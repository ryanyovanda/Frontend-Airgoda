"use client";

import { FC, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (!result?.ok) {
        setError(result?.error || "Google login failed. Try again.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError(null);
    setIsLoading(true);
    try {
      console.log(values);
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
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
      setSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-fit h-fit flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Login</h1>
        <button
          onClick={handleGoogleLogin}
          className="bg-red-500 text-white p-2 rounded w-full flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Sign in with Google"}
        </button>

        <Formik initialValues={{ email: "", password: "" }} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-medium">
                  Email
                </label>
                <Field id="email" type="email" name="email" className="border border-gray-300 p-2 rounded text-black" />
                <ErrorMessage name="email" component="span" className="text-red-500" />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="font-medium">
                  Password
                </label>
                <Field id="password" type="password" name="password" className="border border-gray-300 p-2 rounded text-black" />
                <ErrorMessage name="password" component="span" className="text-red-500" />
              </div>
              <button
                disabled={isSubmitting || isLoading}
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isLoading ? "Loading..." : "Login"}
              </button>
              {error && <span className="text-red-500">{error}</span>}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginPage;
