import React, { useState, useEffect } from "react";
import { Student } from "@/entities/Student";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  Filter, 
  Brain, 
  TrendingUp,
  AlertTriangle,
  Users,
  BookOpen
} from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import StudentForm from "../components/students/StudentForm";
import StudentCard from "../components/students/StudentCard";
import BulkPrediction from "../components/students/BulkPrediction";
import FilterPanel from "../components/students/FilterPanel";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    yearLevel: 'all',
    gpaRange: 'all'
  });
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, filters]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await Student.list('-created_date');
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
    }
    setIsLoading(false);
  };

  const filterStudents = () => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.major.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Risk level filter
    if (filters.riskLevel !== 'all') {
      filtered = filtered.filter(student => student.risk_level === filters.riskLevel);
    }

    // Year level filter
    if (filters.yearLevel !== 'all') {
      filtered = filtered.filter(student => student.year_level === filters.yearLevel);
    }

    // GPA range filter
    if (filters.gpaRange !== 'all') {
      const [min, max] = filters.gpaRange.split('-').map(Number);
      filtered = filtered.filter(student => {
        const gpa = student.current_gpa || 0;
        return gpa >= min && gpa <= max;
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSaveStudent = async (studentData) => {
    try {
      if (selectedStudent) {
        await Student.update(selectedStudent.id, studentData);
      } else {
        await Student.create(studentData);
      }
      setShowAddDialog(false);
      setSelectedStudent(null);
      loadStudents();
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  const generatePrediction = async (student) => {
    setIsPredicting(true);
    try {
      const response = await InvokeLLM({
        prompt: `Analyze this student's academic data and predict their performance:
        
        Student Profile:
        - Current GPA: ${student.current_gpa || 'N/A'}
        - Previous Semester GPA: ${student.previous_semester_gpa || 'N/A'}
        - Attendance: ${student.attendance_percentage || 'N/A'}%
        - Internal Assessment Average: ${student.internal_assessment_avg || 'N/A'}
        - Extracurricular Participation: ${student.extracurricular_participation || 'None'}
        - Socioeconomic Status: ${student.socioeconomic_status || 'Not Disclosed'}
        - Year Level: ${student.year_level}
        - Major: ${student.major}
        
        Please predict:
        1. Next semester GPA (0-4 scale)
        2. Risk level (High/Medium/Low)
        3. Confidence score (0-100%)
        4. 3-5 specific recommendations for improvement
        
        Consider factors like GPA trends, attendance patterns, and engagement levels.`,
        response_json_schema: {
          type: "object",
          properties: {
            predicted_gpa: { type: "number", minimum: 0, maximum: 4 },
            risk_level: { type: "string", enum: ["Low", "Medium", "High"] },
            confidence_score: { type: "number", minimum: 0, maximum: 100 },
            recommendations: { 
              type: "array", 
              items: { type: "string" },
              minItems: 3,
              maxItems: 5
            }
          }
        }
      });

      // Update student with predictions
      await Student.update(student.id, {
        ...student,
        predicted_gpa: response.predicted_gpa,
        risk_level: response.risk_level,
        confidence_score: response.confidence_score,
        recommendations: response.recommendations,
        last_prediction_date: new Date().toISOString().split('T')[0]
      });

      loadStudents();
    } catch (error) {
      console.error("Error generating prediction:", error);
    }
    setIsPredicting(false);
  };

  const stats = {
    total: students.length,
    highRisk: students.filter(s => s.risk_level === 'High').length,
    avgGPA: students.reduce((sum, s) => sum + (s.current_gpa || 0), 0) / students.length || 0
  };

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Management
            </h1>
            <p className="text-gray-600">
              Manage student profiles and generate AI-powered performance predictions
            </p>
          </div>
          
          <div className="flex gap-3">
            <BulkPrediction 
              students={students.filter(s => !s.predicted_gpa)}
              onComplete={loadStudents}
            />
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedStudent ? 'Edit Student' : 'Add New Student'}
                  </DialogTitle>
                </DialogHeader>
                <StudentForm
                  student={selectedStudent}
                  onSave={handleSaveStudent}
                  onCancel={() => {
                    setShowAddDialog(false);
                    setSelectedStudent(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Students</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">High Risk</p>
                  <p className="text-3xl font-bold">{stats.highRisk}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Average GPA</p>
                  <p className="text-3xl font-bold">{stats.avgGPA.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students by name, email, ID, or major..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {showFilters && (
          <FilterPanel 
            filters={filters}
            onFiltersChange={setFilters}
          />
        )}

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onEdit={(student) => {
                  setSelectedStudent(student);
                  setShowAddDialog(true);
                }}
                onPredict={generatePrediction}
                isPredicting={isPredicting}
              />
            ))
          )}
        </div>

        {filteredStudents.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No students found</h3>
            <p className="text-gray-500">
              {searchTerm || filters.riskLevel !== 'all' || filters.yearLevel !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Add your first student to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}