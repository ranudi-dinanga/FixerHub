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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Award, Calendar, Building, Hash, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { certificationApi } from '@/services/api';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  issuingOrganization: z.string().min(2, { message: "Organization name must be at least 2 characters" }),
  certificateNumber: z.string().min(1, { message: "Certificate number is required" }),
  issueDate: z.string().min(1, { message: "Issue date is required" }),
  expiryDate: z.string().optional(),
  category: z.enum(['technical', 'safety', 'professional', 'trade', 'other']),
  points: z.number().min(1).max(100).default(10),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CertificationUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      issuingOrganization: '',
      certificateNumber: '',
      issueDate: '',
      expiryDate: '',
      category: 'technical',
      points: 10,
      description: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(''); // Clear previous errors
    
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        setSelectedFile(null);
        setPreviewUrl('');
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, DOCX, and image files are allowed');
        setSelectedFile(null);
        setPreviewUrl('');
        return;
      }

      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.onerror = () => {
          toast.error('Error reading image file');
          setSelectedFile(null);
          setPreviewUrl('');
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl('');
      }
    }
  };

  const validateForm = (data: FormValues): boolean => {
    // Check if all required fields are filled
    if (!data.title.trim()) {
      toast.error('Please enter a certification title');
      return false;
    }
    
    if (!data.issuingOrganization.trim()) {
      toast.error('Please enter the issuing organization');
      return false;
    }
    
    if (!data.certificateNumber.trim()) {
      toast.error('Please enter a certificate number');
      return false;
    }
    
    if (!data.issueDate) {
      toast.error('Please select an issue date');
      return false;
    }
    
    if (!selectedFile) {
      toast.error('Please select a certification document');
      return false;
    }
    
    return true;
  };

  const onSubmit = async (data: FormValues) => {
    // Clear previous errors
    setUploadError('');
    
    // Validate form
    if (!validateForm(data)) {
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('title', data.title.trim());
      formData.append('issuingOrganization', data.issuingOrganization.trim());
      formData.append('certificateNumber', data.certificateNumber.trim());
      formData.append('issueDate', data.issueDate);
      if (data.expiryDate && data.expiryDate.trim()) {
        formData.append('expiryDate', data.expiryDate);
      }
      formData.append('category', data.category);
      formData.append('points', data.points.toString());
      if (data.description && data.description.trim()) {
        formData.append('description', data.description.trim());
      }
      formData.append('document', selectedFile);

      console.log('Uploading certification with data:', {
        title: data.title,
        issuingOrganization: data.issuingOrganization,
        certificateNumber: data.certificateNumber,
        issueDate: data.issueDate,
        category: data.category,
        points: data.points,
        fileName: selectedFile?.name,
        fileSize: selectedFile?.size,
        fileType: selectedFile?.type
      });

      const result = await certificationApi.uploadCertification(formData);
      
      console.log('Upload successful:', result);
      toast.success('Certification uploaded successfully! It is now pending admin approval.');
      
      // Reset form
      form.reset();
      setSelectedFile(null);
      setPreviewUrl('');
      
    } catch (error: any) {
      console.error('Certification upload error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to upload certification';
      
      if (error.message) {
        if (error.message.includes('Only service providers')) {
          errorMessage = 'Only service providers can upload certifications. Please check your account type.';
        } else if (error.message.includes('Missing required fields')) {
          errorMessage = 'Please fill in all required fields.';
        } else if (error.message.includes('Certification document is required')) {
          errorMessage = 'Please select a certification document to upload.';
        } else if (error.message.includes('File too large')) {
          errorMessage = 'File size is too large. Please select a smaller file (max 10MB).';
        } else if (error.message.includes('Only PDF, DOC, DOCX, and image files')) {
          errorMessage = 'Invalid file type. Please select a PDF, DOC, DOCX, or image file.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      safety: 'bg-green-100 text-green-800',
      professional: 'bg-purple-100 text-purple-800',
      trade: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Award className="h-6 w-6" />
            </div>
            Upload Certification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Error Display */}
          {uploadError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Upload Error:</span>
              </div>
              <p className="mt-1 text-red-700">{uploadError}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Certification Title *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Professional Plumber License" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuingOrganization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Issuing Organization *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., State Licensing Board" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="certificateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Certificate Number *
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., PL-12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="trade">Trade</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Issue Date *
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Expiry Date (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="points"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Points (1-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 10)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the certification and its requirements..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Certification Document *
                </FormLabel>
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  required
                />
                <p className="text-sm text-gray-500">
                  Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF (Max size: 10MB)
                </p>
                
                {selectedFile && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Badge variant="secondary" className={getCategoryColor(form.watch('category'))}>
                        {form.watch('category')}
                      </Badge>
                    </div>
                    
                    {previewUrl && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Preview:</p>
                        <img
                          src={previewUrl}
                          alt="Document preview"
                          className="max-h-32 rounded border"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Certification
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationUpload;
