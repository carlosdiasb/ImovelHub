
import React, { useState } from 'react';
import { PropertyType } from '../types';
import Button from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from './Icon';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
    const [isOpen, setIsOpen] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    minPrice: 0,
    maxPrice: 5000000,
    minArea: 0,
    maxArea: 1000,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    onFilterChange(filters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg mb-8">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-lg font-semibold text-primary mb-2">
        <span>Filtros</span>
        <motion.div animate={{ rotate: isOpen ? 0 : -180 }} transition={{ duration: 0.3 }}>
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </motion.div>
      </button>
      <AnimatePresence>
      {isOpen && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-neutral-medium">Tipo</label>
          <select name="type" onChange={handleInputChange} value={filters.type} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md">
            <option value="">Todos</option>
            {Object.values(PropertyType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-medium">Cidade</label>
          <input type="text" name="city" onChange={handleInputChange} value={filters.city} placeholder="Ex: São Paulo" className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-medium">Preço (R$)</label>
          <input type="range" name="maxPrice" min="0" max="10000000" step="50000" onChange={handleInputChange} value={filters.maxPrice} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
          <div className="text-xs text-neutral-medium">Até {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(filters.maxPrice)}</div>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-medium">Área (m²)</label>
          <input type="range" name="maxArea" min="0" max="2000" step="10" onChange={handleInputChange} value={filters.maxArea} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
          <div className="text-xs text-neutral-medium">Até {filters.maxArea} m²</div>
        </div>
        <div className="self-end">
          <Button onClick={handleApplyFilters} className="w-full">Aplicar</Button>
        </div>
      </div>
      </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
};

export default FilterBar;
