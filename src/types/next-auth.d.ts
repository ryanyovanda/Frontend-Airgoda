import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { TokenClaims } from "./auth/TokenPair";

declare module "next-auth" {
  interface Session {
    accessToken: string;
    refreshToken: string;
    error?: string;
    user: {
      id: number;
      email: string;
      roles: string[];
      name: string;
      isVerified: boolean;
      imageUrl?: string | null;
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
    roles: string[];
    token: UserTokenDetails;
    userId: number;
    name: string;
    isVerified: boolean;
    imageUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles: string[];
    accessToken: {
      claims: TokenClaims;
      value: string;
    };
    refreshToken: {
      claims: TokenClaims;
      value: string;
    };
    userId: number;
    name: string;
    email: string;
    isVerified?: boolean;
    imageUrl?: string | null;
    error?: string;
  }
}
