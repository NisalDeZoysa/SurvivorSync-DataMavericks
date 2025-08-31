import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AssignmentsList from '@/components/AssignmentsList';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Heart } from 'lucide-react';

const Assignments = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not volunteer
  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== UserRole.VOLUNTEERS)) {
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
  
  // If not volunteer, don't render the page (redirect will happen)
  if (!currentUser || currentUser.role !== UserRole.VOLUNTEERS) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">My Assignments</h1>
              <p className="text-gray-600">View and manage your volunteer assignments</p>
            </div>
          </div>
        </div>
        
        <AssignmentsList />
      </main>
    </div>
  );
};

export default Assignments;