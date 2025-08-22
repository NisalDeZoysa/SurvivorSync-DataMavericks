import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart' as geocoding;
import '../models/user.dart';
import '../constants/app_constants.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;
  LocationService._internal();

  // Check and request location permissions
  Future<bool> requestLocationPermission() async {
    if (AppConfig.mockMode) return true;
    LocationPermission permission = await Geolocator.checkPermission();
    
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }
    
    if (permission == LocationPermission.deniedForever) {
      return false;
    }
    
    return true;
  }

  // Get current location
  Future<Location?> getCurrentLocation() async {
    try {
      if (AppConfig.mockMode) {
        return Location(latitude: 6.9271, longitude: 79.8612, address: 'Colombo');
      }

      bool hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw Exception('Location permission denied');
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      return Location(
        latitude: position.latitude,
        longitude: position.longitude,
      );
    } catch (e) {
      return null;
    }
  }

  // Get address from coordinates
  Future<String?> getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      if (AppConfig.mockMode) return 'Mock Address, Colombo';
      List<geocoding.Placemark> placemarks = await geocoding.placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        geocoding.Placemark place = placemarks[0];
        return '${place.street}, ${place.locality}, ${place.administrativeArea}';
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Get coordinates from address
  Future<Location?> getCoordinatesFromAddress(String address) async {
    try {
      if (AppConfig.mockMode) return Location(latitude: 6.9271, longitude: 79.8612, address: address);
      List<geocoding.Location> locations = await geocoding.locationFromAddress(address);
      if (locations.isNotEmpty) {
        return Location(
          latitude: locations[0].latitude,
          longitude: locations[0].longitude,
          address: address,
        );
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Calculate distance between two points
  double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  // Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    if (AppConfig.mockMode) return true;
    return await Geolocator.isLocationServiceEnabled();
  }

  // Get last known location
  Future<Location?> getLastKnownLocation() async {
    try {
      if (AppConfig.mockMode) return Location(latitude: 6.9271, longitude: 79.8612, address: 'Colombo');
      Position? position = await Geolocator.getLastKnownPosition();
      if (position != null) {
        return Location(
          latitude: position.latitude,
          longitude: position.longitude,
        );
      }
      return null;
    } catch (e) {
      return null;
    }
  }
} 