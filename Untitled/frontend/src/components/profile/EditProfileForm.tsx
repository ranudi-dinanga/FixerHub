import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/api';
import type { User } from '@/types';

// Base schema for all users
const baseSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(), // base64/URL
  email: z.string().email().optional(),
});

// Service provider specific schema
const providerSchema = baseSchema.extend({
  serviceCategory: z.string().optional(),
  hourlyRate: z.string().optional(),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  branchName: z.string().optional(),
});

// Union type for form values
type FormValues = z.infer<typeof baseSchema> | z.infer<typeof providerSchema>;

// Helper function to check if form values include provider fields
const hasProviderFields = (values: FormValues): values is z.infer<typeof providerSchema> => {
  return 'serviceCategory' in values;
};

const toFormValues = (u?: Partial<User> | null, userRole?: string): FormValues => {
  const baseValues = {
    name: u?.name ?? '',
    location: u?.location ?? '',
    description: u?.description ?? '',
    image: u?.image ?? '',
    email: u?.email ?? '', // shown but not sent
  };

  if (userRole === 'service_provider') {
    return {
      ...baseValues,
      serviceCategory: u?.serviceCategory ?? undefined,
      hourlyRate: u?.hourlyRate != null ? String(u.hourlyRate) : '',
      bankName: u?.bankName ?? '',
      accountNumber: u?.accountNumber ?? '',
      branchName: u?.branchName ?? '',
    };
  }

  return baseValues;
};

const OMIT_FROM_UPDATE: (keyof FormValues)[] = ['email'];

interface EditProfileFormProps { onSuccess?: () => void; }

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSuccess }) => {
  const { currentUser, updateCurrentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(currentUser?.image ?? null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Use appropriate schema based on user role
  const schema = currentUser?.role === 'service_provider' ? providerSchema : baseSchema;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: toFormValues(currentUser, currentUser?.role),
    shouldUnregister: false,
  });

  // keep form in sync with context user
  useEffect(() => {
    form.reset(toFormValues(currentUser, currentUser?.role));
    setImagePreview(currentUser?.image ?? null);
  }, [currentUser, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be < 5MB');
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image');

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setImagePreview(dataUrl);
      form.setValue('image', dataUrl, { shouldDirty: true, shouldTouch: true });
    };
    reader.onerror = () => toast.error('Error reading image file');
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (!currentUser?._id) {
      toast.error('User not found');
      return;
    }
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Build payload excluding non-editable fields (email, etc.)
      const payload = Object.fromEntries(
        Object.entries(data).filter(([k]) => !OMIT_FROM_UPDATE.includes(k as keyof FormValues))
      ) as Partial<User> & { hourlyRate?: string };

      // Cast hourlyRate -> number if present (only for service providers)
      if (currentUser.role === 'service_provider' && payload.hourlyRate != null && payload.hourlyRate !== '') {
        (payload as any).hourlyRate = Number(payload.hourlyRate);
      } else if (currentUser.role === 'service_provider') {
        delete (payload as any).hourlyRate;
      }

      const res = await userApi.updateProfile(currentUser._id, payload);
      const updated = (res?.user ?? res) as Partial<User>;

      updateCurrentUser(updated as User);
      form.reset(toFormValues(updated, currentUser.role));
      setImagePreview(updated?.image ?? null);

      toast.success('Profile updated successfully!');
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update profile';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <div className="text-sm text-muted-foreground">Loading profile…</div>;
  }

  const isServiceProvider = currentUser.role === 'service_provider';
  const isServiceSeeker = currentUser.role === 'service_seeker';

  return (
    <Form {...form}>
      {/* NOTE: do NOT put disabled on a wrapping fieldset */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4" autoComplete="off">
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {submitError}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Email (read-only / not included in update) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (locked)</FormLabel>
                <FormControl>
                  <Input {...field} readOnly disabled className="opacity-60 cursor-not-allowed" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="w-full max-w-xs">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="cursor-pointer" />
                    </FormControl>
                    {/* keep the image value in RHF */}
                    <input type="hidden" value={field.value ?? ''} readOnly />
                    <FormMessage />
                    {isServiceProvider && (
                      <p className="text-xs text-blue-600 mt-1">
                        💡 Service providers get +25 points for having a profile picture!
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Editable fields (default: enabled) */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl><Input placeholder="Your name" {...field} /></FormControl>
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
                <FormControl><Input placeholder="City, District" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Category - Only for Service Providers */}
          {isServiceProvider && (
            <FormField
              control={form.control}
              name="serviceCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Category</FormLabel>
                  <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="plumbing">Plumbing</SelectItem>
                      <SelectItem value="electrical">Electrical</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="gardening">Gardening</SelectItem>
                      <SelectItem value="painting">Painting</SelectItem>
                      <SelectItem value="carpentry">Carpentry</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isServiceProvider ? 'Service Description' : 'About Me'}
                </FormLabel>
                <FormControl>
                  <Textarea 
                    className="min-h-[100px]" 
                    placeholder={
                      isServiceProvider 
                        ? "Describe your services and experience" 
                        : "Tell us about yourself"
                    } 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hourly Rate - Only for Service Providers */}
          {isServiceProvider && (
            <FormField
              control={form.control}
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (LKR)</FormLabel>
                  <FormControl>
                    <Input type="number" inputMode="numeric" placeholder="Enter your hourly rate" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Bank Account Details - Only for Service Providers */}
        {isServiceProvider && (
          <div className="space-y-6 pt-6">
            <h2 className="text-lg font-semibold">Bank Account Details</h2>

            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl><Input placeholder="Enter bank name" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="Enter account number" type="text" {...field} /></FormControl>
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
                  <FormControl><Input placeholder="Enter branch name" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* EDIT button: sends the update request */}
        <div className="pt-6 flex gap-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Updating…
              </>
            ) : (
              'Update Profile'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              form.reset(toFormValues(currentUser, currentUser.role));
              setImagePreview(currentUser?.image ?? null);
              toast.success('Reverted to saved profile');
            }}
          >
            Revert
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditProfileForm;
