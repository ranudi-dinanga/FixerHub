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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { quotationApi } from '@/services/api';
import { Booking } from '@/types';

const quotationSchema = z.object({
  quoteAmount: z.number().min(1, { message: "Amount must be greater than 0" }),
  terms: z.string().min(10, { message: "Terms must be at least 10 characters" }),
});

type QuotationFormValues = z.infer<typeof quotationSchema>;

interface QuotationFormProps {
  booking: Booking;
  onSuccess?: () => void;
}

const QuotationForm: React.FC<QuotationFormProps> = ({ booking, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      quoteAmount: booking.price,
      terms: "",
    },
  });

  const onSubmit = async (data: QuotationFormValues) => {
    setIsSubmitting(true);
    try {
      await quotationApi.sendQuotation(booking._id!, {
        quoteAmount: data.quoteAmount,
        terms: data.terms,
      });

      toast.success('Quotation sent successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Quotation send error:', error);
      toast.error('Failed to send quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">Send Quotation</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="quoteAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Terms and Conditions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter terms and conditions for the quotation"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Quotation'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default QuotationForm;
