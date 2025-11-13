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

type FormData = Pick<
  User,
  | 'phone'
  | 'creciNumber'
  | 'creciState'
  | 'companyName'
  | 'cnpj'
  | 'documentType'
  | 'documentNumber'
  | 'documentUrl'
  | 'proofOfAddressUrl'
  | 'yearsOfExperience'
  | 'serviceRegions'
  | 'specialties'
  | 'professionalWebsite'
  | 'contactPreference'
  | 'preferredContactTime'
  | 'additionalNotes'
  | 'teamSize'
>;

const initialFormState: FormData = {
  phone: '',
  creciNumber: '',
  creciState: '',
  companyName: '',
  cnpj: '',
  documentType: '',
  documentNumber: '',
  documentUrl: '',
  proofOfAddressUrl: '',
  yearsOfExperience: '',
  serviceRegions: '',
  specialties: '',
  professionalWebsite: '',
  contactPreference: 'email',
  preferredContactTime: '',
  additionalNotes: '',
  teamSize: '',
};

const UFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const documentTypes = [
  { value: 'creci_fisico', label: 'CRECI Individual (-F)', hint: 'Para corretores autonomos.' },
  { value: 'creci_juridico', label: 'CRECI Juridico (-J)', hint: 'Imobiliarias com registro ativo.' },
  { value: 'cnpj', label: 'CNPJ', hint: 'Usado para validar dados fiscais.' },
  { value: 'outro', label: 'Outro documento', hint: 'Certidoes ou documentos complementares.' },
];

