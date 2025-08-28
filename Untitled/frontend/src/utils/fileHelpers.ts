// File handling utilities for the frontend

const API_BASE_URL = 'http://localhost:5001';

/**
 * Get the full URL for an uploaded file
 * @param filePath - The relative file path (e.g., "receipts/filename.jpg")
 * @returns Full URL to the file
 */
export const getFileUrl = (filePath: string): string => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Ensure uploads prefix
  const uploadsPath = cleanPath.startsWith('uploads/') ? cleanPath : `uploads/${cleanPath}`;
  
  return `${API_BASE_URL}/${uploadsPath}`;
};

/**
 * Get the filename from a file path
 * @param filePath - The file path
 * @returns Just the filename
 */
export const getFileName = (filePath: string): string => {
  if (!filePath) return '';
  return filePath.split('/').pop() || '';
};

/**
 * Check if a file is an image based on its path/extension
 * @param filePath - The file path
 * @returns True if it's likely an image
 */
export const isImageFile = (filePath: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const extension = filePath.toLowerCase().split('.').pop();
  return extension ? imageExtensions.includes(`.${extension}`) : false;
};

/**
 * Check if a file is a PDF based on its path/extension
 * @param filePath - The file path
 * @returns True if it's a PDF
 */
export const isPdfFile = (filePath: string): boolean => {
  return filePath.toLowerCase().endsWith('.pdf');
};

/**
 * Format currency amount in LKR
 * @param amount - The amount to format
 * @param currency - The currency type (defaults to LKR)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'LKR'): string => {
  if (currency === 'LKR') {
    return `Rs. ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${amount.toFixed(2)}`;
};