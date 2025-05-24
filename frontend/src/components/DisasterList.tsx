
import React, { useState } from 'react';
import { AlertTriangle, Search, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Disaster, DisasterSeverity, DisasterType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock data for demonstration
const mockDisasters: Disaster[] = [
  {
    id: '1',
    location: {
      latitude: 7.8731,
      longitude: 80.7718,
      address: 'Colombo 03, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    type: DisasterType.FLOOD,
    name: 'Flood in Colombo',
    severity: DisasterSeverity.HIGH,
    details: 'Severe flooding reported in downtown area following heavy rains. Multiple streets underwater.',
    affectedCount: 120,
    contactNo: '555-123-4567',
    status: 'pending'
  },
  {
    id: '2',
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'Kandy, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    type: DisasterType.FIRE,
    name: 'Building Fire in Kandy',
    severity: DisasterSeverity.CRITICAL,
    details: 'Commercial building on fire. Fire department dispatched. Nearby buildings evacuated.',
    affectedCount: 45,
    contactNo: '555-987-6543',
    status: 'in-progress'
  },
  {
    id: '3',
    location: {
      latitude: 6.0535,
      longitude: 80.2210,
      address: 'Galle, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    type: DisasterType.LANDSLIDE,
    name: 'Landslide Warning in Galle',
    severity: DisasterSeverity.MEDIUM,
    details: 'Potential landslide risk following persistent rainfall. Residents advised to be on alert.',
    affectedCount: 75,
    contactNo: '555-222-3333',
    status: 'pending'
  },
  {
    id: '4',
    location: {
      latitude: 9.6615,
      longitude: 80.0255,
      address: 'Jaffna, Sri Lanka'
    },
    timestamp: new Date(Date.now() - 28800000).toISOString(),
    type: DisasterType.TSUNAMI,
    name: 'Tsunami Warning in Jaffna',
    severity: DisasterSeverity.HIGH,
    details: 'Tsunami warning issued after offshore earthquake. Coastal evacuation recommended.',
    affectedCount: 500,
    contactNo: '555-444-5555',
    status: 'resolved'
  }
];

const DisasterList: React.FC = () => {
  const [disasters, setDisasters] = useState<Disaster[]>(mockDisasters);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const filteredDisasters = disasters
    .filter(disaster => {
      // Search filter
      const searchFilter = searchTerm ? 
        disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.location.address?.toLowerCase().includes(searchTerm.toLowerCase()) :
        true;
      
      // Type filter
      const typeFilter = filterType !== 'all' ? 
        disaster.type === filterType : 
        true;
      
      // Status filter
      const statusFilter = filterStatus !== 'all' ? 
        disaster.status === filterStatus : 
        true;
      
      // Severity filter
      const severityFilter = filterSeverity !== 'all' ? 
        disaster.severity === filterSeverity : 
        true;
        
      return searchFilter && typeFilter && statusFilter && severityFilter;
    })
    .sort((a, b) => {
      // Sort by timestamp, newest first
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getSeverityColor = (severity: DisasterSeverity) => {
    switch(severity) {
      case DisasterSeverity.LOW:
        return "bg-blue-100 text-blue-800";
      case DisasterSeverity.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case DisasterSeverity.HIGH:
        return "bg-orange-100 text-orange-800";
      case DisasterSeverity.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            type="text"
            placeholder="Search emergencies..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-1 gap-2">
          <div className="w-1/3">
            <Select 
              value={filterType} 
              onValueChange={setFilterType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={DisasterType.FLOOD}>Flood</SelectItem>
                <SelectItem value={DisasterType.FIRE}>Fire</SelectItem>
                <SelectItem value={DisasterType.EARTHQUAKE}>Earthquake</SelectItem>
                <SelectItem value={DisasterType.LANDSLIDE}>Landslide</SelectItem>
                <SelectItem value={DisasterType.TSUNAMI}>Tsunami</SelectItem>
                <SelectItem value={DisasterType.HURRICANE}>Hurricane</SelectItem>
                <SelectItem value={DisasterType.OTHER}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/3">
            <Select 
              value={filterStatus} 
              onValueChange={setFilterStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-1/3">
            <Select 
              value={filterSeverity} 
              onValueChange={setFilterSeverity}
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value={DisasterSeverity.LOW}>Low</SelectItem>
                <SelectItem value={DisasterSeverity.MEDIUM}>Medium</SelectItem>
                <SelectItem value={DisasterSeverity.HIGH}>High</SelectItem>
                <SelectItem value={DisasterSeverity.CRITICAL}>Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Emergency Reports</h2>
        
        {filteredDisasters.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No emergencies found</h3>
            <p className="mt-1 text-sm text-gray-500">No emergency reports match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDisasters.map((disaster) => (
              <Card key={disaster.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{disaster.name}</CardTitle>
                      <CardDescription>{disaster.location.address || "No address provided"}</CardDescription>
                    </div>
                    <Badge className={getSeverityColor(disaster.severity)}>
                      {disaster.severity.charAt(0).toUpperCase() + disaster.severity.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Type:</span>
                        <span className="ml-1">{disaster.type.charAt(0).toUpperCase() + disaster.type.slice(1)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Affected:</span>
                        <span className="ml-1">{disaster.affectedCount} people</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Reported:</span>
                        <span className="ml-1">{formatTime(disaster.timestamp)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Contact:</span>
                        <span className="ml-1">{disaster.contactNo || "N/A"}</span>
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2">{disaster.details}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center gap-1 text-sm">
                    {getStatusIcon(disaster.status)}
                    <span className="capitalize">{disaster.status}</span>
                  </div>
                  <div>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DisasterList;
