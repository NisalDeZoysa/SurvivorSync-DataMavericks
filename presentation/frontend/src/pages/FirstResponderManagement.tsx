
import Navigation from '@/components/Navigation';
import UserManagement from '@/components/admin/FirstResponderManagement';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const UserManagementPage = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not first responder or admin
  useEffect(() => {
    if (!isLoading && (!currentUser || 
        (currentUser.role !== UserRole.FIRST_RESPONDER && 
         currentUser.role !== UserRole.ADMIN))) {
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
  
  // If not first responder or admin, don't render the page
  if (!currentUser || 
      (currentUser.role !== UserRole.FIRST_RESPONDER && 
       currentUser.role !== UserRole.ADMIN)) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <UserManagement />
      </main>
    </div>
  );
};

export default UserManagementPage;