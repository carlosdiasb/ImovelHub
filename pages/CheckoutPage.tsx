import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, SystemSettings } from '../types';
import * as api from '../services/mockApi';
import { Page } from '../App';
import Button from '../components/Button';
import Icon from '../components/Icon';

interface CheckoutPageProps {
  propertyId: string;
  onNavigate: (page: Page) => void;
}

type PaymentMethod = 'credit-card' | 'pix' | 'boleto';

const CheckoutPage: React.FC<CheckoutPageProps> = ({ propertyId, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [propData, settingsData] = await Promise.all([
        api.getPropertyById(propertyId),
        api.getSystemSettings(),
      ]);
      setProperty(propData || null);
      setSettings(settingsData);
      setIsLoading(false);
    };
    fetchData();
  }, [propertyId]);
  
  const handlePayment = async () => {
    if (!property) return;
    setIsProcessing(true);
    await api.simulatePayment(property.id);
    setIsProcessing(false);
    setPaymentSuccess(true);
    
    setTimeout(() => {
        onNavigate('dashboard');
    }, 2500);
  };
  
  if (isLoading) {
    return (
        <div className="text-center p-10">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-neutral-medium">Carregando checkout...</p>
        </div>
    );
  }

  if (!property || !settings) {
    return <p className="text-center text-red-500">Imóvel ou configurações não encontrados.</p>
  }
  
  if (paymentSuccess) {
      return (
          <div className="text-center max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
             <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
             >
                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-primary mb-2">Pagamento Aprovado!</h2>
                <p className="text-neutral-medium text-sm mb-6">Seu anúncio foi enviado para aprovação. Você será redirecionado em breve.</p>
             </motion.div>
          </div>
      );
  }

  const paymentMethods: { id: PaymentMethod; name: string; icon: any }[] = [
      { id: 'credit-card', name: 'Cartão de Crédito', icon: 'credit-card' },
      { id: 'pix', name: 'PIX', icon: 'pix' },
      { id: 'boleto', name: 'Boleto', icon: 'boleto' },
  ]

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary mb-4 border-b pb-2">Resumo do Pedido</h2>
        <div className="flex items-center gap-4">
            <img src={property.images[0]} alt={property.title} className="w-24 h-24 object-cover rounded-md" />
            <div>
                <h3 className="font-semibold text-neutral-dark">{property.title}</h3>
                <p className="text-sm text-neutral-medium">{property.city}</p>
            </div>
        </div>
        <div className="flex justify-between items-center mt-6 border-t pt-4">
            <span className="text-lg font-semibold">Taxa de Anúncio:</span>
            <span className="text-lg font-bold text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(settings.listingPrice)}</span>
        </div>
      </div>
      
      {/* Payment Details */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-primary mb-4">Pagamento</h2>
        <div className="flex border-b mb-4">
            {paymentMethods.map(method => (
                <button 
                    key={method.id} 
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${paymentMethod === method.id ? 'border-b-2 border-primary text-primary' : 'text-neutral-medium hover:text-primary'}`}
                >
                    <Icon name={method.icon} className="w-5 h-5" />
                    {method.name}
                </button>
            ))}
        </div>
        
        <AnimatePresence mode="wait">
            <motion.div
                key={paymentMethod}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
            >
                {paymentMethod === 'credit-card' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Número do Cartão</label>
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full border p-2 rounded mt-1" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium">Validade</label>
                                <input type="text" placeholder="MM/AA" className="w-full border p-2 rounded mt-1" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium">CVC</label>
                                <input type="text" placeholder="123" className="w-full border p-2 rounded mt-1" />
                            </div>
                        </div>
                    </div>
                )}
                {paymentMethod === 'pix' && (
                    <div className="text-center">
                        <p className="mb-4 text-neutral-medium">Escaneie o QR Code ou use o código abaixo para pagar.</p>
                        <Icon name="qrcode" className="w-48 h-48 mx-auto text-neutral-dark" />
                        <input type="text" readOnly value="00020126...copia_e_cola...540599.90..." className="w-full bg-gray-100 p-2 rounded mt-4 text-center text-sm" />
                    </div>
                )}
                {paymentMethod === 'boleto' && (
                    <div className="text-center">
                        <Icon name="boleto" className="w-32 h-32 mx-auto text-neutral-dark mb-4" />
                        <p className="text-neutral-medium">O boleto será gerado e enviado para o seu e-mail. O pagamento pode levar até 3 dias úteis para ser confirmado.</p>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
        
        <Button onClick={handlePayment} isLoading={isProcessing} className="w-full mt-6" size="lg">
            Confirmar Pagamento
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;