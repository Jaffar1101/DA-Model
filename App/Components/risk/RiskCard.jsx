import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  User, 
  TrendingDown,
  Calendar,
  Target,
  Clock,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

export default function RiskCard({ student, interventions, onCreateIntervention }) {
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (risk) => {
    return risk === 'High' ? '🚨' : risk === 'Medium' ? '⚠️' : '✅';
  };

  const activeInterventions = interventions.filter(i => i.status === 'In Progress');
  const hasActiveIntervention = activeInterventions.length > 0;

  const getGradeStatus = () => {
    if (!student.current_gpa) return null;
    if (student.current_gpa >= 3.5) return { label: 'Excellent', color: 'text-green-600' };
    if (student.current_gpa >= 3.0) return { label: 'Good', color: 'text-blue-600' };
    if (student.current_gpa >= 2.5) return { label: 'Average', color: 'text-yellow-600' };
    return { label: 'Below Average', color: 'text-red-600' };
  };

  const gradeStatus = getGradeStatus();

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-l-4 ${
      student.risk_level === 'High' ? 'border-l-red-500 bg-red-50/30' :
      student.risk_level === 'Medium' ? 'border-l-yellow-500 bg-yellow-50/30' :
      'border-l-green-500 bg-green-50/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
              student.risk_level === 'High' ? 'bg-red-500' :
              student.risk_level === 'Medium' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}>
              {student.full_name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                {student.full_name}
              </CardTitle>
              <p className="text-sm text-gray-600">{student.student_id}</p>
              <p className="text-xs text-gray-500">{student.major} • {student.year_level}</p>
            </div>
          </div>
          
          <Badge className={getRiskColor(student.risk_level)}>
            {getRiskIcon(student.risk_level)} {student.risk_level || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Academic Metrics */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Current GPA</p>
            <div className="flex flex-col items-center">
              <p className="text-lg font-bold text-gray-900">
                {student.current_gpa?.toFixed(2) || 'N/A'}
              </p>
              {gradeStatus && (
                <span className={`text-xs font-medium ${gradeStatus.color}`}>
                  {gradeStatus.label}
                </span>
              )}
            </div>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Attendance</p>
            <p className={`text-lg font-bold ${
              (student.attendance_percentage || 0) >= 85 ? 'text-green-600' :
              (student.attendance_percentage || 0) >= 75 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {student.attendance_percentage || 'N/A'}%
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">Risk Factors:</h4>
          <div className="space-y-1">
            {(student.attendance_percentage || 0) < 75 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <Calendar className="w-3 h-3" />
                <span>Poor attendance ({student.attendance_percentage}%)</span>
              </div>
            )}
            {(student.current_gpa || 0) < 2.5 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <TrendingDown className="w-3 h-3" />
                <span>Low GPA ({student.current_gpa?.toFixed(2)})</span>
              </div>
            )}
            {student.predicted_gpa && student.current_gpa && student.predicted_gpa < student.current_gpa && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <TrendingDown className="w-3 h-3" />
                <span>Declining performance trend</span>
              </div>
            )}
            {(student.internal_assessment_avg || 0) < 70 && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <BookOpen className="w-3 h-3" />
                <span>Low assessment scores</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Preview */}
        {student.recommendations && student.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 text-sm mb-2">AI Recommendations:</h4>
            <p className="text-sm text-blue-800">
              {student.recommendations[0]}
            </p>
            {student.recommendations.length > 1 && (
              <p className="text-xs text-blue-600 mt-1">
                +{student.recommendations.length - 1} more recommendations
              </p>
            )}
          </div>
        )}

        {/* Active Interventions */}
        {hasActiveIntervention && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-900 text-sm">Active Support:</h4>
            </div>
            {activeInterventions.slice(0, 2).map((intervention) => (
              <div key={intervention.id} className="text-sm text-green-800">
                {intervention.intervention_type.replace(/_/g, ' ')}
              </div>
            ))}
            {activeInterventions.length > 2 && (
              <p className="text-xs text-green-600 mt-1">
                +{activeInterventions.length - 2} more interventions
              </p>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={() => onCreateIntervention(student)}
          className={`w-full ${
            student.risk_level === 'High' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          disabled={hasActiveIntervention}
        >
          <Target className="w-4 h-4 mr-2" />
          {hasActiveIntervention ? 'Support Active' : 'Create Intervention'}
        </Button>

        {/* Confidence Score */}
        {student.confidence_score && (
          <div className="text-center">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>AI Confidence</span>
              <span>{student.confidence_score}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300" 
                style={{ width: `${student.confidence_score}%` }}
              ></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}