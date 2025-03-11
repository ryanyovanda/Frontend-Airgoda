import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

// --------------------------------------------------------------------
// 1. Define token structures
// --------------------------------------------------------------------

// Structure of the decoded JWT token from your backend
interface DecodedToken {
  userId: string;
  sub: string;
  name?: string;
  imageUrl?: string | null;
  scope: string; // always a string
  isVerified?: boolean;
  exp?: number;
}

// Ensure that in our JWT claims the required fields are always present
type SafeDecodedToken = Omit<DecodedToken, "userId" | "scope"> & {
  userId: string;
  scope: string;
};

// --------------------------------------------------------------------
// 2. Extend NextAuth User type
// --------------------------------------------------------------------
interface CustomUser extends NextAuthUser {
  userId: string;
  imageUrl?: string | null;
  roles: string[];
  isVerified: boolean;
  token: {
    accessToken: {
      claims: SafeDecodedToken;
      value: string;
    };
    refreshToken: {
      claims: SafeDecodedToken;
      value: string;
    };
  };
}

// --------------------------------------------------------------------
// 3. Define a CustomToken type that extends NextAuth's JWT
// --------------------------------------------------------------------
interface CustomToken extends JWT {
  accessToken: {
    claims: SafeDecodedToken;
    value: string;
  };
  refreshToken: {
    claims: SafeDecodedToken;
    value: string;
  };
  roles: string[];
  userId: string;
  imageUrl?: string | null;
  name: string;
  isVerified?: boolean;
}

// --------------------------------------------------------------------
// 4. Module augmentation for NextAuth types
// --------------------------------------------------------------------
declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      imageUrl?: string | null;
      roles: string[];
      isVerified: boolean;
    } & DefaultSession["user"];
  }
  interface JWT {
    accessToken: {
      claims: SafeDecodedToken;
      value: string;
    };
    refreshToken: {
      claims: SafeDecodedToken;
      value: string;
    };
    roles: string[];
    userId: string;
    imageUrl?: string | null;
    name: string;
    isVerified?: boolean;
  }
}

// --------------------------------------------------------------------
// 5. Initialize NextAuth
// --------------------------------------------------------------------
export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 1, // 1-hour expiry
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`;
        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });
          if (!response.ok) {
            throw new Error("Invalid credentials");
          }
          const { data } = await response.json();
          if (!data?.accessToken || !process.env.JWT_SECRET) {
            throw new Error("JWT secret or accessToken missing");
          }
          // Use non-null assertion for JWT_SECRET
          jwt.verify(data.accessToken, process.env.JWT_SECRET!);
          const decodedToken = jwtDecode<DecodedToken>(data.accessToken);
          return {
            userId: decodedToken.userId || "",
            email: decodedToken.sub || "",
            name: decodedToken.name || "Unknown User",
            imageUrl:
              typeof decodedToken.imageUrl === "string"
                ? decodedToken.imageUrl
                : null,
            roles: decodedToken.scope.split(" ") || [],
            isVerified: decodedToken.isVerified ?? false,
            token: {
              accessToken: {
                claims: {
                  ...decodedToken,
                  userId: decodedToken.userId ?? "",
                  scope: decodedToken.scope ?? "",
                },
                value: data.accessToken,
              },
              refreshToken: {
                claims: {
                  ...jwtDecode<DecodedToken>(data.refreshToken),
                  userId: jwtDecode<DecodedToken>(data.refreshToken).userId ?? "",
                  scope: jwtDecode<DecodedToken>(data.refreshToken).scope ?? "",
                },
                value: data.refreshToken,
              },
            },
          } as CustomUser;
        } catch (error) {
          console.error("[AUTH ERROR] Login failed:", error);
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Cast token to CustomToken so we can use our custom properties
      const customToken = token as CustomToken;
      session.accessToken = customToken.accessToken.value;
      session.refreshToken = customToken.refreshToken.value;
      session.user = {
        ...session.user,
        id: customToken.userId || "",
        email: customToken.accessToken.claims.sub || "",
        name: customToken.name || "Unknown User",
        imageUrl: customToken.imageUrl || null,
        roles: customToken.roles || [],
        isVerified: customToken.isVerified ?? false,
      };
      return session;
    },
    async jwt({ token, user }) {
      // Let NextAuth infer the parameter types.
      if (user) {
        // Cast user to CustomUser since our authorize() returns our custom type.
        const customUser = user as CustomUser;
        token = {
          ...token,
          accessToken: customUser.token.accessToken,
          refreshToken: customUser.token.refreshToken,
          roles: customUser.roles || [],
          userId: customUser.userId || "",
          imageUrl: customUser.imageUrl || null,
          name: customUser.name,
          isVerified: customUser.isVerified,
        } as CustomToken;
      }
      return token;
    },
  },
});

// --------------------------------------------------------------------
// 6. Refresh token function
// --------------------------------------------------------------------
const refreshToken = async (refreshToken: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token: refreshToken }),
  });
  if (!response.ok) return null;
  const { data } = await response.json();
  // Use non-null assertion for JWT_SECRET
  jwt.verify(data.accessToken, process.env.JWT_SECRET!);
  return {
    claims: {
      ...jwtDecode<SafeDecodedToken>(data.accessToken),
      userId: jwtDecode<SafeDecodedToken>(data.accessToken).userId ?? "",
      scope: jwtDecode<SafeDecodedToken>(data.accessToken).scope ?? "",
    },
    value: data.accessToken,
  };
};
