import "next-auth";
import { DefaultSession } from "next-auth";
import { TokenClaims } from "./auth/TokenPair";
import { JWT } from "next-auth/jwt"; // eslint-disable-line @typescript-eslint/no-unused-vars

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: {
      id: string; // ✅ Ensure `id` is always a string
      email: string;
      roles: string[];
      name: string;
      isVerified: boolean;
      imageUrl?: string | null; // ✅ Added `imageUrl`
    } & DefaultSession["user"];
  }

  interface UserTokenDetails {
    accessToken: {
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
  }

  interface User {
    id: string; // ✅ Ensuring userId is consistent as `string`
    roles: string[];
    token: UserTokenDetails;
    name: string;
    isVerified: boolean;
    imageUrl?: string | null; // ✅ Added `imageUrl`
  }
}

declare module "next-auth/jwt" {
  interface JWT extends JWT {
    roles: string[];
    accessToken: {
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
    imageUrl?: string | null; // ✅ Added `imageUrl` to JWT
    userId: string; // ✅ Ensured `userId` is a string for consistency
    error?: string;
  }
}
