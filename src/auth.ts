import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "./constants/url";
import { LoginResponse, TokenClaims } from "./types/auth/TokenPair";
import { jwtDecode } from "jwt-decode";
import jwt from "jsonwebtoken";

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
    // ✅ Google OAuth Provider (UNCHANGED)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ✅ Credentials Provider (Email/Password Login)
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

        const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_URL.auth.login}`;
        console.log("[AUTH] Attempting login:", url);

        try {
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          if (!response.ok) {
            console.error("[AUTH ERROR] Invalid credentials");
            return null;
          }

          const { data } = (await response.json()) as LoginResponse;

          // ✅ Verify JWT Signature
          const secret = process.env.JWT_SECRET;
          if (!secret) {
            console.error("[AUTH ERROR] JWT secret not set");
            return null;
          }

          try {
            jwt.verify(data.accessToken, secret);
          } catch (err) {
            console.error("[AUTH ERROR] JWT verification failed:", err);
            return null;
          }

          // ✅ Decode token & extract claims
          const decodedToken = jwtDecode<TokenClaims>(data.accessToken);

          return {
            email: decodedToken.sub,
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
            roles: decodedToken.scope?.split(" ") || [],
            userId: parseInt(decodedToken.userId),
          } as User;
        } catch (error) {
          console.error("[AUTH ERROR] Login failed:", error);
          throw new Error("Authentication failed. Please try again.");
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.accessToken = token.accessToken?.value;
      session.refreshToken = token.refreshToken?.value;
      session.user = {
        ...session.user,
        roles: token.roles,
        id: token.accessToken?.claims?.userId,
      };
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("[JWT CALLBACK] Processing token:", user);

      // ✅ Google Login (UNCHANGED)
      if (account?.provider === "google") {
        token.sub = profile?.sub;
        token.email = profile?.email;
        token.name = profile?.name;
        token.picture = profile?.picture;
      }

      // ✅ Credentials Login (ONLY MODIFIED THIS PART)
      if (user?.token?.accessToken) {
        token.accessToken = {
          claims: user.token.accessToken.claims,
          value: user.token.accessToken.value,
        };
        token.refreshToken = {
          claims: user.token.refreshToken.claims,
          value: user.token.refreshToken.value,
        };
        token.roles = user.roles;
        token.userId = user.userId;
      }

      // ✅ Handle Access Token Expiration & Refresh
      if (
        token.accessToken?.claims?.exp &&
        Date.now() >= token.accessToken.claims.exp * 1000
      ) {
        console.log("[AUTH] Access token expired, refreshing...");
        const newToken = await refreshToken(token.refreshToken?.value);
        if (!newToken) {
          console.error("[AUTH ERROR] Refresh token invalid. Logging out...");
          return null;
        }
        token.accessToken = newToken;
      }

      return token;
    },
    async signIn({ user, account }) {
      console.log("[SIGN-IN CALLBACK] User:", user);
      return account?.provider === "google" || account?.provider === "credentials";
    },
  },
});

/**
 * 🔄 Function to Refresh Token When Expired
 */
const refreshToken = async (refreshToken: string) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}${API_URL.auth.refresh}`;
  console.log("[AUTH] Refreshing token at:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: refreshToken }),
    });

    if (!response.ok) {
      console.error("[AUTH ERROR] Failed to refresh access token");
      return null;
    }

    const { data } = (await response.json()) as LoginResponse;

    if (!data?.accessToken) {
      console.error("[AUTH ERROR] No new access token received");
      return null;
    }

    return {
      claims: jwtDecode<TokenClaims>(data.accessToken),
      value: data.accessToken,
    };
  } catch (error) {
    console.error("[AUTH ERROR] Refresh Token Failed:", error);
    return null;
  }
};
