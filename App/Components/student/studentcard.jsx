import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle,
  Brain,
  Edit,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function StudentCard({ student, onEdit, onPredict, isPredicting }) {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGPATrend = () => {
    if (!student.current_gpa || !student.predicted_gpa) return null;
    const diff = student.predicted_gpa - student.current_gpa;
    return {
      value: diff,
      color: diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600',
      icon: diff > 0 ? '↗️' : diff < 0 ? '↘️' : '➡️'
    };
  };

  const trend = getGPATrend();

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
              {student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {student.full_name}
              </CardTitle>
              <p className="text-sm text-gray-600">{student.student_id}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(student)}
            className="hover:bg-gray-100"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{student.major} • {student.year_level}</span>
          </div>
        </div>

        {/* Academic Metrics */}
        <div className="grid grid-cols-2 gap-4 py-3 bg-gray-50 rounded-lg px-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Current GPA</p>
            <p className="text-lg font-bold text-gray-900">
              {student.current_gpa?.toFixed(2) || 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Attendance</p>
            <p className="text-lg font-bold text-gray-900">
              {student.attendance_percentage ? `${student.attendance_percentage}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Prediction Results */}
        {student.predicted_gpa ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Predicted GPA</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    {student.predicted_gpa.toFixed(2)}
                  </span>
                  {trend && (
                    <span className={`text-sm font-medium ${trend.color}`}>
                      {trend.icon} {Math.abs(trend.value).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              {student.risk_level && (
                <Badge className={getRiskColor(student.risk_level)}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {student.risk_level}
                </Badge>
              )}
            </div>

            {student.confidence_score && (
              <div>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                  <span>Confidence</span>
                  <span>{student.confidence_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${student.confidence_score}%` }}
                  ></div>
                </div>
              </div>
            )}

            {student.last_prediction_date && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  Updated {format(new Date(student.last_prediction_date), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => onPredict(student)}
            disabled={isPredicting}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Brain className="w-4 h-4 mr-2" />
            {isPredicting ? 'Generating...' : 'Generate AI Prediction'}
          </Button>
        )}

        {/* Recommendations Preview */}
        {student.recommendations && student.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-800 mb-1">Top Recommendation</p>
            <p className="text-sm text-blue-700">
              {student.recommendations[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}