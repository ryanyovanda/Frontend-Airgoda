"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const LoginPage: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsLoading(true);
    try {
      console.log(data);
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      console.log(result);
      if (!result?.ok) {
        router.push(`/login?error=${encodeURIComponent(result?.error || "unknown")}`);
        setError(result?.error || "An unexpected error occurred. Please try again.");
      } else if (result?.ok) {
        if (session?.user.roles.includes("ADMIN") || session?.user.roles.includes("ORGANIZER")) {
          router.push("/dashboard");
        }
        router.push("/");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-fit h-fit flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="border border-gray-300 p-2 rounded text-black"
            />
            {errors.email && (
              <span className="text-red-500">{errors.email.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="border border-gray-300 p-2 rounded text-black"
            />
            {errors.password && (
              <span className="text-red-500">{errors.password.message}</span>
            )}
          </div>
          <button
            disabled={isLoading}
            type="submit"
            className="bg-blue-500 text-white p-2 rounded"
          >
            {isLoading ? "Loading..." : "Login"}
          </button>
          {error && <span className="text-red-500">{error}</span>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
