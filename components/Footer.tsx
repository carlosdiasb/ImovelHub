
import React from 'react';
import Icon from './Icon';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="logo" className="w-8 h-8 text-secondary" />
              <span className="text-xl font-bold">ImóvelHub</span>
            </div>
            <p className="text-neutral-medium">Sua plataforma para encontrar o imóvel dos sonhos.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Navegação</h3>
            <ul className="space-y-2 text-neutral-medium">
              <li><a href="#" className="hover:text-secondary">Início</a></li>
              <li><a href="#" className="hover:text-secondary">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-secondary">Contato</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-neutral-medium">
              <li><a href="#" className="hover:text-secondary">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-secondary">Política de Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              {/* Add social media icons here */}
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-neutral-medium text-sm">
          &copy; {new Date().getFullYear()} ImóvelHub. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
