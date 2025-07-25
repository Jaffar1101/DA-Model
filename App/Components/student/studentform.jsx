import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"];
const EXTRACURRICULAR_LEVELS = ["High", "Medium", "Low", "None"];
const SOCIOECONOMIC_LEVELS = ["High", "Medium", "Low", "Not Disclosed"];

export default function StudentForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState(student || {
    student_id: '',
    full_name: '',
    email: '',
    year_level: '',
    major: '',
    current_gpa: '',
    previous_semester_gpa: '',
    attendance_percentage: '',
    internal_assessment_avg: '',
    extracurricular_participation: 'None',
    socioeconomic_status: 'Not Disclosed'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string numbers to actual numbers
    const processedData = {
      ...formData,
      current_gpa: formData.current_gpa ? parseFloat(formData.current_gpa) : undefined,
      previous_semester_gpa: formData.previous_semester_gpa ? parseFloat(formData.previous_semester_gpa) : undefined,
      attendance_percentage: formData.attendance_percentage ? parseFloat(formData.attendance_percentage) : undefined,
      internal_assessment_avg: formData.internal_assessment_avg ? parseFloat(formData.internal_assessment_avg) : undefined
    };

    onSave(processedData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="STU-2024-001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.doe@university.edu"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_level">Year Level *</Label>
                <Select
                  value={formData.year_level}
                  onValueChange={(value) => handleChange('year_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEAR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="major">Major *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleChange('major', e.target.value)}
                  placeholder="Computer Science"
                  required
                />
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Academic Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_gpa">Current GPA (0-4)</Label>
                <Input
                  id="current_gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.current_gpa}
                  onChange={(e) => handleChange('current_gpa', e.target.value)}
                  placeholder="3.75"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previous_semester_gpa">Previous Semester GPA (0-4)</Label>
                <Input
                  id="previous_semester_gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.previous_semester_gpa}
                  onChange={(e) => handleChange('previous_semester_gpa', e.target.value)}
                  placeholder="3.60"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance_percentage">Attendance Percentage (0-100)</Label>
                <Input
                  id="attendance_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance_percentage}
                  onChange={(e) => handleChange('attendance_percentage', e.target.value)}
                  placeholder="85"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internal_assessment_avg">Internal Assessment Average (0-100)</Label>
                <Input
                  id="internal_assessment_avg"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.internal_assessment_avg}
                  onChange={(e) => handleChange('internal_assessment_avg', e.target.value)}
                  placeholder="88"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="extracurricular">Extracurricular Participation</Label>
                <Select
                  value={formData.extracurricular_participation}
                  onValueChange={(value) => handleChange('extracurricular_participation', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXTRACURRICULAR_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="socioeconomic">Socioeconomic Status</Label>
                <Select
                  value={formData.socioeconomic_status}
                  onValueChange={(value) => handleChange('socioeconomic_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIOECONOMIC_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              {student ? 'Update Student' : 'Add Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}