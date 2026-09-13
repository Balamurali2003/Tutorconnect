import {
  Tutor,
  TutorDocument,
  TutorInterview,
  DemoClass,
  ParentApproval,
  Appointment,
  Student,
  Parent,
  ActivityLog,
  NotificationItem,
  DashboardMetrics,
  MatchRecommendation,
  SocialLead,
  LeadSourceStat,
  WhatsAppTemplate,
  WhatsAppHistoryItem,
  WhatsAppOptIn,
  BulkSendResponse,
  PriorityWeightsConfig,
  PriorityDashboardStats
,
  WhatsAppMessage,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppDashboardStats,
  WhatsAppSettingsConfig,
  WhatsAppWebhookLog,
  WhatsAppApiLog,
  TutorWhatsAppDetailResponse,
  TutorStudentAssignment,
  AssignmentMetrics,
  CreateAssignmentPayload,
  ValidateTutorsResponse,
  TutorImportResult,
  AuthUser,
  LoginPayload,
  LoginResponse,
  TutorDailyUpdate,
  TutorDashboardMetrics,
  AdminDailyUpdatesMetrics
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

let authToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}


export async function fetchStats(): Promise<{
  metrics: DashboardMetrics;
  pipeline: { stage: string; count: number; color: string }[];
  statusDistribution: { name: string; count: number }[];
  monthlyRegistrations: { month: string; count: number }[];
  subjectRequirements: { subject: string; count: number }[];
  locationDistribution: { location: string; count: number }[];
  leadSourceStats?: LeadSourceStat[];
}> {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchTutors(params?: Record<string, string>): Promise<{ tutors: Tutor[]; total: number }> {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tutors?${query}`);
  if (!res.ok) throw new Error('Failed to fetch tutors');
  return res.json();
}

export async function fetchTutorDetail(id: string): Promise<{
  tutor: Tutor;
  documents: TutorDocument[];
  interviews: TutorInterview[];
  demos: DemoClass[];
  parentApprovals: ParentApproval[];
  appointment?: Appointment;
  logs: ActivityLog[];
}> {
  const res = await fetch(`${API_BASE}/tutors/${id}`);
  if (!res.ok) throw new Error('Failed to fetch tutor details');
  return res.json();
}

export async function createTutor(data: Partial<Tutor>): Promise<Tutor> {
  const res = await fetch(`${API_BASE}/tutors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create tutor');
  return res.json();
}

export async function updateTutor(id: string, data: Partial<Tutor>): Promise<Tutor> {
  const res = await fetch(`${API_BASE}/tutors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update tutor');
  return res.json();
}

export async function deleteTutor(id: string): Promise<{ success: boolean; message?: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : authToken;
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/tutors/${id}`, {
    method: 'DELETE',
    headers
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Unable to delete tutor. No data was removed.');
  }
  return data;
}

export async function validateTutor(id: string): Promise<{ success: boolean; tutor: Tutor; message: string }> {
  const res = await fetch(`${API_BASE}/tutors/${id}/validate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to validate tutor');
  return res.json();
}

export async function fetchValidateTutors(params?: Record<string, string>): Promise<ValidateTutorsResponse> {
  const query = params ? new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/tutors/validate?${query}`);
  if (!res.ok) throw new Error('Failed to fetch validate tutors');
  return res.json();
}

export async function importTutorsExcel(rows: any[], commit: boolean = true): Promise<TutorImportResult> {
  const res = await fetch(`${API_BASE}/tutors/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, commit })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Import failed' }));
    throw new Error(err.error || 'Failed to import tutors');
  }
  return res.json();
}

export async function updateTutorPriority(id: string, priority: 'HIGH_PRIORITY' | 'LOW_PRIORITY' | 'NOT_ASSIGNED'): Promise<{ success: boolean; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/tutors/${id}/priority`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priority })
  });
  if (!res.ok) throw new Error('Failed to update tutor priority');
  return res.json();
}

export async function assignPriority(id: string, priority: 'HIGH_PRIORITY' | 'LOW_PRIORITY' | 'NOT_ASSIGNED'): Promise<{ success: boolean; tutor: Tutor }> {
  return updateTutorPriority(id, priority);
}

export async function updateDocumentStatus(
  tutorId: string,
  docId: string,
  data: { status: 'Verified' | 'Rejected'; remarks: string }
): Promise<{ document: TutorDocument; tutor: Tutor; allVerified: boolean; anyRejected: boolean }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/documents/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update document status');
  return res.json();
}

