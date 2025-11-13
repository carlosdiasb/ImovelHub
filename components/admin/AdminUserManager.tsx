import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import * as api from '../../services/mockApi';
import Button from '../Button';

interface AdminUserManagerProps {
    onViewUserProperties: (userId: string) => void;
}

const AdminUserManager: React.FC<AdminUserManagerProps> = ({ onViewUserProperties }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUsers = async () => {
        setIsLoading(true);
        const data = await api.getAllUsersAdmin();
        setUsers(data);
        setIsLoading(false);
    }
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdateStatus = async (id: string, status: 'active' | 'blocked') => {
        await api.updateUser(id, { status });
        fetchUsers();
    }

    if (isLoading) return <p>Carregando usuários...</p>;

    return (
         <div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-4">Gerenciar Usuários</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-2 px-3">Nome</th>
                            <th className="text-left py-2 px-3">Email</th>
                            <th className="text-left py-2 px-3">Anúncios</th>
                            <th className="text-left py-2 px-3">Role</th>
                            <th className="text-left py-2 px-3">Status</th>
                            <th className="text-left py-2 px-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">{user.name}</td>
                                <td className="py-2 px-3">{user.email}</td>
                                <td className="py-2 px-3 text-center">{user.propertyCount || 0}</td>
                                <td className="py-2 px-3">{user.role}</td>
                                <td className="py-2 px-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                                </td>
                                <td className="py-2 px-3 flex gap-2">
                                     {user.role !== 'admin' && (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => onViewUserProperties(user.id)}>Ver Anúncios</Button>
                                            {user.status === 'active' 
                                            ? <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(user.id, 'blocked')}>Bloquear</Button>
                                            : <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(user.id, 'active')}>Desbloquear</Button>
                                            }
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUserManager;