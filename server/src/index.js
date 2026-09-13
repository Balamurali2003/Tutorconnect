require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const whatsappService = require('./services/whatsappService');
const priorityEngine = require('./services/priorityEngine');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const crypto = require('crypto');
const JWT_SECRET = process.env.JWT_SECRET || 'tutorconnect-jwt-secret-key-2026';

// Helper: Base64URL Encoding & Decoding
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

// Sign and Verify JWT Tokens
function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 days validity
  }));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return encodedHeader + '.' + encodedPayload + '.' + signature;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(encodedHeader + '.' + encodedPayload)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  if (signature !== expectedSignature) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// Universal Auth Middleware
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
  const user = verifyToken(token);
  req.user = user;
  next();
});

// Role Guard Middleware
function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required. Please log in.' });
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Requires role: ' + roles.join(' or ') + '.'
      });
    }
    next();
  };
}


// Server-Sent Events (SSE) for Real-Time WhatsApp Dashboard & Inbox Updates
const sseClients = new Set();
app.get('/api/whatsapp/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.add(res);
  req.on('close', () => {
    sseClients.delete(res);
  });
});

function broadcastWhatsAppEvent(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {}
  }
}


const dbPath = path.join(__dirname, 'data/db.json');
const seedPath = path.join(__dirname, 'seed/seedData.js');

function loadDB() {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading db.json, falling back to seed', err);
  }
  return require(seedPath);
}

function cleanPhone(p) {
  if (!p) return '';
  let str = String(p).trim();
  if (str.startsWith('p:')) str = str.slice(2).trim();
  str = str.replace(/[\s-]/g, '');
  if (!str.startsWith('+') && str.length === 10) {
    str = '+91' + str;
  }
  return str;
}

function sanitizePriority(val) {
  if (!val) return 'NOT_ASSIGNED';
  const s = String(val).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (s === 'HIGH' || s === 'HIGH_PRIORITY' || s === 'URGENT') return 'HIGH_PRIORITY';
  if (s === 'MEDIUM' || s === 'MEDIUM_PRIORITY' || s === 'MODERATE') return 'MEDIUM_PRIORITY';
  if (s === 'LOW' || s === 'LOW_PRIORITY' || s === 'STANDARD') return 'LOW_PRIORITY';
  if (s === 'NOT_ASSIGNED' || s === 'NONE' || s === 'UNASSIGNED') return 'NOT_ASSIGNED';
  return s;
}

