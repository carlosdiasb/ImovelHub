import { Property, PropertyType, User, PropertyStatus, SystemSettings } from '../types';

let mockProperties: Property[] = [
  {
    id: '1',
    ownerId: '1',
    title: 'Apartamento Moderno no Centro',
    type: PropertyType.Apartment,
    description: 'Lindo apartamento com 2 quartos, sala ampla e cozinha planejada. Perfeito para quem busca conforto e praticidade no coração da cidade. Próximo a metrô, shoppings e parques.',
    city: 'São Paulo',
    neighborhood: 'Centro',
    price: 750000,
    priceOnRequest: false,
    condoFee: 800,
    iptu: 150,
    area: 85,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    garageSpots: 1,
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/${10 + i}/800/600`),
    lat: -23.5505,
    lng: -46.6333,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 125,
    status: PropertyStatus.Active,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contactOverride: 'owner',
    hasPool: false,
    isFurnished: true,
    petsAllowed: true,
  },
  {
    id: '2',
    ownerId: '2',
    title: 'Casa Espaçosa com Piscina',
    type: PropertyType.House,
    description: 'Casa de alto padrão em condomínio fechado. Possui 4 suítes, área gourmet com churrasqueira, piscina e um lindo jardim. Segurança 24 horas e lazer completo para sua família.',
    city: 'Rio de Janeiro',
    neighborhood: 'Barra da Tijuca',
    price: 2500000,
    priceOnRequest: false,
    condoFee: 1200,
    iptu: 450,
    area: 320,
    bedrooms: 4,
    suites: 4,
    bathrooms: 5,
    garageSpots: 3,
    images: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/${20 + i}/800/600`),
    lat: -22.9999,
    lng: -43.3658,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 340,
    status: PropertyStatus.Active,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    contactOverride: 'admin',
    hasPool: true,
    isFurnished: false,
    petsAllowed: true,
  },
   {
    id: '7',
    ownerId: '1',
    title: 'Anúncio pendente de aprovação',
    type: PropertyType.House,
    description: 'Este anúncio foi pago e agora aguarda a aprovação do administrador.',
    city: 'Florianópolis',
    neighborhood: 'Centro',
    price: 950000,
    priceOnRequest: false,
    area: 150,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    garageSpots: 2,
    images: Array.from({ length: 5 }, (_, i) => `https://picsum.photos/seed/${70 + i}/800/600`),
    lat: -27.5969,
    lng: -48.5495,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 2,
    status: PropertyStatus.PendingApproval,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contactOverride: 'owner',
    petsAllowed: true,
  },
   {
    id: '8',
    ownerId: '2',
    title: 'Anúncio aguardando pagamento',
    type: PropertyType.Land,
    description: 'Este anúncio foi criado e está aguardando o pagamento para ser enviado para aprovação.',
    city: 'Porto Alegre',
    neighborhood: 'Moinhos de Vento',
    price: 600000,
    priceOnRequest: false,
    area: 800,
    images: Array.from({ length: 3 }, (_, i) => `https://picsum.photos/seed/${80 + i}/800/600`),
    lat: -30.0277,
    lng: -51.2287,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 5,
    status: PropertyStatus.PendingPayment,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    contactOverride: 'owner',
  },
];

const mockUsers: User[] = [
    { id: '1', name: 'Ana Costa', email: 'ana@email.com', password: 'password123', phone: '11987654321', accountType: 'particular', role: 'user', status: 'active', validationStatus: 'not_submitted' },
    { 
        id: '2', 
        name: 'Bruno Lima', 
        email: 'bruno@email.com', 
        password: 'password123', 
        phone: '21912345678', 
        accountType: 'corretor', 
        role: 'user', 
        status: 'active', 
        validationStatus: 'approved', 
        creciNumber: '12345-F', 
        creciState: 'RJ',
        documentType: 'creci_fisico',
        documentNumber: '12345-F',
        documentUrl: 'https://docs.exemplo.com/creci-fisico.pdf',
        yearsOfExperience: '8',
        serviceRegions: 'Zona Sul / Centro - RJ',
        specialties: 'Imóveis residenciais de alto padrão, imóveis corporativos',
        professionalWebsite: 'https://www.brunolima.com.br',
        contactPreference: 'whatsapp',
        preferredContactTime: '09h às 18h',
        additionalNotes: 'Especialista em clientes internacionais.'
    },
    { id: '3', name: 'Admin', email: 'admin@email.com', password: 'admin123', phone: '99999999999', accountType: 'particular', role: 'admin', status: 'active', validationStatus: 'not_submitted' },
    { 
        id: '4', 
        name: 'Carlos Dias', 
        email: 'crdb.carlos@gmail.com', 
        password: 'password123', 
        phone: '31988776655', 
        accountType: 'imobiliaria', 
        role: 'user', 
        status: 'active', 
        validationStatus: 'not_submitted',
        companyName: 'Imobiliária Dias Ltda.',
        cnpj: '12.345.678/0001-90',
        creciNumber: '54321-J',
        creciState: 'MG',
        documentType: 'creci_juridico',
        documentNumber: '54321-J',
        documentUrl: 'https://docs.exemplo.com/creci-juridico.pdf',
        proofOfAddressUrl: 'https://docs.exemplo.com/comprovante-endereco.pdf',
        yearsOfExperience: '12',
        serviceRegions: 'Belo Horizonte, Nova Lima e região metropolitana',
        specialties: 'Lançamentos residenciais, imóveis comerciais e alto padrão',
        professionalWebsite: 'https://www.imobiliariadias.com.br',
        contactPreference: 'email',
        preferredContactTime: 'Horário comercial',
        additionalNotes: 'Equipe dedicada para aprovação de crédito e compliance.',
        teamSize: '18'
    }
];

