import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Page } from '../App';
import Icon from './Icon';
import Button from './Button';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, onSearch }) => {
  const { user, logout } = useAuth();
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    logout();
    onNavigate('home');
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate('home')}
        >
          <Icon name="logo" className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-primary hidden sm:block">ImóvelHub</span>
        </div>
        <div className="flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
                <input 
                    type="text" 
                    placeholder="Busque por cidade ou bairro..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-full bg-neutral-light border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="search" className="w-5 h-5 text-neutral-medium" />
                </div>
            </form>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden md:inline text-neutral-medium">Olá, {user.name.split(' ')[0]}</span>
              {user.role === 'admin' && (
                <Button onClick={() => onNavigate('admin')} variant='primary' size='sm'>Painel Admin</Button>
              )}
              <Button onClick={() => onNavigate('dashboard')} variant='outline' size='sm'>Meus Anúncios</Button>
              <Button onClick={handleLogout} variant='secondary' size='sm'>Sair</Button>
            </>
          ) : (
            <Button onClick={() => onNavigate('auth')} variant='primary' size='sm'>
              <Icon name="user" className="w-5 h-5 mr-1"/>
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
