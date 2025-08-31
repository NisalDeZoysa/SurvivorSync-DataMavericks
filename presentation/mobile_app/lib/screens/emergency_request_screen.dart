import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../constants/app_constants.dart';
import '../models/disaster.dart';
import '../providers/disaster_provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class EmergencyRequestScreen extends StatefulWidget {
  const EmergencyRequestScreen({super.key});

  @override
  State<EmergencyRequestScreen> createState() => _EmergencyRequestScreenState();
}

class _EmergencyRequestScreenState extends State<EmergencyRequestScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _detailsCtrl = TextEditingController();
  final _contactCtrl = TextEditingController();
  final _countCtrl = TextEditingController(text: '1');
  DisasterType _type = DisasterType.other;
  DisasterSeverity _severity = DisasterSeverity.medium;
  File? _photo;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    if (user != null) {
      _nameCtrl.text = user.name;
      _contactCtrl.text = user.contactNo ?? '';
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _detailsCtrl.dispose();
    _contactCtrl.dispose();
    _countCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickPhoto() async {
    final picker = ImagePicker();
    final x = await picker.pickImage(source: ImageSource.camera);
    if (x != null) setState(() => _photo = File(x.path));
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final dp = context.read<DisasterProvider>();

    final okLoc = await dp.getCurrentLocation();
    if (!okLoc) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Enable location to submit.'),
        backgroundColor: AppColors.error,
      ));
      return;
    }

    final ok = await dp.submitRequest(
      name: _nameCtrl.text.trim(),
      disasterType: _type,
      severity: _severity,
      details: _detailsCtrl.text.trim(),
      affectedCount: int.tryParse(_countCtrl.text) ?? 1,
      contactNo: _contactCtrl.text.trim(),
      imageFile: _photo,
    );

    if (!mounted) return;
    if (ok) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text('Request submitted.'),
        backgroundColor: AppColors.success,
      ));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(dp.error ?? 'Failed to submit'),
        backgroundColor: AppColors.error,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Report Emergency'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSizes.lg),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CustomTextField(
                  controller: _nameCtrl,
                  label: 'Contact Person Name',
                  validator: (v) => (v == null || v.isEmpty) ? AppStrings.requiredField : null,
                ),
                const SizedBox(height: AppSizes.md),
                Text(AppStrings.emergencyType, style: AppTextStyles.labelLarge),
                const SizedBox(height: AppSizes.xs),
                DropdownButtonFormField<DisasterType>(
                  value: _type,
                  items: DisasterType.values
                      .map((t) => DropdownMenuItem(value: t, child: Text(t.label)))
                      .toList(),
                  onChanged: (v) => setState(() => _type = v ?? DisasterType.other),
                ),
                const SizedBox(height: AppSizes.md),
                Text(AppStrings.severity, style: AppTextStyles.labelLarge),
                const SizedBox(height: AppSizes.xs),
                DropdownButtonFormField<DisasterSeverity>(
                  value: _severity,
                  items: DisasterSeverity.values
                      .map((s) => DropdownMenuItem(value: s, child: Text(s.label)))
                      .toList(),
                  onChanged: (v) => setState(() => _severity = v ?? DisasterSeverity.medium),
                ),
                const SizedBox(height: AppSizes.md),
                CustomTextField(
                  controller: _countCtrl,
                  label: AppStrings.affectedCount,
                  keyboardType: TextInputType.number,
                  validator: (v) => (v == null || v.isEmpty) ? AppStrings.requiredField : null,
                ),
                const SizedBox(height: AppSizes.md),
                CustomTextField(
                  controller: _contactCtrl,
                  label: AppStrings.contactNumber,
                  keyboardType: TextInputType.phone,
                  validator: (v) => (v == null || v.isEmpty) ? AppStrings.requiredField : null,
                ),
                const SizedBox(height: AppSizes.md),
                CustomTextField(
                  controller: _detailsCtrl,
                  label: AppStrings.details,
                  maxLines: 4,
                  validator: (v) => (v == null || v.isEmpty) ? AppStrings.requiredField : null,
                ),
                const SizedBox(height: AppSizes.lg),
                Text('Photo (optional)', style: AppTextStyles.labelLarge),
                const SizedBox(height: AppSizes.xs),
                GestureDetector(
                  onTap: _pickPhoto,
                  child: Container(
                    height: 140,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppSizes.borderRadius),
                      border: Border.all(color: AppColors.outline),
                    ),
                    child: _photo == null
                        ? Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.camera_alt, color: AppColors.textSecondary),
                                const SizedBox(height: AppSizes.xs),
                                Text('Tap to capture', style: AppTextStyles.bodySmall.copyWith(color: AppColors.textSecondary)),
                              ],
                            ),
                          )
                        : ClipRRect(
                            borderRadius: BorderRadius.circular(AppSizes.borderRadius),
                            child: Image.file(_photo!, fit: BoxFit.cover, width: double.infinity),
                          ),
                  ),
                ),
                const SizedBox(height: AppSizes.xl),
                Consumer<DisasterProvider>(
                  builder: (_, dp, __) => CustomButton(
                    onPressed: dp.isLoading ? null : _submit,
                    text: dp.isLoading ? 'Submitting...' : AppStrings.submitRequest,
                    variant: ButtonVariant.danger,
                    isLoading: dp.isLoading,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
} 