function normalizeDatabase(data) {
  if (!data) return data;
  if (!Array.isArray(data.leads)) {
    data.leads = [
      {
        id: "lead-wa-101",
        leadSource: "WHATSAPP",
        platform: "whatsapp",
        name: "Kavitha Ramesh",
        phoneNumber: "+919842155432",
        email: "kavitha.ramesh@gmail.com",
        externalLeadId: "wamid.HBgLOTE5ODQyMTU1NDMyFQIA",
        campaignName: "Direct WhatsApp Inquiry",
        adName: "WhatsApp Click-to-Chat",
        message: "Hello! Looking for a Class 10 Tamil and English home tutor in Tirunelveli for evening sessions.",
        messages: [
          {
            id: "msg-1",
            sender: "user",
            text: "Hello! Looking for a Class 10 Tamil and English home tutor in Tirunelveli for evening sessions.",
            timestamp: "2026-09-02T14:30:00.000Z"
          }
        ],
        status: "NEW_LEAD",
        convertedType: null,
        convertedId: null,
        createdAt: "2026-09-02T14:30:00.000Z",
        sourceCreatedAt: "2026-09-02T14:30:00.000Z",
        updatedAt: "2026-09-02T14:30:00.000Z"
      },
      {
        id: "lead-fb-102",
        leadSource: "FACEBOOK",
        platform: "fb",
        name: "Suresh Kannan",
        phoneNumber: "+919943218765",
        email: "suresh.physics@gmail.com",
        externalLeadId: "l:fb_lead_form_8765432",
        campaignName: "TEACHERS WANTED",
        adName: "New Leads ad",
        formName: "Charithra Learning Hub ? Tirunelveli-copy",
        subjects: ["Physics", "Chemistry"],
        experience: "5 years",
        message: "Submitted Teacher Wanted form on Facebook Lead Ads (Subjects: Physics, Chemistry | Experience: 5 years)",
        messages: [
          {
            id: "msg-2",
            sender: "system",
            text: "Submitted Teacher Wanted form on Facebook Lead Ads (Subjects: Physics, Chemistry | Experience: 5 years)",
            timestamp: "2026-09-02T16:15:00.000Z"
          }
        ],
        status: "NEW_LEAD",
        convertedType: null,
        convertedId: null,
        createdAt: "2026-09-02T16:15:00.000Z",
        sourceCreatedAt: "2026-09-02T16:15:00.000Z",
        updatedAt: "2026-09-02T16:15:00.000Z"
      },
      {
        id: "lead-ig-103",
        leadSource: "INSTAGRAM",
        platform: "ig",
        name: "deepika_educator",
        phoneNumber: "+919789012345",
        email: "deepika.educator@gmail.com",
        externalLeadId: "igsid_9823471029",
        campaignName: "Instagram Direct Message",
        adName: "IG Story Recruitment Post",
        message: "Hi! I saw your teacher recruitment story. Can I apply for Mathematics home tutoring for 9th and 10th CBSE?",
        messages: [
          {
            id: "msg-3",
            sender: "user",
            text: "Hi! I saw your teacher recruitment story. Can I apply for Mathematics home tutoring for 9th and 10th CBSE?",
            timestamp: "2026-09-03T09:10:00.000Z"
          }
        ],
        status: "NEW_LEAD",
        convertedType: null,
        convertedId: null,
        createdAt: "2026-09-03T09:10:00.000Z",
        sourceCreatedAt: "2026-09-03T09:10:00.000Z",
        updatedAt: "2026-09-03T09:10:00.000Z"
      }
    ];
  }
  if (!Array.isArray(data.whatsappTemplates)) {
    data.whatsappTemplates = [
      {
        id: "tmpl-1",
        name: "New Tutor Application",
        category: "APPLICATION",
        content: "Hello {{tutor_name}},\n\nThis is TutorConnect Tuition Centre.\n\nWe are contacting you regarding your tutor application.\n\nPlease let us know your availability for the next step.\n\nThank you,\nTutorConnect Team",
        variables: ["{{tutor_name}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-2",
        name: "Document Verification Required",
        category: "VERIFICATION",
        content: "Hello {{tutor_name}},\n\nYour application for {{subjects}} tutoring has been shortlisted.\n\nPlease submit your required verification documents (Qualification Certificate, ID Proof, and Experience Certificate) to continue onboarding.\n\nCurrent Stage: {{status}}.\n\nThank you,\nTutorConnect Verification Team",
        variables: ["{{tutor_name}}", "{{subjects}}", "{{status}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-3",
        name: "Interview Invitation",
        category: "INTERVIEW",
        content: "Hello {{tutor_name}},\n\nYour interview with TutorConnect Tuition Centre has been scheduled.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\nLocation/Mode: {{location}}\n\nPlease confirm your availability at the scheduled time.\n\nThank you,\nAcademic Lead, TutorConnect",
        variables: ["{{tutor_name}}", "{{interview_date}}", "{{interview_time}}", "{{location}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-4",
        name: "Interview Reminder",
        category: "INTERVIEW",
        content: "Reminder: Hello {{tutor_name}},\n\nThis is a friendly reminder for your upcoming tutor recruitment interview.\n\nDate: {{interview_date}}\nTime: {{interview_time}}\n\nPlease be available 5 minutes prior to the scheduled slot.\n\nThank you,\nTutorConnect Team",
        variables: ["{{tutor_name}}", "{{interview_date}}", "{{interview_time}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-5",
        name: "Demo Class Invitation",
        category: "DEMO_CLASS",
        content: "Hello {{tutor_name}},\n\nCongratulations! You have cleared the interview stage.\n\nYour demo class has been scheduled with student {{student_name}} for {{subject}}.\n\nDate: {{demo_date}}\nTime: {{demo_time}}\nLocation: {{location}}\n\nPlease prepare a 45-minute demonstration session.\n\nThank you,\nTutorConnect Team",
        variables: ["{{tutor_name}}", "{{student_name}}", "{{subject}}", "{{demo_date}}", "{{demo_time}}", "{{location}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-6",
        name: "Demo Class Reminder",
        category: "DEMO_CLASS",
        content: "Reminder: Hello {{tutor_name}},\n\nYour Demo Class with student {{student_name}} for {{subject}} is scheduled for {{demo_date}} at {{demo_time}}.\n\nLocation: {{location}}.\n\nWe wish you all the best with your demonstration!\n\nTutorConnect Operations",
        variables: ["{{tutor_name}}", "{{student_name}}", "{{subject}}", "{{demo_date}}", "{{demo_time}}", "{{location}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-7",
        name: "Parent Approval Update",
        category: "PARENT_APPROVAL",
        content: "Hello {{tutor_name}},\n\nYour demo class evaluation has been submitted to the student's parents for review and final approval.\n\nWe will notify you immediately upon confirmation of the tuition schedule.\n\nThank you for your patience,\nTutorConnect Team",
        variables: ["{{tutor_name}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-8",
        name: "Tutor Selected",
        category: "SELECTION",
        content: "Hello {{tutor_name}},\n\nGreat news! The parent has approved your demo class and selected you as the official tutor for {{subjects}}.\n\nWe are finalizing the tuition agreement and start date.\n\nCongratulations from the TutorConnect Team!",
        variables: ["{{tutor_name}}", "{{subjects}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-9",
        name: "Tutor Appointment",
        category: "APPOINTMENT",
        content: "Hello {{tutor_name}},\n\nYou have been officially appointed as Home Tutor for student {{student_name}} for {{subject}}.\n\nLocation: {{location}}\nTiming: {{availableTiming}}\n\nPlease check your TutorConnect portal for complete appointment details.\n\nWelcome aboard!\nTutorConnect Tuition Centre",
        variables: ["{{tutor_name}}", "{{student_name}}", "{{subject}}", "{{location}}", "{{availableTiming}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      },
      {
        id: "tmpl-10",
        name: "General Tutor Announcement",
        category: "ANNOUNCEMENT",
        content: "Hello {{tutor_name}},\n\nWe have immediate home tuition requirements for {{subjects}} in {{location}}.\n\nIf you have available teaching slots this week, please reply with your preferred days and timings.\n\nThank you,\nTutorConnect Team",
        variables: ["{{tutor_name}}", "{{subjects}}", "{{location}}"],
        createdAt: "2026-09-01T10:00:00.000Z"
      }
    ];
  }

  if (!Array.isArray(data.whatsappHistory)) {
    data.whatsappHistory = [
      {
        id: "wa-hist-1",
        date: "2026-09-03T10:15:00.000Z",
        tutorId: "tut-001",
        tutorName: "Muthu lakshmi",
        phone: "+919942323234",
        message: "Hello Muthu lakshmi,\n\nThis is TutorConnect Tuition Centre.\n\nWe are contacting you regarding your tutor application.\n\nPlease let us know your availability.\n\nThank you.",
        templateName: "New Tutor Application",
        status: "Sent",
        sentBy: "Admin"
      },
      {
        id: "wa-hist-2",
        date: "2026-09-03T11:45:00.000Z",
        tutorId: "tut-002",
        tutorName: "Ishak jas",
        phone: "+919751533400",
        message: "Hello Ishak jas,\n\nYour interview with TutorConnect Tuition Centre has been scheduled.\n\nDate: 08 Sep 2026\nTime: 11:00 AM\n\nPlease be available at the scheduled time.\n\nThank you.",
        templateName: "Interview Invitation",
        status: "Sent",
        sentBy: "Admin"
      }
    ];
  }

  if (Array.isArray(data.tutors)) {
    data.tutors.forEach(t => {
      t.priority = sanitizePriority(t.priority);
      if (!t.originalPhoneNumber) {
        t.originalPhoneNumber = t.mobile || t.phone || '';
      }
      if (!t.whatsappPhoneNumber) {
        t.whatsappPhoneNumber = cleanPhone(t.originalPhoneNumber || t.mobile || t.phone || '');
      }
      if (!t.whatsappOptIn) {
        t.whatsappOptIn = 'YES';
      }
      if (!t.leadSource) {
        if (t.platform && t.platform.toUpperCase() === 'FB') t.leadSource = 'FACEBOOK';
        else if (t.platform && t.platform.toUpperCase() === 'IG') t.leadSource = 'INSTAGRAM';
        else t.leadSource = 'EXCEL_IMPORT';
      }
      if (!t.externalLeadId) t.externalLeadId = t.tutorId || t.id;
      if (!t.campaignName) t.campaignName = 'TEACHERS WANTED';
      if (!t.adName) t.adName = 'New Leads ad';
      if (!t.platform) t.platform = t.leadSource === 'FACEBOOK' ? 'fb' : t.leadSource === 'INSTAGRAM' ? 'ig' : 'manual';
      if (!t.sourceCreatedAt) t.sourceCreatedAt = t.createdAt || new Date().toISOString();
    });
  }
  if (Array.isArray(data.students)) {
    data.students.forEach(s => {
      if (!s.leadSource) {
        if (s.platform && s.platform.toUpperCase() === 'FB') s.leadSource = 'FACEBOOK';
        else if (s.platform && s.platform.toUpperCase() === 'IG') s.leadSource = 'INSTAGRAM';
        else s.leadSource = 'EXCEL_IMPORT';
      }
      if (!s.externalLeadId) s.externalLeadId = s.studentId || s.id;
      if (!s.campaignName) s.campaignName = 'Tution';
      if (!s.adName) s.adName = 'New Leads ad';
      if (!s.platform) s.platform = s.leadSource === 'FACEBOOK' ? 'fb' : s.leadSource === 'INSTAGRAM' ? 'ig' : 'manual';
      if (!s.sourceCreatedAt) s.sourceCreatedAt = s.createdAt || new Date().toISOString();
    });
  }
  // Requirement 12: Ensure tutors who failed interview do not appear in Demo Classes
  if (Array.isArray(data.demoClasses)) {
    data.demoClasses = data.demoClasses.filter(demo => {
      const tutor = (data.tutors || []).find(t => t.id === demo.tutorId);
      const interview = (data.interviews || []).find(i => i.tutorId === demo.tutorId);
      const isFailed = (tutor && (tutor.status === 'INTERVIEW_FAILED' || tutor.interviewResult === 'FAILED')) ||
                       (interview && (interview.result === 'FAILED' || interview.interviewResult === 'FAILED' || interview.result === 'Rejected'));
      return !isFailed;
    });
  }
  return data;
}

function saveDB(data) {
  try {
    normalizeDatabase(data);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving db.json', err);
  }
}

let db = normalizeDatabase(loadDB());

if (!db.priorityConfig) {
  db.priorityConfig = { ...priorityEngine.DEFAULT_WEIGHTS };
}

function triggerPriorityRecalculation() {
  const summary = priorityEngine.recalculateAllTutorPriorities(db, db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS);
  saveDB(db);
  return summary;
}

// Initial priority calculation on startup
triggerPriorityRecalculation();

// Admin DB hot-reload from disk
app.post('/api/admin/reload-db', requireRole(['ADMIN']), (req, res) => {
  try {
    db = normalizeDatabase(loadDB());
    if (!db.priorityConfig) {
      db.priorityConfig = { ...priorityEngine.DEFAULT_WEIGHTS };
    }
    triggerPriorityRecalculation();
    res.json({ success: true, message: 'Database reloaded from disk' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function addLog(tutorId, actor, action, description) {
  const log = {
    id: "act-" + Date.now() + "-" + Math.floor(Math.random()*1000),
    tutorId,
    actor,
    action,
    description,
    message: description,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  if (!db.activityLogs) db.activityLogs = [];
  db.activityLogs.unshift(log);
  return log;
}

function addNotification(title, message, type, link) {
  const notif = {
    id: "notif-" + Date.now() + "-" + Math.floor(Math.random()*1000),
    title,
    message,
    type: type || 'info',
    read: false,
    link: link || '/dashboard',
    timestamp: new Date().toISOString()
  };
  if (!db.notifications) db.notifications = [];
  db.notifications.unshift(notif);
  return notif;
}

// 1. Stats endpoint
app.get('/api/stats', (req, res) => {
  const tutors = db.tutors || [];
  const students = db.students || [];
  const parents = db.parents || [];

  const totalTutors = tutors.length;
  const newApplications = tutors.filter(t => t.status === 'NEW_APPLICATION').length;
  const highPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'HIGH_PRIORITY').length;
  const mediumPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'MEDIUM_PRIORITY').length;
  const lowPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'LOW_PRIORITY').length;
  const notAssignedTutors = tutors.filter(t => !t.priority || t.priority === 'NOT_ASSIGNED').length;
  const totalScore = tutors.reduce((sum, t) => sum + (t.priorityScore || 0), 0);
  const averageTutorScore = totalTutors > 0 ? Number((totalScore / totalTutors).toFixed(1)) : 0;
  const pendingVerification = tutors.filter(t => t.status === 'DOCUMENT_VERIFICATION' || t.status === 'VALIDATED').length;
  const interviewsScheduled = tutors.filter(t => t.status && (t.status === 'INTERVIEW_PENDING' || t.status === 'INTERVIEW_SCHEDULED' || t.status === 'INTERVIEW_ON_HOLD' || t.status === 'DOCUMENT_APPROVED')).length;
  const demoClassesPending = tutors.filter(t => t.status && (t.status.startsWith('DEMO_CLASS_') || t.status === 'INTERVIEW_SELECTED')).length;
  const parentApprovalsPending = tutors.filter(t => t.status && t.status.startsWith('PARENT_')).length;
  const appointedTutors = tutors.filter(t => t.status === 'TUTOR_APPOINTED' || t.status === 'ACTIVE').length;
  const totalStudents = students.length;
  const totalParents = parents.length;

  const pipeline = [
    { stage: 'New Application', count: tutors.filter(t => t.status === 'NEW_APPLICATION').length, color: '#3b82f6' },
    { stage: 'Priority Assigned', count: tutors.filter(t => t.priority === 'HIGH_PRIORITY' || t.priority === 'LOW_PRIORITY').length, color: '#eab308' },
    { stage: 'Validated', count: tutors.filter(t => t.status === 'VALIDATED').length, color: '#6366f1' },
    { stage: 'Doc Verification', count: tutors.filter(t => t.status === 'DOCUMENT_VERIFICATION' || t.status === 'DOCUMENT_APPROVED').length, color: '#f97316' },
    { stage: 'Interview', count: tutors.filter(t => t.status && (t.status.startsWith('INTERVIEW_') || t.status === 'DOCUMENT_APPROVED') && t.status !== 'INTERVIEW_SELECTED').length, color: '#8b5cf6' },
    { stage: 'Demo Class', count: tutors.filter(t => t.status && (t.status.startsWith('DEMO_CLASS_') || t.status === 'INTERVIEW_SELECTED')).length, color: '#06b6d4' },
    { stage: 'Parent Approval', count: tutors.filter(t => t.status && t.status.startsWith('PARENT_')).length, color: '#ec4899' },
    { stage: 'Appointed / Active', count: appointedTutors, color: '#10b981' }
  ];

  const statusMap = {};
  tutors.forEach(t => {
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
  });
  const statusDistribution = Object.keys(statusMap).map(k => ({ name: k, count: statusMap[k] }));

  const monthMap = {};
  [...tutors, ...students].forEach(item => {
    if (item.createdAt) {
      const d = new Date(item.createdAt);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthMap[key] = (monthMap[key] || 0) + 1;
      }
    }
  });
  let monthlyRegistrations = Object.keys(monthMap).map(k => ({ month: k, count: monthMap[k] }));
  if (monthlyRegistrations.length === 0) {
    monthlyRegistrations = [{ month: 'Aug 2026', count: tutors.length + students.length }];
  }

  const subMap = {};
  tutors.forEach(t => {
    (t.subjects || []).forEach(sub => {
      subMap[sub] = (subMap[sub] || 0) + 1;
    });
  });
  const subjectRequirements = Object.keys(subMap).slice(0, 10).map(k => ({ subject: k, count: subMap[k] }));

  const locMap = {};
  tutors.forEach(t => {
    const loc = t.platform ? (t.platform.toUpperCase() === 'FB' ? 'Facebook Lead' : 'Instagram Lead') : (t.preferredLocation || 'Campaign');
    locMap[loc] = (locMap[loc] || 0) + 1;
  });
  const locationDistribution = Object.keys(locMap).map(k => ({ location: k, count: locMap[k] }));

  res.json({
    metrics: {
      totalTutors,
      newApplications,
      highPriorityTutors,
      mediumPriorityTutors,
      lowPriorityTutors,
      notAssignedTutors,
      averageTutorScore,
      highPriorityPercent: totalTutors > 0 ? Number(((highPriorityTutors / totalTutors) * 100).toFixed(1)) : 0,
      mediumPriorityPercent: totalTutors > 0 ? Number(((mediumPriorityTutors / totalTutors) * 100).toFixed(1)) : 0,
      lowPriorityPercent: totalTutors > 0 ? Number(((lowPriorityTutors / totalTutors) * 100).toFixed(1)) : 0,
      pendingVerification,
      interviewsScheduled,
      demoClassesPending,
      parentApprovalsPending,
      appointedTutors,
      totalStudents,
      totalParents
    },
    pipeline,
    statusDistribution,
    monthlyRegistrations,
    subjectRequirements,
    locationDistribution,
    leadSourceStats: (() => {
      const leads = db.leads || [];
      const webCount = leads.filter(l => l.leadSource === 'WEBSITE').length + tutors.filter(t => t.leadSource === 'WEBSITE' || t.platform === 'website').length;
      const waCount = leads.filter(l => l.leadSource === 'WHATSAPP').length;
      const fbCount = leads.filter(l => l.leadSource === 'FACEBOOK').length + tutors.filter(t => t.leadSource === 'FACEBOOK' || t.platform === 'fb').length;
      const igCount = leads.filter(l => l.leadSource === 'INSTAGRAM').length + tutors.filter(t => t.leadSource === 'INSTAGRAM' || t.platform === 'ig').length;
      const excelCount = tutors.filter(t => t.leadSource === 'EXCEL_IMPORT').length + students.filter(s => s.leadSource === 'EXCEL_IMPORT').length;
      const manualCount = leads.filter(l => l.leadSource === 'MANUAL_ENTRY').length;
      const total = webCount + waCount + fbCount + igCount + excelCount + manualCount;

      return [
        { source: 'Website Portal', count: webCount, color: '#F5A623', key: 'WEBSITE', icon: 'website' },
        { source: 'WhatsApp', count: waCount, color: '#25D366', key: 'WHATSAPP', icon: 'whatsapp' },
        { source: 'Facebook Lead Ads', count: fbCount, color: '#1877F2', key: 'FACEBOOK', icon: 'facebook' },
        { source: 'Instagram Messages', count: igCount, color: '#E1306C', key: 'INSTAGRAM', icon: 'instagram' },
        { source: 'Excel Bulk Import', count: excelCount, color: '#059669', key: 'EXCEL_IMPORT', icon: 'excel' },
        { source: 'Manual Entry', count: manualCount, color: '#6366F1', key: 'MANUAL_ENTRY', icon: 'manual' }
      ];
    })()
  });
});

// Tutors List & Filters
app.get('/api/tutors', (req, res) => {
  let list = (db.tutors || []).filter(t => t.isDeleted !== true);
  const { search, priority, status, subject, location, qualification, minExp, maxExp, platform, homeTuition } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t => 
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (t.externalLeadId && t.externalLeadId.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(q))) ||
      (t.subjectsText && t.subjectsText.toLowerCase().includes(q))
    );
  }

  if (priority && priority !== 'ALL') {
    const target = sanitizePriority(priority);
    list = list.filter(t => sanitizePriority(t.priorityLevel || t.priority) === target);
  }

  const { sort } = req.query;
  if (sort === 'priority_desc' || sort === 'priority_high') {
    list.sort((a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0));
  } else if (sort === 'priority_asc' || sort === 'priority_low') {
    list.sort((a, b) => (a.priorityScore ?? 0) - (b.priorityScore ?? 0));
  }

  if (status && status !== 'ALL') {
    if (status === 'VALIDATED' || req.query.validated === 'true') {
      list = list.filter(t => t.isValidated === true || t.is_validated === true || t.status === 'VALIDATED');
    } else if (status === 'TUTOR_APPOINTED' || status === 'ACTIVE' || req.query.appointed === 'true') {
      list = list.filter(t => 
        t.status === 'TUTOR_APPOINTED' || 
        t.status === 'ACTIVE' || 
        t.isAppointed === true || 
        t.is_appointed === true || 
        (db.appointments || []).some(a => a.tutorId === t.id && a.status === 'ACTIVE')
      );
    } else {
      list = list.filter(t => t.status === status);
    }
  } else if (req.query.validated === 'true') {
    list = list.filter(t => t.isValidated === true || t.is_validated === true || t.status === 'VALIDATED');
  } else if (req.query.appointed === 'true') {
    list = list.filter(t => 
      t.status === 'TUTOR_APPOINTED' || 
      t.status === 'ACTIVE' || 
      t.isAppointed === true || 
      t.is_appointed === true || 
      (db.appointments || []).some(a => a.tutorId === t.id && a.status === 'ACTIVE')
    );
  }

  if (subject && subject !== 'ALL') {
    list = list.filter(t => 
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))) ||
      (t.subjectsText && t.subjectsText.toLowerCase().includes(subject.toLowerCase()))
    );
  }

  if (location && location !== 'ALL') {
    list = list.filter(t => t.preferredLocation && t.preferredLocation.toLowerCase().includes(location.toLowerCase()));
  }

  if (qualification && qualification !== 'ALL') {
    list = list.filter(t => t.qualification && t.qualification.toLowerCase().includes(qualification.toLowerCase()));
  }

  if (platform && platform !== 'ALL') {
    list = list.filter(t => t.platform && t.platform.toLowerCase() === platform.toLowerCase());
  }

  if (homeTuition && homeTuition !== 'ALL') {
    list = list.filter(t => t.homeTuitionAvailable && t.homeTuitionAvailable.toLowerCase() === homeTuition.toLowerCase());
  }

  if (minExp) {
    list = list.filter(t => t.experienceYears >= Number(minExp));
  }

  if (maxExp) {
    list = list.filter(t => t.experienceYears <= Number(maxExp));
  }

  res.json({ tutors: list, total: list.length });
});

// Update Priority / Manual Override handler
const handleUpdatePriority = (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const rawPriority = req.body.priority || req.body.priorityLevel;
  const reason = req.body.reason || req.body.overrideReason || 'Administrative priority adjustment';
  const overriddenBy = req.body.overriddenBy || 'Admin';

  if (rawPriority === 'AUTOMATIC' || req.body.resetToAutomatic) {
    tutor.prioritySource = 'AUTOMATIC';
    delete tutor.manualPriorityLevel;
    delete tutor.overrideReason;
    delete tutor.overriddenBy;
    delete tutor.overriddenAt;

    const demand = priorityEngine.computeStudentDemand(db.students || []);
    const calc = priorityEngine.calculateTutorPriority(tutor, demand, db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS);
    tutor.priorityScore = calc.priorityScore;
    tutor.priorityLevel = calc.priorityLevel;
    tutor.priority = calc.priorityLevel;
    tutor.priorityBreakdown = calc.priorityBreakdown;
    tutor.priorityExplanation = calc.priorityExplanation;
    tutor.lowPriorityReasons = calc.lowPriorityReasons;
    tutor.lastPriorityCalculatedAt = calc.lastPriorityCalculatedAt;

    addLog(tutor.id, overriddenBy, 'PRIORITY_RESET_AUTOMATIC', `Reset priority to automatic scoring: ${tutor.priorityScore}/100 (${tutor.priorityLevel}).`);
  } else {
    const priority = sanitizePriority(rawPriority);
    tutor.prioritySource = 'MANUAL';
    tutor.manualPriorityLevel = priority;
    tutor.priorityLevel = priority;
    tutor.priority = priority;
    tutor.overrideReason = reason;
    tutor.overriddenBy = overriddenBy;
    tutor.overriddenAt = new Date().toISOString();

    const priorityLabel = priority === 'HIGH_PRIORITY' ? 'High Priority' : priority === 'MEDIUM_PRIORITY' ? 'Medium Priority' : 'Low Priority';
    addLog(tutor.id, overriddenBy, 'PRIORITY_MANUAL_OVERRIDE', `Manually overridden priority to: ${priorityLabel}. Reason: ${reason}`);
    addNotification('Priority Overridden', `${tutor.fullName} manually set to ${priorityLabel}.`, 'info', '/tutors/' + tutor.id);
  }

  saveDB(db);
  res.json({ success: true, tutor });
};

app.patch('/api/tutors/:id/priority', handleUpdatePriority);
app.post('/api/tutors/:id/priority', handleUpdatePriority);
app.post('/api/tutors/:id/assign-priority', handleUpdatePriority);
app.post('/api/tutors/:id/priority-override', handleUpdatePriority);


// =========================================================================
// VALIDATE TUTORS API & EXCEL BULK IMPORT
// =========================================================================

// GET /api/tutors/validate - List tutors in the Validate Tutor stage
app.get('/api/tutors/validate', (req, res) => {
  if (!db.tutors) db.tutors = [];

  // Tutors in the VALIDATE TUTOR stage:
  // Not soft-deleted AND not yet validated (and not in later stages like appointment)
  let list = db.tutors.filter(t => 
    t.isDeleted !== true &&
    t.isValidated !== true &&
    t.is_validated !== true &&
    t.status !== 'VALIDATED' &&
    t.status !== 'DOCUMENT_VERIFICATION' &&
    t.status !== 'TUTOR_APPOINTED' &&
    t.currentStage !== 'DOCUMENT_VERIFICATION'
  );

  const { search, priority, subject, experience, homeTuition, location, page = 1, limit = 20 } = req.query;

  if (search) {
    const q = search.toLowerCase().trim();
    list = list.filter(t =>
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (t.externalLeadId && t.externalLeadId.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.phone && t.phone.includes(q)) ||
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(q))) ||
      (t.subjectsText && t.subjectsText.toLowerCase().includes(q)) ||
      (t.preferredLocation && t.preferredLocation.toLowerCase().includes(q))
    );
  }

  if (priority && priority !== 'ALL') {
    const pTarget = priority.toUpperCase().replace(/\s+/g, '_');
    list = list.filter(t => {
      const p = (t.priorityLevel || t.priority || '').toUpperCase().replace(/\s+/g, '_');
      if (pTarget === 'NOT_ASSIGNED') {
        return !p || p === 'NOT_ASSIGNED';
      }
      return p.includes(pTarget) || pTarget.includes(p);
    });
  }

  if (subject && subject !== 'ALL') {
    const sQuery = subject.toLowerCase().trim();
    list = list.filter(t =>
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(sQuery))) ||
      (t.subjectsText && t.subjectsText.toLowerCase().includes(sQuery))
    );
  }

  if (experience && experience !== 'ALL') {
    list = list.filter(t => {
      const yrs = t.experienceYears !== undefined ? t.experienceYears : 0;
      if (experience === '0-1') return yrs >= 0 && yrs <= 1;
      if (experience === '1-3') return yrs >= 1 && yrs <= 3;
      if (experience === '3-5') return yrs >= 3 && yrs <= 5;
      if (experience === '5+') return yrs >= 5;
      return true;
    });
  }

  if (homeTuition && homeTuition !== 'ALL') {
    const htTarget = homeTuition.toLowerCase();
    list = list.filter(t => (t.homeTuitionAvailable || '').toLowerCase() === htTarget);
  }

  if (location && location !== 'ALL') {
    const locQuery = location.toLowerCase().trim();
    list = list.filter(t => (t.preferredLocation || '').toLowerCase().includes(locQuery));
  }

  const total = list.length;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 20);
  const totalPages = Math.ceil(total / l) || 1;
  const startIndex = (p - 1) * l;
  const paginated = list.slice(startIndex, startIndex + l);

  res.json({
    success: true,
    tutors: paginated,
    total,
    page: p,
    limit: l,
    totalPages
  });
});

// POST /api/tutors/import - Excel Bulk Import into Validate Tutor stage
app.post('/api/tutors/import', (req, res) => {
  const { rows, commit = true } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of rows.' });
  }

  const validRecords = [];
  const duplicateRecords = [];
  const invalidRecords = [];
  const errors = [];

  // Lookup maps for duplicate checking against active tutors in database
  const activeTutors = (db.tutors || []).filter(t => t.isDeleted !== true);
  const existingExternalIds = new Map();
  const existingPhones = new Map();
  const existingEmails = new Map();

  activeTutors.forEach(t => {
    if (t.externalLeadId) existingExternalIds.set(t.externalLeadId.toString().trim(), t);
    const p1 = cleanPhone(t.mobile);
    const p2 = cleanPhone(t.phone);
    const p3 = cleanPhone(t.whatsappPhoneNumber);
    if (p1) existingPhones.set(p1, t);
    if (p2) existingPhones.set(p2, t);
    if (p3) existingPhones.set(p3, t);
    if (t.email) existingEmails.set(t.email.toLowerCase().trim(), t);
  });

  // Tracking within batch to prevent intra-batch duplicates
  const batchExternalIds = new Set();
  const batchPhones = new Set();
  const batchEmails = new Set();

  rows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const rowErrors = [];

    const externalId = (getFieldVal(row, ['id', 'external id', 'external_id', 'lead id', 'lead_id']) || '').toString().trim();
    const fullName = getFieldVal(row, ['full name', 'fullname', 'full_name', 'name', 'tutor name', 'teacher name']);
    const rawPhone = getFieldVal(row, ['phone number', 'phone_number', 'phonenumber', 'mobile', 'mobile number', 'phone', 'contact']);
    const cleanedPhone = cleanPhone(rawPhone);
    const rawEmail = getFieldVal(row, ['email', 'email address', 'email_address', 'e-mail']);
    const email = (rawEmail || '').toLowerCase().trim();
    
    const subjectsStr = getFieldVal(row, ['subjects', 'which subjects can you teach', 'which_subjects_can_you_teach?', 'subject']);
    const expStr = getFieldVal(row, ['experience', 'how much teaching experience do you have', 'how_much_teaching_experience_do_you_have?', 'teaching experience', 'experience years']);
    const qualification = getFieldVal(row, ['qualification', 'degree', 'education']) || 'Not Provided';
    const location = getFieldVal(row, ['location', 'preferred location', 'city', 'area']) || 'Not Provided';
    const availableDays = getFieldVal(row, ['available days', 'available_days', 'days']) || 'Not Provided';
    const availableTiming = getFieldVal(row, ['available timing', 'available_timing', 'timing', 'time']) || 'Flexible';
    const expectedSalary = Number(getFieldVal(row, ['expected salary', 'expected_salary', 'salary', 'fees'])) || 0;
    const homeTuitionStr = getFieldVal(row, ['home tuition', 'home_tuition', 'home tuition available', 'are you comfortable providing home tuition', 'are_you_comfortable_providing_home_tuition?']) || 'Yes';
    const rawPriority = getFieldVal(row, ['priority', 'priority level']);
    const notes = getFieldVal(row, ['notes', 'remarks', 'comments', 'instruction']) || '';

    // Validations:
    if (!fullName || fullName.trim().length === 0) {
      rowErrors.push('Full Name is required');
    }
    if (!cleanedPhone || cleanedPhone.length < 7) {
      rowErrors.push('Valid phone number is required (min 7 digits)');
    }

    // Duplicate Checking Priority:
    // 1. External ID
    // 2. Phone number
    // 3. Email
    let isDuplicate = false;
    let duplicateReason = '';
    let duplicateField = '';

    if (externalId) {
      if (existingExternalIds.has(externalId)) {
        isDuplicate = true;
        duplicateField = 'External ID';
        duplicateReason = `External ID '${externalId}' already exists (matches ${existingExternalIds.get(externalId).fullName})`;
      } else if (batchExternalIds.has(externalId)) {
        isDuplicate = true;
        duplicateField = 'External ID';
        duplicateReason = `Duplicate External ID '${externalId}' within upload file`;
      }
    }

    if (!isDuplicate && cleanedPhone) {
      if (existingPhones.has(cleanedPhone)) {
        isDuplicate = true;
        duplicateField = 'Phone Number';
        duplicateReason = `Phone Number '${cleanedPhone}' already registered (matches ${existingPhones.get(cleanedPhone).fullName})`;
      } else if (batchPhones.has(cleanedPhone)) {
        isDuplicate = true;
        duplicateField = 'Phone Number';
        duplicateReason = `Duplicate Phone Number '${cleanedPhone}' within upload file`;
      }
    }

    if (!isDuplicate && email) {
      if (existingEmails.has(email)) {
        isDuplicate = true;
        duplicateField = 'Email';
        duplicateReason = `Email '${email}' already registered (matches ${existingEmails.get(email).fullName})`;
      } else if (batchEmails.has(email)) {
        isDuplicate = true;
        duplicateField = 'Email';
        duplicateReason = `Duplicate Email '${email}' within upload file`;
      }
    }

    if (isDuplicate) {
      duplicateRecords.push({
        rowNum,
        data: row,
        fullName: fullName || 'Unnamed',
        phone: rawPhone || cleanedPhone,
        email,
        reason: duplicateReason,
        field: duplicateField
      });
      errors.push(`Row ${rowNum}: Skipped - Duplicate (${duplicateReason})`);
    } else if (rowErrors.length > 0) {
      invalidRecords.push({
        rowNum,
        data: row,
        fullName: fullName || 'Unnamed',
        phone: rawPhone || '',
        email,
        errors: rowErrors
      });
      errors.push(`Row ${rowNum}: Invalid (${rowErrors.join(', ')})`);
    } else {
      if (externalId) batchExternalIds.add(externalId);
      if (cleanedPhone) batchPhones.add(cleanedPhone);
      if (email) batchEmails.add(email);

      // Parse experience years
      let expYears = 0;
      if (typeof expStr === 'number') {
        expYears = expStr;
      } else if (typeof expStr === 'string') {
        const m = expStr.match(/\d+/);
        if (m) expYears = parseInt(m[0], 10);
      }

      // Parse subjects array
      let subjects = ['General Coaching'];
      if (subjectsStr) {
        subjects = subjectsStr.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        if (subjects.length === 0) subjects = ['General Coaching'];
      }

      // Home tuition normalization
      const homeTuitionNorm = ['yes', 'true', '1', 'y'].includes(homeTuitionStr.toString().toLowerCase().trim()) ? 'Yes' : 'No';

      const validItem = {
        rowNum,
        externalLeadId: externalId || null,
        fullName: fullName.trim(),
        mobile: cleanedPhone,
        phone: cleanedPhone,
        email: email || 'Not Provided',
        subjects,
        subjectsText: subjects.join(', '),
        experience: expStr || `${expYears} Years`,
        experienceYears: expYears,
        qualification,
        preferredLocation: location,
        availableDays,
        availableTiming,
        expectedSalary,
        homeTuitionAvailable: homeTuitionNorm,
        priority: sanitizePriority(rawPriority || 'NOT_ASSIGNED'),
        notes,
        leadSource: 'EXCEL_IMPORT',
        platform: 'excel_bulk_import'
      };

      validRecords.push(validItem);
    }
  });

  const summary = {
    totalRows: rows.length,
    valid: validRecords.length,
    duplicates: duplicateRecords.length,
    invalid: invalidRecords.length,
    successfullyImported: 0,
    skippedDuplicates: duplicateRecords.length,
    invalidRows: invalidRecords.length
  };

  if (commit && validRecords.length > 0) {
    const demand = priorityEngine.computeStudentDemand(db.students || []);
    const now = new Date().toISOString();
    let currentMaxNum = (db.tutors || []).reduce((max, t) => {
      const match = (t.tutorId || '').match(/\d+/);
      return match ? Math.max(max, parseInt(match[0], 10)) : max;
    }, 0);

    const newlyCreatedTutors = validRecords.map((item, idx) => {
      currentMaxNum++;
      const id = 'tut-imp-' + Date.now() + '-' + idx + '-' + Math.floor(Math.random() * 1000);
      const tutorId = 'TUT-' + String(currentMaxNum).padStart(3, '0');

      const tutor = {
        id,
        tutorId,
        externalLeadId: item.externalLeadId,
        fullName: item.fullName,
        mobile: item.mobile,
        phone: item.phone,
        email: item.email,
        qualification: item.qualification,
        experience: item.experience,
        experienceYears: item.experienceYears,
        subjects: item.subjects,
        subjectsText: item.subjectsText,
        preferredLocation: item.preferredLocation,
        availableDays: item.availableDays,
        availableTiming: item.availableTiming,
        expectedSalary: item.expectedSalary,
        homeTuitionAvailable: item.homeTuitionAvailable,
        notes: item.notes,
        leadSource: 'EXCEL_IMPORT',
        platform: 'excel_bulk_import',
        status: 'NEW_APPLICATION',
        currentStage: 'VALIDATE_TUTOR',
        isValidated: false,
        is_validated: false,
        isDeleted: false,
        createdAt: now,
        updatedAt: now
      };

      // Automatic Priority Calculation
      const calc = priorityEngine.calculateTutorPriority(tutor, demand, db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS);
      tutor.priorityScore = calc.priorityScore;
      tutor.priorityLevel = calc.priorityLevel;
      tutor.priority = calc.priorityLevel;
      tutor.priorityBreakdown = calc.priorityBreakdown;
      tutor.priorityExplanation = calc.priorityExplanation;
      tutor.lowPriorityReasons = calc.lowPriorityReasons;
      tutor.lastPriorityCalculatedAt = now;

      // Seed standard tutor documents
      const docTypes = ['Resume', 'Qualification Certificate', 'Address Proof'];
      docTypes.forEach(dt => {
        if (!db.tutorDocuments) db.tutorDocuments = [];
        db.tutorDocuments.push({
          id: 'doc-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
          tutorId: tutor.id,
          docType: dt,
          fileName: `${tutor.fullName.replace(/\s+/g, '_')}_${dt.replace(/\s+/g, '_')}.pdf`,
          fileUrl: `/mock-files/${tutor.id}_${dt.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          status: 'Pending',
          remarks: '',
          updatedAt: now
        });
      });

      addLog(tutor.id, 'Admin', 'EXCEL_IMPORTED', `Tutor profile imported via Excel. Placed in Validate Tutor stage with priority score ${tutor.priorityScore}/100.`);
      return tutor;
    });

    db.tutors.push(...newlyCreatedTutors);
    saveDB(db);
    summary.successfullyImported = newlyCreatedTutors.length;
  }

  res.json({
    success: true,
    summary,
    validRecords,
    duplicateRecords,
    invalidRecords,
    errors
  });
});

// Single Tutor Details
app.get('/api/tutors/:id', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const documents = (db.tutorDocuments || []).filter(d => d.tutorId === tutor.id);
  const interviews = (db.interviews || []).filter(i => i.tutorId === tutor.id);
  const demos = (db.demoClasses || []).filter(d => d.tutorId === tutor.id);
  const parentApprovals = (db.parentApprovals || []).filter(p => p.tutorId === tutor.id);
  const appointment = (db.appointments || []).find(a => a.tutorId === tutor.id);
  const logs = (db.activityLogs || []).filter(l => l.tutorId === tutor.id);

  res.json({
    tutor,
    documents,
    interviews,
    demos,
    parentApprovals,
    appointment,
    logs
  });
});

// Create Tutor
app.post('/api/tutors', (req, res) => {
  const nextNum = (db.tutors.length + 1).toString().padStart(3, '0');
  const newTutor = {
    id: 'tut-' + nextNum,
    tutorId: 'TUT-2026-' + nextNum,
    fullName: req.body.fullName || 'New Tutor',
    mobile: req.body.mobile || '',
    whatsapp: req.body.whatsapp || req.body.mobile || '',
    email: req.body.email || '',
    gender: req.body.gender || 'Male',
    dob: req.body.dob || '1995-01-01',
    qualification: req.body.qualification || '',
    specialization: req.body.specialization || '',
    experienceYears: Number(req.body.experienceYears) || 0,
    subjects: Array.isArray(req.body.subjects) ? req.body.subjects : [req.body.subjects || 'General'],
    preferredLocation: req.body.preferredLocation || 'Tiruchirappalli',
    availableTiming: req.body.availableTiming || '5:00 PM - 7:00 PM',
    expectedSalary: Number(req.body.expectedSalary) || 15000,
    resume: req.body.resume || (req.body.fullName || 'tutor') + '_resume.pdf',
    photo: req.body.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    priority: req.body.priority || 'LOW_PRIORITY',
    result: 'Pending',
    status: req.body.priority === 'HIGH_PRIORITY' ? 'HIGH_PRIORITY' : 'NEW_APPLICATION',
    createdAt: new Date().toISOString()
  };

  db.tutors.unshift(newTutor);

  // Initialize standard 6 documents
  const docTypes = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Other Documents'];
  docTypes.forEach((dt, idx) => {
    db.tutorDocuments.push({
      id: 'doc-' + nextNum + '-' + (idx+1),
      tutorId: newTutor.id,
      docType: dt,
      fileName: newTutor.fullName.replace(/\s+/g, '_') + '_' + dt.replace(/\s+/g, '_') + '.pdf',
      fileUrl: '/mock-files/' + newTutor.id + '_' + dt.toLowerCase().replace(/\s+/g, '_') + '.pdf',
      status: 'Pending',
      remarks: '',
      updatedAt: new Date().toISOString()
    });
  });

  addLog(newTutor.id, 'Admin', 'APPLICATION_CREATED', 'New tutor profile created for ' + newTutor.fullName + '.');
  addNotification('New Tutor Application', newTutor.fullName + ' applied for ' + newTutor.subjects.join(', ') + '.', 'info', '/tutors/' + newTutor.id);
  saveDB(db);

  res.status(201).json(newTutor);
});

// Update Tutor
app.put('/api/tutors/:id', (req, res) => {
  const index = db.tutors.findIndex(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Tutor not found' });

  db.tutors[index] = { ...db.tutors[index], ...req.body, updatedAt: new Date().toISOString() };

  // Recalculate priority if priority is automatic
  if (db.tutors[index].prioritySource !== 'MANUAL') {
    const demand = priorityEngine.computeStudentDemand(db.students || []);
    const calc = priorityEngine.calculateTutorPriority(db.tutors[index], demand, db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS);
    db.tutors[index].priorityScore = calc.priorityScore;
    db.tutors[index].priorityLevel = calc.priorityLevel;
    db.tutors[index].priority = calc.priorityLevel;
    db.tutors[index].priorityBreakdown = calc.priorityBreakdown;
    db.tutors[index].lastPriorityCalculatedAt = new Date().toISOString();
  }

  addLog(db.tutors[index].id, 'Admin', 'PROFILE_UPDATED', 'Tutor profile details updated.');
  saveDB(db);
  res.json(db.tutors[index]);
});

// Permanent Delete Tutor and all related child records with atomic transaction & rollback
app.delete('/api/tutors/:id', requireRole(['ADMIN']), (req, res) => {
  const tutor = (db.tutors || []).find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) {
    return res.status(404).json({ success: false, message: 'Tutor not found' });
  }

  const tutorId = tutor.id;
  const altTutorId = tutor.tutorId;
  const tutorMatches = (val) => val && (val === tutorId || (altTutorId && val === altTutorId));

  // Snapshot database for atomic transaction rollback
  const dbSnapshot = JSON.parse(JSON.stringify(db));

  // Collect any server-uploaded files belonging strictly to this tutor for post-commit cleanup
  const filesToDelete = [];
  (db.tutorDailyUpdates || []).forEach(u => {
    if (tutorMatches(u.tutorId)) {
      const photoUrl = u.imageUrl || u.whiteboardPhotoUrl || u.photoUrl;
      if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('/uploads/')) {
        filesToDelete.push(path.join(__dirname, '..', photoUrl));
      }
    }
  });

  (db.tutorDocuments || []).forEach(d => {
    if (tutorMatches(d.tutorId)) {
      if (d.fileUrl && typeof d.fileUrl === 'string' && d.fileUrl.startsWith('/uploads/')) {
        filesToDelete.push(path.join(__dirname, '..', d.fileUrl));
      }
    }
  });

  try {
    // 1. Delete dependent/child records first
    // Tutor-student assignment records
    if (db.tutorStudentAssignments) {
      db.tutorStudentAssignments = db.tutorStudentAssignments.filter(a => !tutorMatches(a.tutorId));
    }

    // Tutor daily teaching updates
    if (db.tutorDailyUpdates) {
      db.tutorDailyUpdates = db.tutorDailyUpdates.filter(u => !tutorMatches(u.tutorId));
    }

    // Appointments
    if (db.appointments) {
      db.appointments = db.appointments.filter(ap => !tutorMatches(ap.tutorId));
    }

    // Parent approvals
    if (db.parentApprovals) {
      db.parentApprovals = db.parentApprovals.filter(pa => !tutorMatches(pa.tutorId));
    }

    // Demo classes
    if (db.demoClasses) {
      db.demoClasses = db.demoClasses.filter(dc => !tutorMatches(dc.tutorId));
    }

    // Interviews
    if (db.interviews) {
      db.interviews = db.interviews.filter(iv => !tutorMatches(iv.tutorId));
    }

    // Tutor verification documents
    if (db.tutorDocuments) {
      db.tutorDocuments = db.tutorDocuments.filter(d => !tutorMatches(d.tutorId));
    }

    // WhatsApp messages & history
    if (db.whatsAppMessages) {
      db.whatsAppMessages = db.whatsAppMessages.filter(m => !tutorMatches(m.tutorId));
    }
    if (db.whatsAppContacts) {
      db.whatsAppContacts = db.whatsAppContacts.filter(c => !tutorMatches(c.tutorId));
    }
    if (db.whatsappHistory) {
      db.whatsappHistory = db.whatsappHistory.filter(h => !tutorMatches(h.tutorId));
    }
    if (db.whatsAppApiLogs) {
      db.whatsAppApiLogs = db.whatsAppApiLogs.filter(l => !tutorMatches(l.tutorId));
    }

    // Activity logs & notifications
    if (db.activityLogs) {
      db.activityLogs = db.activityLogs.filter(al => !tutorMatches(al.tutorId));
    }
    if (db.notifications) {
      db.notifications = db.notifications.filter(n => !(n.link && (n.link.includes(tutorId) || (altTutorId && n.link.includes(altTutorId)))));
    }

    // 2. Student Safety: unassign students, KEEP student records intact
    if (db.students) {
      db.students.forEach(s => {
        if (tutorMatches(s.assignedTutorId)) {
          s.assignedTutorId = null;
          if (s.status === 'TUTOR_ASSIGNED' || s.status === 'PENDING_MATCH') {
            s.status = 'LOOKING_FOR_TUTOR';
          }
        }
      });
    }

    // 3. Delete tutor record itself (permanently removing profile & auth record)
    db.tutors = (db.tutors || []).filter(t => t.id !== tutorId && t.tutorId !== altTutorId);

    // Commit Transaction: recalculate priorities and persist to disk
    triggerPriorityRecalculation();
    saveDB(db);

    // 4. File Cleanup: only after database transaction successfully committed
    filesToDelete.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileErr) {
        console.warn('Failed to clean up tutor file:', filePath, fileErr.message);
      }
    });

    return res.json({
      success: true,
      message: 'Tutor and all related details deleted permanently.'
    });
  } catch (err) {
    // Transaction Rollback: restore previous database snapshot
    db = dbSnapshot;
    saveDB(db);
    console.error('Error in permanent tutor deletion (rolled back):', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to delete tutor. No data was removed.'
    });
  }
});

// Validate Tutor (Applicable to both High Priority & Low Priority)
app.post('/api/tutors/:id/validate', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  tutor.isValidated = true;
  tutor.is_validated = true;
  tutor.status = 'VALIDATED';
  tutor.currentStage = 'DOCUMENT_VERIFICATION';
  tutor.current_stage = 'DOCUMENT_VERIFICATION';

  addLog(tutor.id, 'Admin', 'TUTOR_VALIDATED', 'Tutor validated and moved to Document Verification.');
  
  addNotification(
    'Tutor Validated',
    tutor.fullName + ' has been validated and moved to Document Verification.',
    'success',
    '/recruitment/document-verification'
  );

  saveDB(db);
  res.json({ success: true, tutor, message: 'Tutor validated and moved to Document Verification.' });
});

// Document verification endpoint
app.put('/api/tutors/:id/documents/:docId', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const doc = (db.tutorDocuments || []).find(d => d.id === req.params.docId && d.tutorId === tutor.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });

  const { status, remarks } = req.body;
  if (status) doc.status = status;
  if (remarks !== undefined) doc.remarks = remarks;
  doc.updatedAt = new Date().toISOString();

  addLog(tutor.id, 'Staff', 'DOCUMENT_STATUS_CHANGED', doc.docType + ' marked as ' + doc.status + '. Remarks: ' + (remarks || 'None'));

  // Re-check all documents for this tutor
  const tutorDocs = db.tutorDocuments.filter(d => d.tutorId === tutor.id);
  const anyRejected = tutorDocs.some(d => d.status === 'Rejected');
  const allVerified = tutorDocs.length > 0 && tutorDocs.every(d => d.status === 'Verified');

  if (anyRejected) {
    tutor.status = 'DOCUMENT_REJECTED';
    addNotification('Document Rejected', tutor.fullName + ' has one or more rejected documents.', 'danger', '/recruitment/document-verification');
  } else if (allVerified) {
    tutor.status = 'DOCUMENT_APPROVED';
    addNotification('Documents Approved', 'All documents for ' + tutor.fullName + ' verified successfully. Ready for Interview.', 'success', '/recruitment/document-verification');
  } else {
    tutor.status = 'DOCUMENT_VERIFICATION';
  }

  saveDB(db);
  res.json({ document: doc, tutor, allVerified, anyRejected });
});

// Move tutor to interview
app.post('/api/tutors/:id/move-to-interview', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const tutorDocs = db.tutorDocuments.filter(d => d.tutorId === tutor.id);
  const allVerified = tutorDocs.length > 0 && tutorDocs.every(d => d.status === 'Verified');
  
  if (!allVerified) {
    return res.status(400).json({ error: 'Cannot move to Interview until all required documents are verified!' });
  }

  tutor.status = 'INTERVIEW_SCHEDULED';
  
  let interview = (db.interviews || []).find(i => i.tutorId === tutor.id);
  if (!interview) {
    interview = {
      id: 'int-' + Date.now(),
      interviewId: 'INT-2026-' + (db.interviews.length + 1).toString().padStart(3, '0'),
      tutorId: tutor.id,
      date: req.body.date || '2026-09-08',
      time: req.body.time || '11:00 AM',
      interviewer: req.body.interviewer || 'Dr. K. Raghavan (Academic Lead)',
      type: req.body.type || 'Online',
      communicationRating: 0,
      subjectKnowledgeRating: 0,
      teachingAbilityRating: 0,
      overallRating: 0,
      result: 'Pending',
      comments: req.body.comments || 'Interview scheduled'
    };
    db.interviews.push(interview);
  }

  addLog(tutor.id, 'Staff', 'INTERVIEW_SCHEDULED', 'Interview scheduled with ' + interview.interviewer + ' for ' + interview.date + ' at ' + interview.time + '.');
  addNotification('Interview Scheduled', 'Interview scheduled for ' + tutor.fullName + '.', 'info', '/recruitment/interview');

  saveDB(db);
  res.json({ success: true, tutor, interview });
});

// Get all interviews
app.get('/api/interviews', (req, res) => {
  const interviewsWithDetails = (db.interviews || []).map(interview => {
    const tutor = db.tutors.find(t => t.id === interview.tutorId);
    return { ...interview, tutor };
  });
  res.json({ interviews: interviewsWithDetails });
});

// Submit interview evaluation (Atomic Transaction with Rollback)
app.put('/api/interviews/:id', (req, res) => {
  let interview = (db.interviews || []).find(i => i.id === req.params.id || i.interviewId === req.params.id);
  if (!interview && (req.body.tutorId || req.params.id.startsWith('int-'))) {
    const tutorId = req.body.tutorId || req.params.id.replace('int-', '');
    const t = (db.tutors || []).find(item => item.id === tutorId || item.tutorId === tutorId);
    if (t) {
      interview = {
        id: req.params.id.startsWith('int-') ? req.params.id : 'int-' + t.id,
        interviewId: 'INT-2026-' + ((db.interviews ? db.interviews.length : 0) + 1).toString().padStart(3, '0'),
        tutorId: t.id,
        date: req.body.date || new Date().toISOString().split('T')[0],
        time: req.body.time || '11:00 AM',
        interviewer: req.body.interviewer || 'Academic Panel Lead',
        type: req.body.type || 'Online',
        communicationRating: 0,
        subjectKnowledgeRating: 0,
        teachingAbilityRating: 0,
        overallRating: 0,
        result: 'Pending',
        comments: ''
      };
      if (!db.interviews) db.interviews = [];
      db.interviews.push(interview);
    }
  }

  if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

  // Take atomic transaction snapshot
  const dbSnapshot = JSON.stringify(db);

  try {
    const tutor = (db.tutors || []).find(t => t.id === interview.tutorId);
    const { communicationRating, subjectKnowledgeRating, teachingAbilityRating, overallRating, result, comments, interviewer } = req.body;

    if (communicationRating !== undefined) interview.communicationRating = Number(communicationRating);
    if (subjectKnowledgeRating !== undefined) interview.subjectKnowledgeRating = Number(subjectKnowledgeRating);
    if (teachingAbilityRating !== undefined) interview.teachingAbilityRating = Number(teachingAbilityRating);
    if (overallRating !== undefined) interview.overallRating = Number(overallRating);
    if (comments !== undefined) interview.comments = comments;
    if (interviewer) interview.interviewer = interviewer;

    const isSelected = result === 'SELECTED' || result === 'Selected';
    const isFailed = result === 'FAILED' || result === 'Failed' || result === 'REJECTED' || result === 'Rejected';
    const isOnHold = result === 'ON_HOLD' || result === 'On Hold' || result === 'OnHold';

    let demo = null;

    if (isSelected) {
      interview.result = 'SELECTED';
      interview.interviewResult = 'SELECTED';
      interview.status = 'INTERVIEW_SELECTED';

      if (tutor) {
        tutor.status = 'INTERVIEW_SELECTED';
        tutor.interviewResult = 'SELECTED';

        // Check if tutor already has an existing Demo Class record (prevent duplicates)
        demo = (db.demoClasses || []).find(d => d.tutorId === tutor.id);
        if (!demo) {
          demo = {
            id: 'dem-' + Date.now(),
            demoId: 'DEM-2026-' + ((db.demoClasses ? db.demoClasses.length : 0) + 1).toString().padStart(3, '0'),
            tutorId: tutor.id,
            studentId: null,
            subject: (tutor.subjects && tutor.subjects.length > 0) ? tutor.subjects[0] : null,
            class: null,
            demoDate: null,
            demoTime: null,
            date: null,
            time: null,
            location: tutor.preferredLocation || null,
            teachingMethod: null,
            adminRating: 0,
            studentRating: 0,
            parentRating: 0,
            status: 'DEMO_CLASS_PENDING',
            result: 'Pending',
            comments: 'Demo class pending scheduling.',
            createdAt: new Date().toISOString()
          };
          if (!db.demoClasses) db.demoClasses = [];
          db.demoClasses.push(demo);
        } else {
          // Update existing pending record
          if (demo.status !== 'DEMO_CLASS_SCHEDULED' && demo.status !== 'SCHEDULED' && demo.status !== 'DEMO_CLASS_COMPLETED' && demo.status !== 'COMPLETED') {
            demo.status = 'DEMO_CLASS_PENDING';
            demo.result = 'Pending';
          }
        }

        addLog(tutor.id, 'Interviewer', 'INTERVIEW_SELECTED', 'Interview result: SELECTED. Tutor moved to Demo Class.');
        addNotification('Interview Selected', 'Interview result saved as SELECTED. Tutor ' + tutor.fullName + ' moved to Demo Class.', 'success', '/recruitment/demo-classes');
      }
    } else if (isFailed) {
      interview.result = 'FAILED';
      interview.interviewResult = 'FAILED';
      interview.status = 'INTERVIEW_FAILED';

      if (tutor) {
        tutor.status = 'INTERVIEW_FAILED';
        tutor.interviewResult = 'FAILED';

        // Requirement 2 & 8: Ensure NO active Demo Class record for this failed tutor
        if (db.demoClasses) {
          db.demoClasses = db.demoClasses.filter(d => d.tutorId !== tutor.id);
        }

        addLog(tutor.id, 'Interviewer', 'INTERVIEW_FAILED', 'Interview result: FAILED. ' + (comments || 'Did not meet criteria.'));
        addNotification('Interview Result', tutor.fullName + ' failed the interview round.', 'danger', '/recruitment/interview');
      }
    } else if (isOnHold) {
      interview.result = 'ON_HOLD';
      interview.interviewResult = 'ON_HOLD';
      interview.status = 'INTERVIEW_ON_HOLD';

      if (tutor) {
        tutor.status = 'INTERVIEW_ON_HOLD';
        tutor.interviewResult = 'ON_HOLD';

        // Requirement 3: Ensure NO active Demo Class record for on-hold tutor
        if (db.demoClasses) {
          db.demoClasses = db.demoClasses.filter(d => d.tutorId !== tutor.id);
        }

        addLog(tutor.id, 'Interviewer', 'INTERVIEW_ON_HOLD', 'Interview placed on hold. Comments: ' + (comments || 'Under review.'));
        addNotification('Interview Result', tutor.fullName + ' placed on hold after interview.', 'warning', '/recruitment/interview');
      }
    } else {
      interview.result = result || 'Pending';
    }

    saveDB(db);
    return res.json({
      success: true,
      message: isSelected ? 'Interview selected. Tutor moved to Demo Class.' : isFailed ? 'Interview result saved as FAILED. Tutor kept in Interview Failed.' : 'Interview placed on hold.',
      interview,
      tutor,
      demo
    });
  } catch (err) {
    // Rollback atomic transaction
    db = normalizeDatabase(JSON.parse(dbSnapshot));
    console.error('Error in interview evaluation, rolled back:', err);
    return res.status(500).json({
      success: false,
      message: 'Unable to update interview evaluation. No changes were made.',
      error: err.message
    });
  }
});

// Get all demo classes with linked tutor and student details
app.get('/api/demos', (req, res) => {
  // Requirement 9: Demo Classes page must only display tutors who are not failed in interview
  const validDemos = (db.demoClasses || []).filter(demo => {
    const tutor = (db.tutors || []).find(t => t.id === demo.tutorId);
    const interview = (db.interviews || []).find(i => i.tutorId === demo.tutorId);
    if (tutor && (tutor.status === 'INTERVIEW_FAILED' || tutor.interviewResult === 'FAILED')) return false;
    if (interview && (interview.result === 'FAILED' || interview.interviewResult === 'FAILED' || interview.result === 'Rejected')) return false;
    return true;
  });

  const demosWithDetails = validDemos.map(demo => {
    const tutor = db.tutors.find(t => t.id === demo.tutorId);
    const student = db.students.find(s => s.id === demo.studentId);
    const interview = (db.interviews || []).find(i => i.tutorId === demo.tutorId);
    return {
      ...demo,
      tutor,
      student,
      interview
    };
  });
  res.json({ demoClasses: demosWithDetails });
});

// Move tutor to Demo Class (standalone trigger with strict validation)
app.post('/api/tutors/:id/move-to-demo', (req, res) => {
  const tutor = (db.tutors || []).find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

  const interview = (db.interviews || []).find(i => i.tutorId === tutor.id);

  // Requirement 5: If the interview result is FAILED, reject Demo Class creation
  if (
    tutor.status === 'INTERVIEW_FAILED' ||
    tutor.interviewResult === 'FAILED' ||
    (interview && (interview.result === 'FAILED' || interview.interviewResult === 'FAILED' || interview.result === 'Rejected'))
  ) {
    return res.status(400).json({
      success: false,
      message: 'Failed interview tutors cannot be moved to Demo Classes.'
    });
  }

  const isSelected =
    tutor.status === 'INTERVIEW_SELECTED' ||
    tutor.interviewResult === 'SELECTED' ||
    (interview && (interview.result === 'SELECTED' || interview.interviewResult === 'SELECTED' || interview.result === 'Selected'));

  if (!isSelected) {
    return res.status(400).json({
      success: false,
      message: 'Failed interview tutors cannot be moved to Demo Classes.'
    });
  }

  tutor.status = 'INTERVIEW_SELECTED';
  tutor.interviewResult = 'SELECTED';

  // Requirement 10: Prevent duplicate Demo Classes
  let demo = (db.demoClasses || []).find(d => d.tutorId === tutor.id);
  if (!demo) {
    demo = {
      id: 'dem-' + Date.now(),
      demoId: 'DEM-2026-' + ((db.demoClasses ? db.demoClasses.length : 0) + 1).toString().padStart(3, '0'),
      tutorId: tutor.id,
      studentId: req.body.studentId || null,
      subject: req.body.subject || (tutor.subjects && tutor.subjects[0]) || null,
      class: req.body.class || null,
      date: req.body.date || req.body.demoDate || null,
      demoDate: req.body.date || req.body.demoDate || null,
      time: req.body.time || req.body.demoTime || null,
      demoTime: req.body.time || req.body.demoTime || null,
      location: req.body.location || tutor.preferredLocation || null,
      teachingMethod: req.body.teachingMethod || null,
      adminRating: 0,
      studentRating: 0,
      parentRating: 0,
      status: (req.body.date && req.body.studentId) ? 'DEMO_CLASS_SCHEDULED' : 'DEMO_CLASS_PENDING',
      result: 'Pending',
      comments: req.body.comments || 'Demo class created',
      createdAt: new Date().toISOString()
    };
    if (!db.demoClasses) db.demoClasses = [];
    db.demoClasses.push(demo);
  } else {
    if (req.body.studentId) demo.studentId = req.body.studentId;
    if (req.body.subject) demo.subject = req.body.subject;
    if (req.body.class) demo.class = req.body.class;
    if (req.body.date) {
      demo.date = req.body.date;
      demo.demoDate = req.body.date;
    }
    if (req.body.time) {
      demo.time = req.body.time;
      demo.demoTime = req.body.time;
    }
    if (req.body.location) demo.location = req.body.location;
    if (demo.date && demo.studentId) {
      demo.status = 'DEMO_CLASS_SCHEDULED';
    } else if (demo.status !== 'DEMO_CLASS_SCHEDULED' && demo.status !== 'DEMO_CLASS_COMPLETED' && demo.status !== 'COMPLETED') {
      demo.status = 'DEMO_CLASS_PENDING';
    }
  }

  addLog(tutor.id, 'Interviewer', 'INTERVIEW_SELECTED', 'Interview selected. Tutor moved to Demo Class process.');
  addNotification('Interview Selected', 'Interview selected successfully. Tutor ' + tutor.fullName + ' moved to Demo Class.', 'success', '/recruitment/demo-classes');

  saveDB(db);
  res.json({ success: true, tutor, demo });
});

// Create demo class directly (with strict validation against FAILED interview tutors)
app.post('/api/demos', (req, res) => {
  const tutorId = req.body.tutorId;
  if (!tutorId) return res.status(400).json({ success: false, message: 'tutorId is required' });

  const tutor = (db.tutors || []).find(t => t.id === tutorId || t.tutorId === tutorId);
  if (!tutor) return res.status(404).json({ success: false, message: 'Tutor not found' });

  const interview = (db.interviews || []).find(i => i.tutorId === tutor.id);

  // Requirement 5: Check if FAILED
  if (
    tutor.status === 'INTERVIEW_FAILED' ||
    tutor.interviewResult === 'FAILED' ||
    (interview && (interview.result === 'FAILED' || interview.interviewResult === 'FAILED' || interview.result === 'Rejected'))
  ) {
    return res.status(400).json({
      success: false,
      message: 'Failed interview tutors cannot be moved to Demo Classes.'
    });
  }

  // Check if SELECTED
  const isSelected =
    tutor.status === 'INTERVIEW_SELECTED' ||
    tutor.interviewResult === 'SELECTED' ||
    (interview && (interview.result === 'SELECTED' || interview.interviewResult === 'SELECTED' || interview.result === 'Selected'));

  if (!isSelected) {
    return res.status(400).json({
      success: false,
      message: 'Failed interview tutors cannot be moved to Demo Classes.'
    });
  }

  tutor.status = 'INTERVIEW_SELECTED';
  tutor.interviewResult = 'SELECTED';

  // Prevent duplicates
  let demo = (db.demoClasses || []).find(d => d.tutorId === tutor.id);
  if (!demo) {
    demo = {
      id: 'dem-' + Date.now(),
      demoId: 'DEM-2026-' + ((db.demoClasses ? db.demoClasses.length : 0) + 1).toString().padStart(3, '0'),
      tutorId: tutor.id,
      studentId: req.body.studentId || null,
      subject: req.body.subject || (tutor.subjects && tutor.subjects[0]) || null,
      class: req.body.class || null,
      date: req.body.date || req.body.demoDate || null,
      demoDate: req.body.date || req.body.demoDate || null,
      time: req.body.time || req.body.demoTime || null,
      demoTime: req.body.time || req.body.demoTime || null,
      location: req.body.location || tutor.preferredLocation || null,
      teachingMethod: req.body.teachingMethod || null,
      adminRating: 0,
      studentRating: 0,
      parentRating: 0,
      status: (req.body.date && req.body.studentId) ? 'DEMO_CLASS_SCHEDULED' : 'DEMO_CLASS_PENDING',
      result: 'Pending',
      comments: req.body.comments || 'Demo class created',
      createdAt: new Date().toISOString()
    };
    if (!db.demoClasses) db.demoClasses = [];
    db.demoClasses.push(demo);
  } else {
    if (req.body.studentId) demo.studentId = req.body.studentId;
    if (req.body.subject) demo.subject = req.body.subject;
    if (req.body.class) demo.class = req.body.class;
    if (req.body.date) {
      demo.date = req.body.date;
      demo.demoDate = req.body.date;
    }
    if (req.body.time) {
      demo.time = req.body.time;
      demo.demoTime = req.body.time;
    }
    if (req.body.location) demo.location = req.body.location;
    if (demo.date && demo.studentId) {
      demo.status = 'DEMO_CLASS_SCHEDULED';
    } else if (demo.status !== 'DEMO_CLASS_SCHEDULED' && demo.status !== 'DEMO_CLASS_COMPLETED' && demo.status !== 'COMPLETED') {
      demo.status = 'DEMO_CLASS_PENDING';
    }
  }

  saveDB(db);
  res.json({ success: true, tutor, demo });
});

// Schedule an existing demo class
app.put('/api/demos/:id/schedule', (req, res) => {
  const demo = (db.demoClasses || []).find(d => d.id === req.params.id || d.demoId === req.params.id);
  if (!demo) return res.status(404).json({ success: false, message: 'Demo class not found' });

  const tutor = db.tutors.find(t => t.id === demo.tutorId);
  const { studentId, subject, class: studentClass, date, time, location, comments, teachingMethod } = req.body;

  if (studentId) demo.studentId = studentId;
  if (subject) demo.subject = subject;
  if (studentClass) demo.class = studentClass;
  if (date) {
    demo.date = date;
    demo.demoDate = date;
  }
  if (time) {
    demo.time = time;
    demo.demoTime = time;
  }
  if (location) demo.location = location;
  if (comments) demo.comments = comments;
  if (teachingMethod) demo.teachingMethod = teachingMethod;

  demo.status = 'DEMO_CLASS_SCHEDULED';
  demo.result = 'Pending';
  if (tutor) tutor.status = 'DEMO_CLASS_SCHEDULED';

  const student = db.students.find(s => s.id === demo.studentId);
  const studentName = student ? student.studentName : 'student';

  if (tutor) {
    addLog(tutor.id, 'Admin', 'DEMO_CLASS_SCHEDULED', 'Demo class scheduled with ' + studentName + ' on ' + (demo.date || '') + ' at ' + (demo.time || '') + ' for subject ' + (demo.subject || '') + '.');
    addNotification('Demo Class Scheduled', 'Demo class scheduled for ' + tutor.fullName + ' with ' + studentName + '.', 'info', '/recruitment/demo-classes');
  }

  saveDB(db);
  res.json({ success: true, demo, tutor });
});

// Submit demo class evaluation
app.put('/api/demos/:id', (req, res) => {
  const demo = (db.demoClasses || []).find(d => d.id === req.params.id || d.demoId === req.params.id);
  if (!demo) return res.status(404).json({ success: false, message: 'Demo class not found' });

  const tutor = db.tutors.find(t => t.id === demo.tutorId);
  const student = db.students.find(s => s.id === demo.studentId);
  const { adminRating, studentRating, parentRating, result, comments, teachingMethod } = req.body;

  if (adminRating !== undefined) demo.adminRating = Number(adminRating);
  if (studentRating !== undefined) demo.studentRating = Number(studentRating);
  if (parentRating !== undefined) demo.parentRating = Number(parentRating);
  if (result !== undefined) demo.result = result;
  if (comments !== undefined) demo.comments = comments;
  if (teachingMethod) demo.teachingMethod = teachingMethod;

  if (result === 'Passed' || result === 'PASSED' || result === 'DEMO_CLASS_PASSED') {
    demo.result = 'Passed';
    demo.status = 'DEMO_CLASS_PASSED';
    if (tutor) {
      tutor.status = 'DEMO_CLASS_PASSED';
      addLog(tutor.id, 'Academic Lead', 'DEMO_PASSED', 'Demo class passed with student rating ' + demo.studentRating + '/5.');
      
      // Automatically transition to PARENT_APPROVAL_PENDING
      tutor.status = 'PARENT_APPROVAL_PENDING';
      
      let approval = (db.parentApprovals || []).find(a => a.tutorId === tutor.id && a.demoId === demo.id);
      if (!approval) {
        approval = {
          id: 'appr-' + Date.now(),
          tutorId: tutor.id,
          parentId: student ? student.parentId : 'par-001',
          studentId: demo.studentId,
          demoId: demo.id,
          status: 'PENDING',
          rating: 0,
          feedback: '',
          comments: 'Awaiting parent review after demo class.',
          decidedAt: null
        };
        db.parentApprovals.push(approval);
      }
      
      addNotification('Parent Approval Pending', 'Demo passed for ' + tutor.fullName + '. Parent approval requested.', 'warning', '/recruitment/parent-approval');
    }
  } else if (result === 'Failed' || result === 'FAILED' || result === 'DEMO_CLASS_FAILED') {
    demo.result = 'Failed';
    demo.status = 'DEMO_CLASS_FAILED';
    if (tutor) {
      tutor.status = 'DEMO_CLASS_FAILED';
      addLog(tutor.id, 'Academic Lead', 'DEMO_FAILED', 'Demo class failed. Feedback: ' + comments);
      addNotification('Demo Class Result', 'Demo class failed for ' + tutor.fullName + '.', 'danger', '/recruitment/demo-classes');
    }
  } else {
    demo.result = 'Pending';
  }

  saveDB(db);
  res.json({ success: true, demo, tutor });
});

// Parent Approvals List & Decision
app.get('/api/parent-approvals', (req, res) => {
  res.json({ approvals: db.parentApprovals || [] });
});

app.post('/api/parent-approvals/:id/decide', (req, res) => {
  const approval = (db.parentApprovals || []).find(a => a.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Parent approval request not found' });

  const tutor = db.tutors.find(t => t.id === approval.tutorId);
  const { decision, rating, feedback, comments } = req.body;

  approval.rating = Number(rating) || 5;
  approval.feedback = feedback || '';
  approval.comments = comments || '';
  approval.decidedAt = new Date().toISOString();

  let appointment = null;

  if (decision === 'APPROVE') {
    approval.status = 'APPROVED';
    approval.approvalStatus = 'APPROVED';
    approval.approval_status = 'APPROVED';

    if (tutor) {
      tutor.status = 'TUTOR_APPOINTED';
      tutor.isAppointed = true;
      tutor.is_appointed = true;
      tutor.currentStage = 'TUTOR_APPOINTED';
      tutor.current_stage = 'TUTOR_APPOINTED';
    }

    // Lookup student and parent for appointment
    const student = (db.students || []).find(s => s.id === approval.studentId) || (db.students && db.students[0]);
    const parent = student ? (db.parents || []).find(p => p.id === student.parentId) : null;

    const appointmentId = 'APT-2026-' + ((db.appointments || []).length + 1).toString().padStart(3, '0');
    appointment = {
      id: 'apt-' + Date.now(),
      appointmentId,
      tutorId: tutor ? tutor.id : approval.tutorId,
      studentId: student ? student.id : 'stu-001',
      parentId: parent ? parent.id : (student ? student.parentId : 'par-001'),
      subject: approval.subject || (tutor && tutor.subjects && tutor.subjects[0]) || 'General',
      location: approval.location || (tutor && tutor.preferredLocation) || 'Student Residence',
      timing: approval.timing || (tutor && tutor.availableTiming) || '5:00 PM - 7:00 PM',
      salary: Number(tutor && tutor.expectedSalary) || 15000,
      startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    if (!db.appointments) db.appointments = [];
    db.appointments = db.appointments.filter(a => a.tutorId !== (tutor ? tutor.id : approval.tutorId));
    db.appointments.unshift(appointment);

    if (student && tutor) {
      student.assignedTutorId = tutor.id;
      student.status = 'TUTOR_ASSIGNED';
    }

    if (tutor) {
      addLog(tutor.id, 'Parent', 'TUTOR_APPOINTED', 'Parent approved tutor. Tutor appointed successfully.');
      addNotification('Parent Approved Tutor!', 'Parent approved ' + tutor.fullName + '. Tutor appointed successfully.', 'success', '/tutors/' + tutor.id);
    }
  } else {
    approval.status = 'REJECTED';
    approval.approvalStatus = 'REJECTED';
    approval.approval_status = 'REJECTED';
    if (tutor) tutor.status = 'PARENT_REJECTED';
    if (tutor) {
      addLog(tutor.id, 'Parent', 'PARENT_REJECTED', 'Parent rejected tutor. Feedback: "' + approval.feedback + '"');
      addNotification('Parent Rejected Tutor', 'Parent rejected ' + tutor.fullName + '.', 'danger', '/recruitment/parent-approval');
    }
  }

  saveDB(db);
  res.json({ success: true, approval, tutor, appointment });
});

// Appointments list endpoint
app.get('/api/appointments', (req, res) => {
  res.json({ appointments: db.appointments || [] });
});

// Final Tutor Appointment (Strict rule enforcement)
app.post('/api/appointments', (req, res) => {
  const { tutorId, studentId, startDate, timing, salary, subject, location } = req.body;
  const tutor = db.tutors.find(t => t.id === tutorId || t.tutorId === tutorId);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const student = db.students.find(s => s.id === studentId);
  const parent = student ? db.parents.find(p => p.id === student.parentId) : null;

  const tutorDocs = (db.tutorDocuments || []).filter(d => d.tutorId === tutor.id);
  const docsVerified = tutorDocs.length > 0 && tutorDocs.every(d => d.status === 'Verified');
  const tutorInterview = (db.interviews || []).find(i => i.tutorId === tutor.id && i.result === 'Selected');
  const tutorDemo = (db.demoClasses || []).find(d => d.tutorId === tutor.id && d.result === 'Passed');
  const parentApproval = (db.parentApprovals || []).find(p => p.tutorId === tutor.id && p.status === 'APPROVED');

  const checkFailures = [];
  if (!docsVerified && tutor.status !== 'PARENT_APPROVED' && tutor.status !== 'TUTOR_APPOINTED' && tutor.status !== 'ACTIVE') {
    checkFailures.push('All documents must be verified');
  }
  if (!tutorInterview && tutor.status !== 'PARENT_APPROVED' && tutor.status !== 'TUTOR_APPOINTED' && tutor.status !== 'ACTIVE') {
    checkFailures.push('Interview must be selected / passed');
  }
  if (!tutorDemo && tutor.status !== 'PARENT_APPROVED' && tutor.status !== 'TUTOR_APPOINTED' && tutor.status !== 'ACTIVE') {
    checkFailures.push('Demo class must be passed');
  }
  if (!parentApproval && tutor.status !== 'PARENT_APPROVED' && tutor.status !== 'TUTOR_APPOINTED' && tutor.status !== 'ACTIVE') {
    checkFailures.push('Parent approval must be completed');
  }

  if (checkFailures.length > 0 && tutor.status !== 'PARENT_APPROVED') {
    return res.status(400).json({
      error: 'Cannot appoint tutor. Prerequisites not met: ' + checkFailures.join(', ')
    });
  }

  const appointmentId = 'APT-2026-' + (db.appointments.length + 1).toString().padStart(3, '0');
  const newAppointment = {
    id: 'apt-' + Date.now(),
    appointmentId,
    tutorId: tutor.id,
    studentId: student ? student.id : 'stu-001',
    parentId: parent ? parent.id : (student ? student.parentId : 'par-001'),
    subject: subject || (tutor.subjects && tutor.subjects[0]) || 'General',
    location: location || tutor.preferredLocation || 'Centre / Residence',
    timing: timing || tutor.availableTiming || '5:00 PM - 7:00 PM',
    salary: Number(salary) || tutor.expectedSalary || 15000,
    startDate: startDate || new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  };

  db.appointments.push(newAppointment);

  tutor.status = 'ACTIVE';
  tutor.result = 'Passed';

  if (student) {
    student.assignedTutorId = tutor.id;
    student.status = 'TUTOR_ASSIGNED';
  }

  addLog(tutor.id, 'Admin', 'TUTOR_APPOINTED', 'Tutor ' + tutor.fullName + ' successfully appointed for student ' + (student ? student.studentName : 'Student') + ' (' + appointmentId + ').');
  addNotification('?? Tutor Appointed!', tutor.fullName + ' has been appointed as Active Tutor (' + appointmentId + ').', 'success', '/tutors/' + tutor.id);

  saveDB(db);
  res.status(201).json({ success: true, appointment: newAppointment, tutor, student });
});

// Students CRUD

// =========================================================================
// TUTOR-STUDENT ASSIGNMENTS API (Add New Student to Appointed Tutor)
// =========================================================================

function enrichAssignment(assignment) {
  const tutor = (db.tutors || []).find(t => t.id === assignment.tutorId);
  const student = (db.students || []).find(s => s.id === assignment.studentId);
  return {
    ...assignment,
    tutor: tutor || null,
    student: student || null,
    tutorName: tutor ? tutor.fullName : 'Appointed Tutor',
    tutorPhone: tutor ? (tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone) : '—',
    tutorSubjects: tutor ? tutor.subjects : [],
    tutorLocation: tutor ? tutor.preferredLocation : '—',
    studentName: student ? student.studentName : 'Assigned Student',
    studentPhone: student ? (student.phone || student.parentPhone) : '—',
    studentClass: student ? student.class : assignment.class,
    studentLocation: student ? student.location : assignment.location,
    parentPhone: student ? student.parentPhone : '—'
  };
}

// 1. Get All Tutor-Student Assignments
app.get('/api/tutor-student-assignments', (req, res) => {
  if (!db.tutorStudentAssignments) db.tutorStudentAssignments = [];
  let list = [...db.tutorStudentAssignments];
  const { tutorId, studentId, status, subject } = req.query;

  if (tutorId) {
    list = list.filter(a => a.tutorId === tutorId);
  }
  if (studentId) {
    list = list.filter(a => a.studentId === studentId);
  }
  if (status && status !== 'ALL') {
    list = list.filter(a => (a.status || '').toUpperCase() === status.toUpperCase());
  }
  if (subject && subject !== 'ALL') {
    list = list.filter(a => (a.subject || '').toLowerCase().includes(subject.toLowerCase()));
  }

  const enriched = list.map(enrichAssignment);
  res.json({
    success: true,
    assignments: enriched,
    total: enriched.length
  });
});

// 2. Metrics for Appointed Tutors & Assignments
app.get('/api/tutor-student-assignments/metrics', (req, res) => {
  if (!db.tutorStudentAssignments) db.tutorStudentAssignments = [];
  const assignments = db.tutorStudentAssignments;
  const tutors = db.tutors || [];
  const students = db.students || [];

  // Appointed tutors
  const appointedTutors = tutors.filter(t =>
    t.status === 'TUTOR_APPOINTED' ||
    t.status === 'ACTIVE' ||
    t.isAppointed === true ||
    t.is_appointed === true ||
    (db.appointments || []).some(a => a.tutorId === t.id && a.status === 'ACTIVE')
  );

  const totalAppointedTutors = appointedTutors.length;
  const activeAssignments = assignments.filter(a => a.status === 'ACTIVE');

  // Unique students with at least 1 ACTIVE assignment
  const activeStudentIds = new Set(activeAssignments.map(a => a.studentId));
  const totalAssignedStudents = activeStudentIds.size;

  // Unassigned students = students with no ACTIVE assignment
  const unassignedStudents = students.filter(s => !activeStudentIds.has(s.id)).length;

  // Tutors with no active student assignments
  const activeTutorIds = new Set(activeAssignments.map(a => a.tutorId));
  const tutorsWithNoStudents = appointedTutors.filter(t => !activeTutorIds.has(t.id)).length;

  res.json({
    success: true,
    metrics: {
      totalAppointedTutors,
      totalAssignedStudents,
      activeAssignments: activeAssignments.length,
      unassignedStudents,
      tutorsWithNoStudents
    }
  });
});

// 3. Create New Tutor-Student Assignment
app.post('/api/tutor-student-assignments', (req, res) => {
  if (!db.tutorStudentAssignments) db.tutorStudentAssignments = [];

  const {
    tutorId,
    studentId,
    subject,
    class: studentClass,
    lessonType,
    days,
    startTime,
    endTime,
    location,
    monthlyFee,
    hourlyFee,
    startDate,
    notes
  } = req.body;

  // Validation 1: Required fields
  if (!tutorId || !studentId || !subject || !startDate) {
    return res.status(400).json({
      error: 'Tutor, Student, Subject, and Start Date are required.'
    });
  }

  // Validation 2: Tutor exists and is appointed / active
  const tutor = (db.tutors || []).find(t => t.id === tutorId || t.tutorId === tutorId);
  if (!tutor) {
    return res.status(404).json({ error: 'Appointed tutor not found.' });
  }

  const isAppointed =
    tutor.status === 'TUTOR_APPOINTED' ||
    tutor.status === 'ACTIVE' ||
    tutor.isAppointed === true ||
    tutor.is_appointed === true ||
    (db.appointments || []).some(a => a.tutorId === tutor.id && a.status === 'ACTIVE');

  if (!isAppointed) {
    return res.status(400).json({
      error: `Tutor ${tutor.fullName} is not currently appointed. Recruitment status must be APPOINTED.`
    });
  }

  // Validation 3: Student exists
  const student = (db.students || []).find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student record not found.' });
  }

  // Validation 4: Duplicate active assignment check
  const duplicateActive = db.tutorStudentAssignments.find(
    a =>
      a.tutorId === tutor.id &&
      a.studentId === student.id &&
      (a.subject || '').toLowerCase() === subject.toLowerCase() &&
      a.status === 'ACTIVE'
  );

  if (duplicateActive) {
    return res.status(400).json({
      error: `Tutor ${tutor.fullName} is already actively assigned to ${student.studentName} for ${subject}. Duplicate active assignment is prevented.`
    });
  }

  // Soft Warnings (Non-blocking alerts)
  const warnings = [];

  // Subject compatibility check
  const tutorSubjects = Array.isArray(tutor.subjects) ? tutor.subjects : [tutor.subjects || ''];
  const teachesSubject = tutorSubjects.some(s =>
    s.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(s.toLowerCase())
  );
  if (!teachesSubject) {
    warnings.push(`Tutor's listed subjects (${tutorSubjects.join(', ')}) do not explicitly list '${subject}'.`);
  }

  // Location mismatch check
  const effectiveLocation = location || student.location || '';
  if (tutor.preferredLocation && effectiveLocation &&
      !tutor.preferredLocation.toLowerCase().includes(effectiveLocation.toLowerCase()) &&
      !effectiveLocation.toLowerCase().includes(tutor.preferredLocation.toLowerCase())) {
    warnings.push(`Location mismatch: Tutor prefers '${tutor.preferredLocation}', but tuition location is '${effectiveLocation}'.`);
  }

  // Timing overlap check against tutor's other active lessons
  const selectedDays = Array.isArray(days) ? days : (days ? [days] : ['Monday', 'Wednesday', 'Friday']);
  const otherTutorActive = db.tutorStudentAssignments.filter(a => a.tutorId === tutor.id && a.status === 'ACTIVE');
  for (const existing of otherTutorActive) {
    const existingDays = Array.isArray(existing.days) ? existing.days : [existing.days];
    const commonDays = selectedDays.filter(d => existingDays.includes(d));
    if (commonDays.length > 0 && startTime && existing.startTime === startTime) {
      warnings.push(`Timing overlap on ${commonDays.join(', ')}: Tutor already has an active lesson at ${existing.startTime} with another student.`);
      break;
    }
  }

  const now = new Date().toISOString();
  const assignmentId = 'tsa-' + Date.now();
  const newAssignment = {
    id: assignmentId,
    tutorId: tutor.id,
    studentId: student.id,
    subject,
    class: studentClass || student.class || 'Standard',
    lessonType: lessonType || 'Home Tuition',
    days: selectedDays,
    startTime: startTime || '05:00 PM',
    endTime: endTime || '07:00 PM',
    location: effectiveLocation,
    monthlyFee: Number(monthlyFee) || 5000,
    hourlyFee: hourlyFee ? Number(hourlyFee) : undefined,
    startDate,
    status: 'ACTIVE',
    notes: notes || '',
    createdAt: now,
    updatedAt: now
  };

  db.tutorStudentAssignments.unshift(newAssignment);

  // Update student status & assignedTutorId without modifying original contact information
  student.status = 'TUTOR_ASSIGNED';
  student.assignedTutorId = tutor.id;

  // Activity Log
  addLog(
    tutor.id,
    'Admin',
    'STUDENT_ASSIGNED',
    `Assigned student ${student.studentName} (${subject}) to appointed tutor ${tutor.fullName}.`
  );
  addNotification(
    'Student Assigned to Tutor',
    `${student.studentName} has been assigned to ${tutor.fullName} for ${subject}.`,
    'success',
    '/appointed-tutors'
  );

  saveDB(db);

  res.status(201).json({
    success: true,
    message: 'Student assigned successfully.',
    assignment: enrichAssignment(newAssignment),
    warnings
  });
});

// 4. Update Tutor-Student Assignment
app.put('/api/tutor-student-assignments/:id', (req, res) => {
  if (!db.tutorStudentAssignments) db.tutorStudentAssignments = [];
  const assignment = db.tutorStudentAssignments.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const {
    subject,
    class: studentClass,
    lessonType,
    days,
    startTime,
    endTime,
    location,
    monthlyFee,
    hourlyFee,
    startDate,
    notes,
    status
  } = req.body;

  if (subject !== undefined) assignment.subject = subject;
  if (studentClass !== undefined) assignment.class = studentClass;
  if (lessonType !== undefined) assignment.lessonType = lessonType;
  if (days !== undefined) assignment.days = Array.isArray(days) ? days : [days];
  if (startTime !== undefined) assignment.startTime = startTime;
  if (endTime !== undefined) assignment.endTime = endTime;
  if (location !== undefined) assignment.location = location;
  if (monthlyFee !== undefined) assignment.monthlyFee = Number(monthlyFee);
  if (hourlyFee !== undefined) assignment.hourlyFee = Number(hourlyFee);
  if (startDate !== undefined) assignment.startDate = startDate;
  if (notes !== undefined) assignment.notes = notes;
  if (status !== undefined && ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    assignment.status = status;
  }
  assignment.updatedAt = new Date().toISOString();

  saveDB(db);
  res.json({
    success: true,
    message: 'Assignment updated successfully.',
    assignment: enrichAssignment(assignment)
  });
});

// 5. Update Status (Pause, Resume, Complete, Cancel)
app.patch('/api/tutor-student-assignments/:id/status', (req, res) => {
  if (!db.tutorStudentAssignments) db.tutorStudentAssignments = [];
  const assignment = db.tutorStudentAssignments.find(a => a.id === req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  const { status } = req.body;
  const validStatuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  assignment.status = status;
  assignment.updatedAt = new Date().toISOString();

  // If student no longer has any ACTIVE assignment, transition student status back to PENDING_MATCH
  const student = (db.students || []).find(s => s.id === assignment.studentId);
  if (student) {
    const hasOtherActive = db.tutorStudentAssignments.some(
      a => a.studentId === student.id && a.status === 'ACTIVE'
    );
    if (!hasOtherActive && status !== 'ACTIVE') {
      student.status = 'PENDING_MATCH';
    } else if (status === 'ACTIVE') {
      student.status = 'TUTOR_ASSIGNED';
      student.assignedTutorId = assignment.tutorId;
    }
  }

  saveDB(db);

  addLog(
    assignment.tutorId,
    'Admin',
    'ASSIGNMENT_STATUS_UPDATED',
    `Assignment ${assignment.id} status updated to ${status}.`
  );

  res.json({
    success: true,
    message: `Assignment status updated to ${status}.`,
    assignment: enrichAssignment(assignment)
  });
});


app.get('/api/students', (req, res) => {
  let list = [...(db.students || [])];
  const { search, class: studentClass, platform } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s =>
      (s.studentName && s.studentName.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.externalLeadId && s.externalLeadId.toLowerCase().includes(q)) ||
      (s.phone && s.phone.includes(q)) ||
      (s.parentPhone && s.parentPhone.includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.parentEmail && s.parentEmail.toLowerCase().includes(q)) ||
      (s.class && s.class.toLowerCase().includes(q))
    );
  }

  if (studentClass && studentClass !== 'ALL') {
    list = list.filter(s => s.class === studentClass);
  }

  if (platform && platform !== 'ALL') {
    list = list.filter(s => s.platform && s.platform.toLowerCase() === platform.toLowerCase());
  }

  res.json({ students: list, total: list.length });
});

app.post('/api/students', (req, res) => {
  const nextNum = (db.students.length + 1).toString().padStart(3, '0');
  const newStudent = {
    id: 'stu-' + nextNum,
    studentId: 'STU-2026-' + nextNum,
    studentName: req.body.studentName || 'Student Name',
    gender: req.body.gender || 'Male',
    dob: req.body.dob || '2010-01-01',
    class: req.body.class || '10th Standard',
    school: req.body.school || 'School',
    requiredSubjects: Array.isArray(req.body.requiredSubjects) ? req.body.requiredSubjects : [req.body.requiredSubjects || 'Mathematics'],
    learningRequirements: req.body.learningRequirements || 'Concept coaching',
    location: req.body.location || 'Tiruchirappalli',
    preferredTiming: req.body.preferredTiming || '5:00 PM',
    budget: Number(req.body.budget) || 15000,
    assignedTutorId: req.body.assignedTutorId || null,
    parentId: req.body.parentId || 'par-001',
    status: req.body.assignedTutorId ? 'TUTOR_ASSIGNED' : 'LOOKING_FOR_TUTOR'
  };

  db.students.unshift(newStudent);
  triggerPriorityRecalculation();
  const parent = db.parents.find(p => p.id === newStudent.parentId);
  if (parent) {
    if (!parent.studentIds) parent.studentIds = [];
    if (!parent.studentIds.includes(newStudent.id)) parent.studentIds.push(newStudent.id);
  }

  saveDB(db);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', (req, res) => {
  const index = db.students.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });
  db.students[index] = { ...db.students[index], ...req.body };
  triggerPriorityRecalculation();
  saveDB(db);
  res.json(db.students[index]);
});

app.delete('/api/students/:id', (req, res) => {
  db.students = db.students.filter(s => s.id !== req.params.id);
  triggerPriorityRecalculation();
  saveDB(db);
  res.json({ success: true, message: 'Student deleted successfully' });
});

// Parents CRUD
app.get('/api/parents', (req, res) => {
  res.json({ parents: db.parents || [] });
});

app.post('/api/parents', (req, res) => {
  const nextNum = (db.parents.length + 1).toString().padStart(3, '0');
  const newParent = {
    id: 'par-' + nextNum,
    parentId: 'PAR-2026-' + nextNum,
    parentName: req.body.parentName || 'Parent Name',
    mobile: req.body.mobile || '',
    whatsapp: req.body.whatsapp || req.body.mobile || '',
    email: req.body.email || '',
    address: req.body.address || '',
    occupation: req.body.occupation || '',
    budget: Number(req.body.budget) || 15000,
    tutorPreference: req.body.tutorPreference || 'Experienced tutor',
    studentIds: req.body.studentIds || []
  };

  db.parents.unshift(newParent);
  saveDB(db);
  res.status(201).json(newParent);
});

app.put('/api/parents/:id', (req, res) => {
  const index = db.parents.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Parent not found' });
  db.parents[index] = { ...db.parents[index], ...req.body };
  saveDB(db);
  res.json(db.parents[index]);
});

app.delete('/api/parents/:id', (req, res) => {
  db.parents = db.parents.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Parent deleted successfully' });
});

// Tutor-Student Matching System
app.post('/api/matching', (req, res) => {
  const { studentId, subject, location, timing, budget } = req.body;
  let targetStudent = null;
  if (studentId) {
    targetStudent = db.students.find(s => s.id === studentId || s.studentId === studentId);
  }

  const reqSubject = (subject || (targetStudent && targetStudent.requiredSubjects && targetStudent.requiredSubjects[0]) || 'Mathematics').toLowerCase();
  const reqLocation = (location || (targetStudent && targetStudent.location) || 'Tiruchirappalli').toLowerCase();
  const reqTiming = (timing || (targetStudent && targetStudent.preferredTiming) || '5:00 PM').toLowerCase();
  const reqBudget = Number(budget || (targetStudent && targetStudent.budget) || 15000);

  const scoredTutors = db.tutors.map(tutor => {
    let score = 0;
    const breakdown = [];

    // 1. Subject Match (35%)
    const hasSubject = tutor.subjects && tutor.subjects.some(s => s.toLowerCase().includes(reqSubject) || reqSubject.includes(s.toLowerCase()));
    if (hasSubject) {
      score += 35;
      breakdown.push({ criteria: 'Subject Expertise', score: 35, max: 35, match: true });
    } else {
      breakdown.push({ criteria: 'Subject Expertise', score: 0, max: 35, match: false });
    }

    // 2. Location Match (25%)
    const locMatch = tutor.preferredLocation && (
      tutor.preferredLocation.toLowerCase().includes(reqLocation) ||
      reqLocation.includes(tutor.preferredLocation.toLowerCase())
    );
    if (locMatch) {
      score += 25;
      breakdown.push({ criteria: 'Location Proximity', score: 25, max: 25, match: true });
    } else {
      score += 10;
      breakdown.push({ criteria: 'Location (Commute/Remote)', score: 10, max: 25, match: false });
    }

    // 3. Timing Match (15%)
    const tutorTiming = (tutor.availableTiming || '').toLowerCase();
    const timeMatch = tutorTiming.includes('5:00') || tutorTiming.includes('flexible') || tutorTiming.includes('pm');
    if (timeMatch) {
      score += 15;
      breakdown.push({ criteria: 'Available Timing', score: 15, max: 15, match: true });
    } else {
      score += 8;
      breakdown.push({ criteria: 'Available Timing', score: 8, max: 15, match: false });
    }

    // 4. Experience & Qualification (10%)
    if (tutor.experienceYears >= 5) {
      score += 10;
      breakdown.push({ criteria: 'Experience (5+ yrs)', score: 10, max: 10, match: true });
    } else {
      const expPoints = Math.min(10, tutor.experienceYears * 2);
      score += expPoints;
      breakdown.push({ criteria: 'Experience', score: expPoints, max: 10, match: expPoints >= 6 });
    }

    // 5. Budget Match (10%)
    if (tutor.expectedSalary <= reqBudget) {
      score += 10;
      breakdown.push({ criteria: 'Budget Feasibility', score: 10, max: 10, match: true });
    } else if (tutor.expectedSalary <= reqBudget * 1.2) {
      score += 5;
      breakdown.push({ criteria: 'Budget Feasibility', score: 5, max: 10, match: false });
    } else {
      breakdown.push({ criteria: 'Budget Feasibility', score: 0, max: 10, match: false });
    }

    // 6. Priority Bonus (5%)
    if (tutor.priority === 'HIGH_PRIORITY') {
      score += 5;
      breakdown.push({ criteria: 'High Priority Boost', score: 5, max: 5, match: true });
    } else {
      score += 2;
      breakdown.push({ criteria: 'Priority Level', score: 2, max: 5, match: false });
    }

    return {
      tutor,
      matchScore: Math.min(100, score),
      breakdown
    };
  });

  scoredTutors.sort((a, b) => b.matchScore - a.matchScore);

  res.json({
    student: targetStudent,
    requirements: { subject: reqSubject, location: reqLocation, timing: reqTiming, budget: reqBudget },
    recommendations: scoredTutors.slice(0, 10)
  });
});

// Helper to extract value from row with flexible header aliases
function getFieldVal(row, possibleKeys) {
  if (!row || typeof row !== 'object') return '';
  const normalize = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const rowKeys = Object.keys(row);
  for (const pk of possibleKeys) {
    const npk = normalize(pk);
    for (const rk of rowKeys) {
      if (normalize(rk) === npk) {
        const val = row[rk];
        if (val !== undefined && val !== null) {
          return String(val).trim();
        }
      }
    }
  }
  return '';
}

// Excel Bulk Import with Row-Level Validation & Duplicate Detection
app.post('/api/import/:type', (req, res) => {
  const { type } = req.params;
  const { rows, commit } = req.body;

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of rows.' });
  }

  const validRecords = [];
  const duplicateRecords = [];
  const invalidRecords = [];
  const errors = [];

  // Existing databases lookup sets for instant duplicate detection
  const existingTutorLeadIds = new Set((db.tutors || []).map(t => t.externalLeadId).filter(Boolean));
  const existingTutorPhones = new Set((db.tutors || []).map(t => cleanPhone(t.mobile || t.phone)).filter(Boolean));
  const existingTutorEmails = new Set((db.tutors || []).map(t => (t.email || '').toLowerCase().trim()).filter(Boolean));

  const existingStudentLeadIds = new Set((db.students || []).map(s => s.externalLeadId).filter(Boolean));
  const existingStudentPhones = new Set((db.students || []).map(s => cleanPhone(s.parentPhone || s.phone)).filter(Boolean));
  const existingStudentEmails = new Set((db.students || []).map(s => (s.parentEmail || s.email || '').toLowerCase().trim()).filter(Boolean));

  // Batch-level seen sets to prevent duplicates within the uploaded file
  const batchTutorLeadIds = new Set();
  const batchTutorPhones = new Set();
  const batchTutorEmails = new Set();

  const batchStudentLeadIds = new Set();
  const batchStudentPhones = new Set();
  const batchStudentEmails = new Set();

  rows.forEach((row, idx) => {
    const rowNum = idx + 2;
    const rowErrors = [];

    if (type === 'tutors' || type === 'teachers') {
      const externalLeadId = getFieldVal(row, ['id', 'lead id', 'lead_id', 'externalleadid', 'external lead id', 'lead']);
      const fullName = getFieldVal(row, ['full name', 'full_name', 'tutor name', 'teacher name', 'name']);
      const rawPhone = getFieldVal(row, ['phone number', 'phone_number', 'mobile', 'mobile number', 'phone', 'contact']);
      const cleanedPhone = cleanPhone(rawPhone);
      const email = getFieldVal(row, ['email', 'email address', 'e-mail']);
      const cleanEmail = email.toLowerCase();
      const subjectsStr = getFieldVal(row, ['which subjects can you teach', 'which_subjects_can_you_teach?', 'subjects', 'subject']);
      const expStr = getFieldVal(row, ['how much teaching experience do you have', 'how_much_teaching_experience_do_you_have?', 'experience', 'teaching experience']);
      const homeTuitionStr = getFieldVal(row, ['are you comfortable providing home tuition', 'are_you_comfortable_providing_home_tuition?', 'home tuition available', 'home_tuition_available', 'home tuition', 'hometuition']);
      const platform = getFieldVal(row, ['platform', 'lead source', 'source']) || 'fb';
      const campaignName = getFieldVal(row, ['campaign name', 'campaign_name', 'campaign']) || 'TEACHERS WANTED';
      const adName = getFieldVal(row, ['ad name', 'ad_name', 'ad']) || 'Lead Ad';
      const createdAt = getFieldVal(row, ['created time', 'created_time', 'created date', 'application date', 'date']) || new Date().toISOString();

      if (!fullName) rowErrors.push('Full Name is missing');
      if (!cleanedPhone && !cleanEmail) rowErrors.push('Phone Number or Email is required');

      // Duplicate Check: externalLeadId, phoneNumber, email
      let isDuplicate = false;
      let dupReason = '';

      if (externalLeadId) {
        if (existingTutorLeadIds.has(externalLeadId) || batchTutorLeadIds.has(externalLeadId)) {
          isDuplicate = true;
          dupReason = `Lead ID '${externalLeadId}' already exists`;
        }
      }
      if (!isDuplicate && cleanedPhone) {
        if (existingTutorPhones.has(cleanedPhone) || batchTutorPhones.has(cleanedPhone)) {
          isDuplicate = true;
          dupReason = `Phone Number '${cleanedPhone}' already registered`;
        }
      }
      if (!isDuplicate && cleanEmail) {
        if (existingTutorEmails.has(cleanEmail) || batchTutorEmails.has(cleanEmail)) {
          isDuplicate = true;
          dupReason = `Email '${cleanEmail}' already registered`;
        }
      }

      if (isDuplicate) {
        duplicateRecords.push({ rowNum, data: row, reason: dupReason });
        errors.push(`Row ${rowNum}: ${dupReason}`);
      } else if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(`Row ${rowNum}: ${err}`));
      } else {
        if (externalLeadId) batchTutorLeadIds.add(externalLeadId);
        if (cleanedPhone) batchTutorPhones.add(cleanedPhone);
        if (cleanEmail) batchTutorEmails.add(cleanEmail);

        // Parse numerical experience years
        let expYears = 0;
        const nums = expStr.match(/\d+/);
        if (nums) expYears = Number(nums[0]);

        // Parse subjects
        const subjects = subjectsStr ? subjectsStr.split(/[,/&]/).map(s => s.trim()).filter(Boolean) : ['General'];

        const nextNum = (db.tutors.length + validRecords.length + 1).toString().padStart(3, '0');
        validRecords.push({
          id: 'tut-imp-' + Date.now() + '-' + validRecords.length,
          tutorId: 'TUT-2026-' + nextNum,
          externalLeadId: externalLeadId || 'Not Provided',
          fullName,
          mobile: cleanedPhone,
          phone: cleanedPhone,
          whatsapp: cleanedPhone,
          email,
          gender: 'Not Provided',
          dob: 'Not Provided',
          qualification: 'Not Provided',
          specialization: 'Not Provided',
          experience: expStr || 'Not Provided',
          experienceYears: expYears,
          subjects,
          subjectsText: subjectsStr,
          homeTuitionAvailable: homeTuitionStr.toLowerCase() === 'no' ? 'no' : 'yes',
          preferredLocation: 'Not Provided',
          availableTiming: 'Not Provided',
          expectedSalary: 0,
          documents: 'Not Provided',
          interviewResult: 'Not Provided',
          demoClassResult: 'Not Provided',
          resume: '',
          photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          priority: 'NOT_ASSIGNED',
          status: 'NEW_APPLICATION',
          result: 'Pending',
          platform,
          campaignName,
          adName,
          createdAt
        });
      }
    } else if (type === 'students') {
      const externalLeadId = getFieldVal(row, ['id', 'lead id', 'lead_id', 'externalleadid', 'lead']);
      const studentName = getFieldVal(row, ['full name', 'full_name', 'student name', 'student_name', 'name']);
      const rawPhone = getFieldVal(row, ['phone number', 'phone_number', 'parent contact number', 'parent phone', 'mobile', 'phone', 'contact']);
      const cleanedPhone = cleanPhone(rawPhone);
      const email = getFieldVal(row, ['email', 'parent email', 'contact email', 'email address']);
      const cleanEmail = email.toLowerCase();
      const studentClass = getFieldVal(row, ['student class', 'child class', 'class', 'உங்கள்_பிள்ளை_எந்த_வகுப்பில்_படிக்கிறார்?', 'standard', 'grade']) || 'Not Provided';
      const platform = getFieldVal(row, ['platform', 'lead source', 'source']) || 'fb';
      const campaignName = getFieldVal(row, ['campaign name', 'campaign_name', 'campaign']) || 'Tution';
      const adName = getFieldVal(row, ['ad name', 'ad_name', 'ad']) || 'Lead Ad';
      const createdAt = getFieldVal(row, ['created time', 'created_time', 'created date', 'date']) || new Date().toISOString();

      if (!studentName) rowErrors.push('Student Name is missing');

      // Duplicate Check: externalLeadId, contactPhone, contactEmail
      let isDuplicate = false;
      let dupReason = '';

      if (externalLeadId) {
        if (existingStudentLeadIds.has(externalLeadId) || batchStudentLeadIds.has(externalLeadId)) {
          isDuplicate = true;
          dupReason = `Lead ID '${externalLeadId}' already exists`;
        }
      }
      if (!isDuplicate && cleanedPhone) {
        if (existingStudentPhones.has(cleanedPhone) || batchStudentPhones.has(cleanedPhone)) {
          isDuplicate = true;
          dupReason = `Phone Number '${cleanedPhone}' already registered`;
        }
      }
      if (!isDuplicate && cleanEmail) {
        if (existingStudentEmails.has(cleanEmail) || batchStudentEmails.has(cleanEmail)) {
          isDuplicate = true;
          dupReason = `Email '${cleanEmail}' already registered`;
        }
      }

      if (isDuplicate) {
        duplicateRecords.push({ rowNum, data: row, reason: dupReason });
        errors.push(`Row ${rowNum}: ${dupReason}`);
      } else if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(`Row ${rowNum}: ${err}`));
      } else {
        if (externalLeadId) batchStudentLeadIds.add(externalLeadId);
        if (cleanedPhone) batchStudentPhones.add(cleanedPhone);
        if (cleanEmail) batchStudentEmails.add(cleanEmail);

        const nextNum = (db.students.length + validRecords.length + 1).toString().padStart(3, '0');
        const parNum = (db.parents.length + validRecords.length + 1).toString().padStart(3, '0');
        const parentId = 'par-' + parNum;

        validRecords.push({
          id: 'stu-imp-' + Date.now() + '-' + validRecords.length,
          studentId: 'STU-2026-' + nextNum,
          externalLeadId: externalLeadId || 'Not Provided',
          studentName,
          phone: cleanedPhone,
          parentPhone: cleanedPhone,
          email,
          parentEmail: email,
          gender: 'Not Provided',
          dob: 'Not Provided',
          class: studentClass,
          school: 'Not Provided',
          requiredSubjects: ['Not Provided'],
          learningRequirements: `Home Tuition enquiry (${campaignName})`,
          location: 'Not Provided',
          preferredTiming: 'Not Provided',
          budget: 0,
          assignedTutorId: null,
          parentId,
          status: 'LOOKING_FOR_TUTOR',
          platform,
          campaignName,
          adName,
          createdAt
        });
      }
    } else if (type === 'parents') {
      const parentName = getFieldVal(row, ['parent name', 'parent_name', 'name', 'full name']) || 'Not Provided';
      const rawPhone = getFieldVal(row, ['mobile', 'phone', 'phone number', 'contact']);
      const cleanedPhone = cleanPhone(rawPhone);
      const email = getFieldVal(row, ['email', 'email address']);

      if (!cleanedPhone && !email) rowErrors.push('Mobile Number or Email is required');

      if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(`Row ${rowNum}: ${err}`));
      } else {
        const nextNum = (db.parents.length + validRecords.length + 1).toString().padStart(3, '0');
        validRecords.push({
          id: 'par-imp-' + Date.now() + '-' + validRecords.length,
          parentId: 'PAR-2026-' + nextNum,
          parentName,
          mobile: cleanedPhone,
          whatsapp: cleanedPhone,
          email,
          address: 'Not Provided',
          occupation: 'Not Provided',
          budget: 0,
          tutorPreference: 'Not Provided',
          studentIds: []
        });
      }
    }
  });

  if (commit && validRecords.length > 0) {
    if (type === 'tutors' || type === 'teachers') {
      validRecords.forEach(t => {
        db.tutors.unshift(t);
        const docTypes = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Other Documents'];
        docTypes.forEach((dt, idx) => {
          db.tutorDocuments.push({
            id: 'doc-' + t.id + '-' + (idx + 1),
            tutorId: t.id,
            docType: dt,
            fileName: t.fullName.replace(/\s+/g, '_') + '_' + dt.replace(/\s+/g, '_') + '.pdf',
            fileUrl: '#',
            status: 'Pending',
            remarks: 'Not Provided',
            updatedAt: new Date().toISOString()
          });
        });
        addLog(t.id, 'Excel Import', 'IMPORT_SUCCESS', `Teacher imported: ${t.fullName} via ${t.platform.toUpperCase()} (${t.campaignName}). Priority: NOT_ASSIGNED.`);
      });
      addNotification('Excel Bulk Import Completed', `Successfully imported ${validRecords.length} teachers with Priority: NOT_ASSIGNED.`, 'success', '/tutors');
    } else if (type === 'students') {
      validRecords.forEach(s => {
        db.students.unshift(s);
        // Ensure parent record exists
        let parent = (db.parents || []).find(p => cleanPhone(p.mobile) === cleanPhone(s.parentPhone));
        if (!parent && s.parentPhone) {
          const parNum = (db.parents.length + 1).toString().padStart(3, '0');
          parent = {
            id: s.parentId,
            parentId: 'PAR-2026-' + parNum,
            parentName: 'Not Provided',
            mobile: s.parentPhone,
            phone: s.parentPhone,
            whatsapp: s.parentPhone,
            email: s.parentEmail,
            address: 'Not Provided',
            occupation: 'Not Provided',
            budget: 0,
            tutorPreference: 'Not Provided',
            studentIds: [s.id]
          };
          db.parents.unshift(parent);
        } else if (parent && !parent.studentIds.includes(s.id)) {
          parent.studentIds.push(s.id);
        }
        addLog(s.id, 'Excel Import', 'IMPORT_SUCCESS', `Student imported: ${s.studentName} (Class: ${s.class}) via ${s.platform.toUpperCase()}.`);
      });
      addNotification('Excel Bulk Import Completed', `Successfully imported ${validRecords.length} students.`, 'success', '/students');
    } else if (type === 'parents') {
      validRecords.forEach(p => db.parents.unshift(p));
      addNotification('Excel Bulk Import Completed', `Successfully imported ${validRecords.length} parents.`, 'success', '/parents');
    }
    saveDB(db);
  }

  res.json({
    totalRecords: rows.length,
    validCount: validRecords.length,
    duplicateCount: duplicateRecords.length,
    invalidCount: invalidRecords.length,
    validRecords,
    duplicateRecords,
    invalidRecords,
    errors,
    committed: !!commit
  });
});

