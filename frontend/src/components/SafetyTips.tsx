import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Shield, Phone, Home, Car, Heart } from 'lucide-react';

const SafetyTips = () => {
  const safetyTips = [
    {
      icon: <AlertTriangle className="h-8 w-8 text-emergency-500" />,
      title: "Fire Emergency",
      tips: [
        "Call 911 immediately",
        "Get out of the building quickly and safely",
        "Stay low to avoid smoke inhalation",
        "Never use elevators during a fire",
        "Meet at your designated meeting point",
        "Don't go back inside for belongings"
      ]
    },
    {
      icon: <Shield className="h-8 w-8 text-safety-500" />,
      title: "Natural Disasters",
      tips: [
        "Have an emergency kit ready",
        "Know your evacuation routes",
        "Stay informed through official channels",
        "Follow local authority instructions",
        "Keep important documents in a safe place",
        "Have a family communication plan"
      ]
    },
    {
      icon: <Heart className="h-8 w-8 text-alert-500" />,
      title: "Medical Emergency",
      tips: [
        "Call 911 for life-threatening situations",
        "Stay calm and assess the situation",
        "Don't move seriously injured persons",
        "Apply pressure to bleeding wounds",
        "Check for breathing and pulse",
        "Provide clear location information to responders"
      ]
    },
    {
      icon: <Home className="h-8 w-8 text-safety-600" />,
      title: "Home Safety",
      tips: [
        "Install smoke and carbon monoxide detectors",
        "Keep emergency numbers easily accessible",
        "Have flashlights and batteries ready",
        "Know where your main water and gas shutoffs are",
        "Keep a first aid kit fully stocked",
        "Practice evacuation routes with family"
      ]
    },
    {
      icon: <Car className="h-8 w-8 text-emergency-600" />,
      title: "Vehicle Emergency",
      tips: [
        "Pull over safely and turn on hazard lights",
        "Stay inside your vehicle if on a busy road",
        "Call for help from a safe location",
        "Keep emergency supplies in your car",
        "Know how to change a tire safely",
        "Keep your gas tank at least half full"
      ]
    },
    {
      icon: <Phone className="h-8 w-8 text-alert-600" />,
      title: "Communication",
      tips: [
        "Program emergency numbers in your phone",
        "Keep a charged backup phone or power bank",
        "Know how to send emergency text messages",
        "Have an out-of-state contact person",
        "Learn basic emergency signals",
        "Keep a battery-powered radio available"
      ]
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Emergency Safety Tips</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Essential safety information that everyone should know. Being prepared can save lives in emergency situations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safetyTips.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-emergency-200">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {category.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-sm">
                      <div className="bg-safety-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                        <svg className="h-3 w-3 text-safety-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-emergency-50 rounded-lg p-6 border border-emergency-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-emergency-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-emergency-700 mb-2">Remember: 911 for Life-Threatening Emergencies</h3>
              <p className="text-emergency-600 text-sm">
                In any life-threatening emergency, call 911 immediately. Provide clear information about your location, 
                the nature of the emergency, and follow the dispatcher's instructions. Stay on the line until help arrives.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyTips;