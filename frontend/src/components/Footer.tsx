import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AdminAuthDialog from '@/components/AdminAuthDialog';

const Footer = () => {
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Links Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/report" className="text-gray-300 hover:text-white transition-colors">
                  Report Emergency
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-white transition-colors">
                  News
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emergency-400" />
                <span className="text-gray-300">Emergency: 117</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emergency-400" />
                <span className="text-gray-300">OPD General Hospital: 011-2691111</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emergency-400" />
                <span className="text-gray-300">help@emergencyaidconnect.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emergency-400" />
                <span className="text-gray-300">123 Emergency Lane, Safety City</span>
              </div>
            </div>
          </div>

          {/* Admin Registration Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Administrative Access</h3>
            <p className="text-gray-300 mb-4 text-sm">
              For emergency responders and system administrators
            </p>
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full bg-transparent border-emergency-400 text-emergency-400 hover:bg-emergency-400 hover:text-white"
                >
                  Admin Registration/Login
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Administrative Access</DialogTitle>
                </DialogHeader>
                <AdminAuthDialog onClose={() => setIsAdminDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 SurvivorSync. All rights reserved. | Built for community safety and emergency response.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;