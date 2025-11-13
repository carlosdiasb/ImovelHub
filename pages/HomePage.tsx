
import React, { useState, useEffect } from 'react';
import * as api from '../services/mockApi';
import { Property } from '../types';
import PropertyCard from '../components/PropertyCard';
import SkeletonCard from '../components/SkeletonCard';
import FilterBar from '../components/FilterBar';
import { Page } from '../App';

interface HomePageProps {
  onNavigate: (page: Page, propertyId?: string) => void;
  searchQuery: string;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, searchQuery }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      const data = await api.getProperties(filters);
      // Simple client-side filtering simulation
      const filteredData = data.filter(p => {
        const { type, city, maxPrice, maxArea } = filters as any;
        
        const filterMatch = 
          (!type || p.type === type) &&
          (!city || p.city.toLowerCase().includes(city.toLowerCase())) &&
          (!maxPrice || p.price <= maxPrice) &&
          (!maxArea || p.area <= maxArea);

        const searchMatch = !searchQuery ||
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

        return filterMatch && searchMatch;
      });
      setProperties(filteredData);
      setIsLoading(false);
    };
    fetchProperties();
  }, [filters, searchQuery]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-2">Encontre seu novo lar</h1>
      <p className="text-neutral-medium mb-6">Explore os melhores imóveis da região.</p>
      
      <FilterBar onFilterChange={setFilters} />
      
      {searchQuery && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Resultados para: <span className="text-secondary">"{searchQuery}"</span></h2>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
          : properties.map(property => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onClick={() => onNavigate('details', property.id)} 
              />
            ))}
      </div>
      {
        !isLoading && properties.length === 0 && (
          <div className="text-center col-span-full py-12">
            <h2 className="text-xl font-semibold text-neutral-medium">Nenhum imóvel encontrado</h2>
            <p className="text-neutral-medium">Tente ajustar seus filtros ou o termo de busca.</p>
          </div>
        )
      }
    </div>
  );
};

export default HomePage;