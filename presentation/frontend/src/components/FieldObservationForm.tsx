import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Camera, Upload } from 'lucide-react';
import { FieldObservation, DisasterSeverity } from '@/types';
import { useToast } from '@/components/ui/use-toast';

interface FieldObservationFormData {
  assignmentId: string;
  description: string;
  severity?: DisasterSeverity;
  additionalNotes?: string;
  latitude?: number;
  longitude?: number;
}

interface FieldObservationFormProps {
  onSubmit: (observation: Omit<FieldObservation, 'id' | 'volunteerId' | 'timestamp'>) => void;
}

const FieldObservationForm: React.FC<FieldObservationFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const form = useForm<FieldObservationFormData>({
    defaultValues: {
      assignmentId: '',
      description: '',
      severity: undefined,
      additionalNotes: '',
    },
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          toast({
            title: "Location captured",
            description: `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
        },
        (error) => {
          toast({
            variant: "destructive",
            title: "Location Error",
            description: "Unable to get your current location.",
          });
        }
      );
    } else {
      toast({
        variant: "destructive",
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
      });
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).slice(0, 5); // Limit to 5 images
      setSelectedImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data: FieldObservationFormData) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, you would upload images to a server here
      const imageUrls = selectedImages.map((_, index) => `image_${Date.now()}_${index}.jpg`);
      
      const observation: Omit<FieldObservation, 'id' | 'volunteerId' | 'timestamp'> = {
        assignmentId: data.assignmentId,
        description: data.description,
        severity: data.severity,
        additionalNotes: data.additionalNotes,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        location: location || undefined,
      };
      
      onSubmit(observation);
      
      toast({
        title: "Field Observation Submitted",
        description: "Your observation has been recorded successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "There was an error submitting your observation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Observation Report</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="assignmentId"
              rules={{ required: "Assignment ID is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter assignment ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observation Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you observed in the field..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity Assessment (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity level" />
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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Location</label>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Get Current Location
                </Button>
              </div>
              
              {location && (
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><strong>Coordinates:</strong> {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Images</label>
                <label className="cursor-pointer">
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    asChild
                  >
                    <span>
                      <Camera className="h-4 w-4" />
                      Add Images
                    </span>
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative bg-gray-100 p-2 rounded-md">
                      <p className="text-sm truncate">{image.name}</p>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional observations or recommendations..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-safety-500 hover:bg-safety-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Observation"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FieldObservationForm;