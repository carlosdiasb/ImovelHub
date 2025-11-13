import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property, PropertyType } from '../types';
import * as api from '../services/mockApi';
import Button from './Button';
import Icon from './Icon';

interface PropertyFormProps {
  propertyId?: string;
  onFormSubmit: () => void;
}

type FormData = Omit<Property, 'id' | 'ownerId' | 'createdAt' | 'views' | 'status' | 'expiresAt' | 'contactOverride'>;

const initialFormData: FormData = {
    title: '',
    type: PropertyType.Apartment,
    description: '',
    city: '',
    neighborhood: '',
    price: 0,
    priceOnRequest: false,
    condoFee: 0,
    iptu: 0,
    area: 0,
    bedrooms: 1,
    suites: 0,
    bathrooms: 1,
    garageSpots: 0,
    images: [],
    lat: 0,
    lng: 0,
    hasPool: false,
    isFurnished: false,
    petsAllowed: false,
};

const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, onFormSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'images', string>>>({});

  const validate = useCallback(() => {
    const newErrors: Partial<Record<keyof FormData | 'images', string>> = {};

    if (formData.price < 0) newErrors.price = 'O preço não pode ser um valor negativo.';
    if (formData.area < 0) newErrors.area = 'A área não pode ser um valor negativo.';
    if ((formData.bedrooms || 0) < 0) newErrors.bedrooms = 'Número de quartos inválido.';
    if ((formData.suites || 0) < 0) newErrors.suites = 'Número de suítes inválido.';
    if ((formData.bathrooms || 0) < 0) newErrors.bathrooms = 'Número de banheiros inválido.';
    if ((formData.garageSpots || 0) < 0) newErrors.garageSpots = 'Número de vagas inválido.';
    if (formData.suites && formData.bedrooms && formData.suites > formData.bedrooms) {
      newErrors.suites = 'O número de suítes não pode ser maior que o de quartos.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);


  useEffect(() => {
    if (propertyId) {
      const fetchProperty = async () => {
        setIsLoading(true);
        const prop = await api.getPropertyById(propertyId);
        if (prop) {
          const {id, ownerId, createdAt, views, status, ...editableData} = prop;
          setFormData({
            ...initialFormData,
            ...editableData,
          });
          setImagePreviews(prop.images);
        }
        setIsLoading(false);
      };
      fetchProperty();
    }
  }, [propertyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
       const isNumericField = ['price', 'area', 'bedrooms', 'bathrooms', 'suites', 'garageSpots', 'condoFee', 'iptu'].includes(name);
      setFormData(prev => ({ ...prev, [name]: isNumericField ? Number(value) : value }));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newPreviews = files.map(file => URL.createObjectURL(file as Blob));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      // In a real app, you'd upload and get back URLs from a server. Here we use the preview URL.
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newPreviews] }));
    }
  };

  const removeImage = (index: number) => {
    setImagePreviews(previews => previews.filter((_, i) => i !== index));
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };
  
  // Re-validate on every change
  useEffect(() => {
    validate();
  }, [formData, validate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) return;
    
    setIsLoading(true);
    const dataToSubmit = { ...formData };

    if (propertyId) {
      await api.updateProperty(propertyId, dataToSubmit);
    } else {
      await api.createProperty(dataToSubmit, user.id);
    }

    setIsLoading(false);
    onFormSubmit();
  };
  
  const FormField: React.FC<{name: keyof FormData, label: string, children: React.ReactNode}> = ({ name, label, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        {children}
        {errors[name as keyof typeof errors] && <p className="text-red-600 text-xs mt-1">{errors[name as keyof typeof errors]}</p>}
    </div>
  );
  
  if (isLoading && propertyId) return <p>Carregando imóvel...</p>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-primary mb-6">{propertyId ? 'Editar Imóvel' : 'Criar Novo Anúncio'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Basic Info */}
        <div className="p-4 border rounded-md space-y-4">
          <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2">Informações Principais</h2>
          <FormField name="title" label="Título do Anúncio">
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} placeholder="Ex: Apartamento com 2 quartos em Copacabana" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary sm:text-sm" />
          </FormField>
           <FormField name="description" label="Descrição">
            <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={5} placeholder="Descreva os detalhes do seu imóvel, diferenciais, etc." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary sm:text-sm" />
          </FormField>
        </div>

        {/* Section 2: Location */}
        <div className="p-4 border rounded-md space-y-4">
            <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2">Localização</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="city" label="Cidade">
                    <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary sm:text-sm" />
                </FormField>
                <FormField name="neighborhood" label="Bairro">
                    <input type="text" name="neighborhood" id="neighborhood" value={formData.neighborhood} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary sm:text-sm" />
                </FormField>
           </div>
        </div>

        {/* Section 3: Details & Values */}
        <div className="p-4 border rounded-md space-y-4">
            <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2">Detalhes e Valores</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField name="price" label="Preço (R$)"><input type="number" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="area" label="Área (m²)"><input type="number" name="area" id="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="bedrooms" label="Quartos"><input type="number" name="bedrooms" id="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="suites" label="Suítes"><input type="number" name="suites" id="suites" value={formData.suites} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="bathrooms" label="Banheiros"><input type="number" name="bathrooms" id="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="garageSpots" label="Vagas"><input type="number" name="garageSpots" id="garageSpots" value={formData.garageSpots} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="condoFee" label="Condomínio (R$)"><input type="number" name="condoFee" id="condoFee" value={formData.condoFee} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField name="iptu" label="IPTU (R$)"><input type="number" name="iptu" id="iptu" value={formData.iptu} onChange={handleChange} min="0" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" /></FormField>
            </div>
             <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2"><input type="checkbox" id="hasPool" name="hasPool" checked={formData.hasPool} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-secondary" /><label htmlFor="hasPool" className="text-sm">Tem piscina?</label></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="isFurnished" name="isFurnished" checked={formData.isFurnished} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-secondary" /><label htmlFor="isFurnished" className="text-sm">É mobiliado?</label></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="petsAllowed" name="petsAllowed" checked={formData.petsAllowed} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-secondary" /><label htmlFor="petsAllowed" className="text-sm">Aceita pets?</label></div>
                <div className="flex items-center gap-2"><input type="checkbox" id="priceOnRequest" name="priceOnRequest" checked={formData.priceOnRequest} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-secondary" /><label htmlFor="priceOnRequest" className="text-sm">Ocultar valor para visitantes (mostrar "Valor a consultar")</label></div>
             </div>
        </div>
        
        {/* Section 4: Images */}
         <div className="p-4 border rounded-md">
           <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2">Fotos do Imóvel</h2>
           <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 my-4">
              {imagePreviews.map((src, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={src} className="w-full h-full object-cover rounded" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="w-3 h-3"/>
                  </button>
                </div>
              ))}
               <label className="w-full aspect-square border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-light">
                 <Icon name="upload" className="w-8 h-8 text-neutral-medium" />
                 <span className="text-xs text-neutral-medium text-center">Adicionar Fotos</span>
                 <input type="file" multiple onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
               </label>
           </div>
           {errors.images && <p className="text-red-600 text-xs mt-1">{errors.images}</p>}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isLoading} disabled={Object.keys(errors).length > 0} variant="primary" size="lg">
            {propertyId ? 'Salvar Alterações' : 'Criar e Ir para Pagamento'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;