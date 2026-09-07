export type TutorStatus =
  | 'NEW_APPLICATION'
  | 'HIGH_PRIORITY'
  | 'LOW_PRIORITY'
  | 'VALIDATED'
  | 'DOCUMENT_VERIFICATION'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_SELECTED'
  | 'INTERVIEW_REJECTED'
  | 'DEMO_CLASS_SCHEDULED'
  | 'DEMO_CLASS_PASSED'
  | 'DEMO_CLASS_FAILED'
  | 'PARENT_APPROVAL_PENDING'
  | 'PARENT_APPROVED'
  | 'PARENT_REJECTED'
  | 'TUTOR_APPOINTED'
  | 'ACTIVE'
  | 'INACTIVE';

export type PriorityLevel = 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'LOW_PRIORITY';
export type PriorityType = 'NOT_ASSIGNED' | PriorityLevel;

export interface PriorityMetricBreakdownItem {
  score: number;
  max: number;
  rawPoints?: number;
  years?: number;
  matchedDemandCount?: number;
  matchedSubjects?: string[];
  matchedCount?: number;
  detail: string;
}

export interface PriorityBreakdown {
  experience: PriorityMetricBreakdownItem;
  subjectDemand: PriorityMetricBreakdownItem;
  homeTuition: PriorityMetricBreakdownItem;
  qualification: PriorityMetricBreakdownItem;
  locationMatch: PriorityMetricBreakdownItem;
  timingMatch: PriorityMetricBreakdownItem;
  total: number;
  maxTotal: number;
}

export interface PriorityWeightsConfig {
  experienceWeight: number;
  subjectDemandWeight: number;
  homeTuitionWeight: number;
  qualificationWeight: number;
  locationMatchWeight: number;
  timingMatchWeight: number;
}

export interface PriorityDashboardStats {
  totalTutors: number;
  highPriority: { count: number; percentage: number };
  mediumPriority: { count: number; percentage: number };
  lowPriority: { count: number; percentage: number };
  averageScore: number;
  top10Tutors: Tutor[];
  studentDemand: {
    totalActiveStudents: number;
    subjectCounts: Record<string, number>;
    locationCounts: Record<string, number>;
    timingCounts: Record<string, number>;
  };
}

