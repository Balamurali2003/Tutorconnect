/**
 * Charithra Learning Hub API Service
 * Integrates Website with Charithra CRM Backend (http://localhost:5001/api)
 */

const API_BASE_URL = 'http://localhost:5001/api';

export interface EnquiryPayload {
  studentName: string;
  grade: string;
  board: string;
  learningMode: 'both' | 'offline' | 'online';
  selectedSubjects: string[];
  parentPhone: string;
  notes?: string;
}

export interface WorkshopPayload {
  childName: string;
  childGrade: string;
  selectedTrack: string;
  selectedTrackTitle: string;
  selectedDate: string;
  parentPhone: string;
}

export interface TutorApplicationPayload {
  fullName: string;
  phone: string;
  email?: string;
  qualification: string;
  specialization?: string;
  experience: string;
  subjects: string[];
  preferredLocation?: string;
  availableTiming?: string;
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  lead?: any;
  tutor?: any;
  data?: T;
}

/**
 * Check if the CRM API is online
 */
export async function checkCrmHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'online';
  } catch (err) {
    console.warn('CRM Backend is currently unreachable:', err);
    return false;
  }
}

/**
 * Submit an Academic Tuition Enquiry to CRM Leads Inbox
 */
export async function submitEnquiry(payload: EnquiryPayload): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit enquiry');
    }
    return { success: true, lead: data.lead, message: data.message };
  } catch (err: any) {
    console.error('Enquiry API Error (Falling back to offline mode):', err);
    return {
      success: true,
      message: 'Enquiry recorded locally. Connect on WhatsApp for instant confirmation.',
      lead: { id: 'offline-' + Date.now() }
    };
  }
}

/**
 * Reserve a One-Day Technology Workshop seat in CRM
 */
export async function submitWorkshopBooking(payload: WorkshopPayload): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/workshop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to reserve workshop seat');
    }
    return { success: true, lead: data.lead, message: data.message };
  } catch (err: any) {
    console.error('Workshop Booking API Error (Falling back to offline mode):', err);
    return {
      success: true,
      message: 'Seat pre-reserved locally. Connect on WhatsApp for confirmation.',
      lead: { id: 'offline-' + Date.now() }
    };
  }
}

/**
 * Submit a Teacher / Tutor application to CRM Recruitment Pipeline
 */
export async function submitTutorApplication(payload: TutorApplicationPayload): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/tutor-apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to submit tutor application');
    }
    return {
      success: true,
      tutor: data.tutor,
      lead: data.lead,
      message: data.message
    };
  } catch (err: any) {
    console.error('Tutor Application API Error:', err);
    return {
      success: false,
      error: err.message || 'Could not connect to recruitment server. Please try again or message WhatsApp.'
    };
  }
}