// Activity logs endpoint
app.get('/api/activity-logs', (req, res) => {
  res.json({ logs: db.activityLogs || [] });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({ notifications: db.notifications || [] });
});

app.put('/api/notifications/:id/read', (req, res) => {
  const notif = (db.notifications || []).find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  saveDB(db);
  res.json({ success: true, notif });
});

app.put('/api/notifications/read-all', (req, res) => {
  (db.notifications || []).forEach(n => n.read = true);
  saveDB(db);
  res.json({ success: true });
});

// Reset Database to Seed Data
app.post('/api/reset', (req, res) => {
  delete require.cache[require.resolve(seedPath)];
  db = JSON.parse(JSON.stringify(require(seedPath)));
  saveDB(db);
  res.json({ success: true, message: 'Database reset to initial seed data' });
});


// ============================================================================
// SOCIAL MEDIA & WHATSAPP WEBHOOKS & LEADS API
// ============================================================================

// Meta Webhook Verification Handler (WhatsApp, Facebook, Instagram)
const handleMetaVerification = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || 'tutorconnect_meta_verify_token_2026';

  if (mode && token) {
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('META_WEBHOOK_VERIFIED:', req.path);
      if (!db.whatsAppWebhookLogs) db.whatsAppWebhookLogs = [];
      db.whatsAppWebhookLogs.unshift({
        id: 'wh-verif-' + Date.now(),
        timestamp: new Date().toISOString(),
        eventType: 'verification',
        providerMessageId: null,
        phoneNumber: null,
        processingStatus: 'Processed',
        error: null,
        summary: 'Webhook GET verification challenge succeeded'
      });
      if (!db.whatsAppConfig) db.whatsAppConfig = {};
      db.whatsAppConfig.webhookVerified = true;
      saveDB(db);
      return res.status(200).send(challenge);
    }
    return res.status(403).json({ error: 'Verify token mismatch' });
  }
  return res.status(400).json({ error: 'Invalid verification request parameters' });
};

