export enum PropertyType {
  Land = 'Terreno',
  House = 'Casa',
  Apartment = 'Apartamento',
}

export enum PropertyStatus {
  PendingPayment = 'Pendente de Pagamento',
  PendingApproval = 'Aguardando Aprovação',
  Active = 'Ativo',
  Rejected = 'Rejeitado',
}

export interface Property {
  id: string;
  ownerId: string;
  title: string;
  type: PropertyType;
  description: string;
  city: string;
  neighborhood: string;
  address?: string;
  price: number;
  priceOnRequest?: boolean;
  condoFee?: number;
  iptu?: number;
  area: number; // in m²
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  garageSpots?: number;
  images: string[];
  lat: number;
  lng: number;
  createdAt: string;
  views?: number;
  status: PropertyStatus;
  expiresAt?: string;
  contactOverride?: 'owner' | 'admin';
  hasPool?: boolean;
  isFurnished?: boolean;
  petsAllowed?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string; // For auth purposes, should not be sent to client
  accountType: 'particular' | 'corretor' | 'imobiliaria';
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  propertyCount?: number;
  validationStatus?: 'not_submitted' | 'pending' | 'approved' | 'rejected';
  creciNumber?: string;
  creciState?: string; // e.g. 'SP', 'RJ'
  companyName?: string; // Razão Social for imobiliaria
  cnpj?: string; // for imobiliaria
}

export interface SystemSettings {
  listingPrice: number;
  adminContactPhone?: string;
}