export async function moveToInterview(tutorId: string, data?: any): Promise<{ success: boolean; tutor: Tutor; interview: TutorInterview }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/move-to-interview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to move to interview' }));
    throw new Error(err.error || 'Failed to move to interview');
  }
  return res.json();
}

export async function submitInterviewEvaluation(
  interviewId: string,
  data: Partial<TutorInterview> & { tutorId?: string }
): Promise<{ success: boolean; interview: TutorInterview; tutor: Tutor; message?: string; demo?: DemoClass }> {
  const res = await fetch(`${API_BASE}/interviews/${interviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Failed to update interview evaluation');
  }
  return json;
}

export async function moveToDemoClass(tutorId: string, data?: any): Promise<{ success: boolean; tutor: Tutor; demo: DemoClass; message?: string }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/move-to-demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data || {})
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Failed to move to demo class');
  }
  return json;
}

export async function createDemoClass(data: {
  tutorId: string;
  studentId?: string | null;
  subject?: string | null;
  class?: string | null;
  date?: string | null;
  time?: string | null;
  location?: string | null;
  comments?: string;
}): Promise<{ success: boolean; demo?: DemoClass; tutor?: Tutor; message?: string }> {
  const res = await fetch(`${API_BASE}/demos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || json.error || 'Failed to create demo class');
  }
  return json;
}

export async function fetchInterviews(): Promise<{ interviews: TutorInterview[] }> {
  const res = await fetch(`${API_BASE}/interviews`);
  if (!res.ok) throw new Error('Failed to fetch interviews');
  return res.json();
}

export async function fetchDemos(): Promise<{ demoClasses: DemoClass[] }> {
  const res = await fetch(`${API_BASE}/demos`);
  if (!res.ok) throw new Error('Failed to fetch demo classes');
  return res.json();
}

export async function scheduleDemoClass(demoId: string, data: {
  studentId?: string;
  subject?: string;
  class?: string;
  date?: string;
  time?: string;
  location?: string;
  comments?: string;
  teachingMethod?: string;
}): Promise<{ success: boolean; demo: DemoClass; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/demos/${demoId}/schedule`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to schedule demo class' }));
    throw new Error(err.error || 'Failed to schedule demo class');
  }
  return res.json();
}

export async function submitDemoEvaluation(demoId: string, data: Partial<DemoClass>): Promise<{ success: boolean; demo: DemoClass; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/demos/${demoId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update demo evaluation');
  return res.json();
}

export async function decideParentApproval(
  approvalId: string,
  data: { decision: 'APPROVE' | 'REJECT'; rating: number; feedback: string; comments?: string }
): Promise<{ success: boolean; approval: ParentApproval; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/parent-approvals/${approvalId}/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to record parent approval decision');
  return res.json();
}

export async function createAppointment(data: {
  tutorId: string;
  studentId: string;
  startDate?: string;
  timing?: string;
  salary?: number;
  subject?: string;
  location?: string;
}): Promise<{ success: boolean; appointment: Appointment; tutor: Tutor; student?: Student }> {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to appoint tutor' }));
    throw new Error(err.error || 'Failed to appoint tutor');
  }
  return res.json();
}

export async function fetchAppointments(): Promise<{ appointments: Appointment[] }> {
  const res = await fetch(`${API_BASE}/appointments`);
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function fetchStudents(params?: Record<string, string>): Promise<{ students: Student[]; total?: number }> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/students${query}`);
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function createStudent(data: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create student');
  return res.json();
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update student');
  return res.json();
}

export async function deleteStudent(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete student');
  return res.json();
}

export async function fetchParents(): Promise<{ parents: Parent[] }> {
  const res = await fetch(`${API_BASE}/parents`);
  if (!res.ok) throw new Error('Failed to fetch parents');
  return res.json();
}

