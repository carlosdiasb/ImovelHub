import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property, PropertyTypeSetting } from '../types';
import * as api from '../services/mockApi';
import Button from './Button';
import Icon from './Icon';
import { motion } from 'framer-motion';

// --- PROPS & STATE ---

interface PropertyFormProps {
  propertyId?: string;
  onFormSubmit: () => void;
}

type FormData = Omit<Property, 'id' | 'ownerId' | 'createdAt' | 'views' | 'status' | 'expiresAt' | 'contactOverride'>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const initialFormData: FormData = {
    title: '',
    type: '',
    description: '',
    city: '',
    neighborhood: '',
    price: 0,
    priceOnRequest: false,
    condoFee: 0,
    iptu: 0,
    area: 0,
    bedrooms: 0,
    suites: 0,
    bathrooms: 1,
    garageSpots: 0,
    images: [],
    lat: -23.5505, // Default to São Paulo
    lng: -46.6333,
    hasPool: false,
    isFurnished: false,
    petsAllowed: false,
};

// --- HELPER COMPONENTS ---

const Section: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
    <h2 className="text-xl font-bold text-neutral-dark border-b border-gray-200 pb-3 mb-6">{title}</h2>
    <div className="space-y-6">{children}</div>
  </div>
);

const FormField: React.FC<{ label: string; error?: string; children: ReactNode, required?: boolean }> = ({ label, error, children, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
  </div>
);

const Checkbox: React.FC<{ name: keyof FormData; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children: ReactNode }> = ({ name, checked, onChange, children }) => (
    <div className="flex items-center gap-2">
        <input 
            type="checkbox" 
            id={name} 
            name={name} 
            checked={checked} 
            onChange={onChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-secondary cursor-pointer" 
        />
        <label htmlFor={name} className="text-sm text-gray-700 cursor-pointer">{children}</label>
    </div>
);

const ImageUploader: React.FC<{ images: string[]; onImagesChange: (images: string[]) => void; error?: string }> = ({ images, onImagesChange, error }) => {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // FIX: Cast file to Blob to resolve TypeScript type inference issue with URL.createObjectURL.
            const newImageUrls = files.map(file => URL.createObjectURL(file as Blob));
            onImagesChange([...images, ...newImageUrls]);
        }
    };

    const removeImage = (indexToRemove: number) => {
        onImagesChange(images.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {images.map((src, index) => (
                    <motion.div 
                        key={src} 
                        className="relative group aspect-square"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        layout
                    >
                        <img src={src} alt={`Pré-visualização ${index + 1}`} className="w-full h-full object-cover rounded-md shadow-md" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white">
                            <Icon name="close" className="w-4 h-4" />
                        </button>
                        {index === 0 && <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-0.5 rounded-b-md">Principal</div>}
                    </motion.div>
                ))}
                <label className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-secondary transition-colors text-gray-500 hover:text-secondary">
                    <Icon name="upload" className="w-8 h-8" />
                    <span className="text-xs text-center mt-1">Adicionar</span>
                    <input type="file" multiple onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/webp" />
                </label>
            </div>
            {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
             <p className="text-xs text-gray-500 mt-2">A primeira imagem será a foto de capa do seu anúncio.</p>
        </div>
    );
};


// --- MAIN FORM COMPONENT ---

const PropertyForm: React.FC<PropertyFormProps> = ({ propertyId, onFormSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditing = !!propertyId;
  
  // --- DATA FETCHING ---

  useEffect(() => {
    const fetchTypes = async () => {
        const types = await api.getPropertyTypes();
        setPropertyTypes(types);
        if (!isEditing && types.length > 0) {
            setFormData(prev => ({ ...prev, type: types[0].name }));
        }
    };
    fetchTypes();
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      const fetchProperty = async () => {
        setIsLoading(true);
        const prop = await api.getPropertyById(propertyId);
        if (prop) {
          const { id, ownerId, createdAt, views, status, ...editableData } = prop;
          setFormData({ ...initialFormData, ...editableData });
        }
        setIsLoading(false);
      };
      fetchProperty();
    } else {
        setFormData(initialFormData);
    }
  }, [propertyId, isEditing]);


  // --- FORM HANDLING & VALIDATION ---
  
  const validate = useCallback(() => {
    const newErrors: FormErrors = {};
    if (!formData.title.trim() || formData.title.length < 5) newErrors.title = 'O título deve ter pelo menos 5 caracteres.';
    if (!formData.type) newErrors.type = 'Selecione um tipo de imóvel.';
    if (!formData.description.trim() || formData.description.length < 20) newErrors.description = 'A descrição deve ter pelo menos 20 caracteres.';
    if (!formData.city.trim()) newErrors.city = 'A cidade é obrigatória.';
    if (!formData.neighborhood.trim()) newErrors.neighborhood = 'O bairro é obrigatório.';
    if (formData.price <= 0) newErrors.price = 'O preço deve ser maior que zero.';
    if (formData.area <= 0) newErrors.area = 'A área deve ser maior que zero.';
    if ((formData.bedrooms || 0) < 0) newErrors.bedrooms = 'Número inválido.';
    if ((formData.bathrooms || 0) <= 0) newErrors.bathrooms = 'Deve ter pelo menos 1 banheiro.';
    if ((formData.suites || 0) < 0) newErrors.suites = 'Número inválido.';
    if ((formData.suites || 0) > (formData.bedrooms || 0)) newErrors.suites = 'Suítes não podem exceder o número de quartos.';
    if ((formData.garageSpots || 0) < 0) newErrors.garageSpots = 'Número inválido.';
    if (formData.images.length === 0) newErrors.images = 'Adicione pelo menos uma foto do imóvel.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumeric = ['price', 'area', 'bedrooms', 'bathrooms', 'suites', 'garageSpots', 'condoFee', 'iptu'].includes(name);

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumeric ? Number(value) : value)
    }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validate()) {
        // Scroll to the first error
        const firstErrorKey = Object.keys(errors)[0];
        if (firstErrorKey) {
            const errorElement = document.getElementById(firstErrorKey);
            errorElement?.focus();
        }
        return;
    };
    
    setIsLoading(true);
    if (isEditing) {
      await api.updateProperty(propertyId, formData);
    } else {
      await api.createProperty(formData, user.id);
    }
    setIsLoading(false);
    onFormSubmit();
  };

  if (isLoading && isEditing) {
      return <div className="text-center p-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div><p className="mt-2">Carregando dados do imóvel...</p></div>;
  }
  
  const formIsInvalid = Object.keys(errors).length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-primary mb-6">{isEditing ? 'Editar Anúncio' : 'Criar Novo Anúncio'}</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        
        <Section title="Informações Principais">
          <FormField label="Título do Anúncio" error={errors.title} required>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Apartamento Moderno com Vista para o Mar" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" />
          </FormField>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Tipo de Imóvel" error={errors.type} required>
                <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary">
                    <option value="" disabled>Selecione...</option>
                    {propertyTypes.map(type => <option key={type.id} value={type.name}>{type.name}</option>)}
                </select>
            </FormField>
            <FormField label="Área (m²)" error={errors.area} required>
                <input type="number" id="area" name="area" value={formData.area} onChange={handleChange} min="1" className="w-full border-gray-300 rounded-md shadow-sm" />
            </FormField>
          </div>
          <FormField label="Descrição" error={errors.description} required>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} placeholder="Descreva os detalhes do seu imóvel, diferenciais, cômodos, e o que há de melhor na região." className="w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" />
          </FormField>
        </Section>

        <Section title="Fotos">
            <ImageUploader images={formData.images} onImagesChange={handleImagesChange} error={errors.images} />
        </Section>

        <Section title="Localização">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Cidade" error={errors.city} required>
                    <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
                </FormField>
                <FormField label="Bairro" error={errors.neighborhood} required>
                    <input type="text" id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full border-gray-300 rounded-md shadow-sm" />
                </FormField>
           </div>
        </Section>
        
        <Section title="Detalhes do Imóvel">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <FormField label="Quartos" error={errors.bedrooms}><input type="number" id="bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField label="Suítes" error={errors.suites}><input type="number" id="suites" name="suites" value={formData.suites} onChange={handleChange} min="0" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField label="Banheiros" error={errors.bathrooms} required><input type="number" id="bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="1" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField label="Vagas" error={errors.garageSpots}><input type="number" id="garageSpots" name="garageSpots" value={formData.garageSpots} onChange={handleChange} min="0" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
            </div>
             <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Checkbox name="hasPool" checked={formData.hasPool || false} onChange={handleChange}>Tem piscina?</Checkbox>
                <Checkbox name="isFurnished" checked={formData.isFurnished || false} onChange={handleChange}>É mobiliado?</Checkbox>
                <Checkbox name="petsAllowed" checked={formData.petsAllowed || false} onChange={handleChange}>Aceita pets?</Checkbox>
             </div>
        </Section>

        <Section title="Valores">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Preço (R$)" error={errors.price} required><input type="number" id="price" name="price" value={formData.price} onChange={handleChange} min="1" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField label="Condomínio (R$)"><input type="number" id="condoFee" name="condoFee" value={formData.condoFee} onChange={handleChange} min="0" placeholder="Deixe 0 se não houver" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
              <FormField label="IPTU (R$)"><input type="number" id="iptu" name="iptu" value={formData.iptu} onChange={handleChange} min="0" placeholder="Deixe 0 se não houver" className="w-full border-gray-300 rounded-md shadow-sm" /></FormField>
            </div>
             <div className="pt-2">
                <Checkbox name="priceOnRequest" checked={formData.priceOnRequest || false} onChange={handleChange}>Ocultar valor para visitantes (mostrar "Valor a consultar")</Checkbox>
             </div>
        </Section>
        
        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isLoading} disabled={formIsInvalid && !isLoading} variant="primary" size="lg" title={formIsInvalid ? 'Preencha todos os campos obrigatórios' : ''}>
            {isEditing ? 'Salvar Alterações' : 'Publicar Anúncio'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;