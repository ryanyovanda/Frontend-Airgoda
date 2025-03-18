'use client';

import { FC, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';


interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm Password is required'),
});

const RegisterPage: FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (
    values: RegisterFormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          role: 'USER',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
      if (response.status === 400 && errorData.message.includes("email_unique")) {
        throw new Error("This email is already registered. Please use a different email.");
      }

      throw new Error(errorData.message || 'Registration failed');
    }


      alert('Registration successful! Redirecting to login...');
      router.push('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-fit h-fit flex flex-col gap-4 p-6 border border-gray-300 rounded-lg shadow-lg bg-white">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        <p className="text-center text-gray-600">
          Sign up for free and start enjoying amazing deals and benefits!
        </p>

        <Formik
          initialValues={{ email: '', password: '', confirmPassword: '' }}
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
              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="font-medium">
                  Confirm Password
                </label>
                <Field
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  className="border border-gray-300 p-2 rounded text-black"
                />
                <ErrorMessage name="confirmPassword" component="span" className="text-red-500" />
              </div>
              <button
                disabled={isSubmitting || isLoading}
                type="submit"
                className="bg-[#8A2DE2] text-white p-2 rounded w-full"
              >
                {isLoading ? 'Registering...' : 'Sign Up'}
              </button>
              {error && <span className="text-red-500 text-center">{error}</span>}
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