export async function createParent(data: Partial<Parent>): Promise<Parent> {
  const res = await fetch(`${API_BASE}/parents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create parent');
  return res.json();
}

export async function updateParent(id: string, data: Partial<Parent>): Promise<Parent> {
  const res = await fetch(`${API_BASE}/parents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update parent');
  return res.json();
}

export async function deleteParent(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/parents/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete parent');
  return res.json();
}

export async function getTutorMatches(params: {
  studentId?: string;
  subject?: string;
  location?: string;
  timing?: string;
  budget?: number;
}): Promise<{
  student?: Student;
  requirements: { subject: string; location: string; timing: string; budget: number };
  recommendations: MatchRecommendation[];
}> {
  const res = await fetch(`${API_BASE}/matching`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('Failed to calculate tutor matches');
  return res.json();
}

export interface ImportResult {
  totalRecords: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  validRecords: any[];
  duplicateRecords: any[];
  invalidRecords: any[];
  errors: string[];
  committed: boolean;
}

export async function importExcelRows(
  type: 'tutors' | 'teachers' | 'students' | 'parents',
  rows: any[],
  commit = false
): Promise<ImportResult> {
  const res = await fetch(`${API_BASE}/import/${type}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows, commit })
  });
  if (!res.ok) throw new Error('Failed to process Excel import');
  return res.json();
}

export async function fetchNotifications(): Promise<{ notifications: NotificationItem[] }> {
  const res = await fetch(`${API_BASE}/notifications`);
  if (!res.ok) throw new Error('Failed to fetch notifications');
  return res.json();
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'PUT' });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PUT' });
  return res.json();
}

export async function fetchActivityLogs(): Promise<{ logs: ActivityLog[] }> {
  const res = await fetch(`${API_BASE}/activity-logs`);
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
  return res.json();
}

// -------------------------------------------------------------
// Social Media & WhatsApp Leads API Client
// -------------------------------------------------------------
export async function fetchLeads(params?: Record<string, string>): Promise<{ leads: SocialLead[]; total: number }> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/leads${query}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchLeadDetail(id: string): Promise<{ lead: SocialLead }> {
  const res = await fetch(`${API_BASE}/leads/${id}`);
  if (!res.ok) throw new Error('Failed to fetch lead details');
  return res.json();
}

export async function createManualLead(data: Partial<SocialLead>): Promise<{ success: boolean; lead: SocialLead }> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create lead' }));
    throw new Error(err.error || 'Failed to create lead');
  }
  return res.json();
}

export async function convertLead(
  id: string,
  data: {
    targetType: 'TUTOR' | 'STUDENT';
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    subjects?: string[];
    class?: string;
    experience?: string;
  }
): Promise<{ success: boolean; message: string; tutor?: Tutor; student?: Student; lead: SocialLead }> {
  const res = await fetch(`${API_BASE}/leads/${id}/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to convert lead' }));
    throw new Error(err.error || 'Failed to convert lead');
  }
  return res.json();
}

export async function linkLead(id: string, targetType: 'TUTOR' | 'STUDENT', targetId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/${id}/link`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetType, targetId })
  });
  if (!res.ok) throw new Error('Failed to link lead');
  return res.json();
}

export async function deleteLead(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/leads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete lead');
  return res.json();
}

export async function simulateInboundLead(data: {
  channel: 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM';
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  subjects?: string[];
  experience?: string;
  campaignName?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/leads/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Simulation failed' }));
    throw new Error(err.error || 'Simulation failed');
  }
  return res.json();
}

// -------------------------------------------------------------
// WhatsApp Communication Module API Client
// -------------------------------------------------------------
export async function fetchWhatsAppTemplates(): Promise<{ templates: WhatsAppTemplate[] }> {
  const res = await fetch(`${API_BASE}/whatsapp/templates`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp templates');
  return res.json();
}

export async function createWhatsAppTemplate(data: Partial<WhatsAppTemplate>): Promise<{ success: boolean; template: WhatsAppTemplate }> {
  const res = await fetch(`${API_BASE}/whatsapp/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to create template' }));
    throw new Error(err.error || 'Failed to create template');
  }
  return res.json();
}

export async function updateWhatsAppTemplate(id: string, data: Partial<WhatsAppTemplate>): Promise<{ success: boolean; template: WhatsAppTemplate }> {
  const res = await fetch(`${API_BASE}/whatsapp/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update template' }));
    throw new Error(err.error || 'Failed to update template');
  }
  return res.json();
}

export async function deleteWhatsAppTemplate(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/whatsapp/templates/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete template');
  return res.json();
}

export async function sendWhatsAppMessage(data: {
  tutorId?: string;
  phone: string;
  message: string;
  templateName?: string;
  sentBy?: string;
  extra?: any;
}): Promise<{ success: boolean; historyItem: WhatsAppHistoryItem; whatsappUrl: string; message: string }> {
  const res = await fetch(`${API_BASE}/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send WhatsApp message' }));
    throw new Error(err.error || 'Failed to send WhatsApp message');
  }
  return res.json();
}

export async function bulkSendWhatsAppMessages(data: {
  tutorIds: string[];
  message?: string;
  messageTemplate?: string;
  templateId?: string;
  templateName?: string;
  extra?: any;
}): Promise<BulkSendResponse> {
  const res = await fetch(`${API_BASE}/whatsapp/bulk-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send bulk WhatsApp messages' }));
    throw new Error(err.error || 'Failed to send bulk WhatsApp messages');
  }
  return res.json();
}

export async function fetchWhatsAppHistory(params?: Record<string, string>): Promise<{ history: WhatsAppHistoryItem[]; total: number }> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/whatsapp/history${query}`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp history');
  return res.json();
}

export async function updateTutorWhatsAppOptIn(
  tutorId: string,
  optIn: WhatsAppOptIn
): Promise<{ success: boolean; tutor: Tutor; message: string }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/whatsapp-opt-in`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optIn })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update WhatsApp opt-in' }));
    throw new Error(err.error || 'Failed to update WhatsApp opt-in');
  }
  return res.json();
}

// Priority Scoring System API Calls
export async function fetchPriorityConfig(): Promise<{ success: boolean; config: PriorityWeightsConfig }> {
  const res = await fetch(`${API_BASE}/priority/config`);
  if (!res.ok) throw new Error('Failed to fetch priority configuration');
  return res.json();
}

export async function updatePriorityConfig(config: PriorityWeightsConfig): Promise<{
  success: boolean;
  message: string;
  config: PriorityWeightsConfig;
  summary: any;
}> {
  const res = await fetch(`${API_BASE}/priority/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update priority configuration' }));
    throw new Error(err.error || 'Failed to update priority configuration');
  }
  return res.json();
}