app.get('/api/webhooks/whatsapp', handleMetaVerification);
app.get('/api/webhooks/facebook', handleMetaVerification);
app.get('/api/webhooks/instagram', handleMetaVerification);

// Pure payload processing helpers
function processWhatsAppPayload(body) {
  let senderPhone = '';
  let contactName = '';
  let textMessage = '';
  let wamid = '';
  let timestamp = new Date().toISOString();

  if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0]) {
    const change = body.entry[0].changes[0].value;
    if (change.contacts && change.contacts[0]) {
      contactName = change.contacts[0].profile ? change.contacts[0].profile.name : '';
    }
    if (change.messages && change.messages[0]) {
      const msg = change.messages[0];
      senderPhone = cleanPhone(msg.from);
      wamid = msg.id || ('wamid.' + Date.now());
      textMessage = msg.text ? msg.text.body : (msg.type ? `[${msg.type}]` : 'Inbound WhatsApp message');
      if (msg.timestamp) {
        timestamp = new Date(Number(msg.timestamp) * 1000).toISOString();
      }
    }
  } else if (body.from || body.phoneNumber) {
    senderPhone = cleanPhone(body.from || body.phoneNumber);
    contactName = body.name || body.fullName || 'WhatsApp Contact';
    textMessage = body.message || body.text || 'Inbound inquiry';
    wamid = body.id || ('wamid.' + Date.now());
    if (body.timestamp) timestamp = body.timestamp;
  }

  if (!senderPhone) {
    return { ignored: true, status: 'ignored_non_message_event' };
  }

  if (!db.leads) db.leads = [];

  let existingLead = db.leads.find(l => cleanPhone(l.phoneNumber) === senderPhone);

  if (existingLead) {
    if (!existingLead.messages) existingLead.messages = [];
    existingLead.messages.push({
      id: wamid,
      sender: 'user',
      text: textMessage,
      timestamp
    });
    existingLead.message = textMessage;
    existingLead.updatedAt = new Date().toISOString();

    addLog(existingLead.convertedId || null, 'WhatsApp', 'WHATSAPP_MESSAGE_RECEIVED', `WhatsApp message from ${existingLead.name || senderPhone}: "${textMessage}"`);
    addNotification('New WhatsApp Message', `Message from ${existingLead.name || senderPhone}: "${textMessage}"`, 'info', '/communication/whatsapp');
    saveDB(db);
    return { success: true, lead: existingLead, isNew: false, message: 'Message attached to existing lead thread' };
  } else {
    const newLead = {
      id: 'lead-wa-' + Date.now(),
      leadSource: 'WHATSAPP',
      platform: 'whatsapp',
      name: contactName || 'WhatsApp Contact',
      phoneNumber: senderPhone,
      email: body.email || '',
      externalLeadId: wamid,
      campaignName: body.campaignName || 'Direct WhatsApp Inquiry',
      adName: body.adName || 'WhatsApp Click-to-Chat',
      message: textMessage,
      messages: [
        {
          id: wamid,
          sender: 'user',
          text: textMessage,
          timestamp
        }
      ],
      status: 'NEW_LEAD',
      convertedType: null,
      convertedId: null,
      createdAt: timestamp,
      sourceCreatedAt: timestamp,
      updatedAt: new Date().toISOString()
    };
    db.leads.unshift(newLead);
    addLog(null, 'WhatsApp', 'WHATSAPP_LEAD_CREATED', `New WhatsApp Lead received from ${contactName || senderPhone} (${senderPhone}).`);
    addNotification('New WhatsApp Lead Received', `WhatsApp lead from ${contactName || senderPhone} (${senderPhone}): "${textMessage}"`, 'success', '/communication/whatsapp');
    saveDB(db);
    return { success: true, lead: newLead, isNew: true, message: 'New WhatsApp lead created' };
  }
}

