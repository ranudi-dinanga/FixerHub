/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  name: z.string()
    .min(1, { message: "Full name is required" })
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name is too long" })
    .regex(/^[a-zA-Z\s]+$/, { message: "Name can only contain letters and spaces" }),
  
  email: z.string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email is too long" }),
  
  password: z.string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(50, { message: "Password is too long" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" 
    }),
  
  role: z.enum(['service_seeker', 'service_provider'], {
    required_error: "Please select a user type",
  }),
  
  location: z.string()
    .min(1, { message: "Location is required" })
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location is too long" }),
  
  serviceCategory: z.string().optional(),
  description: z.string().optional(),
  
  hourlyRate: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const rate = parseFloat(val);
      return !isNaN(rate) && rate >= 0 && rate <= 1000;
    }, { message: "Hourly rate must be between $0 and $1000" }),
  
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branchName: z.string().optional(),
  
  // Profile picture field
  image: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'service_provider') {
    if (!data.serviceCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Service category is required for service providers",
        path: ["serviceCategory"]
      });
    }
    if (!data.description || data.description.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Description must be at least 10 characters for service providers",
        path: ["description"]
      });
    }
    if (!data.hourlyRate || parseFloat(data.hourlyRate) <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid hourly rate is required for service providers",
        path: ["hourlyRate"]
      });
    }
    if (!data.bankName || data.bankName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bank name is required for service providers",
        path: ["bankName"]
      });
    }
    if (!data.accountNumber || data.accountNumber.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valid account number is required for service providers",
        path: ["accountNumber"]
      });
    }
    if (!data.branchName || data.branchName.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Branch name is required for service providers",
        path: ["branchName"]
      });
    }
  }
});

type FormValues = z.infer<typeof formSchema>;

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const [isProvider, setIsProvider] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "service_seeker",
      location: "",
      serviceCategory: "",
      description: "",
      hourlyRate: "",
      bankName: "",
      accountNumber: "",
      branchName: "",
      image: "",
    },
    mode: "onChange"
  });

  const handleUserTypeChange = (value: string) => {
    setIsProvider(value === 'service_provider');
    // Reset provider-specific fields when switching to homeowner
    if (value === 'service_seeker') {
      form.setValue('serviceCategory', '');
      form.setValue('description', '');
      form.setValue('hourlyRate', '');
      form.setValue('bankName', '');
      form.setValue('accountNumber', '');
      form.setValue('branchName', '');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile picture must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      form.setValue('image', dataUrl, { shouldDirty: true, shouldTouch: true });
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Error reading image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      console.log("Form data:", data);
      const userData = {
        ...data,
        hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
        rating: 0,
        totalRatings: 0,
      };
      
      await registerUser(userData);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-[450px] mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>Create an account to get started</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>I am a</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleUserTypeChange(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="service_seeker">Homeowner</SelectItem>
                      <SelectItem value="service_provider">Service Provider</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="City, State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profile Picture Upload */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture (Optional)</FormLabel>
                  <div className="space-y-3">
                    {imagePreview && (
                      <div className="flex justify-center">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      </div>
                    )}
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                    </FormControl>
                    <input type="hidden" value={field.value ?? ''} readOnly />
                    <p className="text-xs text-muted-foreground">
                      Upload a profile picture (JPG, PNG, GIF). Max size: 5MB.
                      {isProvider && " Service providers get +25 points for having a profile picture!"}
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isProvider && (
              <>
                <FormField
                  control={form.control}
                  name="serviceCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="gardening">Gardening</SelectItem>
                          <SelectItem value="painting">Painting</SelectItem>
                          <SelectItem value="carpentry">Carpentry</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Services</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Brief description of your services (min. 10 characters)" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="1000" 
                          step="0.01"
                          placeholder="50.00" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your bank name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your account number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your branch name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Registering..." : "Register"}
            </Button>
            {/* Display form errors */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="text-red-800 text-sm">
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <p key={field} className="flex items-center gap-2">
                      <span className="font-medium capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>{error.message}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-service-blue hover:underline">Login</Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
