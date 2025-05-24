
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import DisasterReportForm from '@/components/DisasterReportForm';
import DisasterList from '@/components/DisasterList';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Index = () => {
  const { currentUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      // If not logged in, we stay on this page but don't redirect
      // as anonymous users can still view a landing page
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  // For non-logged-in users, show the landing page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        {/* Carousel Section */}
        <div className="bg-white py-12">
          <div className="container mx-auto px-0">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
                Be Prepared. Stay Informed. Act Fast.
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto animate-fade-in">
                SurvivorSync empowers communities to respond faster and stay safer during disasters.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Carousel 
                className="w-full"
                plugins={[
                  Autoplay({
                    delay: 4000,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
              >
                <CarouselContent>
                  <CarouselItem>
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop"
                        alt="Emergency Response Team"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2 animate-slide-in-right">Report Disasters Instantly</h3>
                          <p className="text-lg animate-fade-in animation-delay-300">Quickly report incidents like floods, fires, or accidents with real-time location sharing.</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop"
                        alt="Technology Solutions"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2 animate-scale-in">Get Verified Alerts</h3>
                          <p className="text-lg animate-fade-in animation-delay-300">Receive real-time updates and official warnings from first responders and authorities.</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop"
                        alt="Community Support"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2 animate-fade-in">Track Ongoing Emergencies</h3>
                          <p className="text-lg animate-slide-in-right animation-delay-300">Stay informed with live disaster maps, affected areas, and emergency updates.</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                  <CarouselItem>
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop"
                        alt="Coordination Center"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2 animate-scale-in">Join as a Volunteer</h3>
                          <p className="text-lg animate-fade-in animation-delay-300">Help when it matters most—sign up as a volunteer and contribute to rescue efforts.</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  <CarouselItem>
                    <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop"
                        alt="Coordination Center"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-bold mb-2 animate-scale-in">Coordinate with First Responders</h3>
                          <p className="text-lg animate-fade-in animation-delay-300">Seamless communication and task coordination between users, volunteers, and rescue teams.</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-safety-50 to-blue-50 py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Rapid Response <span className="text-emergency-500">Emergency</span> Management
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Report emergencies, coordinate responses, and save lives with our comprehensive disaster management platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    size="lg" 
                    className="bg-emergency-500 hover:bg-emergency-600"
                    onClick={() => navigate('/report')}
                  >
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Report Emergency
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-safety-500 text-safety-600 hover:bg-safety-50"
                    onClick={() => navigate('/login')}
                  >
                    Login / Register
                  </Button>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="bg-white shadow-xl rounded-xl p-4 md:p-6 border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-emergency-100 rounded-full p-3">
                      <AlertTriangle className="h-6 w-6 text-emergency-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Emergency Reporting</h3>
                      <p className="text-gray-600 text-sm">Quick and easy disaster reporting</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-safety-100 rounded-full p-1 mt-0.5">
                        <svg className="h-3 w-3 text-safety-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p>No registration required to report emergencies</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-safety-100 rounded-full p-1 mt-0.5">
                        <svg className="h-3 w-3 text-safety-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p>Real-time location detection</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-safety-100 rounded-full p-1 mt-0.5">
                        <svg className="h-3 w-3 text-safety-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p>Upload images and record voice descriptions</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-safety-100 rounded-full p-1 mt-0.5">
                        <svg className="h-3 w-3 text-safety-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p>Instant notification to first responders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="bg-emergency-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-emergency-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Report Emergency</h3>
                <p className="text-gray-600">
                  Quickly submit details about the emergency situation with our user-friendly form.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="bg-alert-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-alert-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">First Responder Notified</h3>
                <p className="text-gray-600">
                  Our system immediately alerts the nearest available first responders to the situation.
                </p>
              </div>
              
              <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="bg-safety-100 h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-safety-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Coordinated Response</h3>
                <p className="text-gray-600">
                  Track the status of the emergency response and receive updates in real-time.
                </p>
              </div>
            </div>
          </div>
        </div>

       
      </div>
    );
  }

  // For logged-in users, show appropriate dashboard based on role
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">
          {currentUser.role === UserRole.ADMIN 
            ? "Admin Dashboard" 
            : currentUser.role === UserRole.FIRST_RESPONDER 
              ? "First Responder Dashboard"
              : "User Dashboard"}
        </h1>
        
        {currentUser.role === UserRole.USER && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Report Emergency</h2>
              <DisasterReportForm />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Recent Reports</h2>
              <DisasterList />
            </div>
          </div>
        )}
        
        {currentUser.role === UserRole.FIRST_RESPONDER && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Emergency Reports</h2>
              <DisasterList />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Report New Emergency</h2>
              <DisasterReportForm />
            </div>
          </div>
        )}
        
        {currentUser.role === UserRole.ADMIN && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emergency-500">
                  <h3 className="text-sm font-medium text-gray-500">Pending Emergencies</h3>
                  <p className="text-3xl font-bold">12</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-alert-500">
                  <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
                  <p className="text-3xl font-bold">8</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-safety-500">
                  <h3 className="text-sm font-medium text-gray-500">Resolved Today</h3>
                  <p className="text-3xl font-bold">5</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
                  <h3 className="text-sm font-medium text-gray-500">Active Responders</h3>
                  <p className="text-3xl font-bold">18</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-4">All Emergency Reports</h2>
              <DisasterList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
