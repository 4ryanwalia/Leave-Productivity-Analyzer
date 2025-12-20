import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../services/api_service.dart';

class UploadScreen extends StatefulWidget {
  final VoidCallback? onUploadSuccess;
  
  const UploadScreen({super.key, this.onUploadSuccess});

  @override
  State<UploadScreen> createState() => _UploadScreenState();
}

class _UploadScreenState extends State<UploadScreen> {
  bool _isUploading = false;
  String? _uploadMessage;
  bool _uploadSuccess = false;

  Future<void> _pickAndUploadFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['xlsx', 'xls'],
      );

      if (result != null && result.files.single.bytes != null) {
        setState(() {
          _isUploading = true;
          _uploadMessage = null;
          _uploadSuccess = false;
        });

        final fileBytes = result.files.single.bytes!;
        final fileName = result.files.single.name;

        final response = await ApiService.uploadFile(fileBytes, fileName);

        setState(() {
          _isUploading = false;
          _uploadSuccess = true;
          _uploadMessage =
              'File uploaded successfully!\n${response['recordsProcessed']} records processed.';
        });
        
        // Automatically navigate to dashboard after 2 seconds
        Future.delayed(const Duration(seconds: 2), () {
          if (mounted && widget.onUploadSuccess != null) {
            widget.onUploadSuccess!();
          }
        });
      }
    } catch (e) {
      setState(() {
        _isUploading = false;
        _uploadSuccess = false;
        _uploadMessage = 'Error: ${e.toString()}';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.cloud_upload,
              size: 80,
              color: Colors.blue,
            ),
            const SizedBox(height: 24),
            const Text(
              'Upload Attendance Excel File',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Select an Excel file (.xlsx or .xls) with attendance data.\n'
              'Required columns: Employee Name/ID, Date, In-Time, Out-Time',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: _isUploading ? null : _pickAndUploadFile,
              icon: _isUploading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.upload_file),
              label: Text(_isUploading ? 'Uploading...' : 'Choose File'),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
                textStyle: const TextStyle(fontSize: 16),
              ),
            ),
            if (_uploadMessage != null) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _uploadSuccess
                      ? Colors.green.shade50
                      : Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _uploadSuccess
                        ? Colors.green.shade300
                        : Colors.red.shade300,
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      _uploadMessage!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: _uploadSuccess ? Colors.green.shade900 : Colors.red.shade900,
                      ),
                    ),
                    if (_uploadSuccess && widget.onUploadSuccess != null) ...[
                      const SizedBox(height: 16),
                      ElevatedButton.icon(
                        onPressed: () {
                          widget.onUploadSuccess!();
                        },
                        icon: const Icon(Icons.dashboard),
                        label: const Text('Go to Dashboard'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Auto-redirecting in 2 seconds...',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.green.shade700,
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

