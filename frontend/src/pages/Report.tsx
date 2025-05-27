
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
          <DisasterReportForm />
        </div>
      </main>
    </div>
  );
};

export default Report;
