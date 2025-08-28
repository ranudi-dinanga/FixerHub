import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ProfilePictureUploadProps {
  onUploadSuccess: (profilePicture: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { token } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await axios.post<{ profilePicture: string }>(
        `${process.env.REACT_APP_API_URL}/api/users/upload-profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (onUploadSuccess) {
        onUploadSuccess(response.data.profilePicture);
      }
      setSelectedFile(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || 'Error uploading profile picture');
      } else {
        setError('Error uploading profile picture');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 2 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="profile-picture-upload"
        type="file"
        onChange={handleFileSelect}
      />
      <label htmlFor="profile-picture-upload">
        <Button
          variant="contained"
          component="span"
          startIcon={<CloudUploadIcon />}
          disabled={uploading}
        >
          Select Image
        </Button>
      </label>

      {selectedFile && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Selected file: {selectedFile.name}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
            sx={{ mt: 1 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default ProfilePictureUpload; 