
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, MapPin, Check, Mic, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Disaster, DisasterType, DisasterSeverity } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';

interface DisasterFormValues {
  name: string;
  type: DisasterType;
  severity: DisasterSeverity;
  details: string;
  affectedCount: number;
  contactNo?: string;
  address?: string;
}

const DisasterReportForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<DisasterFormValues>({
    defaultValues: {
      name: '',
      type: DisasterType.OTHER,
      severity: DisasterSeverity.MEDIUM,
      details: '',
      affectedCount: 1,
      contactNo: currentUser?.contactNo || '',
      address: '',
    }
  });

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast({
            title: "Location detected",
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Long: ${position.coords.longitude.toFixed(4)}`,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to access your location. Please provide an address.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Location Not Supported",
        description: "Geolocation is not supported by your browser.",
      });
    }
  };

  const toggleAudioRecording = () => {
    setIsRecordingAudio(!isRecordingAudio);
    // In a real app, implement actual audio recording functionality here
    if (isRecordingAudio) {
      toast({
        title: "Recording stopped",
        description: "Your audio recording has been saved.",
      });
    } else {
      toast({
        title: "Recording started",
        description: "Speak clearly to describe the emergency.",
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: DisasterFormValues) => {
    if (!location && !data.address) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Please provide either your current location or an address.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would be sent to your API
      const newDisaster: Partial<Disaster> = {
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
          address: data.address
        },
        timestamp: new Date().toISOString(),
        type: data.type,
        name: data.name,
        severity: data.severity,
        details: data.details,
        affectedCount: data.affectedCount,
        contactNo: data.contactNo,
        reportedBy: currentUser?.id,
        status: "pending"
      };
      
      // Simulating API call
      console.log("Submitting disaster report:", newDisaster);
      
      setTimeout(() => {
        toast({
          title: "Report Submitted",
          description: "Your emergency report has been submitted successfully.",
        });
        form.reset();
        setSelectedImage(null);
        setImagePreview(null);
        setIsSubmitting(false);
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was a problem submitting your report. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-safety-700">Report Emergency</h2>
        <p className="text-gray-600">
          Please provide as much detail as possible about the emergency situation.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={getLocation}
            >
              <MapPin className="h-4 w-4" />
              Detect Location
            </Button>
            {location && (
              <span className="text-sm text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" /> Location detected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (if location not detected)</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, City, Province..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Emergency name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief name for this emergency" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Type is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emergency Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DisasterType.FLOOD}>Flood</SelectItem>
                      <SelectItem value={DisasterType.FIRE}>Fire</SelectItem>
                      <SelectItem value={DisasterType.EARTHQUAKE}>Earthquake</SelectItem>
                      <SelectItem value={DisasterType.LANDSLIDE}>Landslide</SelectItem>
                      <SelectItem value={DisasterType.TSUNAMI}>Tsunami</SelectItem>
                      <SelectItem value={DisasterType.HURRICANE}>Hurricane/Storm</SelectItem>
                      <SelectItem value={DisasterType.OTHER}>Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="severity"
              rules={{ required: "Severity is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DisasterSeverity.LOW}>Low</SelectItem>
                      <SelectItem value={DisasterSeverity.MEDIUM}>Medium</SelectItem>
                      <SelectItem value={DisasterSeverity.HIGH}>High</SelectItem>
                      <SelectItem value={DisasterSeverity.CRITICAL}>Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affectedCount"
              rules={{ required: "Affected count is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated People Affected</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="details"
            rules={{ required: "Details are required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Emergency Details</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Provide as much detail as possible about the emergency situation..." 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormLabel className="block mb-2">Upload Image Evidence</FormLabel>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-safety-500 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-1">Select image</span>
                    </div>
                  </div>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
                {imagePreview && (
                  <div className="relative h-32 w-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <FormLabel className="block mb-2">Record Audio Description</FormLabel>
              <Button
                type="button"
                variant={isRecordingAudio ? "destructive" : "outline"}
                className="flex items-center gap-2"
                onClick={toggleAudioRecording}
              >
                <Mic className="h-4 w-4" />
                {isRecordingAudio ? "Stop Recording" : "Start Recording"}
              </Button>
              {isRecordingAudio && (
                <p className="text-sm text-red-500 mt-2">Recording in progress...</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center text-emergency-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">This will be reported to emergency services</span>
            </div>
            <Button 
              type="submit" 
              className="bg-emergency-500 hover:bg-emergency-600" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default DisasterReportForm;
