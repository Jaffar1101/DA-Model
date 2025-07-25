
import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { Intervention } from "@/entities/Intervention";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Shield, 
  Target,
  Clock,
  Users,
  TrendingDown,
  Plus,
  Search,
  Filter,
  UserX,
  AlertCircle
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// import RiskCard from "../Components/risk/RiskCard.jsx";
import InterventionForm from "../components/risk/InterventionForm";

export default function RiskAssessmentPage() {
  const [students, setStudents] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [showInterventionDialog, setShowInterventionDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    loadRiskData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedRisk]);

  const loadRiskData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, interventionsData] = await Promise.all([
        Student.list('-created_date'),
        Intervention.list('-created_date')
      ]);
      setStudents(studentsData);
      setInterventions(interventionsData);
    } catch (error) {
      console.error("Error loading risk assessment data:", error);
    }
    setIsLoading(false);
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRisk !== "all") {
      filtered = filtered.filter(student => student.risk_level === selectedRisk);
    }

    // Sort by risk level priority (High > Medium > Low)
    filtered.sort((a, b) => {
      const riskOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return (riskOrder[b.risk_level] || 0) - (riskOrder[a.risk_level] || 0);
    });

    setFilteredStudents(filtered);
  };

  const getRiskStats = () => {
    const total = students.length;
    const high = students.filter(s => s.risk_level === 'High').length;
    const medium = students.filter(s => s.risk_level === 'Medium').length;
    const low = students.filter(s => s.risk_level === 'Low').length;
    const withInterventions = students.filter(s => 
      interventions.some(i => i.student_id === s.student_id && i.status === 'In Progress')
    ).length;

    return { total, high, medium, low, withInterventions };
  };

  const getRiskDistribution = () => {
    const stats = getRiskStats();
    return [
      { name: 'High Risk', value: stats.high, color: '#ef4444' },
      { name: 'Medium Risk', value: stats.medium, color: '#f59e0b' },
      { name: 'Low Risk', value: stats.low, color: '#10b981' }
    ];
  };

  const getInterventionData = () => {
    const types = interventions.reduce((acc, intervention) => {
      acc[intervention.intervention_type] = (acc[intervention.intervention_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(types).map(([type, count]) => ({
      type: type.replace(/_/g, ' '),
      count
    }));
  };

  const handleCreateIntervention = async (interventionData) => {
    try {
      await Intervention.create({
        ...interventionData,
        student_id: selectedStudent.student_id,
        assigned_by: "Current User", // Replace with actual user
        status: "Pending",
        start_date: new Date().toISOString().split('T')[0]
      });
      
      setShowInterventionDialog(false);
      setSelectedStudent(null);
      loadRiskData();
    } catch (error) {
      console.error("Error creating intervention:", error);
    }
  };

  const stats = getRiskStats();
  const riskDistribution = getRiskDistribution();
  const interventionData = getInterventionData();

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Risk Assessment & Early Warning
            </h1>
            <p className="text-gray-600">
              Identify at-risk students and implement timely interventions
            </p>
          </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">High Risk</p>
                  <p className="text-3xl font-bold">{stats.high}</p>
                  <p className="text-xs text-red-100 mt-1">
                    {((stats.high / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Medium Risk</p>
                  <p className="text-3xl font-bold">{stats.medium}</p>
                  <p className="text-xs text-yellow-100 mt-1">
                    {((stats.medium / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Low Risk</p>
                  <p className="text-3xl font-bold">{stats.low}</p>
                  <p className="text-xs text-green-100 mt-1">
                    {((stats.low / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </div>
                <Shield className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">With Support</p>
                  <p className="text-3xl font-bold">{stats.withInterventions}</p>
                  <p className="text-xs text-blue-100 mt-1">
                    Active interventions
                  </p>
                </div>
                <Target className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                  <p className="text-xs text-purple-100 mt-1">
                    Being monitored
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Risk Level Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Target className="w-5 h-5 text-blue-500" />
                Intervention Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={interventionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="type" 
                    stroke="#64748b"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name, ID, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedRisk} onValueChange={setSelectedRisk}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk Levels</SelectItem>
              <SelectItem value="High">High Risk Only</SelectItem>
              <SelectItem value="Medium">Medium Risk Only</SelectItem>
              <SelectItem value="Low">Low Risk Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Students At Risk */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <UserX className="w-5 h-5 text-red-500" />
              Students Requiring Attention ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map((student) => (
                  <RiskCard
                    key={student.id}
                    student={student}
                    interventions={interventions.filter(i => i.student_id === student.student_id)}
                    onCreateIntervention={(student) => {
                      setSelectedStudent(student);
                      setShowInterventionDialog(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchTerm || selectedRisk !== 'all' ? 'No students match your filters' : 'All students are doing well!'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || selectedRisk !== 'all' 
                    ? 'Try adjusting your search criteria' 
                    : 'No students currently require immediate attention'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Intervention Dialog */}
        <Dialog open={showInterventionDialog} onOpenChange={setShowInterventionDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Create Intervention for {selectedStudent?.full_name}
              </DialogTitle>
            </DialogHeader>
            
            {selectedStudent && (
              <InterventionForm
                student={selectedStudent}
                onSave={handleCreateIntervention}
                onCancel={() => {
                  setShowInterventionDialog(false);
                  setSelectedStudent(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
