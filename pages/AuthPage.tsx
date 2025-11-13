
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '../components/Icon';
import { User } from '../types';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'register' | 'forgotPassword' | 'forgotPasswordSuccess';

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [accountType, setAccountType] = useState<User['accountType']>('particular');
  const [error, setError] = useState('');
  const { login, register, requestPasswordReset, isLoading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { user, error } = await login(email, password);
    if (user) {
      onAuthSuccess();
    } else {
      setError(error || 'Email ou senha inválidos.');
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (password !== confirmPassword) {
          setError('As senhas não coincidem.');
          return;
      }
      if (password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }
      const { user, error } = await register(name, email, password, accountType);
      if (user) {
          onAuthSuccess();
      } else {
          setError(error || 'Ocorreu um erro ao criar a conta.');
      }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    await requestPasswordReset(email);
    setAuthMode('forgotPasswordSuccess');
  }

  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  };

  const renderForm = () => {
    switch(authMode) {
      case 'login':
        return (
          <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-3xl font-bold text-center text-primary mb-6">Entrar</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="email">Email</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-6">
                <label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="password">Senha</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark mb-3 leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="password" type="password" placeholder="******************" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setAuthMode('forgotPassword')} className="inline-block align-baseline font-bold text-sm text-primary hover:text-secondary">Esqueceu a senha?</button>
              </div>
              <Button type="submit" isLoading={isLoading} className="w-full">Entrar</Button>
            </form>
            <p className="text-center text-neutral-medium text-sm mt-6">Não tem uma conta? <button onClick={() => setAuthMode('register')} className="font-bold text-primary hover:text-secondary ml-1">Crie uma agora</button></p>
          </motion.div>
        );
      case 'register':
        return (
            <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
              <h2 className="text-3xl font-bold text-center text-primary mb-6">Criar Conta</h2>
              <form onSubmit={handleRegister}>
                  <div className="mb-4"><label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="name">Nome Completo</label><input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="name" type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required /></div>
                  <div className="mb-4"><label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="email-register">Email</label><input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="email-register" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                  <div className="mb-4">
                    <label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="accountType">Tipo de Conta</label>
                    <select id="accountType" value={accountType} onChange={(e) => setAccountType(e.target.value as User['accountType'])} className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary">
                        <option value="particular">Particular</option>
                        <option value="corretor">Corretor(a)</option>
                        <option value="imobiliaria">Imobiliária</option>
                    </select>
                  </div>
                  <div className="mb-4"><label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="password-register">Senha</label><input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="password-register" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                  <div className="mb-6"><label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="confirm-password">Confirmar Senha</label><input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="confirm-password" type="password" placeholder="Repita sua senha" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                  <Button type="submit" isLoading={isLoading} className="w-full">Registrar</Button>
              </form>
              <p className="text-center text-neutral-medium text-sm mt-6">Já tem uma conta? <button onClick={() => setAuthMode('login')} className="font-bold text-primary hover:text-secondary ml-1">Faça login</button></p>
            </motion.div>
        );
       case 'forgotPassword':
        return (
          <motion.div key="forgot" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <h2 className="text-3xl font-bold text-center text-primary mb-2">Recuperar Senha</h2>
            <p className="text-center text-neutral-medium text-sm mb-6">Digite seu email para receber as instruções.</p>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <label className="block text-neutral-medium text-sm font-bold mb-2" htmlFor="email-forgot">Email</label>
                <input className="shadow appearance-none border rounded w-full py-2 px-3 text-neutral-dark leading-tight focus:outline-none focus:shadow-outline focus:ring-2 focus:ring-secondary" id="email-forgot" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" isLoading={isLoading} className="w-full">Enviar Instruções</Button>
            </form>
            <p className="text-center text-neutral-medium text-sm mt-6"><button onClick={() => setAuthMode('login')} className="font-bold text-primary hover:text-secondary ml-1">Voltar para o Login</button></p>
          </motion.div>
        );
      case 'forgotPasswordSuccess':
        return (
             <motion.div key="success" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                <div className="w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-center text-primary mb-2">Verifique seu Email</h2>
                <p className="text-neutral-medium text-sm mb-6">Se uma conta com este email existir, enviamos um link para você redefinir sua senha.</p>
                <Button onClick={() => setAuthMode('login')} className="w-full">Voltar para o Login</Button>
            </motion.div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex justify-center items-center py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl overflow-hidden">
        {error && <motion.p initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm text-center">{error}</motion.p>}
        <AnimatePresence mode="wait">
          {renderForm()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;