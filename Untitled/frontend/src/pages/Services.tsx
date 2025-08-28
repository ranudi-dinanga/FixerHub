import React, { useState, useEffect } from 'react';
import ServiceFilter from '@/components/services/ServiceFilter';
import ProviderCard from '@/components/services/ProviderCard';
import { Provider } from '@/types';
import { userApi } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

const Services = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await userApi.getServiceProviders();
      setProviders(data);
      setFilteredProviders(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch service providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (location: string, category: string) => {
    setSearchPerformed(true);
    
    let result = [...providers];
    
    // Filter by location if provided
    if (location.trim()) {
      const locationLower = location.toLowerCase();
      result = result.filter(
        provider => provider.location.toLowerCase().includes(locationLower)
      );
    }
    
    // Filter by category if not 'all'
    if (category !== 'all') {
      result = result.filter(provider => provider.serviceCategory === category);
    }
    
    setFilteredProviders(result);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-gray-500">Loading service providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Find Service Providers</h1>
      
      <ServiceFilter onFilterChange={handleFilterChange} />
      
      {searchPerformed && filteredProviders.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No service providers found matching your criteria.</p>
          <p className="text-gray-500">Try adjusting your filters or search for a different location.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(searchPerformed ? filteredProviders : providers).map((provider) => (
            <ProviderCard key={provider._id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Services;