function processFacebookPayload(body) {
  let name = '';
  let phone = '';
  let email = '';
  let subjects = [];
  let experience = '';
  let leadId = '';
  let campaignName = 'TEACHERS WANTED';
  let adName = 'New Leads ad';
  let formName = 'Charithra Learning Hub ? Tirunelveli-copy';
  let timestamp = new Date().toISOString();

  if (body.entry && body.entry[0] && body.entry[0].changes && body.entry[0].changes[0]) {
    const change = body.entry[0].changes[0].value;
    leadId = change.leadgen_id || change.form_id || ('fb-' + Date.now());
    if (change.field_data) {
      change.field_data.forEach(f => {
        const key = f.name ? f.name.toLowerCase() : '';
        const val = (f.values && f.values[0]) ? f.values[0] : '';
        if (key.includes('name')) name = val;
        else if (key.includes('phone')) phone = cleanPhone(val);
        else if (key.includes('email')) email = val;
        else if (key.includes('subject')) subjects = [val];
        else if (key.includes('experience')) experience = val;
      });
    }
  } else {
    name = body.name || body.fullName || 'Facebook Lead';
    phone = cleanPhone(body.phone || body.phoneNumber);
    email = body.email || '';
    subjects = body.subjects ? (Array.isArray(body.subjects) ? body.subjects : [body.subjects]) : ['Mathematics', 'Science'];
    experience = body.experience || '2-3 years';
    leadId = body.id || body.leadId || ('fb-' + Date.now());
    campaignName = body.campaignName || campaignName;
    adName = body.adName || adName;
    formName = body.formName || formName;
  }

  if (!db.leads) db.leads = [];

  const newLead = {
    id: 'lead-fb-' + Date.now(),
    leadSource: 'FACEBOOK',
    platform: 'fb',
    name: name || 'Facebook Lead',
    phoneNumber: phone || 'Not Provided',
    email: email || 'Not Provided',
    externalLeadId: leadId,
    campaignName,
    adName,
    formName,
    subjects,
    experience,
    message: `Form submitted on Facebook Lead Ads: "${campaignName}"`,
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'system',
        text: `Form submitted on Facebook: ${name} (${phone}, ${email}) - Subjects: ${subjects.join(', ')} - Exp: ${experience}`,
        timestamp
      }
    ],
    status: 'NEW_LEAD',
    convertedType: null,
    convertedId: null,
    createdAt: timestamp,
    sourceCreatedAt: timestamp,
    updatedAt: new Date().toISOString()
  };

  db.leads.unshift(newLead);
  addLog(null, 'Facebook', 'FACEBOOK_LEAD_CREATED', `New Facebook Lead received: ${name} (${phone}).`);
  addNotification('New Facebook Lead Received', `New Facebook Lead received from ${name} (${phone}) - Campaign: ${campaignName}`, 'success', '/communication/facebook');

  saveDB(db);
  return { success: true, lead: newLead, message: 'Facebook lead created' };
}

function processInstagramPayload(body) {
  let igUserId = '';
  let textMessage = '';
  let messageId = '';
  let timestamp = new Date().toISOString();
  let name = 'Instagram User';

  if (body.entry && body.entry[0] && body.entry[0].messaging && body.entry[0].messaging[0]) {
    const msgEvent = body.entry[0].messaging[0];
    igUserId = msgEvent.sender ? msgEvent.sender.id : ('igsid_' + Date.now());
    if (msgEvent.message) {
      textMessage = msgEvent.message.text || '[Direct Media Attachment]';
      messageId = msgEvent.message.mid || ('ig-mid-' + Date.now());
    }
    if (msgEvent.timestamp) {
      timestamp = new Date(msgEvent.timestamp).toISOString();
    }
  } else {
    igUserId = body.senderId || body.id || ('igsid_' + Date.now());
    textMessage = body.message || body.text || 'Instagram Direct Message inquiry';
    name = body.name || body.username || 'Instagram User';
    messageId = 'ig-mid-' + Date.now();
  }

  if (!db.leads) db.leads = [];

  let existingLead = db.leads.find(l => l.externalLeadId === igUserId && l.leadSource === 'INSTAGRAM');

  if (existingLead) {
    if (!existingLead.messages) existingLead.messages = [];
    existingLead.messages.push({
      id: messageId,
      sender: 'user',
      text: textMessage,
      timestamp
    });
    existingLead.message = textMessage;
    existingLead.updatedAt = new Date().toISOString();

    addLog(existingLead.convertedId || null, 'Instagram', 'INSTAGRAM_MESSAGE_RECEIVED', `New Instagram message from @${existingLead.name}: "${textMessage}"`);
    addNotification('New Instagram Message', `Message from @${existingLead.name}: "${textMessage}"`, 'info', '/communication/instagram');
    saveDB(db);
    return { success: true, lead: existingLead, isNew: false, message: 'Instagram message added to thread' };
  } else {
    const newLead = {
      id: 'lead-ig-' + Date.now(),
      leadSource: 'INSTAGRAM',
      platform: 'ig',
      name: name,
      phoneNumber: body.phoneNumber ? cleanPhone(body.phoneNumber) : 'Not Provided',
      email: body.email || 'Not Provided',
      externalLeadId: igUserId,
      campaignName: body.campaignName || 'Instagram Direct Message',
      adName: body.adName || 'IG Story / Post Ad',
      message: textMessage,
      messages: [
        {
          id: messageId,
          sender: 'user',
          text: textMessage,
          timestamp
        }
      ],
      status: 'NEW_LEAD',
      convertedType: null,
      convertedId: null,
      createdAt: timestamp,
      sourceCreatedAt: timestamp,
      updatedAt: new Date().toISOString()
    };
    db.leads.unshift(newLead);
    addLog(null, 'Instagram', 'INSTAGRAM_LEAD_CREATED', `New Instagram Lead received: @${name} (${igUserId}).`);
    addNotification('New Instagram Lead Received', `Instagram message lead from @${name}: "${textMessage}"`, 'success', '/communication/instagram');
    saveDB(db);
    return { success: true, lead: newLead, isNew: true, message: 'New Instagram lead created' };
  }
}

