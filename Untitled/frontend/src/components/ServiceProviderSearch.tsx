import React, { useState } from 'react';
import { providerApi } from '../services/api';

interface Provider {
  id: string;
  name: string;
  service: string;
  rating: number;
  // Add other provider properties as needed
}

const ServiceProviderSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await providerApi.searchProviders({ query: searchTerm });
      setProviders(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error searching for providers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold mb-6">Find Service Providers</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for services..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">{provider.name}</h3>
            <p className="text-gray-600">{provider.service}</p>
            <div className="mt-2">
              <span className="text-yellow-500">★</span>
              <span className="ml-1">{provider.rating.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>

      {providers.length === 0 && !loading && !error && (
        <p className="text-center text-gray-500 mt-4">
          No providers found. Try a different search term.
        </p>
      )}
    </div>
  );
};

export default ServiceProviderSearch; 