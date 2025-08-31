import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppConfig {
  // Toggle mock mode for testing without backend or permissions
  static const bool mockMode = true;
}

class AppColors {
  // Primary Colors
  static const Color primary = Color(0xFF1E40AF);
  static const Color primaryLight = Color(0xFF3B82F6);
  static const Color primaryDark = Color(0xFF1E3A8A);
  
  // Emergency Colors
  static const Color emergency = Color(0xFFDC2626);
  static const Color emergencyLight = Color(0xFFEF4444);
  static const Color emergencyDark = Color(0xFFB91C1C);
  
  // Safety Colors
  static const Color safety = Color(0xFF059669);
  static const Color safetyLight = Color(0xFF10B981);
  static const Color safetyDark = Color(0xFF047857);
  
  // Neutral Colors
  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF1F5F9);
  static const Color outline = Color(0xFFE2E8F0);
  static const Color textPrimary = Color(0xFF1E293B);
  static const Color textSecondary = Color(0xFF64748B);
  static const Color textTertiary = Color(0xFF94A3B8);
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
}

class AppTextStyles {
  static TextStyle get displayLarge => GoogleFonts.inter(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get displayMedium => GoogleFonts.inter(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get displaySmall => GoogleFonts.inter(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get headlineLarge => GoogleFonts.inter(
    fontSize: 22,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get headlineMedium => GoogleFonts.inter(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get headlineSmall => GoogleFonts.inter(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get titleLarge => GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get titleMedium => GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get titleSmall => GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );
  
  static TextStyle get bodyLarge => GoogleFonts.inter(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get bodyMedium => GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get bodySmall => GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );
  
  static TextStyle get labelLarge => GoogleFonts.inter(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
  
  static TextStyle get labelMedium => GoogleFonts.inter(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: AppColors.textSecondary,
  );
  
  static TextStyle get labelSmall => GoogleFonts.inter(
    fontSize: 10,
    fontWeight: FontWeight.w500,
    color: AppColors.textTertiary,
  );
}

class AppSizes {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 16.0;
  static const double lg = 24.0;
  static const double xl = 32.0;
  static const double xxl = 48.0;
  
  static const double borderRadius = 12.0;
  static const double borderRadiusSmall = 8.0;
  static const double borderRadiusLarge = 16.0;
  
  static const double buttonHeight = 48.0;
  static const double inputHeight = 48.0;
  static const double appBarHeight = 56.0;
}

class AppStrings {
  // App Info
  static const String appName = 'SurvivorSync';
  static const String appTagline = 'Emergency Help at Your Fingertips';
  
  // Onboarding
  static const String onboardingTitle1 = 'Welcome to SurvivorSync';
  static const String onboardingTitle2 = 'Quick Emergency Reporting';
  static const String onboardingTitle3 = 'Track Your Requests';
  static const String onboardingTitle4 = 'Stay Connected';
  
  static const String onboardingDesc1 = 'Get help during disasters with just a few taps. Your safety is our priority.';
  static const String onboardingDesc2 = 'Report emergencies quickly with location, photos, and voice recordings.';
  static const String onboardingDesc3 = 'Monitor the status of your emergency requests in real-time.';
  static const String onboardingDesc4 = 'Connect with emergency services and get updates on your situation.';
  
  // Authentication
  static const String login = 'Login';
  static const String register = 'Register';
  static const String email = 'Email';
  static const String password = 'Password';
  static const String confirmPassword = 'Confirm Password';
  static const String name = 'Full Name';
  static const String contactNumber = 'Contact Number';
  static const String forgotPassword = 'Forgot Password?';
  static const String dontHaveAccount = "Don't have an account? ";
  static const String alreadyHaveAccount = 'Already have an account? ';
  static const String signUp = 'Sign Up';
  static const String signIn = 'Sign In';
  static const String continueAsGuest = 'Continue as Guest';
  
  // Emergency Request
  static const String reportEmergency = 'Report Emergency';
  static const String emergencyName = 'Emergency Name';
  static const String emergencyType = 'Emergency Type';
  static const String severity = 'Severity Level';
  static const String details = 'Emergency Details';
  static const String affectedCount = 'People Affected';
  static const String location = 'Location';
  static const String detectLocation = 'Detect My Location';
  static const String uploadImage = 'Upload Image';
  static const String recordAudio = 'Record Audio';
  static const String submitRequest = 'Submit Request';
  static const String requestSubmitted = 'Request Submitted';
  static const String requestId = 'Request ID';
  
  // Status Messages
  static const String pending = 'Pending';
  static const String processing = 'Processing';
  static const String resolved = 'Resolved';
  static const String cancelled = 'Cancelled';
  
  // Navigation
  static const String home = 'Home';
  static const String requests = 'My Requests';
  static const String profile = 'Profile';
  static const String settings = 'Settings';
  
  // Errors
  static const String errorOccurred = 'An error occurred';
  static const String tryAgain = 'Please try again';
  static const String networkError = 'Network error';
  static const String locationError = 'Unable to get location';
  static const String permissionDenied = 'Permission denied';
  
  // Success
  static const String success = 'Success';
  static const String requestSubmittedSuccess = 'Your emergency request has been submitted successfully';
  static const String locationDetected = 'Location detected successfully';
  
  // Validation
  static const String requiredField = 'This field is required';
  static const String invalidEmail = 'Please enter a valid email';
  static const String invalidPhone = 'Please enter a valid phone number';
  static const String passwordMismatch = 'Passwords do not match';
  static const String weakPassword = 'Password is too weak';
}

class ApiEndpoints {
  static const String baseUrl = 'http://localhost:7000/api';
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String requests = '/requests';
  static const String userRequests = '/requests/user';
  static const String trackRequest = '/requests/track';
} 