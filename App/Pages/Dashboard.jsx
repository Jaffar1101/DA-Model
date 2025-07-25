import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { AcademicRecord } from "@/entities/AcademicRecord";
import { Intervention } from "@/entities/Intervention";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Target,
  Clock,
  Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

import MetricCard from "../components/dashboard/MetricCard";
import RiskDistribution from "../components/dashboard/RiskDistribution";
import PerformanceTrends from "../components/dashboard/PerformanceTrends";
import RecentPredictions from "../components/dashboard/RecentPredictions";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    avgPredictedGPA: 0,
    highRiskCount: 0,
    interventionCount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, interventionsData] = await Promise.all([
        Student.list('-created_date'),
        Intervention.list('-created_date', 10)
      ]);
      
      setStudents(studentsData);
      setInterventions(interventionsData);
      
      // Calculate statistics
      const totalStudents = studentsData.length;
      const avgPredictedGPA = studentsData.reduce((sum, s) => sum + (s.predicted_gpa || 0), 0) / totalStudents || 0;
      const highRiskCount = studentsData.filter(s => s.risk_level === 'High').length;
      const activeInterventions = interventionsData.filter(i => i.status === 'In Progress').length;
      
      setStats({
        totalStudents,
        avgPredictedGPA: avgPredictedGPA.toFixed(2),
        highRiskCount,
        interventionCount: activeInterventions
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const getRiskData = () => {
    const riskCounts = students.reduce((acc, student) => {
      const risk = student.risk_level || 'Unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(riskCounts).map(([risk, count]) => ({
      name: risk,
      value: count,
      color: risk === 'High' ? '#ef4444' : risk === 'Medium' ? '#f59e0b' : '#10b981'
    }));
  };

  const getPerformanceData = () => {
    return students.map(student => ({
      name: student.full_name.split(' ')[0],
      current: student.current_gpa || 0,
      predicted: student.predicted_gpa || 0,
      attendance: student.attendance_percentage || 0
    })).slice(0, 10);
  };

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Academic Performance Analytics
          </h1>
          <p className="text-gray-600">
            AI-powered insights into student academic performance and risk assessment
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="blue"
            trend="+12% this semester"
            isLoading={isLoading}
          />
          <MetricCard
            title="Avg Predicted GPA"
            value={stats.avgPredictedGPA}
            icon={TrendingUp}
            color="green"
            trend="↑ 0.2 from last semester"
            isLoading={isLoading}
          />
          <MetricCard
            title="High Risk Students"
            value={stats.highRiskCount}
            icon={AlertTriangle}
            color="red"
            trend={`${Math.round((stats.highRiskCount / stats.totalStudents) * 100)}% of total`}
            isLoading={isLoading}
          />
          <MetricCard
            title="Active Interventions"
            value={stats.interventionCount}
            icon={Target}
            color="purple"
            trend="85% success rate"
            isLoading={isLoading}
          />
        </div>

        {/* Charts and Analytics */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <PerformanceTrends 
              data={getPerformanceData()}
              isLoading={isLoading}
            />
          </div>
          <RiskDistribution 
            data={getRiskData()}
            isLoading={isLoading}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RecentPredictions 
            students={students.slice(0, 8)}
            isLoading={isLoading}
          />
          
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Clock className="w-5 h-5 text-blue-500" />
                Recent Interventions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))
                ) : (
                  interventions.slice(0, 5).map((intervention) => (
                    <div key={intervention.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">
                          {intervention.intervention_type}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {intervention.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Assigned by {intervention.assigned_by}
                        </p>
                      </div>
                      <Badge
                        variant={intervention.status === 'Completed' ? 'default' : 'secondary'}
                        className={
                          intervention.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : intervention.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {intervention.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}