# SurvivorSync - Disaster Help Request Mobile App

A Flutter mobile application for end-users to request help during disasters. The app provides a modern, intuitive interface for reporting emergencies and tracking request status.

## Features

### 🚀 Onboarding Screens
- Welcome and introduction slides explaining the app's purpose
- Step-by-step guide on how to use the app
- Modern, engaging UI with smooth animations

### 🔐 User Authentication
- User registration and login with email and password
- Guest mode for users who want to submit requests without creating an account
- Secure token-based authentication
- Profile management

### 🆘 Disaster Request Form
- Comprehensive form for submitting emergency requests
- Fields include:
  - User details (if logged in)
  - Location (with GPS integration)
  - Type of disaster (Flood, Earthquake, Fire, etc.)
  - Severity level
  - Description and details
  - Number of people affected
  - Contact information
  - Optional photo upload
  - Optional audio recording

### 📊 Request Status Tracking
- Real-time status updates for submitted requests
- Timeline view of request processing
- Status indicators (Pending, Processing, Resolved, Cancelled)
- Guest users can track requests using unique request IDs

### 🎨 Modern UI/UX
- Clean, intuitive interface following Material Design 3
- Responsive design for different screen sizes
- Accessibility features
- Dark/light theme support
- Smooth animations and transitions

## Architecture

### Clean Architecture
The app follows clean architecture principles with clear separation of concerns:

```
lib/
├── models/          # Data models and entities
├── providers/       # State management (Provider pattern)
├── services/        # Business logic and API communication
├── screens/         # UI screens and pages
├── widgets/         # Reusable UI components
├── constants/       # App constants and configurations
└── utils/          # Utility functions and helpers
```

### State Management
- **Provider Pattern**: Used for state management throughout the app
- **AuthProvider**: Manages user authentication state
- **DisasterProvider**: Manages emergency requests and location data

### Key Components

#### Models
- `User`: User profile and authentication data
- `DisasterRequest`: Emergency request data structure
- `Location`: GPS coordinates and address information

#### Services
- `ApiService`: Handles all HTTP requests to the backend
- `LocationService`: Manages GPS and geocoding functionality

#### Screens
- `OnboardingScreen`: Welcome and introduction slides
- `LoginScreen`: User authentication
- `RegisterScreen`: User registration
- `HomeScreen`: Main dashboard with quick actions
- `EmergencyRequestScreen`: Emergency reporting form
- `RequestsScreen`: Request history and tracking

## Getting Started

### Prerequisites
- Flutter SDK (3.8.1 or higher)
- Dart SDK
- Android Studio / VS Code
- Android/iOS device or emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile_app
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure API endpoints**
   - Update the `baseUrl` in `lib/constants/app_constants.dart`
   - Ensure the backend server is running

4. **Run the app**
   ```bash
   flutter run
   ```

### Dependencies

The app uses the following key dependencies:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # State Management
  provider: ^6.1.1
  
  # HTTP and API
  http: ^1.1.2
  dio: ^5.4.0
  
  # Location Services
  geolocator: ^10.1.0
  geocoding: ^2.1.1
  
  # Image and File Handling
  image_picker: ^1.0.7
  file_picker: ^6.1.1
  
  # Storage
  shared_preferences: ^2.2.2
  
  # Navigation
  go_router: ^13.2.0
  
  # UI Components
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9
  shimmer: ^3.0.0
  
  # Audio Recording
  record: ^5.0.4
  audioplayers: ^5.2.1
```

## API Integration

The app integrates with a Node.js backend API. Key endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/requests` - Submit emergency request
- `GET /api/requests/user` - Get user's requests
- `GET /api/requests/track/:id` - Track request by ID

## Features in Detail

### Emergency Request Flow

1. **User selects "Report Emergency"**
2. **Form validation** ensures all required fields are completed
3. **Location detection** automatically gets GPS coordinates
4. **Media upload** allows photo and audio evidence
5. **Request submission** sends data to backend
6. **Confirmation** shows success message and request ID

### Guest Mode

- Users can submit emergency requests without creating an account
- Unique request ID is provided for tracking
- All functionality available except request history

### Location Services

- Automatic GPS detection
- Manual address input option
- Geocoding for address-to-coordinates conversion
- Permission handling for location access

## UI/UX Design

### Color Scheme
- **Primary**: Blue (#1E40AF) - Trust and reliability
- **Emergency**: Red (#DC2626) - Urgency and danger
- **Safety**: Green (#059669) - Success and safety
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter - Modern, readable font
- **Hierarchy**: Clear text hierarchy with different weights and sizes
- **Accessibility**: High contrast ratios and readable font sizes

### Components
- **CustomTextField**: Consistent input styling
- **CustomButton**: Multiple variants (primary, outlined, danger)
- **Status Cards**: Visual status indicators
- **Media Upload**: Intuitive photo and audio capture

## Testing

### Unit Tests
```bash
flutter test
```

### Widget Tests
```bash
flutter test test/widget_test.dart
```

### Integration Tests
```bash
flutter drive --target=test_driver/app.dart
```

## Deployment

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- Push notifications for request updates
- Offline mode support
- Multi-language support
- Advanced mapping integration
- Real-time chat with emergency responders
- Emergency contact management
- Weather integration for disaster alerts