export async function recalculateAllPriorities(): Promise<{
  success: boolean;
  message: string;
  summary: any;
}> {
  const res = await fetch(`${API_BASE}/priority/recalculate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to recalculate priorities');
  return res.json();
}

export async function overrideTutorPriority(
  tutorId: string,
  data: {
    priorityLevel: string;
    reason?: string;
    overriddenBy?: string;
    resetToAutomatic?: boolean;
  }
): Promise<{ success: boolean; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/priority-override`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to override priority' }));
    throw new Error(err.error || 'Failed to override priority');
  }
  return res.json();
}

export async function fetchPriorityStats(): Promise<PriorityDashboardStats> {
  const res = await fetch(`${API_BASE}/priority/stats`);
  if (!res.ok) throw new Error('Failed to fetch priority statistics');
  return res.json();
}

export async function fetchTutorPriorityBreakdown(tutorId: string): Promise<{ success: boolean; tutor: Tutor }> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/priority-breakdown`);
  if (!res.ok) throw new Error('Failed to fetch tutor priority breakdown');
  return res.json();
}

// =========================================================================
// WHATSAPP BUSINESS CLOUD API & CONVERSATION SERVICES
// =========================================================================

export async function fetchWhatsAppDashboardStats(): Promise<{
  success: boolean;
  stats: WhatsAppDashboardStats;
  recentMessages: WhatsAppMessage[];
}> {
  const res = await fetch(`${API_BASE}/whatsapp/dashboard-stats`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp dashboard stats');
  return res.json();
}

export async function fetchWhatsAppConversations(): Promise<{
  success: boolean;
  conversations: WhatsAppConversation[];
  total: number;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/conversations`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp conversations');
  return res.json();
}

