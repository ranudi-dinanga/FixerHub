
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ServiceFilterProps {
  onFilterChange: (location: string, category: string) => void;
}

const ServiceFilter: React.FC<ServiceFilterProps> = ({ onFilterChange }) => {
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(location, category);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <Input
            id="location"
            placeholder="City or ZIP code"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Service Category
          </label>
          <Select onValueChange={setCategory} defaultValue={category}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="gardening">Gardening</SelectItem>
              <SelectItem value="painting">Painting</SelectItem>
              <SelectItem value="carpentry">Carpentry</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full">Search</Button>
        </div>
      </div>
    </form>
  );
};

export default ServiceFilter;
