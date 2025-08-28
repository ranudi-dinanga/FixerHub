import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Mail, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email is too long" }),
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters" })
    .max(50, { message: "Password is too long" }),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange"
  });

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'verify-email') {
      setShowVerificationMessage(true);
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    setResendLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Email sent",
          description: "Verification email sent successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      console.error("Login error:", error);
      const errorData = error.response?.data;
      
      if (errorData?.requiresVerification) {
        setNeedsVerification(true);
        setUserEmail(data.email);
      }
      
      toast({
        title: "Login failed",
        description: errorData?.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[350px] mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {showVerificationMessage && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              Registration successful! Please check your email and verify your account before logging in.
            </AlertDescription>
          </Alert>
        )}
        
        {needsVerification && (
          <Alert className="mb-4 border-orange-200 bg-orange-50">
            <Mail className="h-4 w-4" />
            <AlertDescription className="text-orange-800 space-y-2">
              <p>Please verify your email address before logging in.</p>
              <Button
                onClick={handleResendVerification}
                disabled={resendLoading}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3 mr-1" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        
        {/* Display form errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-red-800 text-sm">
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <p key={field} className="flex items-center gap-2">
                  <span className="font-medium capitalize">{field}:</span>
                  <span>{error.message}</span>
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account? <Link to="/register" className="text-service-blue hover:underline">Register</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
