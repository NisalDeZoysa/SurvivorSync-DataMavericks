import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, MapPin, Check, Mic, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import axios from 'axios';
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
import { PDFDownloadLink } from '@react-pdf/renderer';
import DisasterRequestReportPDF from '@/components/EmergencyReportPDF';

interface DisasterFormValues {
  name: string;
  disasterId: DisasterType;
  emergencyName: string; 
  severity: DisasterSeverity;
  details: string;
  affectedCount: number;
  contactNo?: string;
}

const DisasterReportForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mimeTypeRef = useRef<string>('audio/wav'); // Default to WAV
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdDisaster, setCreatedDisaster] = useState<Disaster | null>(null);
  const [resourceCenterDetails, setResourceCenterDetails] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<DisasterFormValues>({
    defaultValues: {
      name: currentUser?.name || '',
      emergencyName: '',
      disasterId: DisasterType.OTHER,
      severity: DisasterSeverity.MEDIUM,
      details: '',
      affectedCount: 1,
      contactNo: currentUser?.contactNo || '',
    }
  });

  // current location fetch function
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

  const toggleAudioRecording = async () => {
    if (isRecordingAudio) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecordingAudio(false);
      toast({
        title: "Recording stopped",
        description: "Your audio recording has been saved.",
      });
    } else {
      try {
        audioChunksRef.current = [];
        setAudioBlob(null);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeTypeRef.current = 'audio/wav';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeTypeRef.current = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp3')) {
          mimeTypeRef.current = 'audio/mp3';
        } else {
          mimeTypeRef.current = 'audio/webm';
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeTypeRef.current
        });

        mediaRecorderRef.current = mediaRecorder as unknown as MediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, {
            type: mimeTypeRef.current
          });
          stream.getTracks().forEach(track => track.stop());
          setAudioBlob(blob);
          audioChunksRef.current = [];
        };

        mediaRecorder.start();
        setIsRecordingAudio(true);
        toast({
          title: "Recording started",
          description: "Speak clearly to describe the emergency.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Microphone access was denied.",
        });
      }
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

  const getResourceCenterDetails = async (resourceCenterIds) => {
    const allDetails = await Promise.all(
      resourceCenterIds.map(async (id) => {
        const response = await axios.get(`http://localhost:7000/api/resource-centers/${id}`);
        return response.data;
      })
    );
    return allDetails.map(({ name, contactNumber, resourceId, province }) => ({
      name,
      contactNumber,
      resourceId,
      province
    }));
  };

  const onSubmit = async (data: DisasterFormValues) => {
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Please provide either your current location or an address.",
      });
      return;
    }

    const formData = new FormData();
    formData.append('name', currentUser?.name || data.name);
    formData.append('userId', currentUser?.id || '1');
    formData.append('disasterId', String(Number(data.disasterId)));
    formData.append('severity', data.severity);
    formData.append('details', data.details || '');
    formData.append('affectedCount', String(Number(data.affectedCount)));
    formData.append('contactNo', data.contactNo || '');

    if (location) {
      formData.append('latitude', String(location.latitude));
      formData.append('longitude', String(location.longitude));
    }

    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    if (audioBlob) {
      const extension = mimeTypeRef.current.split('/')[1] || 'wav';
      const filename = `recording.${extension}`;
      formData.append('voice', audioBlob, filename);
    }
    try {
      setIsSubmitting(true);

      const response = await axios.post('http://localhost:7000/api/requests', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        timeout: 0,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Submission failed");
      }

      setCreatedDisaster(response.data);

      const details = await getResourceCenterDetails(
        response.data.gatewayResponse.resource_center_ids
      );
      setResourceCenterDetails(details);

      setShowSuccessPopup(true);

      toast({
        title: "Report Submitted",
        description: "Your emergency report has been successfully submitted.",
        color: "green",
      });

      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.response?.data?.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    (async () => {
      await register(await connect());
    })();
  }, []);

  return (
    <Card className="p-6 shadow-lg max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emergency-100 mb-4">
          <AlertTriangle className="h-8 w-8 text-emergency-500" />
        </div>
        <h2 className="text-2xl font-bold text-red-600">Report Emergency</h2>
        <p className="text-gray-600">
          Please fill the most urgent details below. Advanced options are available if needed.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Row 1: Detect Location & Record Audio */}
          <div className="flex flex-col sm:flex-row gap-4 mb-2">
            {/* Detect Location */}
            <div className="flex-1 flex flex-col">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2 w-full"
                onClick={getLocation}
              >
                <MapPin className="h-4 w-4" />
                Detect Location
              </Button>
              {location && (
                <span className="text-sm text-green-600 flex items-center mt-2">
                  <Check className="h-4 w-4 mr-1" /> Location detected
                </span>
              )}
            </div>
            {/* Record Audio */}
            <div className="flex-1 flex flex-col">
              <Button
                type="button"
                variant={isRecordingAudio ? "destructive" : "outline"}
                className="flex items-center gap-2 w-full"
                onClick={toggleAudioRecording}
              >
                <Mic className="h-4 w-4" />
                {isRecordingAudio ? "Stop Recording" : "Record Audio"}
              </Button>
              {isRecordingAudio && (
                <p className="text-sm text-red-500 mt-2">Recording in progress...</p>
              )}
              {audioBlob && !isRecordingAudio && (
                <p className="text-xs text-green-600 mt-2">Audio recorded</p>
              )}
            </div>
          </div>

          {/* Row 2: Upload Image & Estimated People Affected */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Upload Image */}
            <div className="flex-1">
              <FormLabel className="block mb-2 font-semibold">Upload Image Evidence</FormLabel>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="flex items-center justify-center w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-emergency-500 transition-colors">
                    <div className="flex flex-col items-center">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Select image</span>
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
                  <div className="relative h-20 w-20">
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
            {/* Estimated People Affected */}
            <div className="flex-1">
              <FormField
                control={form.control}
                name="affectedCount"
                rules={{ required: "Affected count is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Estimated People Affected</FormLabel>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[1, 5, 10, 100, 10000].map((num) => (
                        <Button
                          key={num}
                          type="button"
                          size="sm"
                          variant={field.value === num ? "default" : "outline"}
                          className="px-3"
                          onClick={() => field.onChange(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Or enter manually"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Emergency Situation (was Emergency Details, now in main form) */}
          <FormField
            control={form.control}
            name="details"
            rules={{ required: "Emergency situation is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Emergency Situation</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the emergency situation..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Advanced Options Dropdown */}
          <div>
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 text-gray-700"
              onClick={() => setShowAdvanced((v) => !v)}
            >
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
            </Button>
            {showAdvanced && (
              <div className="mt-4 space-y-4 border rounded-lg p-4 bg-gray-50">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (contact person name)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="disasterId"
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DisasterType.FLOOD.toString()}>Flood</SelectItem>
                          <SelectItem value={DisasterType.EARTHQUAKE.toString()}>Earthquake</SelectItem>
                          <SelectItem value={DisasterType.HOUSEHOLDFIRE.toString()}>Household Fire</SelectItem>
                          <SelectItem value={DisasterType.WILDFIRE.toString()}>Wild Fire</SelectItem>
                          <SelectItem value={DisasterType.TSUNAMI.toString()}>Tsunami</SelectItem>
                          <SelectItem value={DisasterType.LANDSLIDE.toString()}>Landslide</SelectItem>
                          <SelectItem value={DisasterType.OTHER.toString()}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyName"
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
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="flex items-center text-emergency-500">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">This will be reported to emergency services</span>
            </div>
            <Button
              type="submit"
              className="bg-emergency-500 hover:bg-emergency-600 text-lg px-8 py-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Emergency Report"}
            </Button>
          </div>
        </form>
      </Form>

      {/* pop us window */}
      {
        showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-2">Report Submitted Successfully!</h3>
              <p className="mb-6">Your emergency report has been submitted. You can download the report as PDF.</p>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowSuccessPopup(false)}
                >
                  Close
                </Button>

                {createdDisaster && (
                  <PDFDownloadLink
                    document={
                      <DisasterRequestReportPDF
                        request={createdDisaster.request}
                        gatewayResponse={createdDisaster.gatewayResponse}
                        resourceCenterDetails={resourceCenterDetails}
                      />
                    }
                    fileName={`disaster-report-${createdDisaster.request.id}.pdf`}
                  >
                    {({ loading }) => (
                      <Button className="bg-emergency-500 hover:bg-emergency-600">
                        {loading ? "Generating PDF..." : "Download PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>
          </div>
        )
      }
    </Card>
  );
};

export default DisasterReportForm;