export interface Tutor {
  id: string;
  tutorId: string;
  externalLeadId?: string;
  fullName: string;
  mobile: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  gender?: string;
  dob?: string;
  qualification: string;
  specialization?: string;
  experience?: string;
  experienceYears: number;
  subjects: string[];
  subjectsText?: string;
  homeTuitionAvailable?: string;
  preferredLocation: string;
  availableTiming: string;
  expectedSalary: number;
  resume?: string;
  photo?: string;
  priority: PriorityType;
  priorityScore?: number;
  priorityLevel?: PriorityLevel;
  prioritySource?: 'AUTOMATIC' | 'MANUAL';
  manualPriorityLevel?: PriorityLevel;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
  lastPriorityCalculatedAt?: string;
  priorityBreakdown?: PriorityBreakdown;
  priorityExplanation?: string;
  lowPriorityReasons?: string[];
  result?: 'Passed' | 'Failed' | 'Pending' | 'Selected' | 'Rejected' | string;
  status: TutorStatus;
  isValidated?: boolean;
  is_validated?: boolean;
  currentStage?: string;
  current_stage?: string;
  isAppointed?: boolean;
  is_appointed?: boolean;
  leadSource?: LeadSource;
  whatsappPhoneNumber?: string;
  originalPhoneNumber?: string;
  whatsappOptIn?: WhatsAppOptIn;
  platform?: string;
  campaignName?: string;
  adName?: string;
  adsetName?: string;
  formName?: string;
  isOrganic?: string | boolean;
  sourceCreatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type DocumentType =
  | 'Resume'
  | 'Qualification Certificate'
  | 'Degree Certificate'
  | 'Experience Certificate'
  | 'Address Proof'
  | 'Other Documents';

export interface TutorDocument {
  id: string;
  tutorId: string;
  docType: DocumentType;
  fileName: string;
  fileUrl: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  remarks: string;
  updatedAt?: string;
}

export interface TutorInterview {
  id: string;
  interviewId: string;
  tutorId: string;
  date: string;
  time: string;
  interviewer: string;
  type: 'Online' | 'In-Person';
  communicationRating: number;
  subjectKnowledgeRating: number;
  teachingAbilityRating: number;
  overallRating: number;
  result: 'Pending' | 'Selected' | 'Rejected' | 'On Hold';
  comments: string;
}

export interface DemoClass {
  id: string;
  demoId: string;
  tutorId: string;
  studentId: string | null;
  subject: string | null;
  class?: string | null;
  date: string | null;
  time: string | null;
  demoDate?: string | null;
  demoTime?: string | null;
  location: string | null;
  teachingMethod?: string | null;
  adminRating: number;
  studentRating: number;
  parentRating: number;
  status: 'PENDING' | 'SCHEDULED' | 'COMPLETED';
  result: 'Pending' | 'Passed' | 'Failed';
  comments: string;
  createdAt?: string;
  tutor?: Tutor;
  student?: Student;
  interview?: TutorInterview;
}

export interface ParentApproval {
  id: string;
  tutorId: string;
  parentId: string;
  studentId: string;
  demoId?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalStatus?: 'APPROVED' | 'REJECTED' | 'PENDING' | string;
  approval_status?: 'APPROVED' | 'REJECTED' | 'PENDING' | string;
  rating: number;
  feedback: string;
  comments: string;
  decidedAt?: string | null;
}

export interface Appointment {
  id: string;
  appointmentId: string;
  tutorId: string;
  studentId: string;
  parentId: string;
  subject: string;
  location: string;
  timing: string;
  salary: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED';
  createdAt?: string;
}

export interface Student {
  id: string;
  studentId: string;
  externalLeadId?: string;
  studentName: string;
  phone?: string;
  parentPhone?: string;
  email?: string;
  parentEmail?: string;
  gender?: string;
  dob?: string;
  class: string;
  school?: string;
  requiredSubjects?: string[];
  learningRequirements?: string;
  location?: string;
  preferredTiming?: string;
  budget?: number;
  assignedTutorId: string | null;
  parentId: string;
  status: 'LOOKING_FOR_TUTOR' | 'TUTOR_ASSIGNED' | string;
  leadSource?: LeadSource;
  platform?: string;
  campaignName?: string;
  sourceCreatedAt?: string;
  createdAt?: string;
}

export interface Parent {
  id: string;
  parentId: string;
  parentName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  occupation: string;
  budget: number;
  tutorPreference: string;
  studentIds: string[];
}

export interface ActivityLog {
  id: string;
  tutorId?: string;
  actor: string;
  action: string;
  description: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
  link: string;
  timestamp: string;
}

export interface DashboardMetrics {
  totalTutors: number;
  newApplications: number;
  highPriorityTutors: number;
  lowPriorityTutors: number;
  notAssignedTutors?: number;
  pendingVerification: number;
  interviewsScheduled: number;
  demoClassesPending: number;
  parentApprovalsPending: number;
  appointedTutors: number;
  totalStudents: number;
  totalParents: number;
}

export interface MatchRecommendation {
  tutor: Tutor;
  matchScore: number;
  breakdown: {
    criteria: string;
    score: number;
    max: number;
    match: boolean;
  }[];
}

export type UserRole = 'Admin' | 'Staff' | 'Tutor' | 'Parent';

export type LeadSource =
  | 'WHATSAPP'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'EXCEL_IMPORT'
  | 'WEBSITE'
  | 'MANUAL_ENTRY';

export type LeadStatus =
  | 'NEW_LEAD'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'CONVERTED'
  | 'ARCHIVED';

export interface LeadMessage {
  id: string;
  sender: 'user' | 'system' | 'admin';
  text: string;
  timestamp: string;
}

export interface SocialLead {
  id: string;
  leadSource: LeadSource;
  platform: string;
  name: string;
  phoneNumber: string;
  email?: string;
  externalLeadId?: string;
  campaignName?: string;
  adName?: string;
  formName?: string;
  subjects?: string[];
  experience?: string;
  message?: string;
  messages?: LeadMessage[];
  status: LeadStatus;
  convertedType?: 'TUTOR' | 'STUDENT' | null;
  convertedId?: string | null;
  createdAt: string;
  sourceCreatedAt?: string;
  updatedAt?: string;
}

export interface LeadSourceStat {
  source: string;
  count: number;
  color: string;
  key: LeadSource;
  icon?: string;
}

export type WhatsAppOptIn = 'YES' | 'NO' | 'UNKNOWN';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WhatsAppHistoryItem {
  id: string;
  date: string;
  sentAt?: string;
  tutorId?: string | null;
  tutorName: string;
  phoneNumber?: string;
  phone?: string;
  message: string;
  templateId?: string;
  templateName: string;
  status: 'Sent' | 'Failed' | 'Pending' | 'Invalid Number' | 'Skipped' | string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
  sentBy?: string;
}

export interface BulkSendResultItem {
  tutorId: string;
  name?: string;
  tutorName: string;
  phoneNumber: string;
  status: 'SENT' | 'FAILED' | 'Sent' | 'Failed' | 'Invalid Number' | 'Skipped' | string;
  error?: string | null;
  reason: string;
  templateId?: string;
  templateName?: string;
  message?: string;
  sentAt?: string;
  providerMessageId?: string | null;
  errorMessage?: string | null;
}

export interface BulkSendSummary {
  totalSelected: number;
  successfullySent: number;
  failed: number;
  invalidNumbers: number;
  skippedNotEligible: number;
}

export interface BulkSendResponse {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  summary: BulkSendSummary;
  results: BulkSendResultItem[];
}



// =========================================================================
// WHATSAPP BUSINESS API & CONVERSATION TYPES
// =========================================================================

export type WhatsAppMessageDirection = 'OUTBOUND' | 'INBOUND';
export type WhatsAppMessageType = 'TEXT' | 'TEMPLATE' | 'MEDIA';
export type WhatsAppMessageStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'RECEIVED';

export interface WhatsAppMessage {
  id: string;
  tutorId?: string | null;
  direction: WhatsAppMessageDirection;
  messageType: WhatsAppMessageType;
  messageText: string;
  templateName?: string | null;
  phoneNumber: string;
  providerMessageId: string;
  status: WhatsAppMessageStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  sentAt?: string;
  deliveredAt?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface WhatsAppContact {
  id: string;
  tutorId?: string | null;
  phoneNumber: string;
  displayName: string;
  whatsappOptIn: WhatsAppOptIn;
  lastMessageAt: string;
  lastInboundMessageAt?: string | null;
  lastOutboundMessageAt?: string | null;
  conversationStatus: 'OPEN' | 'CLOSED';
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversation {
  id: string;
  contactId: string;
  tutorId?: string | null;
  tutorName: string;
  phoneNumber: string;
  whatsappOptIn: WhatsAppOptIn;
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageDirection: WhatsAppMessageDirection;
  lastMessageStatus: string;
  unreadCount: number;
  conversationStatus: 'OPEN' | 'CLOSED';
}

export interface WhatsAppDashboardStats {
  totalContacts: number;
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;
  incomingMessages: number;
  unreadMessages: number;
  todayMessages: number;
  connectionStatus: string;
  webhookStatus: string;
  lastWebhookReceivedAt?: string | null;
  lastApiRequestAt?: string | null;
}

export interface WhatsAppSettingsConfig {
  businessAccountId: string;
  phoneNumberId: string;
  apiVersion: string;
  webhookUrl: string;
  webhookVerified: boolean;
  connectionStatus: string;
  lastWebhookReceivedAt?: string | null;
  lastApiRequestAt?: string | null;
  maskedAccessToken: string;
  maskedAppSecret: string;
}

export interface WhatsAppWebhookLog {
  id: string;
  timestamp: string;
  eventType: string;
  providerMessageId?: string | null;
  phoneNumber?: string | null;
  processingStatus: string;
  error?: string | null;
  summary: string;
}

export interface WhatsAppApiLog {
  id: string;
  timestamp: string;
  endpoint: string;
  requestType: string;
  tutorId?: string | null;
  tutorName?: string | null;
  providerMessageId?: string | null;
  httpStatus: number;
  result: 'SUCCESS' | 'FAILED';
  error?: string | null;
}

export interface TutorWhatsAppDetailResponse {
  success: boolean;
  tutor: {
    id: string;
    fullName: string;
    phoneNumber: string;
    whatsappOptIn: WhatsAppOptIn;
    status: string;
    priority: string;
  };
  contact?: WhatsAppContact | null;
  stats: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    received: number;
  };
  messages: WhatsAppMessage[];
}
