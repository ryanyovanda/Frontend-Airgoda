import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { JWT } from "next-auth/jwt";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  sub: string;
  name?: string;
  imageUrl?: string | null;
  scope: string;
  isVerified?: boolean;
  exp?: number;
}

interface TokenClaims {
  userId: string;
  sub: string;
  name?: string;
  imageUrl?: string | null;
  scope: string;
  isVerified?: boolean;
}

interface CustomUser extends NextAuthUser {
  userId: string;
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

interface CustomToken extends JWT {
  accessToken: {
    claims: TokenClaims;
    value: string;
  };
  refreshToken: {
    claims: TokenClaims;
    value: string;
  };
  roles: string[];
  userId: string;
  imageUrl?: string | null;
  name: string;
  email: string;
  isVerified?: boolean;
}

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
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
    roles: string[];
    userId: string;
    imageUrl?: string | null;
    name: string;
    email: string;
    isVerified?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid email profile" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || "Google User",
          email: profile.email || "",
          imageUrl: profile.picture || null,
          roles: [], // ✅ Must provide a default empty roles array
          token: {
            accessToken: { 
              claims: { 
                userId: profile.sub, // ✅ Ensure `userId` is included
                sub: profile.sub,
                name: profile.name || "Google User",
                imageUrl: profile.picture || null,
                scope: "", // ✅ Provide empty scope initially
                isVerified: false // ✅ Default to false
              }, 
              value: "" 
            },
            refreshToken: { 
              claims: { 
                userId: profile.sub, 
                sub: profile.sub,
                name: profile.name || "Google User",
                imageUrl: profile.picture || null,
                scope: "", 
                isVerified: false 
              }, 
              value: "" 
            },
          },
          isVerified: false, // ✅ Default value
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
          if (!data?.accessToken) {
            throw new Error("Missing access token");
          }

          const decodedToken = jwtDecode<DecodedToken>(data.accessToken);
          return {
            userId: decodedToken.userId || "",
            email: decodedToken.sub || "",
            name: decodedToken.name || "Unknown User",
            imageUrl: decodedToken.imageUrl || null,
            roles: data.user?.roles || [],
            isVerified: decodedToken.isVerified ?? false,
            token: {
              accessToken: {
                claims: decodedToken,
                value: data.accessToken,
              },
              refreshToken: {
                claims: jwtDecode<DecodedToken>(data.refreshToken),
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
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        try {
          const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google-login`;
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          });

          if (!response.ok) throw new Error("Failed to authenticate with backend");

          const jsonResponse = await response.json();
          console.log("🔍 Backend Google Login Response:", jsonResponse);

          const { data } = jsonResponse;
          const decodedToken = jwtDecode<TokenClaims>(data.accessToken);

          token.accessToken = {
            claims: decodedToken,
            value: data.accessToken,
          };
          token.refreshToken = {
            claims: jwtDecode<TokenClaims>(data.refreshToken),
            value: data.refreshToken,
          };
          token.userId = data.user?.id || decodedToken.userId || "";
          token.roles = data.user?.roles || ["USER"];
          token.isVerified = data.user?.isVerified;
          token.name = data.user?.name || decodedToken.name || "Google User";
          token.email = data.user?.email || decodedToken.sub || "";
          token.imageUrl = data.user?.imageUrl || decodedToken.imageUrl || null;

        } catch (error) {
          console.error("Google Login Backend Error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken.value;
      session.refreshToken = token.refreshToken.value;
      session.user = {
        ...session.user,
        id: token.userId || "",
        name: token.name || "Google User",
        email: token.email || "",
        imageUrl: token.imageUrl || null,
        roles: token.roles || [],
      };
      return session;
    },
  },
});
