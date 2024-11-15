'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Define error state type
interface ErrorState {
  email: string;
  password: string;
  confirmPassword: string;
  testType: string;
  form: string;
}

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [testType, setTestType] = useState('');
  const [errors, setErrors] = useState<ErrorState>({ email: '', password: '', confirmPassword: '', testType: '', form: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors: ErrorState = { email: '', password: '', confirmPassword: '', testType: '', form: '' };

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!testType) {
      newErrors.testType = 'Test type selection is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/users/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, email, password, confirm_password: confirmPassword, test_type: testType }),
          credentials: 'include',
        });

        const data = await response.json();

        if (response.ok) {
          window.location.href = '/dashboard';
        } else {
          setErrors((prevErrors) => ({ ...prevErrors, form: data.error || 'Registration failed. Please try again.' }));
        }
      } catch (error) {
        console.error('Registration failed:', error);
        setErrors((prevErrors) => ({ ...prevErrors, form: 'Failed to register. Please try again later.' }));
      }
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">Sign up to start your exam preparation</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label>Select Test Type</Label>
              <RadioGroup onValueChange={setTestType} value={testType} className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gmat" id="gmat" />
                  <Label htmlFor="gmat">GMAT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="gre" id="gre" />
                  <Label htmlFor="gre">GRE</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sat" id="sat" />
                  <Label htmlFor="sat">SAT</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ielts" id="ielts" />
                  <Label htmlFor="ielts">IELTS</Label>
                </div>
              </RadioGroup>
              {errors.testType && <p className="text-sm text-red-500">{errors.testType}</p>}
            </div>
            <Button type="submit" className="w-full">Register</Button>
          </form>
          {errors.form && <p className="text-sm text-red-500 text-center mt-2">{errors.form}</p>}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}