class MonthlySummary {
  final String employeeName;
  final int year;
  final int month;
  final double totalExpectedHours;
  final double totalActualHours;
  final int leavesUsed;
  final int maxLeavesAllowed;
  final double productivity;

  MonthlySummary({
    required this.employeeName,
    required this.year,
    required this.month,
    required this.totalExpectedHours,
    required this.totalActualHours,
    required this.leavesUsed,
    required this.maxLeavesAllowed,
    required this.productivity,
  });

  factory MonthlySummary.fromJson(Map<String, dynamic> json) {
    return MonthlySummary(
      employeeName: json['employeeName'] ?? '',
      year: json['year'] ?? 0,
      month: json['month'] ?? 0,
      totalExpectedHours: (json['totalExpectedHours'] ?? 0).toDouble(),
      totalActualHours: (json['totalActualHours'] ?? 0).toDouble(),
      leavesUsed: json['leavesUsed'] ?? 0,
      maxLeavesAllowed: json['maxLeavesAllowed'] ?? 2,
      productivity: (json['productivity'] ?? 0).toDouble(),
    );
  }
}

class DailyRecord {
  final String date;
  final double expectedHours;
  final double workedHours;
  final String status;
  final String? inTime;
  final String? outTime;
  final bool isLeave;

  DailyRecord({
    required this.date,
    required this.expectedHours,
    required this.workedHours,
    required this.status,
    this.inTime,
    this.outTime,
    required this.isLeave,
  });

  factory DailyRecord.fromJson(Map<String, dynamic> json) {
    return DailyRecord(
      date: json['date'] ?? '',
      expectedHours: (json['expectedHours'] ?? 0).toDouble(),
      workedHours: (json['workedHours'] ?? 0).toDouble(),
      status: json['status'] ?? 'present',
      inTime: json['inTime'],
      outTime: json['outTime'],
      isLeave: json['isLeave'] ?? false,
    );
  }
}

