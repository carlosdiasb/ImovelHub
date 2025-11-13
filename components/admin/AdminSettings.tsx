import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../types';
import * as api from '../../services/mockApi';
import Button from '../Button';

const AdminSettings: React.FC = () => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [price, setPrice] = useState<number>(0);
    const [adminPhone, setAdminPhone] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            const data = await api.getSystemSettings();
            setSettings(data);
            setPrice(data.listingPrice);
            setAdminPhone(data.adminContactPhone || '');
            setIsLoading(false);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        await api.updateSystemSettings({ 
            listingPrice: price,
            adminContactPhone: adminPhone
        });
        const updatedSettings = await api.getSystemSettings();
        setSettings(updatedSettings);
        setIsSaving(false);
    }

    if (isLoading) return <p>Carregando configurações...</p>

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-6">Configurações do Sistema</h1>
            
            <div className="max-w-md space-y-6">
                <div>
                    <label htmlFor="listingPrice" className="block text-sm font-medium text-gray-700">Preço por Anúncio (R$)</label>
                    <input 
                        type="number"
                        id="listingPrice"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                    />
                </div>
                 <div>
                    <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700">Telefone do Admin para Contato (WhatsApp)</label>
                    <input 
                        type="text"
                        id="adminPhone"
                        placeholder="Ex: 5511999998888"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm rounded-md"
                    />
                    <p className="mt-1 text-xs text-gray-500">Este número será usado nos anúncios onde o contato for definido como "Administrador".</p>
                </div>
                <Button onClick={handleSave} isLoading={isSaving}>
                    Salvar Alterações
                </Button>
            </div>
        </div>
    );
};

export default AdminSettings;