const contactPreferences = [
  { value: 'email', label: 'Email' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const requirementChecklist = [
  'Documento profissional valido (CRECI ou CNPJ).',
  'Comprovante de endereco emitido nos ultimos 90 dias.',
  'Detalhamento da regiao e especialidades de atuacao.',
  'Link de site ou portfolio (quando disponivel).',
  'Canal preferencial para contato da auditoria.',
];

const RegistrationValidationPage: React.FC<RegistrationValidationPageProps> = ({ onNavigate }) => {
    const { user, updateUser, isLoading } = useAuth();
    const [formData, setFormData] = useState<FormData>(initialFormState);
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
                documentType: user.documentType || '',
                documentNumber: user.documentNumber || '',
                documentUrl: user.documentUrl || '',
                proofOfAddressUrl: user.proofOfAddressUrl || '',
                yearsOfExperience: user.yearsOfExperience || '',
                serviceRegions: user.serviceRegions || '',
                specialties: user.specialties || '',
                professionalWebsite: user.professionalWebsite || '',
                contactPreference: user.contactPreference || 'email',
                preferredContactTime: user.preferredContactTime || '',
                additionalNotes: user.additionalNotes || '',
                teamSize: user.teamSize || '',
            });
        } else {
            setFormData(initialFormState);
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateRequiredFields = () => {
        if (!user) return false;
        const baseFields: Array<keyof FormData> = [
            'phone',
            'documentType',
            'documentNumber',
            'documentUrl',
            'yearsOfExperience',
            'serviceRegions',
            'specialties',
            'contactPreference',
        ];
        const typeSpecific: Array<keyof FormData> = user.accountType === 'imobiliaria'
            ? ['companyName', 'cnpj', 'creciNumber', 'creciState', 'proofOfAddressUrl', 'teamSize']
            : ['creciNumber', 'creciState', 'proofOfAddressUrl'];
        const missing = [...baseFields, ...typeSpecific].filter(field => !String(formData[field] || '').trim());
        if (missing.length) {
            setError('Preencha todos os campos obrigatorios marcados com * antes de enviar.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateRequiredFields()) {
            return;
        }

        const { error: apiError } = await updateUser({
            ...formData,
            validationStatus: 'pending'
        });

        if (apiError) {
            setError('Falha ao enviar os dados. Tente novamente.');
        } else {
            setSuccess('Seus dados foram enviados para analise! Voce sera notificado sobre o resultado.');
        }
    };

    if (!user || (user.accountType !== 'corretor' && user.accountType !== 'imobiliaria')) {
        return (
            <div className="text-center bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-red-600">Acesso Restrito</h2>
                <p className="mt-2 text-neutral-medium">Esta pÃ¡gina Ã© exclusiva para usuÃ¡rios do tipo Corretor ou ImobiliÃ¡ria.</p>
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
                    <h2 className="text-2xl font-bold text-center text-primary mb-2">Cadastro em AnÃ¡lise</h2>
                    <p className="text-neutral-medium text-sm mb-6">Suas informaÃ§Ãµes foram recebidas e estÃ£o sendo analisadas por nossa equipe. VocÃª serÃ¡ notificado por e-mail quando o processo for concluÃ­do.</p>
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
                             <p className="text-neutral-medium">Suas informaÃ§Ãµes foram validadas. Agora seus anÃºncios terÃ£o um selo de verificaÃ§Ã£o.</p>
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
                                <p><strong>RazÃ£o Social:</strong> {user.companyName}</p>
                                <p><strong>CNPJ:</strong> {user.cnpj}</p>
                                <p><strong>CRECI JurÃ­dico:</strong> {user.creciNumber} - {user.creciState}</p>
                            </>
                         )}
                    </div>
                </motion.div>
             </div>
        );
    }

    // Form for 'not_submitted' or 'rejected'
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
            <Button onClick={() => onNavigate('dashboard')} variant="outline" size="sm" className="mb-6">
                <Icon name="arrow-left" className="w-4 h-4 mr-2" />
                Voltar
            </Button>

            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                    <p className="text-xs uppercase font-semibold text-secondary tracking-wide">Validacao de Cadastro</p>
                    <h1 className="text-3xl font-bold text-primary mt-1">Detalhe suas informacoes para validar o acesso</h1>
                    <p className="text-neutral-medium text-sm mt-2">Quanto mais completos forem os dados abaixo, mais rapido conseguimos liberar suas publicacoes e ofertas.</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-semibold ${user.validationStatus === 'rejected' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                    {user.validationStatus === 'rejected' ? 'Revisar informacoes' : 'Pendente de envio'}
                </span>
            </div>

            {user.validationStatus === 'rejected' && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 p-4 rounded-md mb-6">
                    <p className="font-semibold mb-1">Cadastro anterior reprovado</p>
                    <p>Verifique se os links estao acessiveis e se os documentos estao atualizados antes de reenviar.</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h3 className="text-sm font-semibold text-neutral-dark uppercase tracking-wide mb-2">Etapas da avaliacao</h3>
                    <ol className="text-xs text-neutral-medium list-decimal list-inside space-y-1">
                        <li>Envie os dados completos</li>
                        <li>Equipe valida documentos</li>
                        <li>Status chega por email</li>
                    </ol>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-neutral-dark uppercase tracking-wide mb-2">Documentos exigidos</h3>
                    <ul className="text-xs text-neutral-medium space-y-1">
                        {requirementChecklist.map(item => (
                            <li key={item} className="flex items-start gap-1">
                                <span className="text-secondary mt-0.5">&bull;</span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-neutral-50">
                    <h3 className="text-sm font-semibold text-neutral-dark uppercase tracking-wide mb-2">Precisa de ajuda?</h3>
                    <p className="text-sm text-neutral-medium mb-2">Suporte de segunda a sexta, 09h - 18h.</p>
                    <p className="text-sm font-semibold text-primary">suporte@imovelhub.com</p>
                    <p className="text-sm font-semibold text-primary">WhatsApp (31) 98877-6655</p>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Info */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neutral-dark">Dados pessoais</h2>
                        <span className="text-xs text-neutral-medium">Campos marcados com * sao obrigatorios</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nome completo</label>
                            <input type="text" value={user.name} readOnly className="mt-1 block w-full bg-gray-100 border-gray-200 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={user.email} readOnly className="mt-1 block w-full bg-gray-100 border-gray-200 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone / WhatsApp *</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                            <p className="text-xs text-neutral-medium mt-1">Preferimos um numero com WhatsApp ativo para validacoes.</p>
                        </div>
                    </div>
                </section>

                {/* Document Info */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neutral-dark">Documentacao para validacao</h2>
                        <span className="text-xs text-neutral-medium">Envie links compartilhaveis (Google Drive, OneDrive, etc.)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Documento principal *</label>
                            <select name="documentType" id="documentType" value={formData.documentType} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required>
                                <option value="">Selecione...</option>
                                {documentTypes.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-neutral-medium mt-1">{documentTypes.find(option => option.value === formData.documentType)?.hint || 'Selecione o documento que representa sua atuacao.'}</p>
                        </div>
                        <div>
                            <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">Numero do documento *</label>
                            <input type="text" name="documentNumber" id="documentNumber" value={formData.documentNumber} onChange={handleChange} placeholder="Ex: 54321-J" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="documentUrl" className="block text-sm font-medium text-gray-700">Link do documento *</label>
                            <input type="url" name="documentUrl" id="documentUrl" value={formData.documentUrl} onChange={handleChange} placeholder="https://drive.google.com/..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                        <div>
                            <label htmlFor="proofOfAddressUrl" className="block text-sm font-medium text-gray-700">Comprovante de endereco *</label>
                            <input type="url" name="proofOfAddressUrl" id="proofOfAddressUrl" value={formData.proofOfAddressUrl} onChange={handleChange} placeholder="https://..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                            <p className="text-xs text-neutral-medium mt-1">Aceitamos contas de consumo emitidas nos ultimos 90 dias.</p>
                        </div>
                    </div>
                </section>

                {/* Professional Info */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neutral-dark">Dados profissionais e atuacao</h2>
                        <span className="text-xs text-neutral-medium">Descreva como voce atua.</span>
                    </div>
                     {user.accountType === 'corretor' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label htmlFor="creciNumber" className="block text-sm font-medium text-gray-700">Numero do CRECI (-F) *</label>
                                <input type="text" name="creciNumber" id="creciNumber" value={formData.creciNumber} onChange={handleChange} placeholder="Ex: 12345-F" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                            </div>
                             <div>
                                <label htmlFor="creciState" className="block text-sm font-medium text-gray-700">Estado do CRECI *</label>
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
                                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Razao social *</label>
                                    <input type="text" name="companyName" id="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                                <div>
                                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">CNPJ *</label>
                                    <input type="text" name="cnpj" id="cnpj" value={formData.cnpj} onChange={handleChange} placeholder="00.000.000/0000-00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                             </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div>
                                    <label htmlFor="creciNumber" className="block text-sm font-medium text-gray-700">CRECI Juridico (-J) *</label>
                                    <input type="text" name="creciNumber" id="creciNumber" value={formData.creciNumber} onChange={handleChange} placeholder="Ex: 54321-J" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                                 <div>
                                    <label htmlFor="creciState" className="block text-sm font-medium text-gray-700">Estado do CRECI *</label>
                                    <select name="creciState" id="creciState" value={formData.creciState} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required>
                                        <option value="">Selecione...</option>
                                        {UFs.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">Tamanho da equipe *</label>
                                    <input type="text" name="teamSize" id="teamSize" value={formData.teamSize} onChange={handleChange} placeholder="Ex: 12 colaboradores" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                                </div>
                            </div>
                        </div>
                     )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">Tempo de atuacao (anos) *</label>
                            <input type="text" name="yearsOfExperience" id="yearsOfExperience" value={formData.yearsOfExperience} onChange={handleChange} placeholder="Ex: 8" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="professionalWebsite" className="block text-sm font-medium text-gray-700">Site ou portfolio</label>
                            <input type="url" name="professionalWebsite" id="professionalWebsite" value={formData.professionalWebsite} onChange={handleChange} placeholder="https://www.seusite.com.br" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="serviceRegions" className="block text-sm font-medium text-gray-700">Regioes de atuacao *</label>
                            <textarea name="serviceRegions" id="serviceRegions" value={formData.serviceRegions} onChange={handleChange} rows={3} placeholder="Ex: Belo Horizonte, Nova Lima, condominios no vetor sul..." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                        <div>
                            <label htmlFor="specialties" className="block text-sm font-medium text-gray-700">Especialidades / Nichos *</label>
                            <textarea name="specialties" id="specialties" value={formData.specialties} onChange={handleChange} rows={3} placeholder="Ex: alto padrao, comercial, lancamentos." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" required />
                        </div>
                    </div>
                </section>

                {/* Contact preferences */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-neutral-dark">Preferencias de contato e observacoes</h2>
                        <span className="text-xs text-neutral-medium">Informe como podemos falar com voce durante a auditoria.</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Canal preferencial *</label>
                        <div className="flex flex-wrap gap-3">
                            {contactPreferences.map(option => (
                                <label key={option.value} className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-medium ${formData.contactPreference === option.value ? 'bg-secondary text-white border-secondary' : 'border-gray-300 text-gray-600'}`}>
                                    <input type="radio" name="contactPreference" value={option.value} checked={formData.contactPreference === option.value} onChange={handleChange} className="sr-only" />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label htmlFor="preferredContactTime" className="block text-sm font-medium text-gray-700">Melhor horario para contato</label>
                            <input type="text" name="preferredContactTime" id="preferredContactTime" value={formData.preferredContactTime} onChange={handleChange} placeholder="Ex: 09h - 18h" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" />
                        </div>
                        <div>
                            <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">Observacoes para a equipe</label>
                            <textarea name="additionalNotes" id="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={3} placeholder="Compartilhe liberacoes especificas, URLs adicionais ou instrucoes." className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary" />
                        </div>
                    </div>
                </section>
                
                {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
                {success && <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">{success}</div>}

                <div className="flex justify-end pt-2">
                    <Button type="submit" isLoading={isLoading} size="lg">
                        Enviar para Analise
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default RegistrationValidationPage;


