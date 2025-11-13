import React, { useState, useEffect } from 'react';
import { User, Property, SystemSettings } from '../../types';
import * as api from '../../services/mockApi';

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className={`p-6 rounded-lg shadow-md ${color}`}>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-4xl font-bold text-white mt-2">{value}</p>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ users: 0, pending: 0, active: 0, revenue: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            const [users, properties, settings] = await Promise.all([
                api.getAllUsersAdmin(),
                api.getAllPropertiesAdmin(),
                api.getSystemSettings()
            ]);
            
            const pending = properties.filter(p => p.status === 'Aguardando Aprovação').length;
            const active = properties.filter(p => p.status === 'Ativo').length;
            const revenue = active * settings.listingPrice;

            setStats({
                users: users.length,
                pending,
                active,
                revenue
            });
            setIsLoading(false);
        };
        fetchStats();
    }, []);

    if (isLoading) {
        return <p>Carregando estatísticas...</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-6">Visão Geral</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Usuários" value={stats.users} color="bg-blue-500" />
                <StatCard title="Anúncios Pendentes" value={stats.pending} color="bg-yellow-500" />
                <StatCard title="Anúncios Ativos" value={stats.active} color="bg-green-500" />
                <StatCard title="Receita Total (Simulada)" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue)} color="bg-primary" />
            </div>
        </div>
    );
}

export default AdminDashboard;
