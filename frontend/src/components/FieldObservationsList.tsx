import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Clock, Camera, Plus } from 'lucide-react';
import { FieldObservation, DisasterSeverity } from '@/types';
import { useAuth } from '@/context/AuthContext';
import FieldObservationForm from '@/components/FieldObservationForm';

// Mock field observations data
const mockObservations: FieldObservation[] = [
  {
    id: '1',
    assignmentId: 'assignment-1',
    volunteerId: 'volunteer-1',
    timestamp: '2024-01-15T14:30:00Z',
    description: 'Water levels have receded significantly in the residential area. Most homes show water damage up to 2 feet.',
    images: ['image1.jpg', 'image2.jpg'],
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    severity: DisasterSeverity.MEDIUM,
    additionalNotes: 'Residents are returning to assess damage. Medical assistance may be needed for elderly residents.'
  },
  {
    id: '2',
    assignmentId: 'assignment-2',
    volunteerId: 'volunteer-1',
    timestamp: '2024-01-14T16:45:00Z',
    description: 'Successfully distributed 50 emergency supply kits to affected families. All families accounted for.',
    severity: DisasterSeverity.LOW,
    additionalNotes: 'Families expressed gratitude. Additional blankets requested for tonight.'
  }
];

const FieldObservationsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [observations, setObservations] = useState<FieldObservation[]>(mockObservations);
  const [showForm, setShowForm] = useState(false);

  const handleSubmitObservation = (observation: Omit<FieldObservation, 'id' | 'volunteerId' | 'timestamp'>) => {
    const newObservation: FieldObservation = {
      ...observation,
      id: Math.random().toString(36).substring(2, 9),
      volunteerId: currentUser?.id || '',
      timestamp: new Date().toISOString()
    };
    
    setObservations(prev => [newObservation, ...prev]);
    setShowForm(false);
  };

  const getSeverityBadge = (severity?: DisasterSeverity) => {
    if (!severity) return null;
    
    const severityConfig = {
      [DisasterSeverity.LOW]: { label: 'Low', className: 'bg-green-100 text-green-800' },
      [DisasterSeverity.MEDIUM]: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      [DisasterSeverity.HIGH]: { label: 'High', className: 'bg-orange-100 text-orange-800' },
      [DisasterSeverity.CRITICAL]: { label: 'Critical', className: 'bg-red-100 text-red-800' }
    };
    
    return severityConfig[severity];
  };

  if (showForm) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Submit Field Observation</h2>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        <FieldObservationForm onSubmit={handleSubmitObservation} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Field Reports</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-safety-500 hover:bg-safety-600 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>
      
      {observations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No field observations submitted yet.</p>
          </CardContent>
        </Card>
      ) : (
        observations.map((observation) => {
          const severityConfig = getSeverityBadge(observation.severity);
          
          return (
            <Card key={observation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(observation.timestamp).toLocaleString()}
                      </span>
                      {severityConfig && (
                        <Badge className={severityConfig.className}>
                          {severityConfig.label}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-700">{observation.description}</p>
                  
                  {observation.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {observation.location.latitude.toFixed(6)}, {observation.location.longitude.toFixed(6)}
                      </span>
                    </div>
                  )}
                  
                  {observation.images && observation.images.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Camera className="h-4 w-4" />
                      <span>{observation.images.length} image(s) attached</span>
                    </div>
                  )}
                  
                  {observation.additionalNotes && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">
                        <strong>Additional Notes:</strong> {observation.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default FieldObservationsList;