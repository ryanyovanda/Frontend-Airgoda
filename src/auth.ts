// @ts-nocheck

import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken"; 

interface TokenClaims {
  userId: number; // ✅ Fix: Use number since backend returns numeric userId
  sub: string;
  name?: string;
  imageUrl?: string | null;
  scope: string;
  isVerified?: boolean;
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
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: number;
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
    userId: number;
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
          if (!data?.accessToken || !process.env.JWT_SECRET) {
            throw new Error("JWT secret or accessToken missing");
          }
          jwt.verify(data.accessToken, process.env.JWT_SECRET!);
          const decodedToken = jwtDecode<DecodedToken>(data.accessToken);
          return {
            userId: decodedToken.userId || "",
            email: decodedToken.email || "",
            name: decodedToken.name || "Unknown User",
            imageUrl: decodedToken.picture || null,
            roles: decodedToken.scope ? decodedToken.scope.split(" ") : [],
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
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.token?.accessToken || { claims: {}, value: "" };
        token.refreshToken = user.token?.refreshToken || { claims: {}, value: "" };
        token.userId = user.userId;
        token.roles = user.roles || [];
        token.isVerified = user.isVerified;
        token.name = user.name;
        token.email = user.email;
        token.imageUrl = user.imageUrl || null;
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
          const decodedToken = jwtDecode<TokenClaims>(data.accessToken);

          token.accessToken = {
            claims: decodedToken,
            value: data.accessToken,
          };
          token.refreshToken = {
            claims: jwtDecode<TokenClaims>(data.refreshToken),
            value: data.refreshToken,
          };
          token.userId = data.user?.id || decodedToken.userId || 0; // ✅ Fix userId
          token.roles = decodedToken.scope ? decodedToken.scope.split(" ") : []; // ✅ Extract roles
          token.isVerified = data.user?.isVerified ?? false;
          token.name = data.user?.name || decodedToken.name || "Unknown";
          token.email = data.user?.email || decodedToken.sub || "";
          token.imageUrl = data.user?.imageUrl || decodedToken.imageUrl || null;
        } catch (error) {
          console.error("Google Login Backend Error:", error);
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (!token.accessToken || !token.refreshToken) {
        console.error("❌ Missing accessToken or refreshToken in session callback", token);
        return session;
      }

      session.accessToken = token.accessToken.value || "";
      session.refreshToken = token.refreshToken.value || "";
      session.user = {
        ...session.user,
        id: token.userId || 0, // ✅ Fix: Use correct userId
        name: token.name || "Unknown",
        email: token.email || "",
        imageUrl: token.imageUrl || null,
        roles: token.roles || [],
        isVerified: token.isVerified ?? false,
      };
      return session;
    },
  },
});