// 1. WhatsApp Webhook Endpoint (Secure Inbound & Status Callbacks)
app.post('/api/webhooks/whatsapp', (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Missing request body' });

  // Verify X-Hub-Signature-256 header if present
  const signature = req.headers['x-hub-signature-256'];
  const appSecret = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || '';
  if (signature && appSecret && !appSecret.includes('placeholder')) {
    const isValid = whatsappService.verifyWebhookSignature(req.rawBody, signature, appSecret);
    if (!isValid) {
      if (!db.whatsAppWebhookLogs) db.whatsAppWebhookLogs = [];
      db.whatsAppWebhookLogs.unshift({
        id: 'wh-err-' + Date.now(),
        timestamp: new Date().toISOString(),
        eventType: 'signature_error',
        providerMessageId: null,
        phoneNumber: null,
        processingStatus: 'Rejected',
        error: 'Invalid X-Hub-Signature-256 HMAC',
        summary: 'Rejected unsigned/invalid webhook request'
      });
      saveDB(db);
      return res.status(403).json({ error: 'Invalid webhook signature' });
    }
  }

  try {
    const body = req.body;
    const now = new Date().toISOString();
    if (!db.whatsAppConfig) db.whatsAppConfig = {};
    db.whatsAppConfig.lastWebhookReceivedAt = now;

    if (!db.whatsAppMessages) db.whatsAppMessages = [];
    if (!db.whatsAppContacts) db.whatsAppContacts = [];
    if (!db.whatsAppWebhookLogs) db.whatsAppWebhookLogs = [];

    let processedCount = 0;

    // A. Check for Meta Webhook changes format
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (!entry.changes || !Array.isArray(entry.changes)) continue;
        for (const change of entry.changes) {
          const val = change.value;
          if (!val) continue;

          // 1. Process Status Updates (sent, delivered, read, failed)
          if (val.statuses && Array.isArray(val.statuses)) {
            for (const statusObj of val.statuses) {
              const pMsgId = statusObj.id;
              const rawStatus = (statusObj.status || '').toUpperCase();
              let newStatus = 'SENT';
              if (rawStatus === 'DELIVERED') newStatus = 'DELIVERED';
              else if (rawStatus === 'READ') newStatus = 'READ';
              else if (rawStatus === 'FAILED') newStatus = 'FAILED';

              // Update in db.whatsAppMessages
              const msgItem = db.whatsAppMessages.find(m => m.providerMessageId === pMsgId || m.id === pMsgId);
              if (msgItem) {
                msgItem.status = newStatus;
                msgItem.updatedAt = now;
                if (newStatus === 'DELIVERED') msgItem.deliveredAt = now;
                if (newStatus === 'READ') msgItem.readAt = now;
                if (newStatus === 'FAILED') {
                  msgItem.errorCode = statusObj.errors?.[0]?.code || 'DELIVERY_FAILURE';
                  msgItem.errorMessage = statusObj.errors?.[0]?.message || 'Message delivery failed';
                }
              }

              // Update backward-compat history
              if (db.whatsappHistory) {
                const hist = db.whatsappHistory.find(h => h.providerMessageId === pMsgId || h.id === pMsgId);
                if (hist) {
                  hist.status = newStatus;
                  if (newStatus === 'DELIVERED') hist.deliveredAt = now;
                  if (newStatus === 'READ') hist.readAt = now;
                }
              }

              // Log webhook event
              db.whatsAppWebhookLogs.unshift({
                id: 'wh-stat-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                timestamp: now,
                eventType: 'message_status',
                providerMessageId: pMsgId,
                phoneNumber: statusObj.recipient_id ? ('+' + statusObj.recipient_id) : null,
                processingStatus: 'Processed',
                error: statusObj.errors?.[0]?.message || null,
                summary: `Message ${pMsgId} status updated to ${newStatus}`
              });

              broadcastWhatsAppEvent('message_status', { providerMessageId: pMsgId, status: newStatus, timestamp: now });
              processedCount++;
            }
          }

          // 2. Process Inbound Messages
          if (val.messages && Array.isArray(val.messages)) {
            for (const msg of val.messages) {
              const rawFrom = msg.from;
              const normalizedDigits = whatsappService.normalizePhoneNumber(rawFrom);
              const formattedPhone = '+' + normalizedDigits;
              const textContent = msg.text ? msg.text.body : (msg.type ? `[${msg.type.toUpperCase()}]` : 'Incoming message');
              const wamid = msg.id || ('wamid.in.' + Date.now());
              const msgTimestamp = msg.timestamp ? new Date(Number(msg.timestamp) * 1000).toISOString() : now;

              // Automatic Tutor Matching: Match phone with Tutor.phoneNumber or mobile
              const matchedTutor = (db.tutors || []).find(t => {
                const tDigits1 = whatsappService.normalizePhoneNumber(t.whatsappPhoneNumber || '');
                const tDigits2 = whatsappService.normalizePhoneNumber(t.mobile || '');
                const tDigits3 = whatsappService.normalizePhoneNumber(t.phone || '');
                const tDigits4 = whatsappService.normalizePhoneNumber(t.originalPhoneNumber || '');
                return (
                  (tDigits1 && tDigits1 === normalizedDigits) ||
                  (tDigits2 && tDigits2 === normalizedDigits) ||
                  (tDigits3 && tDigits3 === normalizedDigits) ||
                  (tDigits4 && tDigits4 === normalizedDigits)
                );
              });

              // Create or update WhatsAppContact
              let contact = db.whatsAppContacts.find(c => {
                const cDigits = whatsappService.normalizePhoneNumber(c.phoneNumber || '');
                return cDigits === normalizedDigits || (matchedTutor && c.tutorId === matchedTutor.id);
              });

              if (!contact) {
                contact = {
                  id: 'wac-' + (matchedTutor ? matchedTutor.id : Date.now()),
                  tutorId: matchedTutor ? matchedTutor.id : null,
                  phoneNumber: formattedPhone,
                  displayName: matchedTutor ? matchedTutor.fullName : (val.contacts?.[0]?.profile?.name || 'WhatsApp Tutor Contact'),
                  whatsappOptIn: matchedTutor ? (matchedTutor.whatsappOptIn || 'YES') : 'YES',
                  lastMessageAt: msgTimestamp,
                  lastInboundMessageAt: msgTimestamp,
                  lastOutboundMessageAt: null,
                  conversationStatus: 'OPEN',
                  unreadCount: 1,
                  createdAt: msgTimestamp,
                  updatedAt: now
                };
                db.whatsAppContacts.unshift(contact);
              } else {
                contact.lastMessageAt = msgTimestamp;
                contact.lastInboundMessageAt = msgTimestamp;
                contact.unreadCount = (contact.unreadCount || 0) + 1;
                contact.updatedAt = now;
              }

              // Create WhatsAppMessage record
              const inMsg = {
                id: 'wam-in-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                tutorId: matchedTutor ? matchedTutor.id : null,
                direction: 'INBOUND',
                messageType: 'TEXT',
                messageText: textContent,
                templateName: null,
                phoneNumber: formattedPhone,
                providerMessageId: wamid,
                status: 'RECEIVED',
                errorCode: null,
                errorMessage: null,
                sentAt: msgTimestamp,
                deliveredAt: msgTimestamp,
                readAt: null,
                createdAt: msgTimestamp,
                updatedAt: now
              };
              db.whatsAppMessages.unshift(inMsg);

              // Attach to social leads if not present
              processWhatsAppPayload({
                from: formattedPhone,
                name: matchedTutor ? matchedTutor.fullName : contact.displayName,
                message: textContent,
                id: wamid,
                timestamp: msgTimestamp
              });

              // Add notification & activity log
              addNotification(
                'New WhatsApp Message',
                `Inbound message from ${contact.displayName} (${formattedPhone}): "${textContent}"`,
                'info',
                '/whatsapp/inbox'
              );
              if (matchedTutor) {
                addLog(matchedTutor.id, 'Tutor WhatsApp', 'WHATSAPP_INBOUND_RECEIVED', `Inbound WhatsApp message received: "${textContent}".`);
              }

              // Log webhook event
              db.whatsAppWebhookLogs.unshift({
                id: 'wh-in-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                timestamp: now,
                eventType: 'inbound_message',
                providerMessageId: wamid,
                phoneNumber: formattedPhone,
                processingStatus: 'Processed',
                error: null,
                summary: `Inbound message from ${contact.displayName}: "${textContent}"`
              });

              broadcastWhatsAppEvent('inbound_message', { message: inMsg, contact });
              processedCount++;
            }
          }
        }
      }
    }

    // B. Direct/Simulated Webhook Payload format (e.g. from tests or simple webhooks)
    if (body.providerMessageId && body.status) {
      const pMsgId = body.providerMessageId;
      const newStatus = body.status.toUpperCase();
      const msgItem = db.whatsAppMessages.find(m => m.providerMessageId === pMsgId || m.id === pMsgId);
      if (msgItem) {
        msgItem.status = newStatus;
        msgItem.updatedAt = now;
        if (newStatus === 'DELIVERED') msgItem.deliveredAt = now;
        if (newStatus === 'READ') msgItem.readAt = now;
      }
      if (db.whatsappHistory) {
        const hist = db.whatsappHistory.find(h => h.providerMessageId === pMsgId || h.id === pMsgId);
        if (hist) hist.status = newStatus;
      }
      db.whatsAppWebhookLogs.unshift({
        id: 'wh-stat-' + Date.now(),
        timestamp: now,
        eventType: 'message_status',
        providerMessageId: pMsgId,
        phoneNumber: body.phoneNumber || null,
        processingStatus: 'Processed',
        error: null,
        summary: `Status updated to ${newStatus}`
      });
      broadcastWhatsAppEvent('message_status', { providerMessageId: pMsgId, status: newStatus, timestamp: now });
      processedCount++;
    } else if (body.from || body.phoneNumber) {
      const rawPhone = body.from || body.phoneNumber;
      const normalizedDigits = whatsappService.normalizePhoneNumber(rawPhone);
      const formattedPhone = '+' + normalizedDigits;
      const textContent = body.message || body.text || 'Inbound inquiry';
      const wamid = body.id || body.providerMessageId || ('wamid.in.' + Date.now());

      const matchedTutor = (db.tutors || []).find(t => {
        const tDigits = whatsappService.normalizePhoneNumber(t.whatsappPhoneNumber || t.mobile || t.phone || '');
        return tDigits === normalizedDigits;
      });

      let contact = db.whatsAppContacts.find(c => {
        const cDigits = whatsappService.normalizePhoneNumber(c.phoneNumber || '');
        return cDigits === normalizedDigits || (matchedTutor && c.tutorId === matchedTutor.id);
      });

      if (!contact) {
        contact = {
          id: 'wac-' + (matchedTutor ? matchedTutor.id : Date.now()),
          tutorId: matchedTutor ? matchedTutor.id : null,
          phoneNumber: formattedPhone,
          displayName: matchedTutor ? matchedTutor.fullName : (body.name || 'WhatsApp Contact'),
          whatsappOptIn: matchedTutor ? (matchedTutor.whatsappOptIn || 'YES') : 'YES',
          lastMessageAt: now,
          lastInboundMessageAt: now,
          lastOutboundMessageAt: null,
          conversationStatus: 'OPEN',
          unreadCount: 1,
          createdAt: now,
          updatedAt: now
        };
        db.whatsAppContacts.unshift(contact);
      } else {
        contact.lastMessageAt = now;
        contact.lastInboundMessageAt = now;
        contact.unreadCount = (contact.unreadCount || 0) + 1;
        contact.updatedAt = now;
      }

      const inMsg = {
        id: 'wam-in-' + Date.now(),
        tutorId: matchedTutor ? matchedTutor.id : null,
        direction: 'INBOUND',
        messageType: 'TEXT',
        messageText: textContent,
        templateName: null,
        phoneNumber: formattedPhone,
        providerMessageId: wamid,
        status: 'RECEIVED',
        errorCode: null,
        errorMessage: null,
        sentAt: now,
        deliveredAt: now,
        readAt: null,
        createdAt: now,
        updatedAt: now
      };
      db.whatsAppMessages.unshift(inMsg);

      db.whatsAppWebhookLogs.unshift({
        id: 'wh-in-' + Date.now(),
        timestamp: now,
        eventType: 'inbound_message',
        providerMessageId: wamid,
        phoneNumber: formattedPhone,
        processingStatus: 'Processed',
        error: null,
        summary: `Inbound message from ${contact.displayName}: "${textContent}"`
      });

      broadcastWhatsAppEvent('inbound_message', { message: inMsg, contact });
      processedCount++;
    }

    saveDB(db);
    return res.status(200).json({ success: true, processed: true, count: processedCount });
  } catch (err) {
    console.error('Error in WhatsApp webhook processing:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Facebook Lead Ads Webhook Endpoint
app.post('/api/webhooks/facebook', (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Missing request body' });
  try {
    const result = processFacebookPayload(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in Facebook webhook:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Instagram Webhook Endpoint
app.post('/api/webhooks/instagram', (req, res) => {
  if (!req.body) return res.status(400).json({ error: 'Missing request body' });
  try {
    const result = processInstagramPayload(req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in Instagram webhook:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. Social Leads List & Filter API
app.get('/api/leads', (req, res) => {
  let list = [...(db.leads || [])];
  const { source, status, search } = req.query;

  if (source && source !== 'ALL') {
    list = list.filter(l => (l.leadSource || '').toUpperCase() === source.toUpperCase());
  }

  if (status && status !== 'ALL') {
    list = list.filter(l => (l.status || '').toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phoneNumber && l.phoneNumber.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q)) ||
      (l.message && l.message.toLowerCase().includes(q)) ||
      (l.campaignName && l.campaignName.toLowerCase().includes(q))
    );
  }

  res.json({ leads: list, total: list.length });
});

app.get('/api/leads/:id', (req, res) => {
  const lead = (db.leads || []).find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  res.json({ lead });
});

// ==========================================
// PUBLIC WEBSITE INTEGRATION ENDPOINTS
// ==========================================

// Health / Status Check for Marketing Website
app.get('/api/public/status', (req, res) => {
  res.json({
    status: 'online',
    service: 'Charithra Learning Hub CRM API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// 1. Academic Tuition Enquiry from Website
app.post('/api/public/enquiry', (req, res) => {
  const { studentName, grade, board, learningMode, selectedSubjects, parentPhone, notes } = req.body;
  if (!studentName || !parentPhone) {
    return res.status(400).json({ success: false, error: 'Student Name and Parent Phone Number are required' });
  }

  const cleanP = cleanPhone(parentPhone);
  const subjectsList = Array.isArray(selectedSubjects) && selectedSubjects.length > 0 ? selectedSubjects : ['General Academics'];
  const modeStr = (learningMode || 'Both').toUpperCase();
  const gradeStr = grade || 'Not Specified';
  const boardStr = board || 'CBSE';

  const enquiryMessage = `Academic Tuition Enquiry for ${studentName} (${gradeStr}, ${boardStr}). Mode: ${modeStr}. Subjects: ${subjectsList.join(', ')}.${notes ? ' Note: ' + notes : ''}`;

  const newLead = {
    id: 'lead-web-' + Date.now(),
    leadSource: 'WEBSITE',
    platform: 'website',
    name: studentName,
    phoneNumber: cleanP,
    email: 'Not Provided',
    externalLeadId: 'web_enq_' + Date.now(),
    campaignName: 'Academic Tuition Enquiry',
    adName: `${modeStr} Learning`,
    subjects: subjectsList,
    experience: `${gradeStr} (${boardStr})`,
    message: enquiryMessage,
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: enquiryMessage,
        timestamp: new Date().toISOString()
      }
    ],
    status: 'NEW_LEAD',
    convertedType: null,
    convertedId: null,
    createdAt: new Date().toISOString(),
    sourceCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.unshift(newLead);

  addLog(null, 'Website', 'WEBSITE_ENQUIRY_RECEIVED', `New academic tuition enquiry received from website: ${studentName} (${cleanP}) - ${subjectsList.join(', ')}.`);
  addNotification(
    'New Website Tuition Enquiry',
    `${studentName} enrolled for ${subjectsList.join(', ')} (${gradeStr}, ${boardStr}). Phone: ${cleanP}`,
    'info',
    '/leads'
  );

  saveDB(db);
  res.status(201).json({
    success: true,
    lead: newLead,
    message: 'Academic enquiry received successfully'
  });
});

// 2. One-Day Workshop Booking from Website
app.post('/api/public/workshop', (req, res) => {
  const { childName, childGrade, selectedTrack, selectedTrackTitle, selectedDate, parentPhone } = req.body;
  if (!childName || !parentPhone) {
    return res.status(400).json({ success: false, error: 'Child Name and Parent Phone Number are required' });
  }

  const cleanP = cleanPhone(parentPhone);
  const trackTitle = selectedTrackTitle || 'Future Skills Workshop';
  const slotDate = selectedDate || 'Upcoming Weekend Batch';
  const gradeStr = childGrade || 'School Student';

  const workshopMessage = `One-Day Workshop Booking for ${childName} (${gradeStr}). Workshop: ${trackTitle}. Selected Slot: ${slotDate}.`;

  const newLead = {
    id: 'lead-ws-' + Date.now(),
    leadSource: 'WEBSITE',
    platform: 'website',
    name: childName,
    phoneNumber: cleanP,
    email: 'Not Provided',
    externalLeadId: 'web_ws_' + Date.now(),
    campaignName: `Workshop - ${trackTitle}`,
    adName: 'One-Day Technology Pass',
    subjects: [trackTitle],
    experience: `${gradeStr} | ${slotDate}`,
    message: workshopMessage,
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: workshopMessage,
        timestamp: new Date().toISOString()
      }
    ],
    status: 'NEW_LEAD',
    convertedType: null,
    convertedId: null,
    createdAt: new Date().toISOString(),
    sourceCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.unshift(newLead);

  addLog(null, 'Website', 'WEBSITE_WORKSHOP_BOOKED', `New workshop seat booking from website: ${childName} (${cleanP}) for ${trackTitle}.`);
  addNotification(
    'New Workshop Booking',
    `${childName} booked for ${trackTitle} on ${slotDate}. Phone: ${cleanP}`,
    'success',
    '/leads'
  );

  saveDB(db);
  res.status(201).json({
    success: true,
    lead: newLead,
    message: 'Workshop seat reserved successfully'
  });
});

// 3. Teacher / Tutor Career Application from Website
app.post('/api/public/tutor-apply', (req, res) => {
  const {
    fullName,
    phone,
    email,
    qualification,
    specialization,
    experience,
    subjects,
    preferredLocation,
    availableTiming,
    message
  } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({ success: false, error: 'Full Name and Phone Number are required' });
  }

  const cleanP = cleanPhone(phone);
  const userEmail = (email || '').trim().toLowerCase();

  // Check duplicate tutor
  const dupTutor = (db.tutors || []).find(t =>
    (cleanP && t.mobile && cleanPhone(t.mobile) === cleanP) ||
    (userEmail && userEmail !== 'not provided' && t.email && t.email.toLowerCase() === userEmail)
  );

  if (dupTutor) {
    return res.status(400).json({
      success: false,
      error: `A tutor candidate with phone "${cleanP}" or email "${userEmail}" is already registered: ${dupTutor.fullName} (${dupTutor.tutorId}).`
    });
  }

  const tutorId = 'TUT-2026-' + ((db.tutors || []).length + 1).toString().padStart(3, '0');
  const subjectsList = Array.isArray(subjects) ? subjects : (subjects ? String(subjects).split(',').map(s => s.trim()) : ['General']);

  const newTutor = {
    id: 'tut-' + Date.now(),
    tutorId,
    externalLeadId: 'web_apply_' + Date.now(),
    fullName,
    mobile: cleanP,
    phone: cleanP,
    whatsapp: cleanP,
    email: (userEmail && userEmail !== 'not provided') ? userEmail : `${tutorId.toLowerCase()}@charithrahub.com`,
    gender: 'Not Provided',
    dob: 'Not Provided',
    qualification: qualification || 'Bachelor Degree',
    specialization: specialization || 'Education',
    experience: experience || '1+ Year',
    experienceYears: parseInt(experience, 10) || 1,
    subjects: subjectsList,
    subjectsText: subjectsList.join(', '),
    homeTuitionAvailable: 'yes',
    preferredLocation: preferredLocation || 'Centre / Online',
    availableTiming: availableTiming || 'Flexible',
    expectedSalary: 15000,
    priority: 'NOT_ASSIGNED',
    status: 'NEW_APPLICATION',
    leadSource: 'WEBSITE',
    platform: 'website',
    campaignName: 'Website Teacher Career Application',
    adName: 'Online Tutor Recruitment',
    notes: message || 'Direct application submitted via public website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.tutors) db.tutors = [];
  db.tutors.unshift(newTutor);

  // Initialize verification documents
  const docTypes = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Photo ID'];
  if (!db.tutorDocuments) db.tutorDocuments = [];
  docTypes.forEach((docType, idx) => {
    db.tutorDocuments.push({
      id: `doc-${newTutor.id}-${idx + 1}`,
      tutorId: newTutor.id,
      docType,
      fileName: `${newTutor.fullName.replace(/\s+/g, '_')}_${docType.replace(/\s+/g, '_')}.pdf`,
      status: 'Pending',
      remarks: 'Awaiting candidate verification',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Also create a linked website lead entry for full CRM tracking visibility
  const leadMessage = `Teacher Career Application: ${fullName} (${qualification || 'Graduate'}). Exp: ${experience || '1+ yr'}. Subjects: ${subjectsList.join(', ')}.${message ? ' Message: ' + message : ''}`;
  const newLead = {
    id: 'lead-tutor-' + Date.now(),
    leadSource: 'WEBSITE',
    platform: 'website',
    name: fullName,
    phoneNumber: cleanP,
    email: userEmail || 'Not Provided',
    externalLeadId: newTutor.externalLeadId,
    campaignName: 'Website Teacher Career Application',
    adName: 'Online Tutor Recruitment',
    subjects: subjectsList,
    experience: experience || '1+ Year',
    message: leadMessage,
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: leadMessage,
        timestamp: new Date().toISOString()
      }
    ],
    status: 'CONVERTED',
    convertedType: 'TUTOR',
    convertedId: newTutor.id,
    createdAt: new Date().toISOString(),
    sourceCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.unshift(newLead);

  addLog(newTutor.id, 'Website', 'TUTOR_ONLINE_APPLICATION', `Direct online tutor application received from ${fullName} (${tutorId}, ${cleanP}).`);
  addNotification(
    'New Teacher Application Received',
    `${fullName} applied to teach ${subjectsList.join(', ')} (Candidate ${tutorId}).`,
    'success',
    `/tutors`
  );

  saveDB(db);
  res.status(201).json({
    success: true,
    tutor: newTutor,
    lead: newLead,
    message: `Teacher application submitted successfully! Reference ID: ${tutorId}`
  });
});

// 5. Manual Lead Entry
app.post('/api/leads', (req, res) => {
  const { name, phoneNumber, email, leadSource, message, campaignName, adName, subjects, experience } = req.body;
  if (!name || !phoneNumber) {
    return res.status(400).json({ error: 'Name and Phone Number are required' });
  }

  const cleanP = cleanPhone(phoneNumber);
  const source = leadSource || 'MANUAL_ENTRY';
  const newLead = {
    id: 'lead-man-' + Date.now(),
    leadSource: source,
    platform: source === 'WHATSAPP' ? 'whatsapp' : source === 'FACEBOOK' ? 'fb' : source === 'INSTAGRAM' ? 'ig' : 'manual',
    name,
    phoneNumber: cleanP,
    email: email || 'Not Provided',
    externalLeadId: 'man_' + Date.now(),
    campaignName: campaignName || 'Direct Enquiry',
    adName: adName || 'Direct Outreach',
    subjects: subjects || ['General'],
    experience: experience || 'Not Provided',
    message: message || 'Inquiry created manually by admin',
    messages: [
      {
        id: 'msg-' + Date.now(),
        sender: 'user',
        text: message || 'Direct enquiry',
        timestamp: new Date().toISOString()
      }
    ],
    status: 'NEW_LEAD',
    convertedType: null,
    convertedId: null,
    createdAt: new Date().toISOString(),
    sourceCreatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.leads) db.leads = [];
  db.leads.unshift(newLead);
  addLog(null, 'Admin', 'LEAD_CREATED_MANUAL', `New manual lead created for ${name} (${cleanP}).`);
  saveDB(db);

  res.status(201).json({ success: true, lead: newLead });
});

// 6. Lead Simulator Endpoint (Testing WhatsApp, FB Lead Ads, IG DM)
app.post('/api/leads/simulate', (req, res) => {
  const { channel, name, phone, message, email, subjects, experience, campaignName } = req.body;

  try {
    if (channel === 'WHATSAPP') {
      const result = processWhatsAppPayload({
        from: phone || '+919842155432',
        name: name || 'Kavitha Ramesh',
        message: message || 'Hello, I am looking for a physics home tutor for my 11th standard son in Tirunelveli.',
        campaignName: campaignName || 'Direct WhatsApp Inquiry'
      });
      return res.status(200).json(result);
    } else if (channel === 'FACEBOOK') {
      const result = processFacebookPayload({
        fullName: name || 'Suresh Kannan',
        phone: phone || '+919943218765',
        email: email || 'suresh.physics@gmail.com',
        subjects: subjects || ['Physics', 'Chemistry'],
        experience: experience || '5 years',
        campaignName: campaignName || 'TEACHERS WANTED'
      });
      return res.status(200).json(result);
    } else if (channel === 'INSTAGRAM') {
      const result = processInstagramPayload({
        senderId: 'igsid_' + Math.floor(Math.random() * 10000000),
        name: name || 'deepika_educator',
        message: message || 'Hi, are you hiring biology tutors for CBSE 10th & 12th standard?',
        phoneNumber: phone || '+919789012345',
        campaignName: campaignName || 'IG Story Ad'
      });
      return res.status(200).json(result);
    }
  } catch (err) {
    console.error('Error in lead simulator:', err);
    return res.status(500).json({ error: 'Internal server error in simulation' });
  }

  return res.status(400).json({ error: 'Invalid simulation channel. Choose WHATSAPP, FACEBOOK, or INSTAGRAM' });
});

// 7. Convert Lead to Tutor or Student
app.post('/api/leads/:id/convert', (req, res) => {
  const lead = (db.leads || []).find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const { targetType, fullName, phoneNumber, email, subjects, class: studentClass, experience } = req.body;
  const name = fullName || lead.name || 'Social Lead';
  const phone = cleanPhone(phoneNumber || lead.phoneNumber);
  const userEmail = (email || lead.email || '').trim().toLowerCase();

  if (targetType === 'TUTOR') {
    // Prevent duplicates by Phone, Email, or externalLeadId
    const dupTutor = (db.tutors || []).find(t =>
      (phone && t.mobile && cleanPhone(t.mobile) === phone) ||
      (userEmail && userEmail !== 'not provided' && t.email && t.email.toLowerCase() === userEmail) ||
      (lead.externalLeadId && t.externalLeadId === lead.externalLeadId)
    );

    if (dupTutor) {
      return res.status(400).json({
        error: `Duplicate tutor candidate detected! A tutor with phone "${phone || dupTutor.mobile}" or email "${userEmail || dupTutor.email}" already exists: ${dupTutor.fullName} (${dupTutor.tutorId}).`
      });
    }

    const tutorId = 'TUT-2026-' + ((db.tutors || []).length + 1).toString().padStart(3, '0');
    const newTutor = {
      id: 'tut-' + Date.now(),
      tutorId,
      externalLeadId: lead.externalLeadId || lead.id,
      fullName: name,
      mobile: phone || '+919999999999',
      phone: phone || '+919999999999',
      whatsapp: phone || '+919999999999',
      email: (userEmail && userEmail !== 'not provided') ? userEmail : `${tutorId.toLowerCase()}@example.com`,
      gender: 'Not Provided',
      dob: 'Not Provided',
      qualification: 'Not Provided',
      specialization: 'Not Provided',
      experience: experience || lead.experience || 'Not Provided',
      experienceYears: 1,
      subjects: subjects || lead.subjects || ['General'],
      subjectsText: (subjects || lead.subjects || ['General']).join(', '),
      homeTuitionAvailable: 'yes',
      preferredLocation: 'Centre / Residence',
      availableTiming: '5:00 PM - 7:00 PM',
      expectedSalary: 15000,
      priority: 'NOT_ASSIGNED',
      status: 'NEW_APPLICATION',
      leadSource: lead.leadSource,
      platform: lead.platform,
      campaignName: lead.campaignName,
      adName: lead.adName,
      sourceCreatedAt: lead.sourceCreatedAt || lead.createdAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!db.tutors) db.tutors = [];
    db.tutors.unshift(newTutor);

    // Create 6 default documents
    const docTypes = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Photo ID'];
    if (!db.tutorDocuments) db.tutorDocuments = [];
    docTypes.forEach((docType, idx) => {
      db.tutorDocuments.push({
        id: `doc-${newTutor.id}-${idx + 1}`,
        tutorId: newTutor.id,
        docType,
        fileName: `${newTutor.fullName.replace(/\s+/g, '_')}_${docType.replace(/\s+/g, '_')}.pdf`,
        status: 'Pending',
        remarks: 'Awaiting candidate submission',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    lead.status = 'CONVERTED';
    lead.convertedType = 'TUTOR';
    lead.convertedId = newTutor.id;
    lead.updatedAt = new Date().toISOString();

    addLog(newTutor.id, 'Admin', 'LEAD_CONVERTED_TO_TUTOR', `Converted ${lead.leadSource} lead "${name}" into Tutor candidate ${newTutor.tutorId}.`);
    addNotification('Lead Converted to Tutor', `${name} (${lead.leadSource}) was successfully converted into Tutor ${newTutor.tutorId}.`, 'success', `/tutors/${newTutor.id}`);

    saveDB(db);
    return res.status(201).json({ success: true, tutor: newTutor, lead, message: `Lead successfully converted to Tutor ${newTutor.tutorId}` });
  }

  if (targetType === 'STUDENT') {
    // Duplicate check
    const dupStudent = (db.students || []).find(s =>
      (phone && ((s.phone && cleanPhone(s.phone) === phone) || (s.parentPhone && cleanPhone(s.parentPhone) === phone))) ||
      (userEmail && userEmail !== 'not provided' && ((s.email && s.email.toLowerCase() === userEmail) || (s.parentEmail && s.parentEmail.toLowerCase() === userEmail))) ||
      (lead.externalLeadId && s.externalLeadId === lead.externalLeadId)
    );

    if (dupStudent) {
      return res.status(400).json({
        error: `Duplicate student detected! A student with phone "${phone}" or email "${userEmail}" already exists: ${dupStudent.studentName} (${dupStudent.studentId}).`
      });
    }

    const studentId = 'STU-2026-' + ((db.students || []).length + 1).toString().padStart(3, '0');
    const parentId = 'PAR-2026-' + ((db.parents || []).length + 1).toString().padStart(3, '0');

    const newParent = {
      id: 'par-' + Date.now(),
      parentId,
      parentName: 'Parent Guardian',
      mobile: phone || '+919999999999',
      whatsapp: phone || '+919999999999',
      email: userEmail || 'parent@example.com',
      address: 'Not Provided',
      occupation: 'Not Provided',
      budget: 15000,
      tutorPreference: 'Experienced Tutor',
      studentIds: []
    };

    const newStudent = {
      id: 'stu-' + Date.now(),
      studentId,
      externalLeadId: lead.externalLeadId || lead.id,
      studentName: name,
      phone: phone || '+919999999999',
      parentPhone: phone || '+919999999999',
      email: userEmail || `${studentId.toLowerCase()}@example.com`,
      parentEmail: userEmail || 'parent@example.com',
      class: studentClass || lead.studentClass || '10th Standard',
      location: 'Student Residence',
      requiredSubjects: subjects || lead.subjects || ['General'],
      status: 'NEW',
      assignedTutorId: null,
      parentId: newParent.id,
      leadSource: lead.leadSource,
      platform: lead.platform,
      campaignName: lead.campaignName,
      adName: lead.adName,
      sourceCreatedAt: lead.sourceCreatedAt || lead.createdAt,
      createdAt: new Date().toISOString()
    };

    newParent.studentIds.push(newStudent.id);

    if (!db.parents) db.parents = [];
    if (!db.students) db.students = [];
    db.parents.unshift(newParent);
    db.students.unshift(newStudent);

    lead.status = 'CONVERTED';
    lead.convertedType = 'STUDENT';
    lead.convertedId = newStudent.id;
    lead.updatedAt = new Date().toISOString();

    addLog(null, 'Admin', 'LEAD_CONVERTED_TO_STUDENT', `Converted ${lead.leadSource} lead "${name}" into Student record ${newStudent.studentId}.`);
    addNotification('Lead Converted to Student', `${name} (${lead.leadSource}) was successfully converted into Student ${newStudent.studentId}.`, 'success', '/students-all');

    saveDB(db);
    return res.status(201).json({ success: true, student: newStudent, parent: newParent, lead, message: `Lead successfully converted to Student ${newStudent.studentId}` });
  }

  return res.status(400).json({ error: 'Invalid targetType. Must be TUTOR or STUDENT.' });
});

// 8. Link Lead to Existing Tutor or Student
app.post('/api/leads/:id/link', (req, res) => {
  const lead = (db.leads || []).find(l => l.id === req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const { targetType, targetId } = req.body;
  if (!targetType || !targetId) return res.status(400).json({ error: 'targetType and targetId required' });

  lead.status = 'CONVERTED';
  lead.convertedType = targetType;
  lead.convertedId = targetId;
  lead.updatedAt = new Date().toISOString();

  addLog(targetId, 'Admin', 'LEAD_LINKED_TO_RECORD', `Linked ${lead.leadSource} lead "${lead.name}" to ${targetType} ${targetId}.`);
  saveDB(db);

  res.json({ success: true, lead, message: `Lead successfully linked to ${targetType} ${targetId}` });
});

// 9. Delete Lead
app.delete('/api/leads/:id', (req, res) => {
  if (!db.leads) db.leads = [];
  db.leads = db.leads.filter(l => l.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Lead deleted successfully' });
});



// ============================================================================
// WHATSAPP COMMUNICATION MODULE: TEMPLATES, MESSAGING & HISTORY API
// ============================================================================

function replaceTemplateVariables(content, tutor, extra = {}) {
  if (!content) return '';
  const subjectsStr = Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : (tutor.subjects || 'All Subjects');
  const vars = {
    '{{tutor_name}}': tutor.fullName || 'Tutor',
    '{{phone_number}}': tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone || '',
    '{{subjects}}': subjectsStr,
    '{{experience}}': tutor.experience || `${tutor.experienceYears || 1} years`,
    '{{location}}': tutor.preferredLocation || 'Centre / Residence',
    '{{priority}}': (tutor.priority || 'NOT_ASSIGNED').replace(/_/g, ' '),
    '{{status}}': (tutor.status || 'NEW_APPLICATION').replace(/_/g, ' '),
    '{{availableTiming}}': tutor.availableTiming || '5:00 PM - 7:00 PM',
    '{{interview_date}}': extra.interview_date || extra.date || '08 Sep 2026',
    '{{interview_time}}': extra.interview_time || extra.time || '11:00 AM',
    '{{demo_date}}': extra.demo_date || extra.date || '10 Sep 2026',
    '{{demo_time}}': extra.demo_time || extra.time || '05:00 PM',
    '{{student_name}}': extra.student_name || 'Standard 10 Student',
    '{{subject}}': extra.subject || (Array.isArray(tutor.subjects) && tutor.subjects[0]) || 'Mathematics'
  };

  let result = content;
  for (const [k, v] of Object.entries(vars)) {
    result = result.split(k).join(v);
  }
  return result;
}

function createWhatsAppUrl(phone, text) {
  let cleanDigits = (phone || '').replace(/[^\d]/g, '');
  if (cleanDigits.length === 10) cleanDigits = '91' + cleanDigits;
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(text || '')}`;
}

// 1. Get all WhatsApp message templates
app.get('/api/whatsapp/templates', (req, res) => {
  res.json({ templates: db.whatsAppTemplates || db.whatsappTemplates || [] });
});

// 2. Create a new message template
app.post('/api/whatsapp/templates', (req, res) => {
  const { name, displayName, category, content: tContent, variables, language = 'en' } = req.body;
  if (!name || !tContent) {
    return res.status(400).json({ error: 'Template name and content are required' });
  }

  const newTemplate = {
    id: 'wtpl-' + Date.now(),
    name: name.toLowerCase().replace(/\s+/g, '_'),
    displayName: displayName || name,
    language,
    category: (category || 'UTILITY').toUpperCase(),
    content: tContent,
    variables: variables || [],
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (!db.whatsAppTemplates) db.whatsAppTemplates = [];
  db.whatsAppTemplates.push(newTemplate);
  if (!db.whatsappTemplates) db.whatsappTemplates = [];
  db.whatsappTemplates.push(newTemplate);
  saveDB(db);

  res.status(201).json({ success: true, template: newTemplate });
});

// 3. Update an existing template
app.put('/api/whatsapp/templates/:id', (req, res) => {
  const tmpl = (db.whatsAppTemplates || []).find(t => t.id === req.params.id);
  if (!tmpl) return res.status(404).json({ error: 'Template not found' });

  const { name, displayName, category, content: tContent, variables, status } = req.body;
  if (name !== undefined) tmpl.name = name;
  if (displayName !== undefined) tmpl.displayName = displayName;
  if (category !== undefined) tmpl.category = category;
  if (tContent !== undefined) tmpl.content = tContent;
  if (variables !== undefined) tmpl.variables = variables;
  if (status !== undefined) tmpl.status = status;
  tmpl.updatedAt = new Date().toISOString();

  saveDB(db);
  res.json({ success: true, template: tmpl });
});

// 4. Delete a template
app.delete('/api/whatsapp/templates/:id', (req, res) => {
  if (!db.whatsAppTemplates) db.whatsAppTemplates = [];
  db.whatsAppTemplates = db.whatsAppTemplates.filter(t => t.id !== req.params.id);
  if (db.whatsappTemplates) {
    db.whatsappTemplates = db.whatsappTemplates.filter(t => t.id !== req.params.id);
  }
  saveDB(db);
  res.json({ success: true, message: 'Template deleted successfully' });
});

// 5. Send single WhatsApp text message
app.post('/api/whatsapp/send', async (req, res) => {
  const { tutorId, phone, message, templateName, templateId, sentBy = 'Admin', extra = {} } = req.body;
  const tutor = (db.tutors || []).find(t => t.id === tutorId);
  const tutorName = tutor ? tutor.fullName : 'Tutor Contact';
  const targetPhone = phone || (tutor ? (tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone) : '');

  if (!targetPhone) {
    return res.status(400).json({ error: 'Recipient phone number is required' });
  }

  const processedMessage = tutor ? whatsappService.personalizeMessage(message, tutor, extra) : message;
  const sendResult = await whatsappService.sendTextMessage(targetPhone, processedMessage);
  const now = new Date().toISOString();

  const msgId = 'wam-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const providerMessageId = sendResult.providerMessageId || ('wamid.HBg' + Date.now());

  // 1. Save to db.whatsAppMessages
  if (!db.whatsAppMessages) db.whatsAppMessages = [];
  const messageRecord = {
    id: msgId,
    tutorId: tutor ? tutor.id : null,
    direction: 'OUTBOUND',
    messageType: templateName ? 'TEMPLATE' : 'TEXT',
    messageText: processedMessage,
    templateName: templateName || null,
    phoneNumber: sendResult.phoneNumber || targetPhone,
    providerMessageId,
    status: sendResult.success ? 'SENT' : 'FAILED',
    errorCode: sendResult.errorCode || null,
    errorMessage: sendResult.errorMessage || null,
    sentAt: now,
    deliveredAt: null,
    readAt: null,
    createdAt: now,
    updatedAt: now
  };
  db.whatsAppMessages.unshift(messageRecord);

  // 2. Save backward-compatible history item
  if (!db.whatsappHistory) db.whatsappHistory = [];
  db.whatsappHistory.unshift({
    id: 'wa-hist-' + Date.now(),
    tutorId: tutor ? tutor.id : null,
    tutorName,
    phoneNumber: sendResult.phoneNumber || targetPhone,
    phone: sendResult.phoneNumber || targetPhone,
    message: processedMessage,
    templateId: templateId || 'direct',
    templateName: templateName || 'Direct WhatsApp Message',
    sentAt: now,
    date: now,
    createdAt: now,
    status: sendResult.success ? 'Sent' : 'Failed',
    providerMessageId,
    errorMessage: sendResult.errorMessage || null,
    sentBy
  });

  // 3. Update Contact
  if (!db.whatsAppContacts) db.whatsAppContacts = [];
  let contact = db.whatsAppContacts.find(c => (tutor && c.tutorId === tutor.id) || c.phoneNumber === sendResult.phoneNumber);
  if (!contact && tutor) {
    contact = {
      id: 'wac-' + tutor.id,
      tutorId: tutor.id,
      phoneNumber: sendResult.phoneNumber || targetPhone,
      displayName: tutor.fullName,
      whatsappOptIn: tutor.whatsappOptIn || 'YES',
      lastMessageAt: now,
      lastInboundMessageAt: null,
      lastOutboundMessageAt: now,
      conversationStatus: 'OPEN',
      unreadCount: 0,
      createdAt: now,
      updatedAt: now
    };
    db.whatsAppContacts.unshift(contact);
  } else if (contact) {
    contact.lastMessageAt = now;
    contact.lastOutboundMessageAt = now;
    contact.updatedAt = now;
  }

  // 4. Log to db.whatsAppApiLogs
  if (!db.whatsAppApiLogs) db.whatsAppApiLogs = [];
  db.whatsAppApiLogs.unshift({
    id: 'api-log-' + Date.now(),
    timestamp: now,
    endpoint: '/api/whatsapp/send',
    requestType: 'SEND_TEXT',
    tutorId: tutor ? tutor.id : null,
    tutorName,
    providerMessageId,
    httpStatus: sendResult.success ? 200 : 400,
    result: sendResult.success ? 'SUCCESS' : 'FAILED',
    error: sendResult.errorMessage || null
  });

  if (!db.whatsAppConfig) db.whatsAppConfig = {};
  db.whatsAppConfig.lastApiRequestAt = now;

  addLog(tutor ? tutor.id : null, sentBy, 'WHATSAPP_MESSAGE_SENT', `WhatsApp message sent to ${tutorName} (${targetPhone}).`);
  saveDB(db);

  broadcastWhatsAppEvent('message_sent', { message: messageRecord, contact });

  res.json({
    success: sendResult.success,
    messageId: providerMessageId,
    tutorId: tutor ? tutor.id : null,
    status: sendResult.success ? 'SENT' : 'FAILED',
    message: processedMessage,
    error: sendResult.errorMessage || null
  });
});

// 6. Send WhatsApp Template Message with Database Dynamic Interpolation
app.post('/api/whatsapp/template', async (req, res) => {
  const { tutorId, templateName, languageCode = 'en', extra = {}, sentBy = 'Admin' } = req.body;
  const tutor = (db.tutors || []).find(t => t.id === tutorId);
  if (!tutor) {
    return res.status(404).json({ error: 'Tutor not found' });
  }

  const targetPhone = tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone;
  if (!targetPhone) {
    return res.status(400).json({ error: 'Tutor has no phone number on record' });
  }

  // Find template by name
  const allTemplates = db.whatsAppTemplates || db.whatsappTemplates || [];
  const tmpl = allTemplates.find(t => t.name === templateName || t.id === templateName);
  const templateContent = tmpl ? tmpl.content : (req.body.content || 'Hello {{tutor_name}}, regarding your tutor application at TutorConnect.');

  const processedMessage = whatsappService.personalizeMessage(templateContent, tutor, extra);
  const sendResult = await whatsappService.sendTextMessage(targetPhone, processedMessage);
  const now = new Date().toISOString();
  const providerMessageId = sendResult.providerMessageId || ('wamid.HBg' + Date.now());

  // Record in whatsAppMessages
  if (!db.whatsAppMessages) db.whatsAppMessages = [];
  const messageRecord = {
    id: 'wam-tmpl-' + Date.now(),
    tutorId: tutor.id,
    direction: 'OUTBOUND',
    messageType: 'TEMPLATE',
    messageText: processedMessage,
    templateName: tmpl ? tmpl.name : templateName,
    phoneNumber: sendResult.phoneNumber || targetPhone,
    providerMessageId,
    status: sendResult.success ? 'SENT' : 'FAILED',
    errorCode: sendResult.errorCode || null,
    errorMessage: sendResult.errorMessage || null,
    sentAt: now,
    deliveredAt: null,
    readAt: null,
    createdAt: now,
    updatedAt: now
  };
  db.whatsAppMessages.unshift(messageRecord);

  // Update backward-compat history
  if (!db.whatsappHistory) db.whatsappHistory = [];
  db.whatsappHistory.unshift({
    id: 'wa-hist-' + Date.now(),
    tutorId: tutor.id,
    tutorName: tutor.fullName,
    phoneNumber: sendResult.phoneNumber || targetPhone,
    phone: sendResult.phoneNumber || targetPhone,
    message: processedMessage,
    templateId: tmpl ? tmpl.id : 'template',
    templateName: tmpl ? tmpl.displayName || tmpl.name : templateName,
    sentAt: now,
    date: now,
    createdAt: now,
    status: sendResult.success ? 'Sent' : 'Failed',
    providerMessageId,
    errorMessage: sendResult.errorMessage || null,
    sentBy
  });

  // Update Contact
  if (!db.whatsAppContacts) db.whatsAppContacts = [];
  let contact = db.whatsAppContacts.find(c => c.tutorId === tutor.id);
  if (contact) {
    contact.lastMessageAt = now;
    contact.lastOutboundMessageAt = now;
    contact.updatedAt = now;
  }

  // Log API dispatch
  if (!db.whatsAppApiLogs) db.whatsAppApiLogs = [];
  db.whatsAppApiLogs.unshift({
    id: 'api-log-' + Date.now(),
    timestamp: now,
    endpoint: '/api/whatsapp/template',
    requestType: 'SEND_TEMPLATE',
    tutorId: tutor.id,
    tutorName: tutor.fullName,
    providerMessageId,
    httpStatus: sendResult.success ? 200 : 400,
    result: sendResult.success ? 'SUCCESS' : 'FAILED',
    error: sendResult.errorMessage || null
  });

  if (!db.whatsAppConfig) db.whatsAppConfig = {};
  db.whatsAppConfig.lastApiRequestAt = now;

  addLog(tutor.id, sentBy, 'WHATSAPP_TEMPLATE_SENT', `WhatsApp template '${tmpl ? tmpl.name : templateName}' sent to ${tutor.fullName}.`);
  saveDB(db);

  broadcastWhatsAppEvent('message_sent', { message: messageRecord, contact });

  res.json({
    success: sendResult.success,
    messageId: providerMessageId,
    tutorId: tutor.id,
    status: sendResult.success ? 'SENT' : 'FAILED',
    messageText: processedMessage,
    error: sendResult.errorMessage || null
  });
});

// 7. Bulk send WhatsApp messages via official WhatsApp Business API
app.post('/api/whatsapp/bulk-send', async (req, res) => {
  const { tutorIds, message, messageTemplate, templateName, templateId, languageCode = 'en', extra = {} } = req.body;
  if (!Array.isArray(tutorIds) || tutorIds.length === 0) {
    return res.status(400).json({ error: 'No tutors selected' });
  }

  // Find template content if templateName provided
  let templateText = message || messageTemplate || '';
  if (!templateText && templateName) {
    const tmpl = (db.whatsAppTemplates || []).find(t => t.name === templateName || t.id === templateName);
    if (tmpl) templateText = tmpl.content;
  }

  if (!templateText.trim()) {
    return res.status(400).json({ error: 'Message content or template name is required' });
  }

  // Must process ALL selected tutors individually
  const selectedTutors = (db.tutors || []).filter(t => tutorIds.includes(t.id));
  const bulkId = 'bulk-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  const now = new Date().toISOString();

  // Execute bulk dispatch via WhatsApp Business API service layer
  const bulkResult = await whatsappService.sendBulkTemplateMessages(selectedTutors, templateText, {
    templateName: templateName || 'bulk_campaign',
    templateId,
    languageCode,
    messageTemplate: templateText,
    extra
  });

  if (!db.whatsAppMessages) db.whatsAppMessages = [];
  if (!db.whatsappHistory) db.whatsappHistory = [];

  // Log every individual recipient in database
  bulkResult.results.forEach(r => {
    if (r.status === 'SENT') {
      const msgId = 'wam-bulk-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
      db.whatsAppMessages.unshift({
        id: msgId,
        tutorId: r.tutorId,
        direction: 'OUTBOUND',
        messageType: 'TEMPLATE',
        messageText: r.message,
        templateName: r.templateName,
        phoneNumber: r.phoneNumber,
        providerMessageId: r.providerMessageId,
        status: 'SENT',
        errorCode: null,
        errorMessage: null,
        sentAt: r.sentAt || now,
        deliveredAt: null,
        readAt: null,
        createdAt: r.sentAt || now,
        updatedAt: now
      });

      // Update contact
      const contact = (db.whatsAppContacts || []).find(c => c.tutorId === r.tutorId);
      if (contact) {
        contact.lastMessageAt = now;
        contact.lastOutboundMessageAt = now;
        contact.updatedAt = now;
      }
    }

    db.whatsappHistory.unshift({
      id: 'wa-hist-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
      bulkId,
      tutorId: r.tutorId,
      tutorName: r.name || r.tutorName,
      phoneNumber: r.phoneNumber,
      phone: r.phoneNumber,
      message: r.message,
      templateId: templateId || 'custom',
      templateName: r.templateName || templateName || 'Bulk Campaign',
      sentAt: r.sentAt || now,
      date: r.sentAt || now,
      createdAt: now,
      status: r.status === 'SENT' ? 'Sent' : (r.status === 'SKIPPED' ? 'Skipped' : 'Failed'),
      providerMessageId: r.providerMessageId || null,
      errorMessage: r.error || r.reason || null,
      sentBy: 'Admin'
    });
  });

  // Log to WhatsAppApiLogs
  if (!db.whatsAppApiLogs) db.whatsAppApiLogs = [];
  db.whatsAppApiLogs.unshift({
    id: 'api-bulk-' + Date.now(),
    timestamp: now,
    endpoint: '/api/whatsapp/bulk-send',
    requestType: 'BULK_SEND',
    tutorId: null,
    tutorName: `Batch of ${selectedTutors.length} Tutors`,
    providerMessageId: `bulk-${Date.now()}`,
    httpStatus: 200,
    result: bulkResult.sent > 0 ? 'SUCCESS' : 'FAILED',
    error: bulkResult.failed > 0 ? `${bulkResult.failed} transmissions failed` : null
  });

  if (!db.whatsAppConfig) db.whatsAppConfig = {};
  db.whatsAppConfig.lastApiRequestAt = now;

  addLog(null, 'Admin', 'WHATSAPP_BULK_SENT', `Bulk WhatsApp message dispatched to ${bulkResult.sent} tutors via WhatsApp Business API.`);
  saveDB(db);

  broadcastWhatsAppEvent('bulk_sent', { summary: bulkResult.summary, bulkId });

  res.json({
    success: true,
    total: bulkResult.total,
    sent: bulkResult.sent,
    failed: bulkResult.failed,
    invalid: bulkResult.invalid,
    skipped: bulkResult.skipped,
    summary: bulkResult.summary,
    results: bulkResult.results
  });
});

// 8. Get WhatsApp Dashboard Stats
app.get('/api/whatsapp/dashboard-stats', (req, res) => {
  const contacts = db.whatsAppContacts || [];
  const messages = db.whatsAppMessages || [];
  const config = db.whatsAppConfig || {};
  const todayPrefix = new Date().toISOString().slice(0, 10);

  const totalContacts = contacts.length;
  const messagesSent = messages.filter(m => m.direction === 'OUTBOUND' && ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length;
  const messagesDelivered = messages.filter(m => ['DELIVERED', 'READ'].includes(m.status)).length;
  const messagesRead = messages.filter(m => m.status === 'READ').length;
  const messagesFailed = messages.filter(m => m.status === 'FAILED').length;
  const incomingMessages = messages.filter(m => m.direction === 'INBOUND').length;
  const unreadMessages = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  const todayMessages = messages.filter(m => (m.createdAt || '').startsWith(todayPrefix)).length;

  const hasLiveToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && !process.env.WHATSAPP_ACCESS_TOKEN.includes('placeholder'));

  res.json({
    success: true,
    stats: {
      totalContacts,
      messagesSent,
      messagesDelivered,
      messagesRead,
      messagesFailed,
      incomingMessages,
      unreadMessages,
      todayMessages,
      connectionStatus: hasLiveToken ? 'CONNECTED' : 'SANDBOX_ACTIVE',
      webhookStatus: config.webhookVerified ? 'ACTIVE' : 'PENDING_VERIFICATION',
      lastWebhookReceivedAt: config.lastWebhookReceivedAt || null,
      lastApiRequestAt: config.lastApiRequestAt || null
    },
    recentMessages: messages.slice(0, 8)
  });
});

// 9. Conversations List (WhatsApp Inbox)
app.get('/api/whatsapp/conversations', (req, res) => {
  const contacts = [...(db.whatsAppContacts || [])];
  const messages = db.whatsAppMessages || [];

  const conversations = contacts.map(contact => {
    const contactMessages = messages.filter(m =>
      (contact.tutorId && m.tutorId === contact.tutorId) ||
      (contact.phoneNumber && m.phoneNumber === contact.phoneNumber)
    );
    const lastMsg = contactMessages[0] || null; // messages are unshifted (newest first)
    const tutor = (db.tutors || []).find(t => t.id === contact.tutorId);

    return {
      id: contact.id,
      contactId: contact.id,
      tutorId: contact.tutorId,
      tutorName: contact.displayName || (tutor ? tutor.fullName : 'Tutor Contact'),
      phoneNumber: contact.phoneNumber,
      whatsappOptIn: contact.whatsappOptIn || (tutor ? tutor.whatsappOptIn : 'YES'),
      lastMessageText: lastMsg ? lastMsg.messageText : 'No messages yet',
      lastMessageTime: lastMsg ? lastMsg.createdAt : contact.createdAt,
      lastMessageDirection: lastMsg ? lastMsg.direction : 'OUTBOUND',
      lastMessageStatus: lastMsg ? lastMsg.status : 'NONE',
      unreadCount: contact.unreadCount || 0,
      conversationStatus: contact.conversationStatus || 'OPEN'
    };
  });

  // Sort by last message time descending
  conversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  res.json({ success: true, conversations, total: conversations.length });
});

// 10. Conversation Thread Messages
app.get('/api/whatsapp/conversations/:contactId/messages', (req, res) => {
  const contact = (db.whatsAppContacts || []).find(c => c.id === req.params.contactId || c.tutorId === req.params.contactId);
  if (!contact) {
    return res.status(404).json({ error: 'Conversation contact not found' });
  }

  const tutor = (db.tutors || []).find(t => t.id === contact.tutorId);
  const messages = (db.whatsAppMessages || []).filter(m =>
    (contact.tutorId && m.tutorId === contact.tutorId) ||
    (contact.phoneNumber && m.phoneNumber === contact.phoneNumber)
  );

  // Return sorted chronologically (oldest to newest) for chat view
  const chatMessages = [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json({
    success: true,
    contact,
    tutor: tutor || null,
    messages: chatMessages,
    total: chatMessages.length
  });
});

// 11. Mark Conversation as Read
app.post('/api/whatsapp/conversations/:contactId/read', (req, res) => {
  const contact = (db.whatsAppContacts || []).find(c => c.id === req.params.contactId || c.tutorId === req.params.contactId);
  if (!contact) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  contact.unreadCount = 0;
  contact.updatedAt = new Date().toISOString();

  // Mark all inbound messages for this contact as READ
  (db.whatsAppMessages || []).forEach(m => {
    if ((m.tutorId === contact.tutorId || m.phoneNumber === contact.phoneNumber) && m.direction === 'INBOUND') {
      m.readAt = new Date().toISOString();
      m.status = 'READ';
    }
  });

  saveDB(db);
  broadcastWhatsAppEvent('conversation_read', { contactId: contact.id });

  res.json({ success: true, contact, message: 'Conversation marked as read' });
});

// 12. WhatsApp Contacts List
app.get('/api/whatsapp/contacts', (req, res) => {
  let list = [...(db.whatsAppContacts || [])];
  const { search, optIn } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(c =>
      (c.displayName && c.displayName.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q))
    );
  }

  if (optIn && optIn !== 'ALL') {
    list = list.filter(c => (c.whatsappOptIn || 'YES').toUpperCase() === optIn.toUpperCase());
  }

  res.json({ success: true, contacts: list, total: list.length });
});

// 13. WhatsApp Settings Configuration API (Masked Credentials)
app.get('/api/whatsapp/settings', (req, res) => {
  const config = db.whatsAppConfig || {};
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && !process.env.WHATSAPP_ACCESS_TOKEN.includes('placeholder'));
  const hasSecret = Boolean(process.env.WHATSAPP_APP_SECRET && !process.env.WHATSAPP_APP_SECRET.includes('placeholder'));

  res.json({
    success: true,
    settings: {
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || config.businessAccountId || '192837465019283',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || config.phoneNumberId || '109283746501928',
      apiVersion: process.env.WHATSAPP_API_VERSION || config.apiVersion || 'v20.0',
      webhookUrl: process.env.WHATSAPP_WEBHOOK_URL || config.webhookUrl || 'http://localhost:5001/api/webhooks/whatsapp',
      webhookVerified: Boolean(config.webhookVerified),
      connectionStatus: hasToken ? 'CONNECTED' : 'SANDBOX_ACTIVE',
      lastWebhookReceivedAt: config.lastWebhookReceivedAt || null,
      lastApiRequestAt: config.lastApiRequestAt || null,
      maskedAccessToken: '••••••••••••••••••••••••••••••••',
      maskedAppSecret: '••••••••••••••••••••••••••••••••'
    }
  });
});

app.post('/api/whatsapp/settings', (req, res) => {
  const { businessAccountId, phoneNumberId, apiVersion, webhookUrl } = req.body;
  if (!db.whatsAppConfig) db.whatsAppConfig = {};

  if (businessAccountId) db.whatsAppConfig.businessAccountId = businessAccountId;
  if (phoneNumberId) db.whatsAppConfig.phoneNumberId = phoneNumberId;
  if (apiVersion) db.whatsAppConfig.apiVersion = apiVersion;
  if (webhookUrl) db.whatsAppConfig.webhookUrl = webhookUrl;
  db.whatsAppConfig.updatedAt = new Date().toISOString();

  saveDB(db);
  whatsappService.refreshConfig();

  res.json({ success: true, message: 'WhatsApp configuration saved successfully', settings: db.whatsAppConfig });
});

// 14. Test Connection
app.post('/api/whatsapp/test-connection', async (req, res) => {
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && !process.env.WHATSAPP_ACCESS_TOKEN.includes('placeholder'));
  const now = new Date().toISOString();

  if (!db.whatsAppConfig) db.whatsAppConfig = {};
  db.whatsAppConfig.lastApiRequestAt = now;
  saveDB(db);

  if (hasToken) {
    res.json({
      success: true,
      status: 'CONNECTED',
      message: 'Meta WhatsApp Cloud API connection verified successfully.'
    });
  } else {
    res.json({
      success: true,
      status: 'SANDBOX_READY',
      message: 'Running in simulated local sandbox mode. Ready to transmit mock provider messages.'
    });
  }
});

// 15. Test Webhook Simulation
app.post('/api/whatsapp/test-webhook', async (req, res) => {
  const { testType = 'inbound', phoneNumber = '+919942323234', message = 'Test inbound message from candidate' } = req.body;
  const now = new Date().toISOString();
  const testWamid = 'wamid.test.' + Date.now();

  if (testType === 'inbound') {
    const matchedTutor = (db.tutors || []).find(t => {
      const tPhone = t.whatsappPhoneNumber || t.mobile || t.phone || '';
      return whatsappService.normalizePhoneNumber(tPhone) === whatsappService.normalizePhoneNumber(phoneNumber);
    });

    if (!db.whatsAppMessages) db.whatsAppMessages = [];
    const inMsg = {
      id: 'wam-test-' + Date.now(),
      tutorId: matchedTutor ? matchedTutor.id : null,
      direction: 'INBOUND',
      messageType: 'TEXT',
      messageText: message,
      templateName: null,
      phoneNumber,
      providerMessageId: testWamid,
      status: 'RECEIVED',
      errorCode: null,
      errorMessage: null,
      sentAt: now,
      deliveredAt: now,
      readAt: null,
      createdAt: now,
      updatedAt: now
    };
    db.whatsAppMessages.unshift(inMsg);

    let contact = (db.whatsAppContacts || []).find(c => (matchedTutor && c.tutorId === matchedTutor.id) || c.phoneNumber === phoneNumber);
    if (contact) {
      contact.lastMessageAt = now;
      contact.lastInboundMessageAt = now;
      contact.unreadCount = (contact.unreadCount || 0) + 1;
    }

    if (!db.whatsAppWebhookLogs) db.whatsAppWebhookLogs = [];
    db.whatsAppWebhookLogs.unshift({
      id: 'wh-test-' + Date.now(),
      timestamp: now,
      eventType: 'inbound_message',
      providerMessageId: testWamid,
      phoneNumber,
      processingStatus: 'Processed',
      error: null,
      summary: `Simulated inbound test message from ${phoneNumber}: "${message}"`
    });

    saveDB(db);
    broadcastWhatsAppEvent('inbound_message', { message: inMsg, contact });

    return res.json({ success: true, message: 'Inbound webhook test event processed', messageId: testWamid });
  }

  // Delivery receipt simulation
  const lastMsg = (db.whatsAppMessages || []).find(m => m.direction === 'OUTBOUND');
  if (lastMsg) {
    lastMsg.status = 'DELIVERED';
    lastMsg.deliveredAt = now;
    saveDB(db);
    broadcastWhatsAppEvent('message_status', { providerMessageId: lastMsg.providerMessageId, status: 'DELIVERED', timestamp: now });
  }

  res.json({ success: true, message: 'Status callback test event processed', messageId: lastMsg?.providerMessageId });
});

// 16. Test Send to Single Number
app.post('/api/whatsapp/test-send', async (req, res) => {
  const { testNumber, message = 'Hello from TutorConnect WhatsApp diagnostic test!' } = req.body;
  if (!testNumber) {
    return res.status(400).json({ error: 'Test number is required' });
  }

  const sendResult = await whatsappService.sendTextMessage(testNumber, message);
  const now = new Date().toISOString();

  if (!db.whatsAppApiLogs) db.whatsAppApiLogs = [];
  db.whatsAppApiLogs.unshift({
    id: 'api-test-' + Date.now(),
    timestamp: now,
    endpoint: '/api/whatsapp/test-send',
    requestType: 'TEST_SEND',
    tutorId: null,
    tutorName: 'Diagnostic Test',
    providerMessageId: sendResult.providerMessageId || null,
    httpStatus: sendResult.success ? 200 : 400,
    result: sendResult.success ? 'SUCCESS' : 'FAILED',
    error: sendResult.errorMessage || null
  });

  if (!db.whatsAppConfig) db.whatsAppConfig = {};
  db.whatsAppConfig.lastApiRequestAt = now;
  saveDB(db);

  res.json({
    success: sendResult.success,
    providerMessageId: sendResult.providerMessageId,
    phoneNumber: sendResult.phoneNumber || testNumber,
    message: sendResult.success ? 'Test message dispatched successfully' : (sendResult.errorMessage || 'Failed to dispatch')
  });
});

// 17. Webhook Logs API
app.get('/api/whatsapp/webhook-logs', (req, res) => {
  let logs = [...(db.whatsAppWebhookLogs || [])];
  const { eventType, search } = req.query;

  if (eventType && eventType !== 'ALL') {
    logs = logs.filter(l => (l.eventType || '').toLowerCase() === eventType.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(l =>
      (l.phoneNumber && l.phoneNumber.includes(q)) ||
      (l.providerMessageId && l.providerMessageId.toLowerCase().includes(q)) ||
      (l.summary && l.summary.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, logs, total: logs.length });
});

// 18. API Logs API
app.get('/api/whatsapp/api-logs', (req, res) => {
  let logs = [...(db.whatsAppApiLogs || [])];
  const { requestType, result } = req.query;

  if (requestType && requestType !== 'ALL') {
    logs = logs.filter(l => (l.requestType || '').toUpperCase() === requestType.toUpperCase());
  }

  if (result && result !== 'ALL') {
    logs = logs.filter(l => (l.result || '').toUpperCase() === result.toUpperCase());
  }

  res.json({ success: true, logs, total: logs.length });
});

// 19. Dedicated Tutor WhatsApp View API
app.get('/api/tutors/:id/whatsapp', (req, res) => {
  const tutor = (db.tutors || []).find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const contact = (db.whatsAppContacts || []).find(c => c.tutorId === tutor.id);
  const messages = (db.whatsAppMessages || []).filter(m =>
    m.tutorId === tutor.id ||
    (tutor.whatsappPhoneNumber && m.phoneNumber === tutor.whatsappPhoneNumber)
  );

  const total = messages.length;
  const sent = messages.filter(m => m.direction === 'OUTBOUND' && ['SENT', 'DELIVERED', 'READ'].includes(m.status)).length;
  const delivered = messages.filter(m => ['DELIVERED', 'READ'].includes(m.status)).length;
  const read = messages.filter(m => m.status === 'READ').length;
  const failed = messages.filter(m => m.status === 'FAILED').length;
  const received = messages.filter(m => m.direction === 'INBOUND').length;

  res.json({
    success: true,
    tutor: {
      id: tutor.id,
      fullName: tutor.fullName,
      phoneNumber: tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone,
      whatsappOptIn: tutor.whatsappOptIn || 'YES',
      status: tutor.status,
      priority: tutor.priority
    },
    contact: contact || null,
    stats: {
      total,
      sent,
      delivered,
      read,
      failed,
      received
    },
    messages: messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  });
});

// 20. Backward Compatible Get WhatsApp History API
app.get('/api/whatsapp/history', (req, res) => {
  let list = [...(db.whatsAppMessages || db.whatsappHistory || [])];
  const { tutorId, status, search } = req.query;

  if (tutorId) {
    list = list.filter(h => h.tutorId === tutorId);
  }

  if (status && status !== 'ALL') {
    list = list.filter(h => (h.status || '').toUpperCase() === status.toUpperCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(h =>
      (h.tutorName && h.tutorName.toLowerCase().includes(q)) ||
      (h.phoneNumber && h.phoneNumber.includes(q)) ||
      (h.phone && h.phone.includes(q)) ||
      (h.message && h.message.toLowerCase().includes(q)) ||
      (h.messageText && h.messageText.toLowerCase().includes(q)) ||
      (h.templateName && h.templateName.toLowerCase().includes(q))
    );
  }

  res.json({ history: list, total: list.length });
});

// 21. Toggle / update tutor WhatsApp Opt-In
app.patch('/api/tutors/:id/whatsapp-opt-in', (req, res) => {
  const tutor = (db.tutors || []).find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const { optIn } = req.body;
  if (!['YES', 'NO', 'UNKNOWN'].includes(optIn)) {
    return res.status(400).json({ error: 'optIn must be YES, NO, or UNKNOWN' });
  }

  tutor.whatsappOptIn = optIn;

  // Sync to contact
  const contact = (db.whatsAppContacts || []).find(c => c.tutorId === tutor.id);
  if (contact) {
    contact.whatsappOptIn = optIn;
    contact.updatedAt = new Date().toISOString();
  }

  addLog(tutor.id, 'Admin', 'WHATSAPP_OPTIN_UPDATED', `Updated WhatsApp opt-in consent for ${tutor.fullName} to ${optIn}.`);
  saveDB(db);

  res.json({ success: true, tutor, contact, message: `WhatsApp opt-in updated to ${optIn}` });
});


// =========================================================================
// AUTOMATIC TUTOR PRIORITY SCORING SYSTEM API
// =========================================================================

// Get scoring weights configuration
app.get('/api/priority/config', (req, res) => {
  res.json({
    success: true,
    config: db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS
  });
});

// Update scoring weights configuration (validates total = 100%)
app.put('/api/priority/config', (req, res) => {
  const {
    experienceWeight,
    subjectDemandWeight,
    homeTuitionWeight,
    qualificationWeight,
    locationMatchWeight,
    timingMatchWeight
  } = req.body;

  const weights = {
    experienceWeight: Number(experienceWeight) || 0,
    subjectDemandWeight: Number(subjectDemandWeight) || 0,
    homeTuitionWeight: Number(homeTuitionWeight) || 0,
    qualificationWeight: Number(qualificationWeight) || 0,
    locationMatchWeight: Number(locationMatchWeight) || 0,
    timingMatchWeight: Number(timingMatchWeight) || 0
  };

  const total = weights.experienceWeight + weights.subjectDemandWeight + weights.homeTuitionWeight +
                weights.qualificationWeight + weights.locationMatchWeight + weights.timingMatchWeight;

  if (total !== 100) {
    return res.status(400).json({
      error: `Total weights must equal exactly 100%. Current total is ${total}%.`
    });
  }

  db.priorityConfig = weights;
  const summary = triggerPriorityRecalculation();
  addLog(null, 'Admin', 'PRIORITY_CONFIG_UPDATED', `Updated tutor priority weights. Total recalculated: ${summary.total}.`);
  saveDB(db);

  res.json({
    success: true,
    message: 'Priority weights updated and all tutor scores recalculated successfully.',
    config: db.priorityConfig,
    summary
  });
});

// Trigger complete recalculation of all tutors
app.post('/api/priority/recalculate', (req, res) => {
  const summary = triggerPriorityRecalculation();
  addLog(null, 'Admin', 'PRIORITY_RECALCULATED', `Manually triggered priority recalculation for ${summary.total} tutors.`);
  res.json({
    success: true,
    message: `Recalculated priority scores for ${summary.total} tutors.`,
    summary
  });
});

// Priority Dashboard Analytics & Top 10 Tutors
app.get('/api/priority/stats', (req, res) => {
  const tutors = db.tutors || [];
  const totalTutors = tutors.length;
  const highPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'HIGH_PRIORITY').length;
  const mediumPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'MEDIUM_PRIORITY').length;
  const lowPriorityTutors = tutors.filter(t => (t.priorityLevel || t.priority) === 'LOW_PRIORITY').length;

  const totalScore = tutors.reduce((acc, t) => acc + (t.priorityScore || 0), 0);
  const averageScore = totalTutors > 0 ? Number((totalScore / totalTutors).toFixed(1)) : 0;

  const top10Tutors = [...tutors]
    .sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0))
    .slice(0, 10);

  const studentDemand = priorityEngine.computeStudentDemand(db.students || []);

  res.json({
    success: true,
    totalTutors,
    highPriority: {
      count: highPriorityTutors,
      percentage: totalTutors > 0 ? Number(((highPriorityTutors / totalTutors) * 100).toFixed(1)) : 0
    },
    mediumPriority: {
      count: mediumPriorityTutors,
      percentage: totalTutors > 0 ? Number(((mediumPriorityTutors / totalTutors) * 100).toFixed(1)) : 0
    },
    lowPriority: {
      count: lowPriorityTutors,
      percentage: totalTutors > 0 ? Number(((lowPriorityTutors / totalTutors) * 100).toFixed(1)) : 0
    },
    averageScore,
    top10Tutors,
    studentDemand
  });
});

// Single Tutor Priority Analysis Breakdown
app.get('/api/tutors/:id/priority-breakdown', (req, res) => {
  const tutor = (db.tutors || []).find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  if (!tutor.priorityBreakdown) {
    const demand = priorityEngine.computeStudentDemand(db.students || []);
    const calc = priorityEngine.calculateTutorPriority(tutor, demand, db.priorityConfig || priorityEngine.DEFAULT_WEIGHTS);
    tutor.priorityScore = calc.priorityScore;
    tutor.priorityLevel = calc.priorityLevel;
    tutor.priorityBreakdown = calc.priorityBreakdown;
    tutor.priorityExplanation = calc.priorityExplanation;
    tutor.lowPriorityReasons = calc.lowPriorityReasons;
    tutor.lastPriorityCalculatedAt = calc.lastPriorityCalculatedAt;
    saveDB(db);
  }

  res.json({
    success: true,
    tutor
  });
});




// =========================================================================
// AUTHENTICATION, JWT, ROLE PROTECTION & DAILY TUTOR UPDATES
// =========================================================================

const multer = require('multer');

// Uploads Directory for Daily Updates Photos
const uploadsDir = path.join(__dirname, '../uploads/daily-updates');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure Multer for Daily Update Photos
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'update-' + uniqueSuffix + ext);
  }
});

const uploadDailyUpdatePhoto = multer({
  storage: uploadStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only images (.jpg, .jpeg, .png, .webp) are allowed!'));
  }
});

// Phone Number Comparison Helper
function phonesMatch(p1, p2) {
  if (!p1 || !p2) return false;
  const c1 = cleanPhone(p1).replace(/\D/g, '');
  const c2 = cleanPhone(p2).replace(/\D/g, '');
  if (!c1 || !c2) return false;
  if (c1 === c2) return true;
  const l1 = c1.slice(-10);
  const l2 = c2.slice(-10);
  return l1.length === 10 && l2.length === 10 && l1 === l2;
}

// -------------------------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { role, username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please enter username and password.' });
  }

  const cleanUser = String(username).trim();
  const cleanPass = String(password).trim();
  const selectedRole = String(role || '').trim();

  // 1. ADMIN LOGIN
  if (selectedRole.toLowerCase() === 'admin') {
    if (cleanUser.toLowerCase() === 'admin' && cleanPass === '1234') {
      const userPayload = {
        userId: 'admin-001',
        role: 'ADMIN',
        name: 'System Administrator',
        username: 'admin'
      };
      const token = signToken(userPayload);
      return res.json({
        success: true,
        token,
        user: userPayload,
        redirectUrl: '/admin/dashboard'
      });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }
  }

  // 2. TUTOR LOGIN
  if (selectedRole.toLowerCase() === 'tutor') {
    const tutors = db.tutors || [];
    const tutor = tutors.find(t =>
      t.fullName && t.fullName.trim().toLowerCase() === cleanUser.toLowerCase() && t.isDeleted !== true
    );

    if (!tutor) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    // Check Tutor Appointment Status
    const isAppointed =
      tutor.status === 'TUTOR_APPOINTED' ||
      tutor.status === 'APPOINTED' ||
      tutor.currentStage === 'TUTOR_APPOINTED';

    if (!isAppointed) {
      return res.status(403).json({
        success: false,
        error: 'Your tutor account is not active yet. Please contact the administrator.'
      });
    }

    // Check Phone Password
    const tutorPhone = tutor.mobile || tutor.phone || tutor.whatsappPhoneNumber;
    if (!phonesMatch(tutorPhone, cleanPass)) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const userPayload = {
      userId: tutor.id,
      tutorId: tutor.id,
      role: 'TUTOR',
      name: tutor.fullName,
      fullName: tutor.fullName,
      mobile: tutor.mobile || tutor.phone,
      email: tutor.email,
      subjects: tutor.subjects,
      qualification: tutor.qualification,
      status: tutor.status
    };
    const token = signToken(userPayload);
    return res.json({
      success: true,
      token,
      user: userPayload,
      redirectUrl: '/tutor/dashboard'
    });
  }

  // 3. PARENT LOGIN
  if (selectedRole.toLowerCase() === 'parent') {
    const students = db.students || [];
    const student = students.find(s => {
      const name = s.studentName || s.fullName || s.name;
      return name && name.trim().toLowerCase() === cleanUser.toLowerCase() && s.isDeleted !== true;
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student account not found.' });
    }

    const studentPhone = student.phone || student.parentPhone || student.mobile;
    if (!phonesMatch(studentPhone, cleanPass)) {
      return res.status(401).json({ success: false, error: 'Invalid username or password.' });
    }

    const userPayload = {
      userId: student.parentId || student.id,
      studentId: student.id,
      parentId: student.parentId || null,
      role: 'PARENT',
      name: student.studentName || student.fullName || student.name,
      studentName: student.studentName || student.fullName || student.name,
      phone: studentPhone,
      email: student.email || student.parentEmail,
      class: student.class,
      location: student.location
    };
    const token = signToken(userPayload);
    return res.json({
      success: true,
      token,
      user: userPayload,
      redirectUrl: '/parent/dashboard'
    });
  }

  return res.status(400).json({ success: false, error: 'Invalid role specified.' });
});

// -------------------------------------------------------------------------
// GET /api/auth/me
// -------------------------------------------------------------------------
app.get('/api/auth/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  res.json({ success: true, user: req.user });
});

// -------------------------------------------------------------------------
// POST /api/auth/forgot-password
// -------------------------------------------------------------------------
app.post('/api/auth/forgot-password', (req, res) => {
  const { username, role } = req.body || {};
  return res.json({
    success: true,
    message: 'If your account is active, your credentials/reset instructions have been sent to your registered contact.'
  });
});

// -------------------------------------------------------------------------
// TUTOR PORTAL APIS
// -------------------------------------------------------------------------

// GET /api/tutor/dashboard-metrics
app.get('/api/tutor/dashboard-metrics', requireRole(['TUTOR', 'ADMIN']), (req, res) => {
  const tutorId = req.user.tutorId || (db.tutors[0] && db.tutors[0].id);
  const assignments = (db.tutorStudentAssignments || []).filter(a => a.tutorId === tutorId && a.status === 'ACTIVE');
  const uniqueStudents = new Set(assignments.map(a => a.studentId));

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayDayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];

  // Today's classes based on assigned days
  const todayClasses = assignments.filter(a => Array.isArray(a.days) && a.days.some(d => d.toLowerCase().includes(todayDayName.toLowerCase())));

  // Updates posted today
  const updates = (db.tutorDailyUpdates || []).filter(u => u.tutorId === tutorId);
  const updatesToday = updates.filter(u => u.updateDate === todayStr || (u.createdAt && u.createdAt.slice(0, 10) === todayStr));

  res.json({
    success: true,
    metrics: {
      todayClassesCount: todayClasses.length,
      assignedStudentsCount: uniqueStudents.size,
      updatesTodayCount: updatesToday.length,
      upcomingClassesCount: assignments.length,
      totalUpdatesCount: updates.length
    },
    todayClasses,
    recentUpdates: updates.slice(0, 5)
  });
});

// GET /api/tutor/students
app.get('/api/tutor/students', requireRole(['TUTOR', 'ADMIN']), (req, res) => {
  const tutorId = req.user.tutorId || (db.tutors[0] && db.tutors[0].id);
  const assignments = (db.tutorStudentAssignments || []).filter(a => a.tutorId === tutorId && a.status === 'ACTIVE');
  const students = db.students || [];

  const assignedStudents = assignments.map(a => {
    const student = students.find(s => s.id === a.studentId);
    return {
      assignmentId: a.id,
      studentId: a.studentId,
      studentName: student ? (student.studentName || student.fullName) : a.studentName || 'Student',
      phone: student ? student.phone : a.studentPhone,
      parentPhone: student ? student.parentPhone : a.parentPhone,
      email: student ? student.email : null,
      class: a.class || (student && student.class) || '10th Standard',
      subject: a.subject,
      days: a.days || [],
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location || (student && student.location),
      lessonType: a.lessonType || 'Home Tuition',
      monthlyFee: a.monthlyFee,
      startDate: a.startDate,
      status: a.status
    };
  });

  res.json({
    success: true,
    students: assignedStudents
  });
});

// GET /api/tutor/classes
app.get('/api/tutor/classes', requireRole(['TUTOR', 'ADMIN']), (req, res) => {
  const tutorId = req.user.tutorId || (db.tutors[0] && db.tutors[0].id);
  const assignments = (db.tutorStudentAssignments || []).filter(a => a.tutorId === tutorId && a.status === 'ACTIVE');
  const students = db.students || [];

  const classes = assignments.map(a => {
    const student = students.find(s => s.id === a.studentId);
    return {
      id: a.id,
      studentId: a.studentId,
      studentName: student ? (student.studentName || student.fullName) : a.studentName,
      subject: a.subject,
      class: a.class || (student && student.class),
      days: a.days || [],
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location || (student && student.location),
      lessonType: a.lessonType
    };
  });

  res.json({
    success: true,
    classes
  });
});

// GET /api/tutor/daily-updates
app.get('/api/tutor/daily-updates', requireRole(['TUTOR', 'ADMIN']), (req, res) => {
  const tutorId = req.user.tutorId || (db.tutors[0] && db.tutors[0].id);
  let updates = (db.tutorDailyUpdates || []).filter(u => u.tutorId === tutorId);

  const { studentId, subject, date } = req.query;
  if (studentId) updates = updates.filter(u => u.studentId === studentId);
  if (subject) updates = updates.filter(u => u.subject.toLowerCase() === subject.toLowerCase());
  if (date) updates = updates.filter(u => u.updateDate === date);

  // Sort newest first
  updates.sort((a, b) => new Date(b.createdAt || b.updateDate) - new Date(a.createdAt || a.updateDate));

  res.json({
    success: true,
    updates,
    total: updates.length
  });
});

// POST /api/tutor/daily-updates
app.post('/api/tutor/daily-updates', requireRole(['TUTOR', 'ADMIN']), uploadDailyUpdatePhoto.single('photo'), (req, res) => {
  try {
    const tutorId = req.user.tutorId || req.body.tutorId;
    const tutor = (db.tutors || []).find(t => t.id === tutorId);
    const tutorName = tutor ? tutor.fullName : (req.user.name || req.body.tutorName || 'Tutor');

    const {
      studentId,
      subject,
      updateDate,
      date,
      thought,
      topicsCovered,
      homework,
      studentProgress,
      classTiming,
      notes
    } = req.body;

    if (!subject || !thought) {
      return res.status(400).json({ success: false, error: 'Subject and Teaching Update Thought are required.' });
    }

    let student = null;
    if (studentId && studentId !== 'ALL' && studentId !== 'general') {
      student = (db.students || []).find(s => s.id === studentId);
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = '/uploads/daily-updates/' + req.file.filename;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    }

    const newUpdate = {
      id: 'tdu-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      tutorId,
      tutorName,
      studentId: student ? student.id : (studentId === 'ALL' || !studentId ? null : studentId),
      studentName: student ? (student.studentName || student.fullName) : (studentId ? req.body.studentName : 'General Update'),
      subject: String(subject).trim(),
      updateDate: updateDate || date || new Date().toISOString().slice(0, 10),
      thought: String(thought).trim(),
      topicsCovered: topicsCovered ? String(topicsCovered).trim() : '',
      homework: homework ? String(homework).trim() : '',
      studentProgress: studentProgress || 'Good',
      classTiming: classTiming || '',
      notes: notes ? String(notes).trim() : '',
      imageUrl,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!Array.isArray(db.tutorDailyUpdates)) {
      db.tutorDailyUpdates = [];
    }
    db.tutorDailyUpdates.unshift(newUpdate);

    // Create notifications for Admin and Parent
    addNotification(
      'Daily Tutor Update Posted',
      (tutorName + ' posted daily update for ' + newUpdate.studentName + ' (' + newUpdate.subject + ')'),
      'info',
      '/admin/tutor-updates'
    );

    saveDB(db);

    res.status(201).json({
      success: true,
      message: 'Daily update published successfully.',
      update: newUpdate
    });
  } catch (err) {
    console.error('Error creating daily update:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/tutor/daily-updates/:id
app.put('/api/tutor/daily-updates/:id', requireRole(['TUTOR', 'ADMIN']), uploadDailyUpdatePhoto.single('photo'), (req, res) => {
  const updateIndex = (db.tutorDailyUpdates || []).findIndex(u => u.id === req.params.id);
  if (updateIndex === -1) {
    return res.status(404).json({ success: false, error: 'Daily update not found' });
  }

  const existing = db.tutorDailyUpdates[updateIndex];
  // Verify tutor ownership (admin can edit any)
  if (req.user.role === 'TUTOR' && existing.tutorId !== req.user.tutorId) {
    return res.status(403).json({ success: false, error: 'You are not authorized to edit this update.' });
  }

  let imageUrl = existing.imageUrl;
  if (req.file) {
    imageUrl = '/uploads/daily-updates/' + req.file.filename;
  } else if (req.body.imageUrl !== undefined) {
    imageUrl = req.body.imageUrl;
  }

  const updated = {
    ...existing,
    subject: req.body.subject !== undefined ? req.body.subject : existing.subject,
    updateDate: req.body.updateDate || req.body.date || existing.updateDate,
    thought: req.body.thought !== undefined ? req.body.thought : existing.thought,
    topicsCovered: req.body.topicsCovered !== undefined ? req.body.topicsCovered : existing.topicsCovered,
    homework: req.body.homework !== undefined ? req.body.homework : existing.homework,
    studentProgress: req.body.studentProgress !== undefined ? req.body.studentProgress : existing.studentProgress,
    classTiming: req.body.classTiming !== undefined ? req.body.classTiming : existing.classTiming,
    notes: req.body.notes !== undefined ? req.body.notes : existing.notes,
    imageUrl,
    updatedAt: new Date().toISOString()
  };

  db.tutorDailyUpdates[updateIndex] = updated;
  saveDB(db);

  res.json({
    success: true,
    message: 'Update revised successfully.',
    update: updated
  });
});

// DELETE /api/tutor/daily-updates/:id
app.delete('/api/tutor/daily-updates/:id', requireRole(['TUTOR', 'ADMIN']), (req, res) => {
  const updateIndex = (db.tutorDailyUpdates || []).findIndex(u => u.id === req.params.id);
  if (updateIndex === -1) {
    return res.status(404).json({ success: false, error: 'Daily update not found' });
  }

  const existing = db.tutorDailyUpdates[updateIndex];
  if (req.user.role === 'TUTOR' && existing.tutorId !== req.user.tutorId) {
    return res.status(403).json({ success: false, error: 'You are not authorized to delete this update.' });
  }

  db.tutorDailyUpdates.splice(updateIndex, 1);
  saveDB(db);

  res.json({
    success: true,
    message: 'Daily update deleted successfully.'
  });
});

// -------------------------------------------------------------------------
// PARENT PORTAL APIS
// -------------------------------------------------------------------------

// GET /api/parent/dashboard
app.get('/api/parent/dashboard', requireRole(['PARENT', 'ADMIN']), (req, res) => {
  const studentId = req.user.studentId || (req.query.studentId && req.query.studentId);
  const student = (db.students || []).find(s => s.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, error: 'Student record not found.' });
  }

  const assignments = (db.tutorStudentAssignments || []).filter(a => a.studentId === studentId && a.status === 'ACTIVE');
  const tutors = db.tutors || [];

  const assignedTutors = assignments.map(a => {
    const tutor = tutors.find(t => t.id === a.tutorId);
    return {
      assignmentId: a.id,
      tutorId: a.tutorId,
      tutorName: tutor ? tutor.fullName : a.tutorName,
      tutorPhone: tutor ? (tutor.mobile || tutor.phone) : a.tutorPhone,
      subject: a.subject,
      days: a.days,
      startTime: a.startTime,
      endTime: a.endTime,
      lessonType: a.lessonType,
      monthlyFee: a.monthlyFee
    };
  });

  // Fetch student updates
  const updates = (db.tutorDailyUpdates || [])
    .filter(u => u.studentId === studentId && u.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.createdAt || b.updateDate) - new Date(a.createdAt || a.updateDate));

  res.json({
    success: true,
    student: {
      id: student.id,
      studentName: student.studentName || student.fullName,
      phone: student.phone,
      parentPhone: student.parentPhone,
      email: student.email,
      class: student.class,
      location: student.location,
      learningRequirements: student.learningRequirements
    },
    assignedTutors,
    classes: assignments,
    recentUpdates: updates.slice(0, 5),
    totalUpdates: updates.length
  });
});

// GET /api/parent/tutor-updates
app.get('/api/parent/tutor-updates', requireRole(['PARENT', 'ADMIN']), (req, res) => {
  const studentId = req.user.studentId || req.query.studentId;
  const updates = (db.tutorDailyUpdates || [])
    .filter(u => u.studentId === studentId && u.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.createdAt || b.updateDate) - new Date(a.createdAt || a.updateDate));

  // Compute stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const updatesThisWeek = updates.filter(u => new Date(u.updateDate || u.createdAt) >= oneWeekAgo);

  res.json({
    success: true,
    updates,
    total: updates.length,
    latestUpdateDate: updates.length > 0 ? updates[0].updateDate : null,
    updatesThisWeekCount: updatesThisWeek.length
  });
});

// GET /api/parent/classes
app.get('/api/parent/classes', requireRole(['PARENT', 'ADMIN']), (req, res) => {
  const studentId = req.user.studentId || req.query.studentId;
  const assignments = (db.tutorStudentAssignments || []).filter(a => a.studentId === studentId && a.status === 'ACTIVE');
  const tutors = db.tutors || [];

  const classes = assignments.map(a => {
    const tutor = tutors.find(t => t.id === a.tutorId);
    return {
      id: a.id,
      tutorName: tutor ? tutor.fullName : a.tutorName,
      subject: a.subject,
      class: a.class,
      days: a.days || [],
      startTime: a.startTime,
      endTime: a.endTime,
      location: a.location,
      lessonType: a.lessonType
    };
  });

  res.json({
    success: true,
    classes
  });
});

// -------------------------------------------------------------------------
// ADMIN TUTOR UPDATES APIS
// -------------------------------------------------------------------------

// GET /api/admin/tutor-updates/metrics
app.get('/api/admin/tutor-updates/metrics', requireRole(['ADMIN']), (req, res) => {
  const updates = db.tutorDailyUpdates || [];
  const todayStr = new Date().toISOString().slice(0, 10);

  const updatesToday = updates.filter(u => u.updateDate === todayStr || (u.createdAt && u.createdAt.slice(0, 10) === todayStr));
  const tutorsPostedToday = new Set(updatesToday.map(u => u.tutorId)).size;
  const studentsWithUpdates = new Set(updates.map(u => u.studentId).filter(Boolean)).size;

  res.json({
    success: true,
    metrics: {
      totalUpdates: updates.length,
      updatesToday: updatesToday.length,
      tutorsPostedToday,
      studentsWithUpdates
    }
  });
});

// GET /api/admin/tutor-updates
app.get('/api/admin/tutor-updates', requireRole(['ADMIN']), (req, res) => {
  let updates = [...(db.tutorDailyUpdates || [])];
  const { tutorId, studentId, subject, search, dateFrom, dateTo } = req.query;

  if (tutorId) updates = updates.filter(u => u.tutorId === tutorId);
  if (studentId) updates = updates.filter(u => u.studentId === studentId);
  if (subject) updates = updates.filter(u => u.subject.toLowerCase() === subject.toLowerCase());
  if (dateFrom) updates = updates.filter(u => u.updateDate >= dateFrom);
  if (dateTo) updates = updates.filter(u => u.updateDate <= dateTo);
  if (search) {
    const q = search.toLowerCase();
    updates = updates.filter(u =>
      (u.tutorName && u.tutorName.toLowerCase().includes(q)) ||
      (u.studentName && u.studentName.toLowerCase().includes(q)) ||
      (u.subject && u.subject.toLowerCase().includes(q)) ||
      (u.thought && u.thought.toLowerCase().includes(q)) ||
      (u.topicsCovered && u.topicsCovered.toLowerCase().includes(q))
    );
  }

  updates.sort((a, b) => new Date(b.createdAt || b.updateDate) - new Date(a.createdAt || a.updateDate));

  res.json({
    success: true,
    updates,
    total: updates.length
  });
});

// PUT /api/admin/tutor-updates/:id/archive
app.put('/api/admin/tutor-updates/:id/archive', requireRole(['ADMIN']), (req, res) => {
  const update = (db.tutorDailyUpdates || []).find(u => u.id === req.params.id);
  if (!update) return res.status(404).json({ success: false, error: 'Update not found' });
  update.status = 'ARCHIVED';
  update.updatedAt = new Date().toISOString();
  saveDB(db);
  res.json({ success: true, message: 'Update archived successfully.', update });
});

// DELETE /api/admin/tutor-updates/:id
app.delete('/api/admin/tutor-updates/:id', requireRole(['ADMIN']), (req, res) => {
  const index = (db.tutorDailyUpdates || []).findIndex(u => u.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, error: 'Update not found' });
  db.tutorDailyUpdates.splice(index, 1);
  saveDB(db);
  res.json({ success: true, message: 'Update deleted successfully.' });
});


app.listen(PORT, () => {
  console.log('TutorConnect Server running on http://localhost:' + PORT);
});
