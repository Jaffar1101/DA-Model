import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const INTERVENTION_TYPES = [
  "Tutoring",
  "Counseling", 
  "Study Group",
  "Attendance Monitoring",
  "Academic Coaching",
  "Other"
];

export default function InterventionForm({ student, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    intervention_type: '',
    description: '',
    target_date: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Generate suggested interventions based on student risk factors
  const getSuggestedInterventions = () => {
    const suggestions = [];
    
    if ((student.attendance_percentage || 0) < 75) {
      suggestions.push({
        type: "Attendance Monitoring",
        description: "Weekly check-ins to improve attendance and identify barriers"
      });
    }
    
    if ((student.current_gpa || 0) < 2.5) {
      suggestions.push({
        type: "Tutoring",
        description: "One-on-one tutoring sessions for core subjects"
      });
    }
    
    if (student.risk_level === 'High') {
      suggestions.push({
        type: "Academic Coaching",
        description: "Comprehensive academic support and study skills development"
      });
    }

    return suggestions;
  };

  const suggestions = getSuggestedInterventions();

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
              <p className="text-sm text-gray-600">{student.major} • {student.year_level}</p>
              <p className="text-xs text-gray-500">GPA: {student.current_gpa?.toFixed(2)} | Attendance: {student.attendance_percentage}%</p>
            </div>
            <Badge className={
              student.risk_level === 'High' ? 'bg-red-100 text-red-800' :
              student.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }>
              {student.risk_level} Risk
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Interventions */}
      {suggestions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Suggested Interventions:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-blue-50 transition-colors border-blue-200"
                onClick={() => {
                  setFormData({
                    intervention_type: suggestion.type,
                    description: suggestion.description,
                    target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
                  });
                }}
              >
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-blue-900">{suggestion.type}</p>
                      <p className="text-sm text-blue-700 mt-1">{suggestion.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Use This
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Intervention Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="intervention_type">Intervention Type *</Label>
          <Select
            value={formData.intervention_type}
            onValueChange={(value) => handleChange('intervention_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select intervention type" />
            </SelectTrigger>
            <SelectContent>
              {INTERVENTION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the intervention plan, goals, and expected outcomes..."
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="target_date">Target Completion Date</Label>
          <Input
            id="target_date"
            type="date"
            value={formData.target_date}
            onChange={(e) => handleChange('target_date', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* AI Recommendations for this student */}
        {student.recommendations && student.recommendations.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">AI Recommendations for {student.full_name}:</h4>
            <ul className="space-y-1">
              {student.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!formData.intervention_type || !formData.description}
          >
            Create Intervention
          </Button>
        </div>
      </form>
    </div>
  );
}