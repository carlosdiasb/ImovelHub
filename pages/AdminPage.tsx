import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../App';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminPropertyManager from '../components/admin/AdminPropertyManager';
import AdminUserManager from '../components/admin/AdminUserManager';
import AdminSettings from '../components/admin/AdminSettings';
import AdminPropertyTypeManager from '../components/admin/AdminPropertyTypeManager';

interface AdminPageProps {
    onNavigate: (page: Page) => void;
}

type AdminSection = 'dashboard' | 'properties' | 'users' | 'propertyTypes' | 'settings';

const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
    const { user } = useAuth();
    const [section, setSection] = useState<AdminSection>('users');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    if (user?.role !== 'admin') {
        return (
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
                <p className="text-neutral-medium">Você não tem permissão para acessar esta página.</p>
                <button onClick={() => onNavigate('home')} className="mt-4 text-primary font-semibold">Voltar para a Home</button>
            </div>
        );
    }

    const handleViewUserProperties = (userId: string) => {
        setSelectedUserId(userId);
        setSection('properties');
    }
    
    const renderSection = () => {
        switch(section) {
            case 'dashboard': return <AdminDashboard />;
            case 'properties': return <AdminPropertyManager selectedUserId={selectedUserId} onClearUserFilter={() => setSelectedUserId(null)} />;
            case 'users': return <AdminUserManager onViewUserProperties={handleViewUserProperties} />;
            case 'propertyTypes': return <AdminPropertyTypeManager />;
            case 'settings': return <AdminSettings />;
            default: return <AdminDashboard />;
        }
    }

    const navItems: { id: AdminSection, label: string }[] = [
        { id: 'dashboard', label: 'Visão Geral' },
        { id: 'properties', label: 'Gerenciar Anúncios' },
        { id: 'users', label: 'Gerenciar Usuários' },
        { id: 'propertyTypes', label: 'Tipos de Imóvel' },
        { id: 'settings', label: 'Configurações' },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
                <h2 className="text-xl font-bold text-primary mb-4">Painel do Admin</h2>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setSection(item.id)}
                            className={`text-left p-2 rounded-md transition-colors text-base ${section === item.id ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-200 text-neutral-dark'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main className="flex-1 bg-white p-6 rounded-lg shadow-md">
                {renderSection()}
            </main>
        </div>
    );
}

export default AdminPage;
