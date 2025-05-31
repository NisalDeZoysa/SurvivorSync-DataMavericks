import React, { useState, useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertTriangle, LogOut, User, UserCheck, Users, Menu, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo_bdrm.png'

const Navigation: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    console.log("")
  }, [location.pathname]);


  if (!currentUser) {
    return (
      <nav className="bg-gray-200 shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 w-11" />
            <span className="text-xl font-bold">SurvivorSync</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <Link to="/news">
              <Button variant="ghost" className="text-gray-600 hover:text-safety-600">
                News
              </Button>
            </Link>
            <Link to="/report">
              <Button variant="outline" className="flex items-center gap-2 border-emergency-300 text-emergency-600 hover:bg-emergency-50">
                <AlertTriangle className="h-4 w-4" />
                Report Emergency
              </Button>
            </Link>
            <Link to="/login">
              <Button className="bg-safety-500 hover:bg-safety-600">Sign In</Button>
            </Link>
          </div>

          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/news" onClick={() => setMobileNavOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-safety-600">
                  News
                </Button>
              </Link>
              <Link to="/report" onClick={() => setMobileNavOpen(false)}>
                <Button variant="outline" className="w-full flex items-center gap-2 border-emergency-300 text-emergency-600 hover:bg-emergency-50">
                  <AlertTriangle className="h-4 w-4" />
                  Report Emergency
                </Button>
              </Link>
              <Link to="/login" onClick={() => setMobileNavOpen(false)}>
                <Button className="w-full bg-safety-500 hover:bg-safety-600">Sign In</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  let navItems = [
    { path: '/', label: 'Dashboard', access: [UserRole.USER, UserRole.VOLUNTEERS] },
    { path: '/admin', label: 'Admin Dashboard', access: [UserRole.ADMIN] },
    {path: '/first_responder', label: 'First Responder', access: [UserRole.ADMIN]},
    { path: '/news', label: 'News', access: [UserRole.USER, UserRole.FIRST_RESPONDER, UserRole.ADMIN] },
    { path: '/report', label: 'Report Emergency', access: [UserRole.USER] },
  ];

  if (currentUser.role === UserRole.VOLUNTEERS) {
    navItems.push(
      { path: '/assignments', label: 'My Assignments', access: [UserRole.VOLUNTEERS] },
      { path: '/observations', label: 'Field Reports', access: [UserRole.VOLUNTEERS] }
    );
  }


  if (currentUser.role === UserRole.FIRST_RESPONDER || currentUser.role === UserRole.ADMIN) {
    navItems.push({ path: '/emergencies', label: 'All Emergencies', access: [UserRole.FIRST_RESPONDER, UserRole.ADMIN] });
  }


  const filteredNavItems = navItems.filter(item => item.access.includes(currentUser.role));

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'Admin';
      case UserRole.FIRST_RESPONDER:
        return 'First Responder';
      case UserRole.VOLUNTEERS:
        return 'Volunteer';
      default:
        return 'User';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Users className="h-4 w-4" />;
      case UserRole.FIRST_RESPONDER:
        return <UserCheck className="h-4 w-4" />;
      case UserRole.VOLUNTEERS:
        return <Heart className="h-4 w-4 text-red-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <nav className="bg-gray-200 shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-emergency-500" />
            <span className="text-xl font-bold">Emergency Aid Connect</span>
          </Link>
          
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-gray-600 hover:text-safety-600 font-medium transition-colors",
                  isActive(item.path) && "text-safety-600 border-b-2 border-safety-500 pb-1"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
              {getRoleIcon(currentUser.role)}
              <span>{getRoleLabel(currentUser.role)}</span>
            </div>

            <div className="text-sm font-medium">
              {currentUser.name}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-gray-600 hover:text-emergency-500"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {mobileNavOpen && (
          <div className="md:hidden mt-4 border-t pt-4">
            <nav className="flex flex-col space-y-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-gray-600 hover:text-safety-600 font-medium py-2 transition-colors",
                    isActive(item.path) && "text-safety-600 bg-gray-50 px-2 rounded"
                  )}
                  onClick={() => setMobileNavOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t pt-4 mt-2 flex flex-col space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {getRoleIcon(currentUser.role)}
                    <span>{getRoleLabel(currentUser.role)}</span>
                  </div>
                  <div className="text-sm font-medium ml-2">
                    {currentUser.name}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  className="flex justify-start hover:bg-gray-100 gap-2 text-gray-600 hover:text-emergency-500"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;