export async function fetchWhatsAppConversationMessages(contactId: string): Promise<{
  success: boolean;
  contact: WhatsAppContact;
  tutor: Tutor | null;
  messages: WhatsAppMessage[];
  total: number;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/conversations/${contactId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch conversation messages');
  return res.json();
}

export async function markWhatsAppConversationRead(contactId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/conversations/${contactId}/read`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to mark conversation read');
  return res.json();
}

export async function sendWhatsAppTemplateMessage(data: {
  tutorId: string;
  templateName: string;
  languageCode?: string;
  extra?: Record<string, any>;
}): Promise<{
  success: boolean;
  messageId: string;
  tutorId: string;
  status: string;
  messageText: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to send template message' }));
    throw new Error(err.error || 'Failed to send template message');
  }
  return res.json();
}

export async function fetchWhatsAppContactsList(params?: { search?: string; optIn?: string }): Promise<{
  success: boolean;
  contacts: WhatsAppContact[];
  total: number;
}> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/whatsapp/contacts?${query}`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp contacts');
  return res.json();
}

export async function fetchWhatsAppSettings(): Promise<{
  success: boolean;
  settings: WhatsAppSettingsConfig;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/settings`);
  if (!res.ok) throw new Error('Failed to fetch WhatsApp settings');
  return res.json();
}

export async function saveWhatsAppSettings(config: Partial<WhatsAppSettingsConfig>): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  if (!res.ok) throw new Error('Failed to save WhatsApp settings');
  return res.json();
}

export async function testWhatsAppConnection(): Promise<{
  success: boolean;
  status: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/test-connection`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to test WhatsApp connection');
  return res.json();
}

export async function testWhatsAppWebhook(payload: {
  testType?: string;
  phoneNumber?: string;
  message?: string;
}): Promise<{
  success: boolean;
  message: string;
  messageId?: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/test-webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to test webhook simulation');
  return res.json();
}

export async function testWhatsAppSend(testNumber: string, message?: string): Promise<{
  success: boolean;
  providerMessageId?: string;
  phoneNumber?: string;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/whatsapp/test-send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testNumber, message })
  });
  if (!res.ok) throw new Error('Failed to dispatch test message');
  return res.json();
}

export async function fetchWhatsAppWebhookLogs(params?: { eventType?: string; search?: string }): Promise<{
  success: boolean;
  logs: WhatsAppWebhookLog[];
  total: number;
}> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/whatsapp/webhook-logs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch webhook logs');
  return res.json();
}

export async function fetchWhatsAppApiLogs(params?: { requestType?: string; result?: string }): Promise<{
  success: boolean;
  logs: WhatsAppApiLog[];
  total: number;
}> {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const res = await fetch(`${API_BASE}/whatsapp/api-logs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch API logs');
  return res.json();
}

export async function fetchTutorWhatsAppDetails(tutorId: string): Promise<TutorWhatsAppDetailResponse> {
  const res = await fetch(`${API_BASE}/tutors/${tutorId}/whatsapp`);
  if (!res.ok) throw new Error('Failed to fetch tutor WhatsApp details');
  return res.json();
}

// =========================================================================
// TUTOR-STUDENT ASSIGNMENT SERVICES
// =========================================================================

export async function fetchTutorStudentAssignments(params?: Record<string, string>): Promise<{
  success: boolean;
  assignments: TutorStudentAssignment[];
  total: number;
}> {
  const query = params ? new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/tutor-student-assignments?${query}`);
  if (!res.ok) throw new Error('Failed to fetch tutor-student assignments');
  return res.json();
}

export async function fetchAssignmentMetrics(): Promise<{
  success: boolean;
  metrics: AssignmentMetrics;
}> {
  const res = await fetch(`${API_BASE}/tutor-student-assignments/metrics`);
  if (!res.ok) throw new Error('Failed to fetch assignment metrics');
  return res.json();
}

export async function createTutorStudentAssignment(payload: CreateAssignmentPayload): Promise<{
  success: boolean;
  message: string;
  assignment: TutorStudentAssignment;
  warnings?: string[];
}> {
  const res = await fetch(`${API_BASE}/tutor-student-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to assign student' }));
    throw new Error(err.error || 'Failed to assign student');
  }
  return res.json();
}

export async function updateTutorStudentAssignment(
  id: string,
  payload: Partial<CreateAssignmentPayload> & { status?: string }
): Promise<{
  success: boolean;
  message: string;
  assignment: TutorStudentAssignment;
}> {
  const res = await fetch(`${API_BASE}/tutor-student-assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update assignment' }));
    throw new Error(err.error || 'Failed to update assignment');
  }
  return res.json();
}

