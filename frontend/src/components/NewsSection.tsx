import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Clock, MapPin, Users, Phone, Search } from 'lucide-react';
import { Disaster, DisasterType, DisasterSeverity } from '@/types';
import axios from 'axios';

interface ApiNewsItem {
  id: number;
  title: string;
  disasterId: number | null;
  disasterRequestId: number | null;
  type: 'natural' | 'man-made';
  severity: DisasterSeverity;
  details: string | null;
  affectedCount: number | null;
  contactNo: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  district: string | null;
  province: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

const NewsSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDisaster, setSelectedDisaster] = useState<Disaster | null>(null);
  const [news, setNews] = useState<Disaster[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get<ApiNewsItem[]>(`http://localhost:7000/api/news`);
        const mapped: Disaster[] = res.data.map((n) => ({
          id: String(n.id),
          name: n.title,
          type: Number(n.disasterId || 6) as unknown as DisasterType,
          severity: n.severity,
          details: n.details || '',
          affectedCount: n.affectedCount || 0,
          contactNo: n.contactNo || undefined,
          status: n.status.toLowerCase(),
          timestamp: n.createdAt,
          location: {
            latitude: typeof n.latitude === 'string' ? parseFloat(n.latitude) : (n.latitude || 0),
            longitude: typeof n.longitude === 'string' ? parseFloat(n.longitude) : (n.longitude || 0),
            address: `${n.district || ''} ${n.province || ''}`.trim(),
          },
        }));
        setNews(mapped);
      } catch (e) {
        // Fallback: keep empty state
        setNews([]);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = news.filter(disaster =>
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