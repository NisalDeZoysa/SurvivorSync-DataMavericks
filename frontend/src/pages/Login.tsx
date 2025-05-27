
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForms from '@/components/AuthForms';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';

const Login = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (!isLoading && currentUser) {
      navigate('/');
    }
  }, [currentUser, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <AuthForms />
      </main>
    </div>
  );
};

export default Login;
