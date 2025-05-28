import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDashboard from '@/components/admin/AdminDashboard';
import VolunteerAssignment from '@/components/admin/VolunteerAssignment';
import ResourceAllocation from '@/components/admin/ResourceAllocation';
import NewsManagement from '@/components/admin/NewsManagement';

const Admin = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!currentUser || currentUser.role !== UserRole.ADMIN)) {
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
  
  // If not admin, don't render the page (redirect will happen)
  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage emergency response operations and resources</p>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="dashboard" className="text-sm font-medium">
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="text-sm font-medium">
              Volunteer Assignment
            </TabsTrigger>
            <TabsTrigger value="resources" className="text-sm font-medium">
              Resource Allocation
            </TabsTrigger>
            <TabsTrigger value="news" className="text-sm font-medium">
              News Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="volunteers" className="space-y-6">
            <VolunteerAssignment />
          </TabsContent>
          
          <TabsContent value="resources" className="space-y-6">
            <ResourceAllocation />
          </TabsContent>
          
          <TabsContent value="news" className="space-y-6">
            <NewsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;