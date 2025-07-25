import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2 } from "lucide-react";
import { InvokeLLM } from "@/integrations/Core";
import { Student } from "@/entities/Student";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

export default function BulkPrediction({ students, onComplete }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [showDialog, setShowDialog] = useState(false);

  const processBulkPredictions = async () => {
    if (students.length === 0) return;
    
    setIsProcessing(true);
    setProgress({ current: 0, total: students.length });

    try {
      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        setProgress({ current: i + 1, total: students.length });

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

          await Student.update(student.id, {
            ...student,
            predicted_gpa: response.predicted_gpa,
            risk_level: response.risk_level,
            confidence_score: response.confidence_score,
            recommendations: response.recommendations,
            last_prediction_date: new Date().toISOString().split('T')[0]
          });

        } catch (error) {
          console.error(`Error processing student ${student.full_name}:`, error);
        }
      }

      setShowDialog(false);
      onComplete();
    } catch (error) {
      console.error("Error in bulk prediction:", error);
    }

    setIsProcessing(false);
    setProgress({ current: 0, total: 0 });
  };

  if (students.length === 0) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
          <Brain className="w-4 h-4 mr-2" />
          Bulk Predictions
          <Badge variant="secondary" className="ml-2">
            {students.length}
          </Badge>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Bulk AI Predictions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Generate AI predictions for <strong>{students.length} students</strong> who don't have predictions yet.
          </p>

          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing predictions...</span>
              </div>
              
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                {progress.current} of {progress.total} completed
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={processBulkPredictions}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Start Predictions
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}