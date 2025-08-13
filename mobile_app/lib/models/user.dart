enum UserRole {
  user,
  firstResponder,
  volunteers,
  admin,
}

class User {
  final String id;
  final String name;
  final String email;
  final UserRole role;
  final String? nic;
  final String? address;
  final Location? location;
  final String? contactNo;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.nic,
    this.address,
    this.location,
    this.contactNo,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: UserRole.values.firstWhere(
        (e) => e.toString().split('.').last == json['role'],
        orElse: () => UserRole.user,
      ),
      nic: json['nic'],
      address: json['address'],
      location: json['location'] != null ? Location.fromJson(json['location']) : null,
      contactNo: json['contactNo'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role.toString().split('.').last,
      'nic': nic,
      'address': address,
      'location': location?.toJson(),
      'contactNo': contactNo,
    };
  }

  User copyWith({
    String? id,
    String? name,
    String? email,
    UserRole? role,
    String? nic,
    String? address,
    Location? location,
    String? contactNo,
  }) {
    return User(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      role: role ?? this.role,
      nic: nic ?? this.nic,
      address: address ?? this.address,
      location: location ?? this.location,
      contactNo: contactNo ?? this.contactNo,
    );
  }
}

class Location {
  final double latitude;
  final double longitude;
  final String? address;

  Location({
    required this.latitude,
    required this.longitude,
    this.address,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      address: json['address'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
} 