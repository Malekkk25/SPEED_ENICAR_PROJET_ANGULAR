export enum Role{
    STUDENT ='STUDENT',
    PSYCHOLOGIST ='PSYCHOLOGIST',
    SCOLARITY='SCOLARITY',
    ADMIN='ADMIN',
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum AppointmentType {
  INITIAL = 'INITIAL',
  FOLLOW_UP = 'FOLLOW_UP',
  URGENT = 'URGENT',
}

export enum AlertLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum MoodLevel {
  VERY_BAD = 1,
  BAD = 2,
  NEUTRAL = 3,
  GOOD = 4,
  VERY_GOOD = 5,
}


export interface BaseEntity{
    id: number;
    createdAt:string;
    updatedAt:string;
    deleted?:boolean;
}


export interface User extends BaseEntity{
    email:string;
    firstName:string;
    lastName:string;
    phone?:string;
    avatarUrl?:string;
    role:Role;
    enabled:boolean;
    lastLogin?:string;
}

export interface PsychologistProfile extends BaseEntity {
  user: User;
  licenseNumber: string;
  specialization: string;
  officeLocation: string;
  availableSlots: TimeSlot[];
}

export interface StudentProfile extends BaseEntity {
  user: User;
  studentId: string;
  dateOfBirth: string;
  department: string;
  level: string;
  enrollmentYear: number;
}

export interface AuthResponse{
    accessToken:string;
    refreshToken:string;
    user:User;
}


export interface LoginRequest{
    email:string;
    password:string;
}

export interface Appointment extends BaseEntity{
    student:StudentProfile;
    psychologist:PsychologistProfile;
    dateTime:string;
    duration:number;
    status:AppointmentStatus;
    type:AppointmentType;
    reason:string;
    notes?:string;
}


export interface AppointmentRequest{
    studentId: number;
    psychologistId:number;
    datetime:string;
    duration :number;
    type:AppointmentType;
    reason:string;
}


export interface AppointmentFilter{
    status?: AppointmentStatus;
    type?: AppointmentType;
    dateFrom?: string;
    dateTo?: string;
    page?:number;
    size?:number;
}


export interface ConfidentialRecord extends BaseEntity{
    student:StudentProfile;
    psychologist:PsychologistProfile;
    sessionDate:string;
    sessionNumber:number;
    chiefComplaint:string;
    observations:string;
    interventions:string;
    plan:string;
    riskLevel:AlertLevel;
    followUpDate?:string;
    isEncrypted:boolean;
}

export interface CreateRecordRequest {
  studentId: number;
  sessionDate: string;
  chiefComplaint: string;
  observations: string;
  interventions: string;
  plan: string;
  riskLevel: AlertLevel;
  followUpDate?: string;
}

export interface UpdateRecordRequest {
  chiefComplaint?: string;
  observations?: string;
  interventions?: string;
  plan?: string;
  riskLevel?: AlertLevel;
  followUpDate?: string;
}

export interface StudentAlert extends BaseEntity{
    student:StudentProfile;
    level:AlertLevel;
    title:string;
    description:string;
    triggerReason:string;
    isResolved:boolean;
    resolvedAt?:string;
    resolvedBy?:User;
    resolvedNote?:string;
}


export interface TimeSlot{
    id?:number;
    dayOfWeek:number;
    startTime:string;
    endTime:string;
    isAvailable:boolean;
}

export interface MoodEntry extends BaseEntity {
  student: StudentProfile;
  moodLevel: number;
  emoji: string;
  note?: string;
  date: string;
  activities: string[];
}

export interface MoodStats {
  average: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  entries: MoodEntry[];
  weeklyAverages: { week: string; avg: number }[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string;
}


export interface Notification extends BaseEntity{
    title:string;
    message:string;
    type:string;
    isRead:boolean;
    relatedEntityId?:number;
}


export interface PsychologistDashboardStats {
  todayAppointments: number;
  pendingAppointments: number;
  activeStudents: number;
  unresolvedAlerts: number;
  criticalAlerts: number;
  weeklyCompletedSessions: number;
  monthlyStats: { month: string; sessions: number }[];
  recentAlerts: StudentAlert[];
  todaySchedule: Appointment[];
}
