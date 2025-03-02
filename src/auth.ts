import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        console.log("[AUTH] Attempting login:", url);

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

          jwt.verify(data.accessToken, process.env.JWT_SECRET);
          const decodedToken = jwtDecode(data.accessToken);

          return {
            id: decodedToken.userId,
            email: decodedToken.sub,
            name: decodedToken.name || "Unknown User", // ✅ Ensure name is always present
            imageUrl: decodedToken.imageUrl || null,
            roles: decodedToken.scope?.split(" ") || [],
            token: {
              accessToken: {
                claims: decodedToken,
                value: data.accessToken,
              },
              refreshToken: {
                claims: jwtDecode(data.refreshToken),
                value: data.refreshToken,
              },
            },
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
      session.accessToken = token.accessToken.value;
      session.refreshToken = token.refreshToken.value;
      session.user = {
        ...session.user,
        id: token.userId,
        email: token.accessToken.claims.sub,
        name: token.name, // ✅ Ensure name is passed in session
        imageUrl: token.imageUrl || null,
        roles: token.roles,
      };
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token = {
          accessToken: {
            claims: user.token.accessToken.claims,
            value: user.token.accessToken.value,
          },
          refreshToken: {
            claims: user.token.refreshToken.claims,
            value: user.token.refreshToken.value,
          },
          roles: user.roles,
          userId: user.id,
          imageUrl: user.imageUrl || null,
          name: user.name, // ✅ Store name in JWT
        };
      }

      // 🔄 Refresh token logic before expiration
      if (token.accessToken.claims.exp * 1000 < Date.now()) {
        console.log("[AUTH] Access token expired, refreshing...");
        const newToken = await refreshToken(token.refreshToken.value);
        if (!newToken) return null;
        token.accessToken = newToken;
      }

      return token;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/google-login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          }
        );

        if (!response.ok) return false;

        const { data } = await response.json();

        if (!data?.accessToken) return false;

        jwt.verify(data.accessToken, process.env.JWT_SECRET);
        const decodedToken = jwtDecode(data.accessToken);

        user.token = {
          accessToken: {
            claims: decodedToken,
            value: data.accessToken,
          },
          refreshToken: {
            claims: jwtDecode(data.refreshToken),
            value: data.refreshToken,
          },
        };
        user.roles = decodedToken.scope?.split(" ") || [];
        user.userId = decodedToken.userId;
        user.imageUrl = decodedToken.imageUrl || null;
        user.name = decodedToken.name || "Google User"; // ✅ Ensure name is set
      }
      return true;
    },
  },
});

const refreshToken = async (refreshToken) => {
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
  jwt.verify(data.accessToken, process.env.JWT_SECRET);
  return {
    claims: jwtDecode(data.accessToken),
    value: data.accessToken,
  };
};
