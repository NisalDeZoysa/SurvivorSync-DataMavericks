import 'dart:io';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/disaster.dart';
import '../constants/app_constants.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;
  String? _authToken;

  void initialize() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiEndpoints.baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_authToken != null) {
          options.headers['Authorization'] = 'Bearer $_authToken';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        handler.next(error);
      },
    ));

    _loadAuthToken();
  }

  Future<void> _loadAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    _authToken = prefs.getString('auth_token');
  }

  Future<void> _saveAuthToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    _authToken = token;
  }

  Future<void> _clearAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _authToken = null;
  }

  // Authentication Methods (mocked when AppConfig.mockMode is true)
  Future<User> login(String email, String password) async {
    if (AppConfig.mockMode) {
      return User(
        id: 'u1',
        name: 'Test User',
        email: email,
        role: UserRole.user,
        contactNo: '+123456789',
      );
    }

    final response = await _dio.post(ApiEndpoints.login, data: {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      final user = User.fromJson(response.data['user']);
      await _saveAuthToken(response.data['token']);
      return user;
    } else {
      throw Exception(response.data['message'] ?? 'Login failed');
    }
  }

  Future<User> register({
    required String name,
    required String email,
    required String password,
    String? contactNo,
  }) async {
    if (AppConfig.mockMode) {
      return User(
        id: 'u2',
        name: name,
        email: email,
        role: UserRole.user,
        contactNo: contactNo,
      );
    }

    final response = await _dio.post(ApiEndpoints.register, data: {
      'name': name,
      'email': email,
      'password': password,
      'contactNo': contactNo,
    });

    if (response.statusCode == 201) {
      final user = User.fromJson(response.data['user']);
      await _saveAuthToken(response.data['token']);
      return user;
    } else {
      throw Exception(response.data['message'] ?? 'Registration failed');
    }
  }

  Future<void> logout() async {
    await _clearAuthToken();
  }

  // Disaster Request Methods (mocked)
  Future<DisasterRequest> submitDisasterRequest({
    required String name,
    required DisasterType disasterType,
    required DisasterSeverity severity,
    required String details,
    required int affectedCount,
    required String contactNo,
    required double latitude,
    required double longitude,
    String? district,
    String? province,
    File? imageFile,
    File? audioFile,
  }) async {
    if (AppConfig.mockMode) {
      return _fakeRequest(
        name: name,
        disasterType: disasterType,
        severity: severity,
        details: details,
        affectedCount: affectedCount,
        contactNo: contactNo,
        latitude: latitude,
        longitude: longitude,
      );
    }

    final formData = FormData.fromMap({
      'name': name,
      'disasterId': disasterType.value,
      'severity': severity.value,
      'details': details,
      'affectedCount': affectedCount,
      'contactNo': contactNo,
      'latitude': latitude,
      'longitude': longitude,
      'district': district ?? '',
      'province': province ?? '',
      if (imageFile != null) 'image': await MultipartFile.fromFile(imageFile.path),
      if (audioFile != null) 'voice': await MultipartFile.fromFile(audioFile.path),
    });

    final response = await _dio.post(
      ApiEndpoints.requests,
      data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}),
    );

    if (response.statusCode == 201) {
      return DisasterRequest.fromJson(response.data);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to submit request');
    }
  }

  Future<List<DisasterRequest>> getUserRequests() async {
    if (AppConfig.mockMode) {
      return _fakeRequestsList();
    }

    final response = await _dio.get(ApiEndpoints.userRequests);
    if (response.statusCode == 200) {
      final List<dynamic> data = response.data['requests'] ?? [];
      return data.map((json) => DisasterRequest.fromJson(json)).toList();
    } else {
      throw Exception(response.data['message'] ?? 'Failed to fetch requests');
    }
  }

  Future<DisasterRequest> trackRequest(String requestId) async {
    if (AppConfig.mockMode) {
      return _fakeRequestsList().then((list) => list.first);
    }

    final response = await _dio.get('${ApiEndpoints.trackRequest}/$requestId');
    if (response.statusCode == 200) {
      return DisasterRequest.fromJson(response.data);
    } else {
      throw Exception(response.data['message'] ?? 'Request not found');
    }
  }

  Future<DisasterRequest> submitGuestRequest({
    required String name,
    required DisasterType disasterType,
    required DisasterSeverity severity,
    required String details,
    required int affectedCount,
    required String contactNo,
    required double latitude,
    required double longitude,
    String? district,
    String? province,
    File? imageFile,
    File? audioFile,
  }) async {
    if (AppConfig.mockMode) {
      return _fakeRequest(
        name: name,
        disasterType: disasterType,
        severity: severity,
        details: details,
        affectedCount: affectedCount,
        contactNo: contactNo,
        latitude: latitude,
        longitude: longitude,
      );
    }

    final formData = FormData.fromMap({
      'name': name,
      'disasterId': disasterType.value,
      'severity': severity.value,
      'details': details,
      'affectedCount': affectedCount,
      'contactNo': contactNo,
      'latitude': latitude,
      'longitude': longitude,
      'district': district ?? '',
      'province': province ?? '',
      'isGuest': true,
      if (imageFile != null) 'image': await MultipartFile.fromFile(imageFile.path),
      if (audioFile != null) 'voice': await MultipartFile.fromFile(audioFile.path),
    });

    final response = await _dio.post(
      ApiEndpoints.requests,
      data: formData,
      options: Options(headers: {'Content-Type': 'multipart/form-data'}),
    );

    if (response.statusCode == 201) {
      return DisasterRequest.fromJson(response.data);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to submit request');
    }
  }

  // Mock helpers
  DisasterRequest _fakeRequest({
    required String name,
    required DisasterType disasterType,
    required DisasterSeverity severity,
    required String details,
    required int affectedCount,
    required String contactNo,
    required double latitude,
    required double longitude,
  }) {
    return DisasterRequest(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      userId: 'u1',
      disasterType: disasterType,
      severity: severity,
      status: RequestStatus.processing,
      details: details,
      affectedCount: affectedCount,
      contactNo: contactNo,
      latitude: latitude,
      longitude: longitude,
      district: 'Colombo',
      province: 'Western',
      image: null,
      voice: null,
      isVerified: true,
      createdAt: DateTime.now().subtract(const Duration(minutes: 5)),
      updatedAt: DateTime.now(),
    );
  }

  Future<List<DisasterRequest>> _fakeRequestsList() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return [
      DisasterRequest(
        id: 'r1',
        name: 'Main Street Flood',
        userId: 'u1',
        disasterType: DisasterType.flood,
        severity: DisasterSeverity.high,
        status: RequestStatus.processing,
        details: 'Severe flooding near the river bank, roads submerged.',
        affectedCount: 25,
        contactNo: '+123456789',
        latitude: 6.9271,
        longitude: 79.8612,
        district: 'Colombo',
        province: 'Western',
        image: null,
        voice: null,
        isVerified: true,
        createdAt: DateTime.now().subtract(const Duration(hours: 1)),
        updatedAt: DateTime.now(),
      ),
      DisasterRequest(
        id: 'r2',
        name: 'Apartment Fire',
        userId: 'u1',
        disasterType: DisasterType.householdFire,
        severity: DisasterSeverity.critical,
        status: RequestStatus.pending,
        details: 'Fire on the 3rd floor; smoke visible from outside.',
        affectedCount: 6,
        contactNo: '+123456789',
        latitude: 6.9147,
        longitude: 79.9726,
        district: 'Colombo',
        province: 'Western',
        image: null,
        voice: null,
        isVerified: false,
        createdAt: DateTime.now().subtract(const Duration(hours: 3)),
        updatedAt: DateTime.now(),
      ),
      DisasterRequest(
        id: 'r3',
        name: 'Landslide Alert',
        userId: 'u1',
        disasterType: DisasterType.other,
        severity: DisasterSeverity.medium,
        status: RequestStatus.resolved,
        details: 'Possible landslide after heavy rain. Area cleared.',
        affectedCount: 0,
        contactNo: '+123456789',
        latitude: 7.2906,
        longitude: 80.6337,
        district: 'Kandy',
        province: 'Central',
        image: null,
        voice: null,
        isVerified: true,
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        updatedAt: DateTime.now(),
      ),
    ];
  }

  // Utility Methods
  bool get isAuthenticated => _authToken != null || AppConfig.mockMode;
  String? get authToken => _authToken;
} 