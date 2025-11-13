import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property, PropertyStatus } from '../types';
import * as api from '../services/mockApi';
import { Page } from '../App';
import Button from '../components/Button';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardPageProps {
  onNavigate: (page: Page, propertyId?: string) => void;
}

const StatusBadge: React.FC<{ status: PropertyStatus }> = ({ status }) => {
  const statusStyles: Record<PropertyStatus, string> = {
    [PropertyStatus.Active]: 'bg-green-100 text-green-800',
    [PropertyStatus.PendingPayment]: 'bg-yellow-100 text-yellow-800 animate-pulse',
    [PropertyStatus.PendingApproval]: 'bg-blue-100 text-blue-800',
    [PropertyStatus.Rejected]: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const fetchUserProperties = useCallback(async () => {
    if (user) {
      setIsLoading(true);
      const data = await api.getPropertiesByOwner(user.id);
      setProperties(data);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserProperties();
  }, [fetchUserProperties]);

  const handleDeleteClick = (id: string) => {
    setPropertyToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (propertyToDelete) {
      await api.deleteProperty(propertyToDelete);
      setProperties(properties.filter(p => p.id !== propertyToDelete));
    }
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };
  
  const shouldShowValidation = user && (user.accountType === 'corretor' || user.accountType === 'imobiliaria');


  if (!user) {
    return <div>Você precisa estar logado para acessar esta página.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-primary">Meus Anúncios</h1>
        <div className="flex items-center gap-2">
            {shouldShowValidation && (
                <Button onClick={() => onNavigate('registrationValidation')} variant="primary">
                    Meu Cadastro
                </Button>
            )}
            <Button onClick={() => onNavigate('create')} variant="secondary">
              <Icon name="plus" className="w-5 h-5 mr-2" />
              Criar Novo Anúncio
            </Button>
        </div>
      </div>

      {shouldShowValidation && user.validationStatus === 'not_submitted' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Cadastro Incompleto</p>
            <p>Valide suas informações de corretor/imobiliária para aumentar a confiança em seus anúncios.</p>
        </div>
      )}
       {shouldShowValidation && user.validationStatus === 'pending' && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Cadastro em Análise</p>
            <p>Suas informações foram recebidas e estão sendo analisadas por nossa equipe.</p>
        </div>
      )}
      {shouldShowValidation && user.validationStatus === 'rejected' && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
            <p className="font-bold">Cadastro Rejeitado</p>
            <p>Houve um problema com seus dados. Por favor, revise e envie novamente clicando em "Meu Cadastro".</p>
        </div>
      )}
      
      {isLoading ? (
        <p>Carregando seus imóveis...</p>
      ) : properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-neutral-medium">Você ainda não tem anúncios.</h2>
          <p className="text-neutral-medium mt-2 mb-6">Clique no botão acima para criar seu primeiro anúncio!</p>
          <Button onClick={() => onNavigate('create')} variant="secondary">
            Anunciar Imóvel
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            <AnimatePresence>
            {properties.map((prop) => {
              const isExpired = prop.expiresAt && new Date(prop.expiresAt) < new Date();
              return (
              <motion.li 
                key={prop.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="p-4 flex flex-col md:flex-row items-center justify-between hover:bg-neutral-light transition-colors"
              >
                <div className="flex items-center mb-4 md:mb-0 flex-grow">
                  <img src={prop.images[0]} alt={prop.title} className="w-24 h-24 object-cover rounded-md mr-4" />
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-neutral-dark">{prop.title}</h3>
                        <StatusBadge status={prop.status} />
                        {isExpired && <span className="text-xs font-semibold text-red-600">(Expirado)</span>}
                    </div>
                    <p className="text-sm text-neutral-medium">{prop.city}, {prop.neighborhood}</p>
                    <p className="text-primary font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prop.price)}</p>
                    <div className="flex items-center text-sm text-neutral-medium mt-1 space-x-4">
                        <div className="flex items-center">
                            <Icon name="eye" className="w-4 h-4 mr-1"/>
                            <span>{prop.views || 0} visualizações</span>
                        </div>
                        {prop.expiresAt && (
                             <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span>Validade: {new Date(prop.expiresAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {prop.status === PropertyStatus.PendingPayment && (
                    <Button onClick={() => onNavigate('checkout', prop.id)} variant="secondary" size="sm">
                        Pagar Agora
                    </Button>
                  )}
                  <Button 
                    onClick={() => onNavigate('edit', prop.id)} 
                    variant="outline" 
                    size="sm"
                    disabled={prop.status === PropertyStatus.PendingApproval}
                    title={prop.status === PropertyStatus.PendingApproval ? "Não é possível editar um anúncio em aprovação" : "Editar"}
                  >
                    <Icon name="edit" className="w-4 h-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDeleteClick(prop.id)} 
                    variant="danger" 
                    size="sm"
                    disabled={prop.status === PropertyStatus.PendingApproval}
                    title={prop.status === PropertyStatus.PendingApproval ? "Não é possível excluir um anúncio em aprovação" : "Excluir"}
                  >
                    <Icon name="trash" className="w-4 h-4" />
                  </Button>
                </div>
              </motion.li>
            )})}
            </AnimatePresence>
          </ul>
        </div>
      )}

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <p>Você tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;