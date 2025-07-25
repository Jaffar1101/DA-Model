
import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { AcademicRecord } from "@/entities/AcademicRecord";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Award,
  BookOpen,
  BarChart3,
  Filter
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, parseISO } from "date-fns";

export default function PerformancePage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('semester');
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      generatePerformanceData();
    }
  }, [students, selectedStudent, selectedTimeframe]);

  const loadPerformanceData = async () => {
    setIsLoading(true);
    try {
      const studentsData = await Student.list('-created_date');
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading performance data:", error);
    }
    setIsLoading(false);
  };

  const generatePerformanceData = () => {
    const filteredStudents = selectedStudent === 'all' 
      ? students 
      : students.filter(s => s.id === selectedStudent);

    // Generate sample performance data over time
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const data = months.map((month, index) => {
      const avgGPA = filteredStudents.reduce((sum, student) => {
        const baseGPA = student.current_gpa || 3.0;
        const variation = (Math.random() - 0.5) * 0.4;
        return sum + Math.max(0, Math.min(4, baseGPA + variation));
      }, 0) / filteredStudents.length;

      const avgAttendance = filteredStudents.reduce((sum, student) => {
        const baseAttendance = student.attendance_percentage || 80;
        const variation = (Math.random() - 0.5) * 10;
        return sum + Math.max(0, Math.min(100, baseAttendance + variation));
      }, 0) / filteredStudents.length;

      return {
        month,
        gpa: Number(avgGPA.toFixed(2)),
        attendance: Number(avgAttendance.toFixed(1)),
        assessment: Number((75 + Math.random() * 20).toFixed(1))
      };
    });

    setPerformanceData(data);
  };

  const getOverallStats = () => {
    const filteredStudents = selectedStudent === 'all' 
      ? students 
      : students.filter(s => s.id === selectedStudent);

    const avgCurrentGPA = filteredStudents.reduce((sum, s) => sum + (s.current_gpa || 0), 0) / filteredStudents.length || 0;
    const avgPredictedGPA = filteredStudents.reduce((sum, s) => sum + (s.predicted_gpa || 0), 0) / filteredStudents.length || 0;
    const avgAttendance = filteredStudents.reduce((sum, s) => sum + (s.attendance_percentage || 0), 0) / filteredStudents.length || 0;
    const improvingCount = filteredStudents.filter(s => (s.predicted_gpa || 0) > (s.current_gpa || 0)).length;

    return {
      currentGPA: avgCurrentGPA.toFixed(2),
      predictedGPA: avgPredictedGPA.toFixed(2),
      attendance: avgAttendance.toFixed(1),
      improving: improvingCount,
      total: filteredStudents.length
    };
  };

  const stats = getOverallStats();
  const gpaTrend = parseFloat(stats.predictedGPA) - parseFloat(stats.currentGPA);

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Performance Tracking
            </h1>
            <p className="text-gray-600">
              Monitor academic progress and identify performance trends over time
            </p>
          </div>
          
          <div className="flex gap-3">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semester">Semester</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current GPA</p>
                  <p className="text-3xl font-bold">{stats.currentGPA}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {gpaTrend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-300" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300" />
                    )}
                    <span className="text-sm text-blue-100">
                      {gpaTrend > 0 ? '+' : ''}{gpaTrend.toFixed(2)} predicted
                    </span>
                  </div>
                </div>
                <Award className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Avg Attendance</p>
                  <p className="text-3xl font-bold">{stats.attendance}%</p>
                  <p className="text-sm text-green-100 mt-2">
                    {stats.attendance > 85 ? 'Excellent' : stats.attendance > 75 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Improving</p>
                  <p className="text-3xl font-bold">{stats.improving}</p>
                  <p className="text-sm text-purple-100 mt-2">
                    of {stats.total} students
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Target GPA</p>
                  <p className="text-3xl font-bold">{stats.predictedGPA}</p>
                  <p className="text-sm text-orange-100 mt-2">
                    AI predicted average
                  </p>
                </div>
                <Target className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                GPA Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis domain={[0, 4]} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gpa" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-green-500" />
                Attendance Pattern
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis domain={[0, 100]} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="attendance" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Performance Analysis */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Individual Student Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(selectedStudent === 'all' ? students.slice(0, 8) : students.filter(s => s.id === selectedStudent)).map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.full_name}</p>
                          <p className="text-sm text-gray-600">{student.major} • {student.year_level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Current GPA</p>
                          <p className="font-bold text-gray-900">{student.current_gpa?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Predicted</p>
                          <p className="font-bold text-gray-900">{student.predicted_gpa?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Attendance</p>
                          <p className="font-bold text-gray-900">{student.attendance_percentage || 'N/A'}%</p>
                        </div>
                        <div>
                          {student.predicted_gpa && student.current_gpa && (
                            <Badge className={
                              student.predicted_gpa > student.current_gpa 
                                ? 'bg-green-100 text-green-800'
                                : student.predicted_gpa < student.current_gpa
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }>
                              {student.predicted_gpa > student.current_gpa ? '↗️ Improving' : 
                               student.predicted_gpa < student.current_gpa ? '↘️ Declining' : '➡️ Stable'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900">Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students Tracked</span>
                  <span className="font-bold text-gray-900">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Above 3.5 GPA</span>
                  <span className="font-bold text-green-600">
                    {selectedStudent === 'all' 
                      ? students.filter(s => (s.current_gpa || 0) > 3.5).length
                      : students.filter(s => s.id === selectedStudent && (s.current_gpa || 0) > 3.5).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Perfect Attendance</span>
                  <span className="font-bold text-blue-600">
                    {selectedStudent === 'all'
                      ? students.filter(s => (s.attendance_percentage || 0) >= 95).length
                      : students.filter(s => s.id === selectedStudent && (s.attendance_percentage || 0) >= 95).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Need Support</span>
                  <span className="font-bold text-red-600">
                    {selectedStudent === 'all'
                      ? students.filter(s => s.risk_level === 'High').length
                      : students.filter(s => s.id === selectedStudent && s.risk_level === 'High').length
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Generate Performance Report
                </Button>
                <Button variant="outline" className="w-full">
                  Export Data
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Review Meeting
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
