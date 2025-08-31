import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import DisasterMap from '@/components/DisasterMap';
import NewsSection from '@/components/NewsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Newspaper } from 'lucide-react';

const News = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency News & Updates</h1>
          <p className="text-gray-600">
            Stay informed about ongoing emergencies and disaster updates in your area.
          </p>
        </div>

        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Live Map
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              News Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Disaster Map</CardTitle>
                <CardDescription>
                  Interactive map showing current ongoing disasters. Hover over markers for details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DisasterMap />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verified Disaster Reports</CardTitle>
                <CardDescription>
                  Latest verified emergency reports and updates. Click on any report for detailed information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default News;