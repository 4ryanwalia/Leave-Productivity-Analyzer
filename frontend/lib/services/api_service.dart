import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Backend API base URL
  // IMPORTANT: Update this value after deploying backend to Render
  // 
  // For local development:
  //   static const String baseUrl = 'http://localhost:3000/api';
  //
  // For production (after deploying to Render):
  //   static const String baseUrl = 'https://your-app-name.onrender.com/api';
  //   Replace 'your-app-name' with your actual Render service name
  static const String baseUrl = 'http://localhost:3000/api';

  /// Upload Excel file
  static Future<Map<String, dynamic>> uploadFile(
    List<int> fileBytes,
    String fileName,
  ) async {
    try {
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/upload'),
      );

      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          fileBytes,
          filename: fileName,
        ),
      );

      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Upload failed');
      }
    } catch (e) {
      throw Exception('Error uploading file: ${e.toString()}');
    }
  }

  /// Get monthly summary
  static Future<Map<String, dynamic>> getMonthlySummary(
    String employeeName,
    int year,
    int month,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/attendance/monthly-summary')
            .replace(queryParameters: {
          'employeeName': employeeName,
          'year': year.toString(),
          'month': month.toString(),
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to fetch monthly summary');
      }
    } catch (e) {
      throw Exception('Error fetching monthly summary: ${e.toString()}');
    }
  }

  /// Get daily breakdown
  static Future<Map<String, dynamic>> getDailyBreakdown(
    String employeeName,
    int year,
    int month,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/attendance/daily-breakdown')
            .replace(queryParameters: {
          'employeeName': employeeName,
          'year': year.toString(),
          'month': month.toString(),
        }),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final error = json.decode(response.body);
        throw Exception(error['error'] ?? 'Failed to fetch daily breakdown');
      }
    } catch (e) {
      throw Exception('Error fetching daily breakdown: ${e.toString()}');
    }
  }

  /// Get list of employees
  static Future<List<String>> getEmployees() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/attendance/employees'),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return List<String>.from(data['employees'] ?? []);
      } else {
        throw Exception('Failed to fetch employees');
      }
    } catch (e) {
      throw Exception('Error fetching employees: ${e.toString()}');
    }
  }
}

