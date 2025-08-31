import 'package:flutter/foundation.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../constants/app_constants.dart';

class AuthProvider with ChangeNotifier {
  User? _currentUser;
  bool _isLoading = false;
  String? _error;
  bool _isOnboardingComplete = false;

  User? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _currentUser != null;
  bool get isOnboardingComplete => _isOnboardingComplete;

  final ApiService _apiService = ApiService();

  // Initialize auth state
  Future<void> initialize() async {
    _setLoading(true);
    try {
      if (AppConfig.mockMode) {
        // skip onboarding for quick demo
        _isOnboardingComplete = true;
      }
      _setLoading(false);
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();
    
    try {
      final user = await _apiService.login(email, password);
      _currentUser = user;
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

  // Register
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    String? contactNo,
  }) async {
    _setLoading(true);
    _clearError();
    
    try {
      final user = await _apiService.register(
        name: name,
        email: email,
        password: password,
        contactNo: contactNo,
      );
      _currentUser = user;
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

  // Logout
  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await _apiService.logout();
      _currentUser = null;
      _setLoading(false);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      notifyListeners();
    }
  }

  // Continue as guest
  void continueAsGuest() {
    if (AppConfig.mockMode) {
      _currentUser = User(
        id: 'guest',
        name: 'Guest User',
        email: 'guest@example.com',
        role: UserRole.user,
        contactNo: '+100000000',
      );
    } else {
      _currentUser = null;
    }
    notifyListeners();
  }

  // Set onboarding complete
  void setOnboardingComplete() {
    _isOnboardingComplete = true;
    notifyListeners();
  }

  // Update user profile
  void updateUser(User user) {
    _currentUser = user;
    notifyListeners();
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