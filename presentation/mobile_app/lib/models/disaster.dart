enum DisasterType {
  flood(1, 'Flood'),
  earthquake(2, 'Earthquake'),
  householdFire(3, 'Household Fire'),
  wildfire(4, 'Wild Fire'),
  tsunami(5, 'Tsunami'),
  other(6, 'Other');

  const DisasterType(this.value, this.label);
  final int value;
  final String label;
}

enum DisasterSeverity {
  low('LOW', 'Low'),
  medium('MEDIUM', 'Medium'),
  high('HIGH', 'High'),
  critical('CRITICAL', 'Critical');

  const DisasterSeverity(this.value, this.label);
  final String value;
  final String label;
}

enum RequestStatus {
  pending('pending', 'Pending'),
  processing('processing', 'Processing'),
  resolved('resolved', 'Resolved'),
  cancelled('cancelled', 'Cancelled');

  const RequestStatus(this.value, this.label);
  final String value;
  final String label;
}

class DisasterRequest {
  final String id;
  final String name;
  final String userId;
  final DisasterType disasterType;
  final DisasterSeverity severity;
  final RequestStatus status;
  final String details;
  final int affectedCount;
  final String contactNo;
  final double latitude;
  final double longitude;
  final String district;
  final String province;
  final String? image;
  final String? voice;
  final bool isVerified;
  final DateTime createdAt;
  final DateTime updatedAt;

  DisasterRequest({
    required this.id,
    required this.name,
    required this.userId,
    required this.disasterType,
    required this.severity,
    required this.status,
    required this.details,
    required this.affectedCount,
    required this.contactNo,
    required this.latitude,
    required this.longitude,
    required this.district,
    required this.province,
    this.image,
    this.voice,
    required this.isVerified,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DisasterRequest.fromJson(Map<String, dynamic> json) {
    return DisasterRequest(
      id: json['id']?.toString() ?? '',
      name: json['name'] ?? '',
      userId: json['userId']?.toString() ?? '',
      disasterType: DisasterType.values.firstWhere(
        (e) => e.value == json['disasterId'],
        orElse: () => DisasterType.other,
      ),
      severity: DisasterSeverity.values.firstWhere(
        (e) => e.value == json['severity'],
        orElse: () => DisasterSeverity.medium,
      ),
      status: RequestStatus.values.firstWhere(
        (e) => e.value == json['status'],
        orElse: () => RequestStatus.pending,
      ),
      details: json['details'] ?? '',
      affectedCount: json['affectedCount'] ?? 0,
      contactNo: json['contactNo'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      district: json['district'] ?? '',
      province: json['province'] ?? '',
      image: json['image'],
      voice: json['voice'],
      isVerified: json['isVerified'] ?? false,
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'userId': userId,
      'disasterId': disasterType.value,
      'severity': severity.value,
      'status': status.value,
      'details': details,
      'affectedCount': affectedCount,
      'contactNo': contactNo,
      'latitude': latitude,
      'longitude': longitude,
      'district': district,
      'province': province,
      'image': image,
      'voice': voice,
      'isVerified': isVerified,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  DisasterRequest copyWith({
    String? id,
    String? name,
    String? userId,
    DisasterType? disasterType,
    DisasterSeverity? severity,
    RequestStatus? status,
    String? details,
    int? affectedCount,
    String? contactNo,
    double? latitude,
    double? longitude,
    String? district,
    String? province,
    String? image,
    String? voice,
    bool? isVerified,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DisasterRequest(
      id: id ?? this.id,
      name: name ?? this.name,
      userId: userId ?? this.userId,
      disasterType: disasterType ?? this.disasterType,
      severity: severity ?? this.severity,
      status: status ?? this.status,
      details: details ?? this.details,
      affectedCount: affectedCount ?? this.affectedCount,
      contactNo: contactNo ?? this.contactNo,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      district: district ?? this.district,
      province: province ?? this.province,
      image: image ?? this.image,
      voice: voice ?? this.voice,
      isVerified: isVerified ?? this.isVerified,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
} 