export async function updateAssignmentStatus(
  id: string,
  status: string
): Promise<{
  success: boolean;
  message: string;
  assignment: TutorStudentAssignment;
}> {
  const res = await fetch(`${API_BASE}/tutor-student-assignments/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Failed to update assignment status' }));
    throw new Error(err.error || 'Failed to update assignment status');
  }
  return res.json();
}

// =========================================================================
// AUTHENTICATION & PORTALS API FUNCTIONS
// =========================================================================

export async function loginUser(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authenticate');
  }
  setAuthToken(data.token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(data.user));
  }
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  const data = await res.json();
  return data.user;
}

export function logoutUser(): void {
  setAuthToken(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}

export async function sendForgotPassword(role: string, username: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, username })
  });
  return res.json();
}

// -------------------------------------------------------------------------
// TUTOR PORTAL APIS
// -------------------------------------------------------------------------

export async function fetchTutorDashboardMetrics(): Promise<{ success: boolean; metrics: TutorDashboardMetrics; todayClasses: any[]; recentUpdates: TutorDailyUpdate[] }> {
  const res = await fetch(`${API_BASE}/tutor/dashboard-metrics`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch tutor dashboard metrics');
  return res.json();
}

export async function fetchTutorStudents(): Promise<{ success: boolean; students: any[] }> {
  const res = await fetch(`${API_BASE}/tutor/students`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch assigned students');
  return res.json();
}

export async function fetchTutorClasses(): Promise<{ success: boolean; classes: any[] }> {
  const res = await fetch(`${API_BASE}/tutor/classes`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
}

export async function fetchTutorDailyUpdates(filters?: { studentId?: string; subject?: string; date?: string }): Promise<{ success: boolean; updates: TutorDailyUpdate[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.studentId) params.append('studentId', filters.studentId);
  if (filters?.subject) params.append('subject', filters.subject);
  if (filters?.date) params.append('date', filters.date);

  const res = await fetch(`${API_BASE}/tutor/daily-updates?${params.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch tutor daily updates');
  return res.json();
}

export async function createTutorDailyUpdate(formData: FormData): Promise<{ success: boolean; update: TutorDailyUpdate; message: string }> {
  const res = await fetch(`${API_BASE}/tutor/daily-updates`, {
    method: 'POST',
    headers: { ...getAuthHeaders() }, // Multer handles multipart boundary automatically
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to publish daily update');
  return data;
}

export async function updateTutorDailyUpdate(id: string, formData: FormData): Promise<{ success: boolean; update: TutorDailyUpdate; message: string }> {
  const res = await fetch(`${API_BASE}/tutor/daily-updates/${id}`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() },
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update daily update');
  return data;
}

export async function deleteTutorDailyUpdate(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/tutor/daily-updates/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete daily update');
  return data;
}

// -------------------------------------------------------------------------
// PARENT PORTAL APIS
// -------------------------------------------------------------------------

export async function fetchParentDashboard(): Promise<{
  success: boolean;
  student: any;
  assignedTutors: any[];
  classes: any[];
  recentUpdates: TutorDailyUpdate[];
  totalUpdates: number;
}> {
  const res = await fetch(`${API_BASE}/parent/dashboard`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch parent dashboard');
  return res.json();
}

export async function fetchParentTutorUpdates(): Promise<{
  success: boolean;
  updates: TutorDailyUpdate[];
  total: number;
  latestUpdateDate: string | null;
  updatesThisWeekCount: number;
}> {
  const res = await fetch(`${API_BASE}/parent/tutor-updates`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch parent tutor updates');
  return res.json();
}

export async function fetchParentClasses(): Promise<{ success: boolean; classes: any[] }> {
  const res = await fetch(`${API_BASE}/parent/classes`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch classes');
  return res.json();
}

// -------------------------------------------------------------------------
// ADMIN TUTOR UPDATES APIS
// -------------------------------------------------------------------------

export async function fetchAdminTutorUpdates(params?: {
  tutorId?: string;
  studentId?: string;
  subject?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{ success: boolean; updates: TutorDailyUpdate[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.tutorId) q.append('tutorId', params.tutorId);
  if (params?.studentId) q.append('studentId', params.studentId);
  if (params?.subject) q.append('subject', params.subject);
  if (params?.search) q.append('search', params.search);
  if (params?.dateFrom) q.append('dateFrom', params.dateFrom);
  if (params?.dateTo) q.append('dateTo', params.dateTo);

  const res = await fetch(`${API_BASE}/admin/tutor-updates?${q.toString()}`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch admin tutor updates');
  return res.json();
}

export async function fetchAdminDailyUpdatesMetrics(): Promise<{ success: boolean; metrics: AdminDailyUpdatesMetrics }> {
  const res = await fetch(`${API_BASE}/admin/tutor-updates/metrics`, {
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to fetch admin tutor updates metrics');
  return res.json();
}

export async function archiveAdminTutorUpdate(id: string): Promise<{ success: boolean; message: string; update: TutorDailyUpdate }> {
  const res = await fetch(`${API_BASE}/admin/tutor-updates/${id}/archive`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to archive update');
  return res.json();
}

export async function deleteAdminTutorUpdate(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/admin/tutor-updates/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) throw new Error('Failed to delete update');
  return res.json();
}

