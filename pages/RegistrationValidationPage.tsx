import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../App';
import { User } from '../types';
import Button from '../components/Button';
import Icon from '../components/Icon';
import { motion } from 'framer-motion';

interface RegistrationValidationPageProps {
  onNavigate: (page: Page) => void;
}

type FormData = Pick<User, 'phone' | 'creciNumber' | 'creciState' | 'companyName' | 'cnpj'>;

const UFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const RegistrationValidationPage: React.FC<RegistrationValidationPageProps> = ({ onNavigate }) => {
    const { user, updateUser, isLoading } = useAuth();
    const [formData, setFormData] = useState<FormData>({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                phone: user.phone || '',
                creciNumber: user.creciNumber || '',
                creciState: user.creciState || '',
                companyName: user.companyName || '',
                cnpj: user.cnpj || '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const { error: apiError } = await updateUser({
            ...formData,
            validationStatus: 'pending'
        });

        if (apiError) {
            setError('Falha ao enviar os dados. Tente novamente.');
        } else {
            setSuccess('Seus dados foram enviados para análise! Você será notificado sobre o resultado.');
        }
    };

    if (!user || (user.accountType !== 'corretor' && user.accountType !== 'imobiliaria')) {
        return (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-red-600">Acesso Restrito</h2>
                <p className="mt-2 text-neutral-medium">Esta página é exclusiva para usuários do tipo Corretor ou Imobiliária.</p>
                <Button onClick={() => onNavigate('dashboard')} className="mt-6">Voltar para o Painel</Button>
            </div>
        );
    }

    if (user.validationStatus === 'pending') {
        return (
             <div className="text-center max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="w-20 h-20 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-primary mb-2">Cadastro em Análise</h2>
                    <p className="text-neutral-medium text-sm mb-6">Suas informações foram recebidas e estão sendo analisadas por nossa equipe. Você será notificado por e-mail quando o processo for concluído.</p>
                    <Button onClick={() => onNavigate('dashboard')}>Voltar para o Painel</Button>
                </motion.div>
             </div>
        );
    }
    
     if (user.validationStatus === 'approved') {
        return (
             <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                 <Button onClick={() => onNavigate('dashboard')} variant="outline" size="sm" className="mb-6">
                    <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="flex items-center gap-4 mb-6">
                         <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                             <h2 className="text-2xl font-bold text-primary">Cadastro Aprovado!</h2>
                             <p className="text-neutral-medium">Suas informações foram validadas. Agora seus anúncios terão um selo de verificação.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3 text-neutral-dark border-t pt-4">
                        <p><strong>Nome:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Telefone:</strong> {user.phone}</p>
                         {user.accountType === 'corretor' && (
                            <>
                               <p><strong>CRECI:</strong> {user.creciNumber} - {user.creciState}</p>
                            </>
                         )}
                         {user.accountType === 'imobiliaria' && (
                            <>
                                <p><strong>Razão Social:</strong> {user.companyName}</p>
                                <p><strong>CNPJ:</strong> {user.cnpj}</p>
                                <p><strong>CRECI Jurídico:</strong> {user.creciNumber} - {user.creciState}</p>
                            </>
                         )}
                    </div>
                </motion.div>
             </div>
        );
    }

    // Form for 'not_submitted' or 'rejected'
    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <Button onClick={() => onNavigate('dashboard')} variant="outline" size="sm" className="mb-6">
                <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                Voltar
            </Button>
            <h1 className="text-3xl font-bold text-primary mb-2">Validação de Cadastro</h1>
            <p className="text-neutral-medium mb-6">Preencha suas informações profissionais para verificar sua conta.</p>

            {user.validationStatus === 'rejected' && <p className="text-red-600 bg-red-50 p-3 rounded-md mb-4 text-sm">Seu cadastro anterior foi rejeitado. Por favor, verifique seus dados e envie novamente.</p>}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div>
                    <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2 mb-4">Dados Pessoais</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                            <input type="text" value={user.name} readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={user.email} readOnly className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div>
                     <h2 className="text-xl font-semibold text-neutral-dark border-b pb-2 mb-4">Dados Profissionais</h2>
                     {user.accountType === 'corretor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="creciNumber" className="block text-sm font-medium text-gray-700">Número do CRECI (com -F)</label>
                                <input type="text" name="creciNumber" id="creciNumber" value={formData.creciNumber} onChange={handleChange} placeholder="Ex: 12345-F" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                            </div>
                             <div>
                                <label htmlFor="creciState" className="block text-sm font-medium text-gray-700">Estado do CRECI</label>
                                <select name="creciState" id="creciState" value={formData.creciState} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required>
                                    <option value="">Selecione...</option>
                                    {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                </select>
                            </div>
                        </div>
                     )}

                     {user.accountType === 'imobiliaria' && (
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Razão Social</label>
                                    <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                                <div>
                                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ</label>
                                    <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                             </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                    <label htmlFor="creciNumber" className="block text-sm font-medium text-gray-700">CRECI Jurídico (com -J)</label>
                                    <input type="text" name="creciNumber" id="creciNumber" value={formData.creciNumber} onChange={handleChange} placeholder="Ex: 54321-J" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                                 <div>
                                    <label htmlFor="creciState" className="block text-sm font-medium text-gray-700">Estado do CRECI</label>
                                    <select name="creciState" id="creciState" value={formData.creciState} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required>
                                        <option value="">Selecione...</option>
                                        {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                     )}
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {success && <p className="text-green-600 text-sm text-center">{success}</p>}

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isLoading} size="lg">
                        Enviar para Análise
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationValidationPage;
