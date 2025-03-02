'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const Register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialValues = {
    email: '',
    password: '',
    confirmPassword: ''
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          role: 'USER'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      alert('Registration successful! Redirecting to login...');
      router.push('/login');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Email</label>
                <Field type="email" name="email" className="w-full border p-2 rounded" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Password</label>
                <Field type="password" name="password" className="w-full border p-2 rounded" />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium">Confirm Password</label>
                <Field type="password" name="confirmPassword" className="w-full border p-2 rounded" />
                <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm" />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isSubmitting || loading}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;