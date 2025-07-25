import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecentPredictions({ students, isLoading }) {
  const getRiskBadgeProps = (risk) => {
    switch (risk) {
      case 'High':
        return { className: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' };
      case 'Medium':
        return { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚠️' };
      case 'Low':
        return { className: 'bg-green-100 text-green-800 border-green-200', icon: '✅' };
      default:
        return { className: 'bg-gray-100 text-gray-800 border-gray-200', icon: '❓' };
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Recent AI Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-start mb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Brain className="w-5 h-5 text-purple-500" />
          Recent AI Predictions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => {
            const riskProps = getRiskBadgeProps(student.risk_level);
            const trend = (student.predicted_gpa || 0) - (student.current_gpa || 0);
            
            return (
              <div key={student.id} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{student.full_name}</p>
                    <p className="text-sm text-gray-600">{student.major}</p>
                  </div>
                  <Badge {...riskProps}>
                    {riskProps.icon} {student.risk_level || 'Unknown'}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">
                      Current: <span className="font-medium">{student.current_gpa?.toFixed(2) || 'N/A'}</span>
                    </span>
                    <span className="text-gray-600">
                      Predicted: <span className="font-medium">{student.predicted_gpa?.toFixed(2) || 'N/A'}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {trend > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : trend < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                    <span className={`font-medium ${
                      trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend > 0 ? '+' : ''}{trend.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {student.confidence_score && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span>Confidence</span>
                      <span>{student.confidence_score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full" 
                        style={{ width: `${student.confidence_score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}