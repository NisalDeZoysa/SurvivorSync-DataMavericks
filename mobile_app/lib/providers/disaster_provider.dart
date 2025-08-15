import 'dart:io';
import 'package:flutter/foundation.dart';
import '../models/disaster.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';

class DisasterProvider with ChangeNotifier {
  List<DisasterRequest> _requests = [];
  DisasterRequest? _currentRequest;
  bool _isLoading = false;
  String? _error;
  Location? _currentLocation;

  List<DisasterRequest> get requests => _requests;
  DisasterRequest? get currentRequest => _currentRequest;
  bool get isLoading => _isLoading;
  String? get error => _error;
  Location? get currentLocation => _currentLocation;

  final ApiService _apiService = ApiService();
  final LocationService _locationService = LocationService();

  // Load user requests
  Future<void> loadUserRequests() async {
    if (!_apiService.isAuthenticated) return;
    
    _setLoading(true);
    _clearError();
    
    try {
      final requests = await _apiService.getUserRequests();
      _requests = requests;
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
    }
  }

  // Submit disaster request
  Future<bool> submitRequest({
    required String name,
    required DisasterType disasterType,
    required DisasterSeverity severity,
    required String details,
    required int affectedCount,
    required String contactNo,
    String? district,
    String? province,
    File? imageFile,
    File? audioFile,
  }) async {
    _setLoading(true);
    _clearError();
    
    try {
      // Get current location if not already set
      if (_currentLocation == null) {
        _currentLocation = await _locationService.getCurrentLocation();
        if (_currentLocation == null) {
          throw Exception('Unable to get location. Please enable location services.');
        }
      }

      DisasterRequest request;
      
      if (_apiService.isAuthenticated) {
        request = await _apiService.submitDisasterRequest(
          name: name,
          disasterType: disasterType,
          severity: severity,
          details: details,
          affectedCount: affectedCount,
          contactNo: contactNo,
          latitude: _currentLocation!.latitude,
          longitude: _currentLocation!.longitude,
          district: district,
          province: province,
          imageFile: imageFile,
          audioFile: audioFile,
        );
      } else {
        request = await _apiService.submitGuestRequest(
          name: name,
          disasterType: disasterType,
          severity: severity,
          details: details,
          affectedCount: affectedCount,
          contactNo: contactNo,
          latitude: _currentLocation!.latitude,
          longitude: _currentLocation!.longitude,
          district: district,
          province: province,
          imageFile: imageFile,
          audioFile: audioFile,
        );
      }

      _currentRequest = request;
      
      // Add to requests list if authenticated
      if (_apiService.isAuthenticated) {
        _requests.insert(0, request);
      }
      
      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }

  // Track request by ID
  Future<bool> trackRequest(String requestId) async {
    _setLoading(true);
    _clearError();
    
    try {
      final request = await _apiService.trackRequest(requestId);
      _currentRequest = request;
      _setLoading(false);
      notifyListeners();
      return true;
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }

  // Get current location
  Future<bool> getCurrentLocation() async {
    _setLoading(true);
    _clearError();
    
    try {
      final location = await _locationService.getCurrentLocation();
      if (location != null) {
        _currentLocation = location;
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        throw Exception('Unable to get location');
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
      return false;
    }
  }

  // Set location manually
  void setLocation(Location location) {
    _currentLocation = location;
    notifyListeners();
  }

  // Clear current request
  void clearCurrentRequest() {
    _currentRequest = null;
    notifyListeners();
  }

  // Refresh requests
  Future<void> refreshRequests() async {
    if (_apiService.isAuthenticated) {
      await loadUserRequests();
    }
  }

  // Helper methods
  void _setLoading(bool loading) {
    _isLoading = loading;
  }

  void _setError(String error) {
    _error = error;
  }

  void _clearError() {
    _error = null;
  }
} 