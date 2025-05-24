
import { useEffect } from 'react';
import DisasterReportForm from '@/components/DisasterReportForm';
import Navigation from '@/components/Navigation';
import { AlertTriangle } from 'lucide-react';

const Report = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emergency-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-emergency-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Report an Emergency</h1>
            <p className="text-gray-600">
              Provide as much detail as possible to help first responders effectively address the situation.
            </p>
          </div>
          
          <DisasterReportForm />
        </div>
      </main>
    </div>
  );
};

export default Report;