let mockSystemSettings: SystemSettings = {
    listingPrice: 99.90,
    adminContactPhone: '5511999998888',
}

const simulateDelay = <T,>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), delay));

const stripPassword = (user: User): Omit<User, 'password'> => {
    const { password, ...rest } = user;
    return rest;
}

// Public APIs
export const getProperties = (filters: any) => {
    const activeProperties = mockProperties.filter(p => {
        const isExpired = p.expiresAt && new Date(p.expiresAt) < new Date();
        return p.status === PropertyStatus.Active && !isExpired;
    });
    return simulateDelay(activeProperties);
}
export const getPropertyById = (id: string) => simulateDelay(mockProperties.find(p => p.id === id));
export const getUserById = (id: string) => {
    const user = mockUsers.find(u => u.id === id);
    return user ? simulateDelay(stripPassword(user)) : simulateDelay(null);
}
export const getPropertiesByOwner = (ownerId: string) => simulateDelay(mockProperties.filter(p => p.ownerId === ownerId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
export const login = (email: string, pass: string) => {
    const user = mockUsers.find(u => u.email === email && u.password === pass);
    if (user) {
        if (user.status === 'blocked') {
            return simulateDelay({ user: null, error: 'Sua conta foi bloqueada.' });
        }
        return simulateDelay({ user: stripPassword(user), error: null });
    }
    return simulateDelay({ user: null, error: 'Email ou senha inválidos.' });
}
export const register = (name: string, email: string, pass: string, accountType: 'particular' | 'corretor' | 'imobiliaria') => {
    if (mockUsers.some(u => u.email === email)) {
        return simulateDelay({ user: null, error: 'Email já está em uso.' });
    }
    const newUser: User = { 
        id: String(mockUsers.length + 1), 
        name, 
        email, 
        password: pass, 
        role: 'user', 
        status: 'active', 
        accountType,
        validationStatus: 'not_submitted'
    };
    mockUsers.push(newUser);
    return simulateDelay({ user: stripPassword(newUser), error: null });
}
export const requestPasswordReset = (email: string) => {
    console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
    return simulateDelay({ success: true }, 1000);
}
export const incrementPropertyView = (id: string) => {
    const index = mockProperties.findIndex(p => p.id === id);
    if (index !== -1) {
        mockProperties[index].views = (mockProperties[index].views || 0) + 1;
    }
    return simulateDelay(true, 50);
};
export const createProperty = (data: Omit<Property, 'id' | 'createdAt' | 'ownerId' | 'views' | 'status'>, ownerId: string) => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // Default 30 days validity

    const newProperty: Property = {
        ...data,
        id: String(Date.now()),
        ownerId,
        createdAt: new Date().toISOString(),
        views: 0,
        status: PropertyStatus.PendingPayment,
        expiresAt: expiryDate.toISOString(),
        contactOverride: 'owner',
    };
    mockProperties.unshift(newProperty);
    return simulateDelay(newProperty);
};
export const updateProperty = (id: string, data: Partial<Property>) => {
    const index = mockProperties.findIndex(p => p.id === id);
    if (index !== -1) {
        mockProperties[index] = { ...mockProperties[index], ...data };
        return simulateDelay(mockProperties[index]);
    }
    return simulateDelay(null);
};
export const deleteProperty = (id: string) => {
    mockProperties = mockProperties.filter(p => p.id !== id);
    return simulateDelay(true);
};
export const simulatePayment = (propertyId: string) => {
    const index = mockProperties.findIndex(p => p.id === propertyId);
    if (index !== -1) {
        mockProperties[index].status = PropertyStatus.PendingApproval;
        return simulateDelay(mockProperties[index], 1500);
    }
    return simulateDelay(null);
}

// Admin APIs
export const getAllPropertiesAdmin = () => simulateDelay(mockProperties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
export const getAllUsersAdmin = () => {
    const usersWithCount = mockUsers.map(user => {
        const propertyCount = mockProperties.filter(p => p.ownerId === user.id).length;
        return { ...stripPassword(user), propertyCount };
    });
    return simulateDelay(usersWithCount);
};
export const updateUser = (id: string, data: Partial<User>) => {
     const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...data };
        return simulateDelay(stripPassword(mockUsers[index]));
    }
    return simulateDelay(null);
}
export const getSystemSettings = () => simulateDelay(mockSystemSettings);
export const updateSystemSettings = (data: Partial<SystemSettings>) => {
    mockSystemSettings = { ...mockSystemSettings, ...data };
    return simulateDelay(mockSystemSettings);
}
