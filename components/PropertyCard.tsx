import React from 'react';
import { motion } from 'framer-motion';
import { Property } from '../types';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const { user } = useAuth();
  
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(property.price);

  const showPrice = user || !property.priceOnRequest;

  return (
    <motion.div
      layoutId={`property-card-${property.id}`}
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      whileHover={{ scale: 1.02, y: -4, boxShadow: "0 8px 20px rgba(12,20,30,0.12)" }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="relative">
        <motion.img layoutId={`property-image-${property.id}`} src={property.images[0]} alt={property.title} className="w-full h-48 object-cover" />
        <span className="absolute top-2 left-2 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded-full">{property.type}</span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-neutral-dark truncate">{property.title}</h3>
        <p className="text-sm text-neutral-medium flex items-center gap-1 mb-3">
          <Icon name="pin" className="w-4 h-4" />
          {property.city}, {property.neighborhood}
        </p>
        <div className="flex justify-between items-center">
          {showPrice ? (
            <p className="text-xl font-bold text-primary">{formattedPrice}</p>
          ) : (
            <p className="text-lg font-semibold text-primary">Valor a consultar</p>
          )}
          <div className="flex gap-3 text-sm text-neutral-medium">
             <div className="flex items-center gap-1">
                <Icon name="area" className="w-4 h-4"/>
                <span>{property.area}m²</span>
             </div>
             {property.bedrooms && (
                 <div className="flex items-center gap-1">
                    <Icon name="bed" className="w-4 h-4"/>
                    <span>{property.bedrooms}</span>
                 </div>
             )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;