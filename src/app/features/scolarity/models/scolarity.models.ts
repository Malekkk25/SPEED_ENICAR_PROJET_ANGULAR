export interface StudentDossier {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  level: string;
  enrollmentYear: number;
  prolongedAbsences: Absence[];
  grades: AcademicRecord[];
  unjustifiedAbsencesCount: number;
  averageGrade: number;
}



export interface Absence {
  id: number;
  studentId: number;
  studentName: string;
  startDate: string;
  endDate: string;
  reason: string;
  justified: boolean;
  durationDays: number;
  prolonged: boolean;
}

export interface AcademicRecord {
  id: number;
  subject: string;
  grade: number;
  maxGrade: number;
  percentage: number;
  semester: string;
  academicYear: string;
  passing: boolean;
  comments: string;
}

export interface AnalysisResult {
  studentId: number;
  studentName: string;
  studentEmail: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  averageGradePercent: number;
  unjustifiedAbsences: number;
  totalAbsenceDays: number;
  alerts: string[];
  recommendations: string[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}