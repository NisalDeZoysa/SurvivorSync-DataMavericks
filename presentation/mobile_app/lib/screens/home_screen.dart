import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/disaster_provider.dart';
import '../constants/app_constants.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';
import '../models/disaster.dart';
import 'emergency_request_screen.dart';
import 'requests_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    // Load user requests if authenticated
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        context.read<DisasterProvider>().loadUserRequests();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        title: Text(
          AppStrings.appName,
          style: AppTextStyles.headlineSmall,
        ),
        actions: [
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              if (authProvider.isAuthenticated) {
                return PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'logout') {
                      authProvider.logout();
                    }
                  },
                  itemBuilder: (context) => [
                    PopupMenuItem(
                      value: 'logout',
                      child: const Text('Logout'),
                    ),
                  ],
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome section
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Welcome${authProvider.currentUser != null ? ', ${authProvider.currentUser!.name}' : ''}!',
                        style: AppTextStyles.displaySmall,
                      ),
                      const SizedBox(height: AppSizes.sm),
                      Text(
                        'How can we help you today?',
                        style: AppTextStyles.bodyLarge.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  );
                },
              ),
              
              const SizedBox(height: AppSizes.xl),
              
              // Emergency request card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSizes.lg),
                decoration: BoxDecoration(
                  color: AppColors.emergency.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSizes.borderRadiusLarge),
                  border: Border.all(
                    color: AppColors.emergency.withOpacity(0.2),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(AppSizes.sm),
                          decoration: BoxDecoration(
                            color: AppColors.emergency,
                            borderRadius: BorderRadius.circular(AppSizes.borderRadiusSmall),
                          ),
                          child: const Icon(
                            Icons.emergency,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: AppSizes.md),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                AppStrings.reportEmergency,
                                style: AppTextStyles.headlineSmall,
                              ),
                              Text(
                                'Report an emergency situation',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSizes.lg),
                    CustomButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const EmergencyRequestScreen(),
                          ),
                        );
                      },
                      text: 'Report Emergency',
                      variant: ButtonVariant.danger,
                      icon: const Icon(Icons.add, size: 20),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: AppSizes.xl),
              
              // Quick actions
              Text(
                'Quick Actions',
                style: AppTextStyles.headlineSmall,
              ),
              
              const SizedBox(height: AppSizes.md),
              
              Row(
                children: [
                  Expanded(
                    child: _buildQuickActionCard(
                      icon: Icons.history,
                      title: 'My Requests',
                      subtitle: 'Track your requests',
                      color: AppColors.primary,
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const RequestsScreen(),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: AppSizes.md),
                  Expanded(
                    child: _buildQuickActionCard(
                      icon: Icons.location_on,
                      title: 'Track Request',
                      subtitle: 'Track by ID',
                      color: AppColors.safety,
                      onTap: () {
                        _showTrackRequestDialog();
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: AppSizes.xl),
              
              // Recent requests (if authenticated)
              Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  if (!authProvider.isAuthenticated) return const SizedBox.shrink();
                  
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recent Requests',
                        style: AppTextStyles.headlineSmall,
                      ),
                      const SizedBox(height: AppSizes.md),
                      Consumer<DisasterProvider>(
                        builder: (context, disasterProvider, child) {
                          if (disasterProvider.requests.isEmpty) {
                            return Container(
                              padding: const EdgeInsets.all(AppSizes.lg),
                              decoration: BoxDecoration(
                                color: AppColors.surface,
                                borderRadius: BorderRadius.circular(AppSizes.borderRadius),
                              ),
                              child: Column(
                                children: [
                                  Icon(
                                    Icons.history,
                                    size: 48,
                                    color: AppColors.textTertiary,
                                  ),
                                  const SizedBox(height: AppSizes.md),
                                  Text(
                                    'No requests yet',
                                    style: AppTextStyles.titleMedium,
                                  ),
                                  Text(
                                    'Your emergency requests will appear here',
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          }
                          
                          return ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: disasterProvider.requests.take(3).length,
                            itemBuilder: (context, index) {
                              final request = disasterProvider.requests[index];
                              return _buildRequestCard(request);
                            },
                          );
                        },
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(AppSizes.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSizes.borderRadius),
          border: Border.all(color: AppColors.outline),
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(AppSizes.sm),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSizes.borderRadiusSmall),
              ),
              child: Icon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(height: AppSizes.sm),
            Text(
              title,
              style: AppTextStyles.titleMedium,
              textAlign: TextAlign.center,
            ),
            Text(
              subtitle,
              style: AppTextStyles.bodySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRequestCard(disasterRequest) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSizes.sm),
      padding: const EdgeInsets.all(AppSizes.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSizes.borderRadius),
        border: Border.all(color: AppColors.outline),
      ),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 40,
            decoration: BoxDecoration(
              color: _getStatusColor(disasterRequest.status),
              borderRadius: BorderRadius.circular(4),
            ),
          ),
          const SizedBox(width: AppSizes.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  disasterRequest.name,
                  style: AppTextStyles.titleMedium,
                ),
                Text(
                  disasterRequest.disasterType.label,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSizes.sm,
              vertical: AppSizes.xs,
            ),
            decoration: BoxDecoration(
              color: _getStatusColor(disasterRequest.status).withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSizes.borderRadiusSmall),
            ),
            child: Text(
              disasterRequest.status.label,
              style: AppTextStyles.labelSmall.copyWith(
                color: _getStatusColor(disasterRequest.status),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(RequestStatus status) {
    switch (status) {
      case RequestStatus.pending:
        return AppColors.warning;
      case RequestStatus.processing:
        return AppColors.info;
      case RequestStatus.resolved:
        return AppColors.success;
      case RequestStatus.cancelled:
        return AppColors.error;
    }
  }

  void _showTrackRequestDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Track Request'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Enter your request ID to track its status',
              style: AppTextStyles.bodyMedium,
            ),
            const SizedBox(height: AppSizes.md),
            CustomTextField(
              controller: controller,
              label: 'Request ID',
              hint: 'Enter request ID',
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          CustomButton(
            onPressed: () {
              if (controller.text.isNotEmpty) {
                Navigator.pop(context);
                context.read<DisasterProvider>().trackRequest(controller.text);
                // Navigate to request details or show in a dialog
              }
            },
            text: 'Track',
            width: 80,
            height: 36,
          ),
        ],
      ),
    );
  }
} 