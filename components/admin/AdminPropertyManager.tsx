import React, { useState, useEffect, useMemo } from 'react';
import { Property, PropertyStatus, User } from '../../types';
import * as api from '../../services/mockApi';
import Button from '../Button';
import Icon from '../Icon';

const StatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
  const statusStyles: Record<PropertyStatus, string> = {
    [PropertyStatus.Active]: 'bg-green-100 text-green-800',
    [PropertyStatus.PendingPayment]: 'bg-yellow-100 text-yellow-800',
    [PropertyStatus.PendingApproval]: 'bg-blue-100 text-blue-800',
    [PropertyStatus.Rejected]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

interface AdminPropertyManagerProps {
    selectedUserId?: string | null;
    onClearUserFilter: () => void;
}

const AdminPropertyManager: React.FC<AdminPropertyManagerProps> = ({ selectedUserId, onClearUserFilter }) => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<PropertyStatus | 'all'>('all');
    
    const fetchAllData = async () => {
        setIsLoading(true);
        const [propsData, usersData] = await Promise.all([
            api.getAllPropertiesAdmin(),
            api.getAllUsersAdmin(),
        ]);
        setProperties(propsData);
        setUsers(usersData);
        setIsLoading(false);
    }
    
    useEffect(() => {
        fetchAllData();
    }, []);

    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user.name;
            return acc;
        }, {} as Record<string, string>);
    }, [users]);

    const handleUpdateProperty = async (id: string, data: Partial<Property>) => {
        await api.updateProperty(id, data);
        fetchAllData();
    }
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este anúncio permanentemente?')) {
            await api.deleteProperty(id);
            fetchAllData();
        }
    }
    
    const filteredProperties = useMemo(() => {
        let props = properties;
        if(selectedUserId) {
            props = props.filter(p => p.ownerId === selectedUserId);
        }

        if (filter === 'all') return props;
        return props.filter(p => p.status === filter);
    }, [properties, filter, selectedUserId]);

    if(isLoading) return <p>Carregando anúncios...</p>

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-4">Gerenciar Anúncios</h1>

             {selectedUserId && (
                <div className="mb-4 p-3 bg-blue-50 rounded-md flex justify-between items-center">
                    <p className="text-blue-800 font-semibold">Mostrando anúncios de: {userMap[selectedUserId] || 'Usuário desconhecido'}</p>
                    <Button onClick={onClearUserFilter} size="sm" variant="outline">Limpar Filtro</Button>
                </div>
            )}

            <div className="mb-4 flex gap-2 flex-wrap">
                <Button variant={filter === 'all' ? 'primary' : 'outline'} size="sm" onClick={() => setFilter('all')}>Todos</Button>
                {Object.values(PropertyStatus).map(status => (
                    <Button key={status} variant={filter === status ? 'primary' : 'outline'} size="sm" onClick={() => setFilter(status)}>{status}</Button>
                ))}
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-2 px-3 font-semibold">Título</th>
                            <th className="text-left py-2 px-3 font-semibold">Usuário</th>
                            <th className="text-left py-2 px-3 font-semibold">Data de Criação</th>
                            <th className="text-left py-2 px-3 font-semibold">Validade</th>
                            <th className="text-left py-2 px-3 font-semibold">Contato WhatsApp</th>
                            <th className="text-left py-2 px-3 font-semibold">Status</th>
                            <th className="text-left py-2 px-3 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProperties.map(prop => {
                            const isExpired = prop.expiresAt && new Date(prop.expiresAt) < new Date();
                            return (
                            <tr key={prop.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">{prop.title}</td>
                                <td className="py-2 px-3">{userMap[prop.ownerId] || `ID: ${prop.ownerId}`}</td>
                                <td className="py-2 px-3">{new Date(prop.createdAt).toLocaleDateString('pt-BR')}</td>
                                <td className="py-2 px-3">
                                   <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            defaultValue={prop.expiresAt ? prop.expiresAt.split('T')[0] : ''}
                                            onChange={(e) => handleUpdateProperty(prop.id, { expiresAt: new Date(e.target.value).toISOString() })}
                                            className={`border rounded px-2 py-1 ${isExpired ? 'border-red-500 text-red-500' : 'border-gray-300'}`}
                                        />
                                   </div>
                                </td>
                                <td className="py-2 px-3">
                                     <select
                                        value={prop.contactOverride || 'owner'}
                                        onChange={(e) => handleUpdateProperty(prop.id, { contactOverride: e.target.value as 'owner' | 'admin' })}
                                        className="border rounded px-2 py-1 border-gray-300"
                                     >
                                         <option value="owner">Anunciante</option>
                                         <option value="admin">Administrador</option>
                                     </select>
                                </td>
                                <td className="py-2 px-3"><StatusBadge status={prop.status} /></td>
                                <td className="py-2 px-3 flex gap-2">
                                    {prop.status === PropertyStatus.PendingApproval && (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={() => handleUpdateProperty(prop.id, { status: PropertyStatus.Active })}>Aprovar</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleUpdateProperty(prop.id, { status: PropertyStatus.Rejected })}>Rejeitar</Button>
                                        </>
                                    )}
                                    <Button size="sm" variant="outline" onClick={() => handleDelete(prop.id)}><Icon name="trash" className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
             {filteredProperties.length === 0 && <p className="text-center mt-4 text-neutral-medium">Nenhum anúncio encontrado com este status.</p>}
        </div>
    );
}

export default AdminPropertyManager;