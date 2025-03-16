import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";

interface TokenClaims {
  userId: number;
  sub: string;
  name?: string;
  imageUrl?: string | null;
  scope: string;
  isVerified?: boolean;
  exp?: number;
}

interface CustomUser extends NextAuthUser {
  userId: number;
  imageUrl?: string | null;
  roles: string[];
  isVerified: boolean;
  token: {
    accessToken: {
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
  };
}

declare module "next-auth" {
  interface JWT {
    accessToken: {
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
    roles: string[];
    userId: number;
    imageUrl?: string | null;
    name: string;
    email: string;
    isVerified?: boolean;
  }

  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: {
      id: number;
      email: string;
      name: string;
      imageUrl?: string | null;
      roles: string[];
      isVerified: boolean;
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 1,
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || "Google User",
          email: profile.email || "",
          imageUrl: profile.picture || null,
          roles: [],
          isVerified: false,
          token: {
            accessToken: { claims: {}, value: "" },
            refreshToken: { claims: {}, value: "" },
          },
        };
      },
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
          const decodedToken = jwtDecode<TokenClaims>(data.accessToken);
          return {
            userId: decodedToken.userId,
            email: decodedToken.sub,
            name: decodedToken.name || "Unknown User",
            imageUrl: decodedToken.imageUrl || null,
            roles: decodedToken.scope ? decodedToken.scope.split(" ") : [],
            isVerified: decodedToken.isVerified ?? false,
            token: {
              accessToken: {
                claims: decodedToken,
                value: data.accessToken,
              },
              refreshToken: {
                claims: jwtDecode<TokenClaims>(data.refreshToken),
                value: data.refreshToken,
              },
            },
          } as CustomUser;
        } catch (error) {
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        const customUser = user as CustomUser; // Type assertion to CustomUser

        // Ensure token properties are initialized properly with default values
        token.accessToken = customUser.token?.accessToken || { claims: {}, value: "" };
        token.refreshToken = customUser.token?.refreshToken || { claims: {}, value: "" };
        token.userId = customUser.userId;
        token.roles = customUser.roles || [];
        token.isVerified = customUser.isVerified;
        token.name = customUser.name;
        token.email = customUser.email;
        token.imageUrl = customUser.imageUrl || null;
      }

      if (account?.provider === "google") {
        try {
          const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google-login`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          });

          if (!response.ok) throw new Error("Failed to authenticate with backend");

          const { data } = await response.json();
          if (!data?.accessToken) throw new Error("No access token received from backend");

          const decodedToken = jwtDecode<TokenClaims>(data.accessToken);
          token.accessToken = {
            claims: decodedToken,
            value: data.accessToken,
          };
          token.refreshToken = {
            claims: jwtDecode<TokenClaims>(data.refreshToken),
            value: data.refreshToken,
          };
          token.userId = data.user?.id || decodedToken.userId || 0;
          token.roles = decodedToken.scope ? decodedToken.scope.split(" ") : [];
          token.isVerified = data.user?.isVerified ?? true;
          token.name = data.user?.name || decodedToken.name;
          token.email = data.user?.email || decodedToken.sub || "";
          token.imageUrl = data.user?.imageUrl || decodedToken.imageUrl || null;
        } catch (error) {}
      }

      return token;
    },

    async session({ session, token }) {
      // Ensure `accessToken` and `refreshToken` are safely accessed with fallback values
      const accessToken = token.accessToken?.value || "";
      const refreshToken = token.refreshToken?.value || "";

      session.accessToken = accessToken;
      session.refreshToken = refreshToken;

      // Ensure session user properties are correctly populated
      session.user = {
        ...session.user,
        roles: token.roles || [],
        id: token.userId || 0,
        email: token.email || "",
        imageUrl: token.imageUrl || "",
        isVerified: token.isVerified || false,
      };

      return session;
    },
  },
});

const refreshAccessToken = async (refreshToken: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const { data } = await response.json();
    const decodedToken = jwtDecode<TokenClaims>(data.accessToken);

    return {
      accessToken: {
        claims: decodedToken,
        value: data.accessToken,
      },
      refreshToken: {
        claims: jwtDecode<TokenClaims>(data.refreshToken),
        value: data.refreshToken,
      },
    };
  } catch (error) {
    return null;
  }
};
