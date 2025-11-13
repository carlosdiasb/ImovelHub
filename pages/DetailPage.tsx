import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, User, SystemSettings } from '../types';
import * as api from '../services/mockApi';
import Icon from '../components/Icon';
import Button from '../components/Button';
import { Page } from '../App';
import { useAuth } from '../context/AuthContext';

interface DetailPageProps {
  propertyId: string;
  onNavigate: (page: Page) => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ propertyId, onNavigate }) => {
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const [propData, settingsData] = await Promise.all([
          api.getPropertyById(propertyId),
          api.getSystemSettings()
      ]);

      if(propData) {
        setProperty(propData);
        setMessage(`Olá! Tenho interesse no imóvel '${propData.title}'. Gostaria de mais informações.`);
        setSettings(settingsData);
        if (propData.status === 'Ativo') {
           api.incrementPropertyView(propertyId);
        }
        const ownerData = await api.getUserById(propData.ownerId);
        if(ownerData) setOwner(ownerData as User);
      }
    };
    fetchData();
  }, [propertyId]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !property) return;

    console.log('Simulating sending message:', {
        to: owner?.email,
        from: user.email,
        userName: user.name,
        propertyId: property.id,
        propertyTitle: property.title,
        message: message,
    });
    
    setMessageSent(true);
  };
  
  const handleShare = async () => {
    if (!property) return;

    const shareData = {
        title: property.title,
        text: `Confira este imóvel incrível: ${property.title}`,
        url: window.location.href, // In a real app with routing, this URL would be dynamic and persistent
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Erro ao compartilhar:', err);
        }
    } else {
        navigator.clipboard.writeText(shareData.url);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    }
};


  if (!property || !owner) {
    return (
        <div className="text-center p-10">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-neutral-medium">Carregando detalhes do imóvel...</p>
        </div>
    );
  }
  
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`;
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price);
  const showPrice = user || !property.priceOnRequest;
  const isExpired = property.expiresAt && new Date(property.expiresAt) < new Date();

  const characteristics = [
    { label: 'Piscina', value: property.hasPool },
    { label: 'Mobiliado', value: property.isFurnished },
    { label: 'Aceita Pets', value: property.petsAllowed },
  ].filter(c => c.value);

  const accountTypeLabels: Record<User['accountType'], string> = {
    particular: 'Particular',
    corretor: 'Corretor(a)',
    imobiliaria: 'Imobiliária'
  };

  return (
    <>
    <AnimatePresence>
        {showNotification && (
            <motion.div
                initial={{ opacity: 0, y: -20, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: -20, x: '-50%' }}
                className="fixed top-24 left-1/2 bg-secondary text-white px-4 py-2 rounded-lg shadow-lg z-50"
            >
                Link copiado para a área de transferência!
            </motion.div>
        )}
    </AnimatePresence>
    <motion.div layoutId={`property-card-${property.id}`}>
      <Button onClick={() => onNavigate('home')} variant="outline" size="sm" className="mb-6">
        <Icon name="arrow-left" className="w-4 h-4 mr-2" />
        Voltar para a lista
      </Button>

      {isExpired && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
          <p className="font-bold">Anúncio Expirado</p>
          <p>Este anúncio não está mais ativo.</p>
        </div>
      )}

      <h1 className="text-4xl font-bold text-primary mb-2">{property.title}</h1>
      <p className="text-lg text-neutral-medium flex items-center gap-2 mb-6">
        <Icon name="pin" className="w-5 h-5" />
        {property.city}, {property.neighborhood}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <motion.img
              layoutId={`property-image-${property.id}`}
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-[500px] object-cover rounded-lg shadow-lg mb-2"
            />
            <div className="flex gap-2 overflow-x-auto p-1">
              {property.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all ${
                    index === currentImageIndex ? 'ring-4 ring-secondary' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-neutral-dark mb-4 border-b pb-2">Descrição</h2>
          <p className="text-neutral-medium leading-relaxed whitespace-pre-wrap">{property.description}</p>
          
          {characteristics.length > 0 && (
            <>
            <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4 border-b pb-2">Características</h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {characteristics.map(char => (
                    <li key={char.label} className="flex items-center gap-2 text-neutral-medium">
                        <div className="w-5 h-5 bg-secondary text-white rounded-full flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span>{char.label}</span>
                    </li>
                ))}
            </ul>
            </>
          )}


           <h2 className="text-2xl font-bold text-neutral-dark mt-8 mb-4 border-b pb-2">Localização</h2>
           <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                <div className="bg-gray-300 h-80 rounded-lg flex items-center justify-center text-neutral-medium shadow-inner bg-cover bg-center" style={{backgroundImage: `url(https://maps.googleapis.com/maps/api/staticmap?center=${property.lat},${property.lng}&zoom=15&size=800x400&markers=color:red%7C${property.lat},${property.lng}&key=YOUR_API_KEY)`}}>
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                        <span className="bg-white text-primary font-semibold px-4 py-2 rounded-full shadow-md">Abrir no Google Maps</span>
                    </div>
                </div>
            </a>

        </div>

        {/* Contact & Info Card */}
        <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white p-6 rounded-lg shadow-xl">
                {showPrice ? (
                  <>
                  <p className="text-4xl font-bold text-primary mb-2">{formattedPrice}</p>
                  {property.condoFee && <p className="text-sm text-neutral-medium">Condomínio: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.condoFee)}</p>}
                  {property.iptu && <p className="text-sm text-neutral-medium mb-4">IPTU: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.iptu)}</p>}
                  </>
                ) : (
                  <p className="text-3xl font-semibold text-primary mb-4">Valor a consultar</p>
                )}
                <div className="grid grid-cols-2 gap-4 text-center my-6">
                    {property.bedrooms && <div><Icon name="bed" className="w-6 h-6 mx-auto text-neutral-medium"/><span className="text-sm">{property.bedrooms} Quartos</span></div>}
                    {property.suites && <div><Icon name="bath" className="w-6 h-6 mx-auto text-neutral-medium"/><span className="text-sm">{property.suites} Suítes</span></div>}
                    {property.bathrooms && <div><Icon name="bath" className="w-6 h-6 mx-auto text-neutral-medium"/><span className="text-sm">{property.bathrooms} Banheiros</span></div>}
                    <div><Icon name="area" className="w-6 h-6 mx-auto text-neutral-medium"/><span className="text-sm">{property.area} m²</span></div>
                    {property.garageSpots && <div><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto text-neutral-medium" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg><span className="text-sm">{property.garageSpots} Vagas</span></div>}
                </div>

                <div className="border-t pt-4">
                    <p className="font-semibold text-neutral-dark">Anunciado por:</p>
                    <p className="text-lg text-neutral-medium mb-4">{owner.name} <span className="text-sm font-semibold text-secondary">({accountTypeLabels[owner.accountType]})</span></p>
                    
                    {user ? (
                        messageSent ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center p-4 bg-green-100 rounded-lg"
                            >
                                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <p className="font-semibold text-green-800">Mensagem enviada com sucesso!</p>
                                <p className="text-sm text-green-700">O anunciante entrará em contato em breve.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSendMessage} className="space-y-3">
                                <div>
                                    <label htmlFor="contact-name" className="block text-xs font-medium text-gray-500">Seu nome</label>
                                    <input id="contact-name" type="text" value={user.name} readOnly className="mt-1 w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block text-xs font-medium text-gray-500">Seu email</label>
                                    <input id="contact-email" type="email" value={user.email} readOnly className="mt-1 w-full bg-gray-100 border-gray-300 rounded-md shadow-sm p-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block text-xs font-medium text-gray-500">Mensagem</label>
                                    <textarea
                                        id="contact-message"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={4}
                                        className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary p-2 text-sm"
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="w-full" disabled={isExpired}>
                                   Enviar Mensagem
                                </Button>
                            </form>
                        )
                    ) : (
                        <div className="text-center p-4 bg-neutral-light rounded-lg border border-gray-200">
                            <Icon name="user" className="w-8 h-8 mx-auto text-primary mb-2" />
                            <p className="font-semibold text-primary mb-2">Entre para contatar o anunciante</p>
                            <p className="text-sm text-neutral-medium mb-4">Veja os detalhes de contato e envie mensagens com facilidade.</p>
                            <Button onClick={() => onNavigate('auth')} className="w-full">
                                Entrar ou Criar Conta
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" className="w-full mt-3" onClick={handleShare} disabled={isExpired}>
                         <Icon name="share" className="w-5 h-5 mr-2" /> Compartilhar
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};

export default DetailPage;
