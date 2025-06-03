import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Clock, MapPin, Users, Phone, Search } from 'lucide-react';
import { Disaster, DisasterType, DisasterSeverity } from '@/types';

// Mock verified disaster news
const mockVerifiedDisasters: Disaster[] = [
  {
    id: '1',
    location: {
      latitude: 7.8731,
      longitude: 80.7718,
      address: 'Colombo 03, Wellawatta'
    },
    timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
    type: DisasterType.FLOOD,
    name: 'Major Flooding in Wellawatta',
    severity: DisasterSeverity.HIGH,
    details: 'Severe flooding has affected the Wellawatta area in Colombo 03 following heavy monsoon rains that began early this morning. Water levels have risen to 3-4 feet in residential areas, forcing many families to evacuate to higher ground. The Sri Lanka Navy has deployed rescue boats to assist with evacuations. Several main roads including Galle Road are currently impassable. Local authorities have set up temporary shelters at nearby schools and community centers.',
    affectedCount: 250,
    contactNo: '119',
    status: 'in-progress'
  },
  {
    id: '2',
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
      address: 'Kandy City Center'
    },
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    type: DisasterType.FIRE,
    name: 'Commercial Complex Fire Contained',
    severity: DisasterSeverity.CRITICAL,
    details: 'A major fire that broke out at the Central Plaza commercial complex in Kandy has been successfully contained by the fire department after a 4-hour operation. The blaze started on the 3rd floor and quickly spread to adjacent floors before firefighters could bring it under control. No casualties have been reported, but several people were treated for smoke inhalation. The building has been evacuated and will remain closed pending a safety inspection. Traffic diversions are in place around the area.',
    affectedCount: 120,
    contactNo: '110',
    status: 'resolved'
  },
  {
    id: '3',
    location: {
      latitude: 6.0535,
      longitude: 80.2210,
      address: 'Galle Hill Country'
    },
    timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    type: DisasterType.LANDSLIDE,
    name: 'Landslide Warning Issued',
    severity: DisasterSeverity.MEDIUM,
    details: 'The Disaster Management Center has issued a landslide warning for hill country areas around Galle following continuous rainfall over the past 48 hours. Geological surveys have identified several areas with unstable soil conditions. Residents in high-risk zones have been advised to remain vigilant and be prepared for possible evacuation. Emergency response teams are on standby and monitoring the situation closely.',
    affectedCount: 300,
    contactNo: '117',
    status: 'pending'
  },
  {
    id: '4',
    location: {
      latitude: 9.6615,
      longitude: 80.0255,
      address: 'Jaffna Coastal Areas'
    },
    timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    type: DisasterType.TSUNAMI,
    name: 'Tsunami Alert Lifted - All Clear',
    severity: DisasterSeverity.LOW,
    details: 'The tsunami warning issued earlier today for the northern coastal areas has been officially lifted by the Department of Meteorology. The alert was triggered by a 6.2 magnitude earthquake detected in the Indian Ocean, but subsequent analysis confirmed no tsunami threat to Sri Lankan coasts. Coastal communities that were evacuated as a precautionary measure have been given the all-clear to return to their homes. Normal activities have resumed in all affected areas.',
    affectedCount: 500,
    contactNo: '118',
    status: 'resolved'
  },
  {
    id: '5',
    location: {
      latitude: 7.2906,
      longitude: 80.6337,
      address: 'Kurunegala Industrial Zone'
    },
    timestamp: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    type: DisasterType.FIRE,
    name: 'Factory Fire Under Investigation',
    severity: DisasterSeverity.HIGH,
    details: 'A fire at a textile manufacturing facility in the Kurunegala Industrial Zone has been extinguished after a coordinated effort by multiple fire stations. The incident occurred during the night shift, but all workers were safely evacuated with no reported injuries. Initial investigations suggest an electrical fault may have caused the fire. The factory will remain closed while authorities conduct a thorough investigation and assess structural damage.',
    affectedCount: 80,
    contactNo: '110',
    status: 'resolved'
  }
];

const NewsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);

  const filteredNews = mockVerifiedDisasters.filter(disaster =>
    disaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disaster.location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(disaster.type).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity: DisasterSeverity) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'in-progress':
        return "bg-blue-100 text-blue-800";
      case 'resolved':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: DisasterType) => {
    switch (type) {
      case DisasterType.FIRE:
        return "🔥";
      case DisasterType.FLOOD:
        return "🌊";
      case DisasterType.LANDSLIDE:
        return "⛰️";
      case DisasterType.TSUNAMI:
        return "🌊";
      case DisasterType.EARTHQUAKE:
        return "🏚️";
      default:
        return "⚠️";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search news by location, type, or keywords..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* News Feed */}
      <div className="space-y-4">
        {filteredNews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <AlertTriangle className="mx-auto h-10 w-10 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No news found</h3>
            <p className="mt-1 text-sm text-gray-500">No verified reports match your search criteria.</p>
          </div>
        ) : (
          filteredNews.map((disaster) => (
            <Card key={disaster.id} className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-emergency-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-xl">{getTypeIcon(disaster.type)}</span>
                      {disaster.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {disaster.location.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(disaster.timestamp)}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge className={getSeverityColor(disaster.severity)}>
                      {disaster.severity}
                    </Badge>
                    <Badge className={getStatusColor(disaster.status)}>
                      {disaster.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {disaster.details.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {disaster.affectedCount} affected
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {disaster.contactNo}
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setSelectedDisaster(disaster)}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedDisaster} onOpenChange={() => setSelectedDisaster(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedDisaster && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <span className="text-2xl">{getTypeIcon(selectedDisaster.type)}</span>
                  {selectedDisaster.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {selectedDisaster.location.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeAgo(selectedDisaster.timestamp)}
                  </span>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Badge className={getSeverityColor(selectedDisaster.severity)}>
                    {selectedDisaster.severity} severity
                  </Badge>
                  <Badge className={getStatusColor(selectedDisaster.status)}>
                    {selectedDisaster.status}
                  </Badge>
                </div>
                
                <div className="prose prose-sm">
                  <p className="text-gray-700 leading-relaxed">{selectedDisaster.details}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Affected People:</span>
                    <p className="text-lg font-semibold">{selectedDisaster.affectedCount}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Emergency Contact:</span>
                    <p className="text-lg font-semibold">{selectedDisaster.contactNo}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Disaster Type:</span>
                    <p className="text-lg font-semibold capitalize">{selectedDisaster.type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Reported:</span>
                    <p className="text-lg font-semibold">{new Date(selectedDisaster.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedDisaster(null)}>
                    Close
                  </Button>
                  <Button className="bg-emergency-500 hover:bg-emergency-600">
                    Contact Emergency Services
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsSection;