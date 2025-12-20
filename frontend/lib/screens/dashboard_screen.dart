import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import '../services/api_service.dart';
import '../models/attendance_data.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<String> _employees = [];
  String? _selectedEmployee;
  DateTime _selectedDate = DateTime.now();
  MonthlySummary? _monthlySummary;
  List<DailyRecord> _dailyBreakdown = [];
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadEmployees();
  }

  Future<void> _loadEmployees() async {
    try {
      final employees = await ApiService.getEmployees();
      setState(() {
        _employees = employees;
        if (employees.isNotEmpty && _selectedEmployee == null) {
          _selectedEmployee = employees.first;
          _loadAttendanceData();
        }
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading employees: ${e.toString()}';
      });
    }
  }

  Future<void> _loadAttendanceData() async {
    if (_selectedEmployee == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final year = _selectedDate.year;
      final month = _selectedDate.month - 1; // API expects 0-11

      final summaryData = await ApiService.getMonthlySummary(
        _selectedEmployee!,
        year,
        month,
      );

      final breakdownData = await ApiService.getDailyBreakdown(
        _selectedEmployee!,
        year,
        month,
      );

      setState(() {
        _monthlySummary = MonthlySummary.fromJson(summaryData);
        _dailyBreakdown = (breakdownData['dailyBreakdown'] as List)
            .map((json) => DailyRecord.fromJson(json))
            .toList();
        _isLoading = false;
        
        // Debug logging (temporary) - Log first 5 daily records
        print('📊 Chart Data Loaded:');
        print('  - Daily breakdown records: ${_dailyBreakdown.length}');
        final logCount = _dailyBreakdown.length > 5 ? 5 : _dailyBreakdown.length;
        for (int i = 0; i < logCount; i++) {
          final record = _dailyBreakdown[i];
          print('  - Record $i: date=${record.date}, expectedHours=${record.expectedHours}, workedHours=${record.workedHours}, status="${record.status}"');
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Error loading data: ${e.toString()}';
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      _loadAttendanceData();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Controls
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String>(
                  value: _selectedEmployee,
                  decoration: const InputDecoration(
                    labelText: 'Employee',
                    border: OutlineInputBorder(),
                  ),
                  items: _employees.map((employee) {
                    return DropdownMenuItem(
                      value: employee,
                      child: Text(employee),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _selectedEmployee = value;
                    });
                    _loadAttendanceData();
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: InkWell(
                  onTap: () => _selectDate(context),
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Month',
                      border: OutlineInputBorder(),
                      suffixIcon: Icon(Icons.calendar_today),
                    ),
                    child: Text(
                      DateFormat('MMMM yyyy').format(_selectedDate),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Error message
          if (_errorMessage != null)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade300),
              ),
              child: Text(
                _errorMessage!,
                style: TextStyle(color: Colors.red.shade900),
              ),
            ),
          // Loading indicator
          if (_isLoading)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: CircularProgressIndicator(),
              ),
            )
          else if (_monthlySummary != null)
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary Cards
                    _buildSummaryCards(),
                    const SizedBox(height: 24),
                    // Charts Section
                    _buildChartsSection(),
                    const SizedBox(height: 24),
                    // Daily Breakdown Table
                    _buildDailyTable(),
                  ],
                ),
              ),
            )
          else
            const Center(
              child: Padding(
                padding: EdgeInsets.all(32.0),
                child: Text(
                  'No data available. Please upload attendance data first.',
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSummaryCards() {
    if (_monthlySummary == null) return const SizedBox();

    final summary = _monthlySummary!;
    final productivityColor = summary.productivity >= 80
        ? Colors.green
        : summary.productivity >= 60
            ? Colors.orange
            : Colors.red;

    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Monthly Summary',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.blueGrey,
              ),
            ),
            const SizedBox(height: 20),
            _buildSimpleMetric(
              'Expected Hours',
              '${summary.totalExpectedHours.toStringAsFixed(1)} hours',
              Icons.schedule,
              Colors.blue,
            ),
            const SizedBox(height: 16),
            _buildSimpleMetric(
              'Actual Hours',
              '${summary.totalActualHours.toStringAsFixed(1)} hours',
              Icons.check_circle,
              Colors.orange,
            ),
            const SizedBox(height: 16),
            _buildSimpleMetric(
              'Leaves Used',
              '${summary.leavesUsed} out of ${summary.maxLeavesAllowed} allowed',
              Icons.event_busy,
              summary.leavesUsed > summary.maxLeavesAllowed
                  ? Colors.red
                  : Colors.purple,
            ),
            const SizedBox(height: 16),
            _buildSimpleMetric(
              'Productivity',
              '${summary.productivity.toStringAsFixed(1)}%',
              Icons.trending_up,
              productivityColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleMetric(
    String label,
    String value,
    IconData icon,
    Color color,
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color, size: 24),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildChartsSection() {
    // Only hide if monthly summary is null - always show charts section otherwise
    if (_monthlySummary == null) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        const Text(
          'Visual Analytics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.blueGrey,
          ),
        ),
        const SizedBox(height: 20),
        Row(
          children: [
            Expanded(
              child: Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Daily Hours Comparison',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: _buildDailyHoursChart(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Card(
                elevation: 2,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Attendance Status',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        height: 200,
                        child: _buildStatusPieChart(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildDailyHoursChart() {
    // Fixed: Include days with workedHours OR expectedHours > 0
    final workingDays = _dailyBreakdown
        .where((record) => record.workedHours > 0 || record.expectedHours > 0)
        .toList();

    // Always show fallback UI instead of empty container
    if (workingDays.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.bar_chart, size: 48, color: Colors.grey),
            SizedBox(height: 8),
            Text(
              'No data available',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    final displayDays = workingDays.length > 10 
        ? workingDays.take(10).toList() 
        : workingDays;

    // Hard-stabilize maxY to ensure bars are always visible
    const maxY = 10.0;

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxY,
        barTouchData: BarTouchData(
          enabled: true,
          touchTooltipData: BarTouchTooltipData(
            tooltipRoundedRadius: 8,
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < displayDays.length) {
                  final date = displayDays[value.toInt()].date;
                  final day = date.split('-')[2];
                  return Padding(
                    padding: const EdgeInsets.only(top: 8.0),
                    child: Text(
                      day,
                      style: const TextStyle(fontSize: 10),
                    ),
                  );
                }
                return const Text('');
              },
              reservedSize: 30,
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(
                  value.toInt().toString(),
                  style: const TextStyle(fontSize: 10),
                );
              },
            ),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: 2,
        ),
        borderData: FlBorderData(show: true),
        barGroups: List.generate(
          displayDays.length,
          (index) {
            final record = displayDays[index];
            // NEVER pass 0 or null to BarChartRodData.toY - use 0.1 minimum
            final expectedY = record.expectedHours <= 0 ? 0.1 : record.expectedHours;
            final workedY = record.workedHours <= 0 ? 0.1 : record.workedHours;
            
            return BarChartGroupData(
              x: index,
              barRods: [
                BarChartRodData(
                  toY: expectedY,
                  color: Colors.blue[300],
                  width: 8,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(4),
                  ),
                ),
                BarChartRodData(
                  toY: workedY,
                  color: Colors.orange,
                  width: 8,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(4),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildStatusPieChart() {
    int present = 0;
    int leave = 0;
    int holiday = 0;

    // Fixed: Normalize status and handle variations
    for (var record in _dailyBreakdown) {
      final status = record.status.toLowerCase().trim();
      
      if (status.contains('present')) {
        present++;
      } else if (status.contains('leave') || status.contains('absent')) {
        leave++;
      } else {
        // Treat anything else as holiday/other
        holiday++;
      }
    }
    
    // Debug logging (temporary)
    print('📊 Pie Chart Counts: present=$present, leave=$leave, holiday=$holiday');

    // Always show fallback UI instead of empty container
    if (present + leave + holiday == 0) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.pie_chart, size: 48, color: Colors.grey),
            SizedBox(height: 8),
            Text(
              'No data available',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    // Build sections list - ensure at least one section exists
    final sections = <PieChartSectionData>[];
    
    // Always add sections even if count is 0 (use 0.1 minimum to ensure visibility)
    sections.add(
      PieChartSectionData(
        value: present > 0 ? present.toDouble() : 0.1,
        title: 'Present\n$present',
        color: Colors.green,
        radius: 60,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
    
    sections.add(
      PieChartSectionData(
        value: leave > 0 ? leave.toDouble() : 0.1,
        title: 'Leave\n$leave',
        color: Colors.red,
        radius: 60,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
    
    if (holiday > 0) {
      sections.add(
        PieChartSectionData(
          value: holiday.toDouble(),
          title: 'Holiday\n$holiday',
          color: Colors.grey,
          radius: 60,
          titleStyle: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      );
    }

    return PieChart(
      PieChartData(
        sectionsSpace: 2,
        centerSpaceRadius: 40,
        sections: sections,
      ),
    );
  }

  Widget _buildDailyTable() {
    if (_dailyBreakdown.isEmpty) {
      return const Text('No daily records available.');
    }

    return Card(
      elevation: 2,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.all(16.0),
            child: Text(
              'Daily Attendance Breakdown',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('Date')),
                DataColumn(label: Text('Expected Hours')),
                DataColumn(label: Text('Worked Hours')),
                DataColumn(label: Text('Status')),
                DataColumn(label: Text('In-Time')),
                DataColumn(label: Text('Out-Time')),
              ],
              rows: _dailyBreakdown.map((record) {
                Color statusColor;
                switch (record.status) {
                  case 'present':
                    statusColor = Colors.green;
                    break;
                  case 'leave':
                    statusColor = Colors.red;
                    break;
                  case 'holiday':
                    statusColor = Colors.grey;
                    break;
                  default:
                    statusColor = Colors.black;
                }

                return DataRow(
                  cells: [
                    DataCell(Text(record.date)),
                    DataCell(Text(record.expectedHours.toStringAsFixed(1))),
                    DataCell(Text(record.workedHours.toStringAsFixed(1))),
                    DataCell(
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          record.status.toUpperCase(),
                          style: TextStyle(
                            color: statusColor,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                    DataCell(Text(record.inTime ?? '-')),
                    DataCell(Text(record.outTime ?? '-')),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

