
import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User as UserIcon,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts';
import { format } from "date-fns";


export default function StudentPortalPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      // Find student profile by email
      const students = await Student.list();
      const profile = students.find(s => s.email === user.email);
      
      if (profile) {
        setStudentProfile(profile);
        generateProgressData(profile);
      }
    } catch (error) {
      console.error("Error loading student data:", error);
    }
    setIsLoading(false);
  };

  const generateProgressData = (profile) => {
    // Generate sample progress data over the semester
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    const currentGPA = profile.current_gpa || 3.0;
    const predictedGPA = profile.predicted_gpa || currentGPA;
    
    const data = months.map((month, index) => {
      const progress = index / (months.length - 1);
      const gpa = currentGPA + (predictedGPA - currentGPA) * progress * 0.8 + (Math.random() - 0.5) * 0.2;
      
      return {
        month,
        gpa: Math.max(0, Math.min(4, Number(gpa.toFixed(2)))),
        attendance: Math.max(60, Math.min(100, (profile.attendance_percentage || 80) + (Math.random() - 0.5) * 10)),
        target: predictedGPA
      };
    });
    
    setProgressData(data);
  };

  const getPerformanceStatus = () => {
    if (!studentProfile) return null;
    
    const gpa = studentProfile.current_gpa || 0;
    const attendance = studentProfile.attendance_percentage || 0;
    
    if (gpa >= 3.5 && attendance >= 90) return { label: 'Excellent', color: 'text-green-600', icon: Star };
    if (gpa >= 3.0 && attendance >= 80) return { label: 'Good', color: 'text-blue-600', icon: CheckCircle };
    if (gpa >= 2.5 || attendance >= 70) return { label: 'Needs Improvement', color: 'text-yellow-600', icon: Clock };
    return { label: 'At Risk', color: 'text-red-600', icon: AlertTriangle };
  };

  const getGPATrend = () => {
    if (!studentProfile?.current_gpa || !studentProfile?.predicted_gpa) return null;
    const diff = studentProfile.predicted_gpa - studentProfile.current_gpa;
    return {
      value: diff,
      isPositive: diff > 0,
      percentage: Math.abs((diff / studentProfile.current_gpa) * 100).toFixed(1)
    };
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return (
      <div className="p-6 space-y-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Profile Not Found</h2>
            <p className="text-gray-600 mb-6">
              Your email ({currentUser?.email}) is not linked to a student profile in our system.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your academic advisor to get your profile set up.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const performanceStatus = getPerformanceStatus();
  const gpaTrend = getGPATrend();
  const StatusIcon = performanceStatus?.icon;

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {studentProfile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {studentProfile.full_name.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                {studentProfile.major} • {studentProfile.year_level}
                {performanceStatus && (
                  <>
                    <span>•</span>
                    <StatusIcon className={`w-4 h-4 ${performanceStatus.color}`} />
                    <span className={performanceStatus.color}>{performanceStatus.label}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Current GPA</p>
                  <p className="text-3xl font-bold">{studentProfile.current_gpa?.toFixed(2) || 'N/A'}</p>
                  {gpaTrend && (
                    <div className="flex items-center gap-1 mt-1">
                      {gpaTrend.isPositive ? (
                        <TrendingUp className="w-4 h-4 text-green-300" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-300" />
                      )}
                      <span className="text-xs text-blue-100">
                        {gpaTrend.isPositive ? '+' : ''}{gpaTrend.value.toFixed(2)} predicted
                      </span>
                    </div>
                  )}
                </div>
                <Award className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Attendance</p>
                  <p className="text-3xl font-bold">{studentProfile.attendance_percentage || 'N/A'}%</p>
                  <p className="text-xs text-green-100 mt-1">
                    {(studentProfile.attendance_percentage || 0) >= 90 ? 'Excellent!' : 
                     (studentProfile.attendance_percentage || 0) >= 80 ? 'Good' : 'Needs improvement'}
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
                  <p className="text-purple-100 text-sm font-medium">Risk Level</p>
                  <p className="text-2xl font-bold">{studentProfile.risk_level || 'Unknown'}</p>
                  <p className="text-xs text-purple-100 mt-1">
                    {studentProfile.confidence_score ? `${studentProfile.confidence_score}% confidence` : 'Assessment pending'}
                  </p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Assessment Avg</p>
                  <p className="text-3xl font-bold">{studentProfile.internal_assessment_avg || 'N/A'}</p>
                  <p className="text-xs text-orange-100 mt-1">
                    Internal assessments
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Chart */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Your Academic Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
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
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                      name="Your GPA"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Target GPA"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Attendance Progress */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900">Attendance Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {studentProfile.attendance_percentage || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Current attendance</p>
                </div>
                <Progress 
                  value={studentProfile.attendance_percentage || 0} 
                  className="h-3 mb-4"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Goal: 85%</span>
                  <span>{Math.max(0, 85 - (studentProfile.attendance_percentage || 0))}% to go</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  View Detailed Report
                </Button>
                <Button variant="outline" className="w-full">
                  Schedule Study Session
                </Button>
                <Button variant="outline" className="w-full">
                  Contact Academic Advisor
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Recommendations */}
        {studentProfile.recommendations && studentProfile.recommendations.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Target className="w-5 h-5 text-purple-500" />
                Personalized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentProfile.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm text-blue-900 font-medium mb-1">
                          Recommendation #{index + 1}
                        </p>
                        <p className="text-sm text-blue-800">
                          {recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-gray-900">Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Strongest Area</span>
                <Badge className="bg-green-100 text-green-800">
                  {(studentProfile.attendance_percentage || 0) > (studentProfile.internal_assessment_avg || 0) 
                    ? 'Attendance' : 'Assessments'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Improvement Area</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {(studentProfile.attendance_percentage || 0) < (studentProfile.internal_assessment_avg || 0) 
                    ? 'Attendance' : 'Study Habits'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Predicted Outcome</span>
                <Badge className={
                  studentProfile.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                  studentProfile.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }>
                  {studentProfile.risk_level === 'Low' ? 'On Track' :
                   studentProfile.risk_level === 'Medium' ? 'Monitor Closely' :
                   'Needs Support'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-gray-900">Study Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Schedule feature coming soon!</p>
                  <p className="text-xs">Plan your study sessions and track your progress.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
