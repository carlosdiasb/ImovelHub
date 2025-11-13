import React, { useState, useEffect } from 'react';
import { PropertyTypeSetting } from '../../types';
import * as api from '../../services/mockApi';
import Button from '../Button';
import Icon from '../Icon';

const AdminPropertyTypeManager: React.FC = () => {
    const [types, setTypes] = useState<PropertyTypeSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingType, setEditingType] = useState<PropertyTypeSetting | null>(null);
    const [newTypeName, setNewTypeName] = useState('');

    const fetchTypes = async () => {
        setIsLoading(true);
        const data = await api.getPropertyTypes();
        setTypes(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTypeName.trim() === '') return;
        await api.addPropertyType(newTypeName);
        setNewTypeName('');
        fetchTypes();
    };

    const handleUpdate = async () => {
        if (!editingType || editingType.name.trim() === '') return;
        await api.updatePropertyType(editingType.id, editingType.name);
        setEditingType(null);
        fetchTypes();
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este tipo? Anúncios existentes com este tipo não serão alterados, mas ele não estará mais disponível para novos anúncios.')) {
            await api.deletePropertyType(id);
            fetchTypes();
        }
    };

    if (isLoading) return <p>Carregando tipos de imóvel...</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-dark mb-4">Gerenciar Tipos de Imóvel</h1>
            
            <form onSubmit={handleAdd} className="mb-6 flex gap-2">
                <input 
                    type="text" 
                    value={newTypeName} 
                    onChange={(e) => setNewTypeName(e.target.value)} 
                    placeholder="Nome do novo tipo"
                    className="flex-grow border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary sm:text-sm"
                />
                <Button type="submit" variant="secondary">Adicionar</Button>
            </form>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="text-left py-2 px-3">Nome</th>
                            <th className="text-left py-2 px-3">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {types.map(type => (
                            <tr key={type.id} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-3">
                                    {editingType?.id === type.id ? (
                                        <input 
                                            type="text"
                                            value={editingType.name}
                                            onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                                            className="border-gray-300 rounded-md shadow-sm sm:text-sm"
                                        />
                                    ) : (
                                        type.name
                                    )}
                                </td>
                                <td className="py-2 px-3 flex gap-2">
                                    {editingType?.id === type.id ? (
                                        <>
                                            <Button size="sm" variant="secondary" onClick={handleUpdate}>Salvar</Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingType(null)}>Cancelar</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => setEditingType(type)}><Icon name="edit" className="w-4 h-4" /></Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(type.id)}><Icon name="trash" className="w-4 h-4" /></Button>
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
};

export default AdminPropertyTypeManager;
