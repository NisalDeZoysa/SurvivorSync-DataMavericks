import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, Phone, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Contact {
  id: string;
  name: string;
  phone: string;
  district: string;
  station: string;
  image?: string;
}

const EmergencyContacts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const emergencyNumbers: Contact[] = [
    {
      id: '1',
      name: 'Disaster Management Center',
      phone: '117',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Ambulance (Fire)',
      phone: '110',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'National Help Desk',
      phone: '118 / 1919',
      district: 'Head Office',
      station: '',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '4',
      name: 'Police',
      phone: '119',
      district: 'Head Office',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '5',
      name: 'Sri Lanka Red Cross',
      phone: '011 267 9373',
      district: 'Head Office',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '6',
      name: 'Army Head Quarter',
      phone: '011-2432682 to 5',
      district: 'Head Office',
      station: 'Head Quarter',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const policeContacts: Contact[] = [
    {
      id: '7',
      name: 'Police Head Quarters',
      phone: '(011) 242 1111',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '8',
      name: 'Police Station - Beruwala',
      phone: '(034) 227 6049',
      district: 'Beruwala',
      station: '',
      image: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '9',
      name: 'Police Station - Bentota',
      phone: '(034) 227 5022',
      district: 'Bentota',
      station: '',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '10',
      name: 'Police Station - Kandy',
      phone: '(081) 222 2222',
      district: 'Pushpadana Mawatha',
      station: '',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '11',
      name: 'Police Station - Polonnaruwa',
      phone: '(027) 222 3099',
      district: 'New Town',
      station: '',
      image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const medicalContacts: Contact[] = [
    {
      id: '12',
      name: 'Accident Service General Hospital',
      phone: '011-2691111',
      district: 'Colombo ',
      station: 'General Hospital',
      image: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '13',
      name: 'Fire & Ambulance',
      phone: '011-2422222',
      district: 'Head Office',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '14',
      name: 'Asiri Central Hospital',
      phone: '011 2 373 000',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '15',
      name: 'Nawaloka Hospital ',
      phone: '011 2 677 777',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: '16',
      name: 'Hemas Hospitals',
      phone: '011 2 472 472',
      district: 'Colombo',
      station: '',
      image: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=150&h=150&fit=crop&crop=face'
    }
  ];

  const filterContacts = (contacts: Contact[]) => {
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.station.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <Card className="hover:shadow-md transition-shadow ">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <img
            src={contact.image}
            alt={contact.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{contact.name}</h3>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <MapPin className="h-4 w-4" />
              <span>{contact.district}</span>
            </div>
            <div className="flex items-center gap-2 text-emergency-600 font-medium">
              <Phone className="h-4 w-4" />
              <span>{contact.phone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Emergency Contacts</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find contact information for emergency services in your district. Search by name or district.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, district, or station..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs defaultValue="emergency" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                🚒 Emergancy
              </TabsTrigger>
              <TabsTrigger value="police" className="flex items-center gap-2">
                🚔 Police
              </TabsTrigger>
              <TabsTrigger value="medical" className="flex items-center gap-2">
                🚑 Medical
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emergency" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterContacts(emergencyNumbers).map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="police" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterContacts(policeContacts).map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="medical" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterContacts(medicalContacts).map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContacts;