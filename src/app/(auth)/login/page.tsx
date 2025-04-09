"use client";

import { FC, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useToast } from "@/providers/ToastProvider";
import { LoginFormValues } from "@/interfaces/login";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginPage: FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", { callbackUrl: "/" });
      if (!result?.ok) {
        showToast("Google login failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Google login error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!result?.ok) {
        showToast(result?.error || "Invalid email or password", "error");
      } else {
        showToast("Login successful!", "success");
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-fit h-fit flex flex-col gap-4 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
        <h1 className="text-2xl font-bold text-center">Sign in</h1>
        <p className="text-center text-gray-600">
          Sign up for free or log in to access amazing deals and benefits!
        </p>

        <button
          onClick={handleGoogleLogin}
          className="bg-[#8A2DE2] text-white p-2 rounded w-full flex justify-center items-center"
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faGoogle} className="mr-2 w-5" />
          {isLoading ? "Loading..." : "Sign in with Google"}
        </button>

        <div className="flex items-center justify-center my-2">
          <div className="w-full border-t border-gray-300"></div>
          <span className="px-2 text-gray-500">or</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
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
                <Field
                  id="password"
                  type="password"
                  name="password"
                  className="border border-gray-300 p-2 rounded text-black"
                />
                <ErrorMessage name="password" component="span" className="text-red-500" />
              </div>
              <button
                disabled={isSubmitting || isLoading}
                type="submit"
                className="bg-[#8A2DE2] text-white p-2 rounded w-full"
              >
                {isLoading ? "Loading..." : "Continue"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-blue-400 text-sm"><a href="/forget-password">Forget Password?</a></p>
        <p className="text-center text-gray-500 text-sm">
          By signing in, I agree to Agoda&apos;
          <a href="#" className="text-blue-500"> Terms of Use </a>
          and
          <a href="#" className="text-blue-500"> Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
