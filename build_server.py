const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const dbPath = path.join(__dirname, 'server/src/data/db.json');
const seedPath = path.join(__dirname, 'server/src/seed/seedData.js');

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

function saveDB(db) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving db.json', err);
  }
}

let db = loadDB();

function addLog(tutorId, actor, action, description) {
  const log = {
    id: ct--,
    tutorId,
    actor,
    action,
    description,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(log);
  return log;
}

function addNotification(title, message, type, link) {
  const notif = {
    id: 
otif--,
    title,
    message,
    type: type || 'info',
    read: false,
    link: link || '/dashboard',
    timestamp: new Date().toISOString()
  };
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
  const highPriorityTutors = tutors.filter(t => t.priority === 'HIGH_PRIORITY').length;
  const lowPriorityTutors = tutors.filter(t => t.priority === 'LOW_PRIORITY').length;
  const pendingVerification = tutors.filter(t => t.status === 'DOCUMENT_VERIFICATION' || t.status === 'VALIDATED').length;
  const interviewsScheduled = tutors.filter(t => t.status === 'INTERVIEW_SCHEDULED').length;
  const demoClassesPending = tutors.filter(t => t.status === 'DEMO_CLASS_SCHEDULED').length;
  const parentApprovalsPending = tutors.filter(t => t.status === 'PARENT_APPROVAL_PENDING').length;
  const appointedTutors = tutors.filter(t => t.status === 'TUTOR_APPOINTED' || t.status === 'ACTIVE').length;
  const totalStudents = students.length;
  const totalParents = parents.length;

  const pipeline = [
    { stage: 'New Application', count: tutors.filter(t => t.status === 'NEW_APPLICATION').length, color: '#3b82f6' },
    { stage: 'Priority Assigned', count: tutors.filter(t => t.status === 'HIGH_PRIORITY' || t.status === 'LOW_PRIORITY').length, color: '#eab308' },
    { stage: 'Validated', count: tutors.filter(t => t.status === 'VALIDATED').length, color: '#6366f1' },
    { stage: 'Doc Verification', count: tutors.filter(t => t.status === 'DOCUMENT_VERIFICATION' || t.status === 'DOCUMENT_APPROVED').length, color: '#f97316' },
    { stage: 'Interview', count: tutors.filter(t => t.status.startsWith('INTERVIEW_')).length, color: '#8b5cf6' },
    { stage: 'Demo Class', count: tutors.filter(t => t.status.startsWith('DEMO_CLASS_')).length, color: '#06b6d4' },
    { stage: 'Parent Approval', count: tutors.filter(t => t.status.startsWith('PARENT_')).length, color: '#ec4899' },
    { stage: 'Appointed / Active', count: appointedTutors, color: '#10b981' }
  ];

  const statusMap = {};
  tutors.forEach(t => {
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
  });
  const statusDistribution = Object.keys(statusMap).map(k => ({ name: k, count: statusMap[k] }));

  const monthlyRegistrations = [
    { month: 'Apr 2026', count: 3 },
    { month: 'May 2026', count: 5 },
    { month: 'Jun 2026', count: 8 },
    { month: 'Jul 2026', count: 12 },
    { month: 'Aug 2026', count: 18 }
  ];

  const subMap = {};
  students.forEach(s => {
    (s.requiredSubjects || []).forEach(sub => {
      subMap[sub] = (subMap[sub] || 0) + 1;
    });
  });
  const subjectRequirements = Object.keys(subMap).map(k => ({ subject: k, count: subMap[k] }));

  const locMap = {};
  tutors.forEach(t => {
    if (t.preferredLocation) locMap[t.preferredLocation] = (locMap[t.preferredLocation] || 0) + 1;
  });
  const locationDistribution = Object.keys(locMap).map(k => ({ location: k, count: locMap[k] }));

  res.json({
    metrics: {
      totalTutors,
      newApplications,
      highPriorityTutors,
      lowPriorityTutors,
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
    locationDistribution
  });
});

// Tutors List & Filters
app.get('/api/tutors', (req, res) => {
  let list = [...(db.tutors || [])];
  const { search, priority, status, subject, location, qualification, minExp, maxExp } = req.query;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(t => 
      (t.fullName && t.fullName.toLowerCase().includes(q)) ||
      (t.tutorId && t.tutorId.toLowerCase().includes(q)) ||
      (t.email && t.email.toLowerCase().includes(q)) ||
      (t.mobile && t.mobile.includes(q)) ||
      (t.subjects && t.subjects.some(s => s.toLowerCase().includes(q)))
    );
  }

  if (priority && priority !== 'ALL') {
    list = list.filter(t => t.priority === priority);
  }

  if (status && status !== 'ALL') {
    list = list.filter(t => t.status === status);
  }

  if (subject && subject !== 'ALL') {
    list = list.filter(t => t.subjects && t.subjects.includes(subject));
  }

  if (location && location !== 'ALL') {
    list = list.filter(t => t.preferredLocation && t.preferredLocation.toLowerCase().includes(location.toLowerCase()));
  }

  if (qualification && qualification !== 'ALL') {
    list = list.filter(t => t.qualification && t.qualification.toLowerCase().includes(qualification.toLowerCase()));
  }

  if (minExp) {
    list = list.filter(t => t.experienceYears >= Number(minExp));
  }

  if (maxExp) {
    list = list.filter(t => t.experienceYears <= Number(maxExp));
  }

  res.json({ tutors: list, total: list.length });
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
    id: 	ut-,
    tutorId: TUT-2026-,
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
    resume: req.body.resume || ${req.body.fullName || 'tutor'}_resume.pdf,
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
      id: doc--,
      tutorId: newTutor.id,
      docType: dt,
      fileName: ${newTutor.fullName.replace(/\s+/g, '_')}_.pdf,
      fileUrl: /mock-files/_.pdf,
      status: 'Pending',
      remarks: '',
      updatedAt: new Date().toISOString()
    });
  });

  addLog(newTutor.id, 'Admin', 'APPLICATION_CREATED', New tutor profile created for .);
  addNotification('New Tutor Application', ${newTutor.fullName} applied for ., 'info', /tutors/);
  saveDB(db);

  res.status(201).json(newTutor);
});

// Update Tutor
app.put('/api/tutors/:id', (req, res) => {
  const index = db.tutors.findIndex(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Tutor not found' });

  db.tutors[index] = { ...db.tutors[index], ...req.body, updatedAt: new Date().toISOString() };
  addLog(db.tutors[index].id, 'Admin', 'PROFILE_UPDATED', Tutor profile details updated.);
  saveDB(db);
  res.json(db.tutors[index]);
});

// Delete Tutor
app.delete('/api/tutors/:id', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  db.tutors = db.tutors.filter(t => t.id !== req.params.id);
  db.tutorDocuments = db.tutorDocuments.filter(d => d.tutorId !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Tutor deleted successfully' });
});

// Validate Tutor (Applicable to both High Priority & Low Priority)
app.post('/api/tutors/:id/validate', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id || t.tutorId === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  tutor.status = 'VALIDATED';
  addLog(tutor.id, 'Admin', 'TUTOR_VALIDATED', Admin validated tutor . Moved to Document Verification.);
  
  // Transition directly to Document Verification workflow state
  tutor.status = 'DOCUMENT_VERIFICATION';
  addLog(tutor.id, 'System', 'DOCUMENT_VERIFICATION_STARTED', Document Verification pipeline initiated for .);
  
  addNotification(
    'Tutor Validated',
    ${tutor.fullName} has been validated and moved to Document Verification.,
    'success',
    /recruitment/document-verification
  );

  saveDB(db);
  res.json({ success: true, tutor, message: ${tutor.fullName} validated successfully and moved to Document Verification! });
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

  addLog(tutor.id, 'Staff', 'DOCUMENT_STATUS_CHANGED', ${doc.docType} marked as . Remarks: );

  // Re-check all documents for this tutor
  const tutorDocs = db.tutorDocuments.filter(d => d.tutorId === tutor.id);
  const anyRejected = tutorDocs.some(d => d.status === 'Rejected');
  const allVerified = tutorDocs.length > 0 && tutorDocs.every(d => d.status === 'Verified');

  if (anyRejected) {
    tutor.status = 'DOCUMENT_REJECTED';
    addNotification('Document Rejected', ${tutor.fullName} has one or more rejected documents., 'danger', /recruitment/document-verification);
  } else if (allVerified) {
    tutor.status = 'DOCUMENT_APPROVED';
    addNotification('Documents Approved', All documents for  verified successfully. Ready for Interview., 'success', /recruitment/document-verification);
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
  
  // Create or update interview record
  let interview = (db.interviews || []).find(i => i.tutorId === tutor.id);
  if (!interview) {
    interview = {
      id: int-,
      interviewId: INT-2026-,
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

  addLog(tutor.id, 'Staff', 'INTERVIEW_SCHEDULED', Interview scheduled with  for  at .);
  addNotification('Interview Scheduled', Interview scheduled for ., 'info', /recruitment/interview);

  saveDB(db);
  res.json({ success: true, tutor, interview });
});

// Submit interview evaluation
app.put('/api/interviews/:id', (req, res) => {
  const interview = (db.interviews || []).find(i => i.id === req.params.id || i.interviewId === req.params.id);
  if (!interview) return res.status(404).json({ error: 'Interview not found' });

  const tutor = db.tutors.find(t => t.id === interview.tutorId);
  const { communicationRating, subjectKnowledgeRating, teachingAbilityRating, overallRating, result, comments, interviewer } = req.body;

  if (communicationRating !== undefined) interview.communicationRating = Number(communicationRating);
  if (subjectKnowledgeRating !== undefined) interview.subjectKnowledgeRating = Number(subjectKnowledgeRating);
  if (teachingAbilityRating !== undefined) interview.teachingAbilityRating = Number(teachingAbilityRating);
  if (overallRating !== undefined) interview.overallRating = Number(overallRating);
  if (result !== undefined) interview.result = result;
  if (comments !== undefined) interview.comments = comments;
  if (interviewer) interview.interviewer = interviewer;

  if (tutor) {
    if (result === 'Selected') {
      tutor.status = 'INTERVIEW_SELECTED';
      addLog(tutor.id, 'Interviewer', 'INTERVIEW_PASSED', Interview passed with rating /5. Selected for demo class.);
      addNotification('Interview Passed', ${tutor.fullName} passed the interview. Ready for Demo Class., 'success', /recruitment/interview);
    } else if (result === 'Rejected') {
      tutor.status = 'INTERVIEW_REJECTED';
      addLog(tutor.id, 'Interviewer', 'INTERVIEW_REJECTED', Interview rejected. Comments: );
      addNotification('Interview Result', ${tutor.fullName} was rejected in the interview round., 'danger', /recruitment/interview);
    }
  }

  saveDB(db);
  res.json({ success: true, interview, tutor });
});

// Move tutor to Demo Class
app.post('/api/tutors/:id/move-to-demo', (req, res) => {
  const tutor = db.tutors.find(t => t.id === req.params.id);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const interview = (db.interviews || []).find(i => i.tutorId === tutor.id);
  if (!interview || interview.result !== 'Selected') {
    return res.status(400).json({ error: 'Tutor must pass interview with result Selected before Demo Class.' });
  }

  tutor.status = 'DEMO_CLASS_SCHEDULED';

  const demo = {
    id: dem-,
    demoId: DEM-2026-,
    tutorId: tutor.id,
    studentId: req.body.studentId || 'stu-001',
    subject: req.body.subject || (tutor.subjects && tutor.subjects[0]) || 'Mathematics',
    class: req.body.class || '10th Standard',
    date: req.body.date || '2026-09-10',
    time: req.body.time || '05:00 PM',
    location: req.body.location || 'Student Residence',
    teachingMethod: req.body.teachingMethod || 'Interactive concept revision',
    adminRating: 0,
    studentRating: 0,
    parentRating: 0,
    result: 'Pending',
    comments: req.body.comments || 'Demo scheduled'
  };

  db.demoClasses.push(demo);
  addLog(tutor.id, 'Staff', 'DEMO_SCHEDULED', Demo class scheduled for subject  on .);
  addNotification('Demo Class Scheduled', Demo class scheduled for ., 'info', /recruitment/demo-classes);

  saveDB(db);
  res.json({ success: true, tutor, demo });
});

// Submit demo class evaluation
app.put('/api/demos/:id', (req, res) => {
  const demo = (db.demoClasses || []).find(d => d.id === req.params.id || d.demoId === req.params.id);
  if (!demo) return res.status(404).json({ error: 'Demo class not found' });

  const tutor = db.tutors.find(t => t.id === demo.tutorId);
  const student = db.students.find(s => s.id === demo.studentId);
  const { adminRating, studentRating, parentRating, result, comments, teachingMethod } = req.body;

  if (adminRating !== undefined) demo.adminRating = Number(adminRating);
  if (studentRating !== undefined) demo.studentRating = Number(studentRating);
  if (parentRating !== undefined) demo.parentRating = Number(parentRating);
  if (result !== undefined) demo.result = result;
  if (comments !== undefined) demo.comments = comments;
  if (teachingMethod) demo.teachingMethod = teachingMethod;

  if (tutor) {
    if (result === 'Passed') {
      tutor.status = 'DEMO_CLASS_PASSED';
      addLog(tutor.id, 'Academic Lead', 'DEMO_PASSED', Demo class passed with student rating /5.);
      
      // Automatically transition to PARENT_APPROVAL_PENDING
      tutor.status = 'PARENT_APPROVAL_PENDING';
      
      // Ensure parent approval record exists
      let approval = (db.parentApprovals || []).find(a => a.tutorId === tutor.id && a.demoId === demo.id);
      if (!approval) {
        approval = {
          id: ppr-,
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
      
      addNotification('Parent Approval Pending', Demo passed for . Parent approval requested., 'warning', /recruitment/parent-approval);
    } else if (result === 'Failed') {
      tutor.status = 'DEMO_CLASS_FAILED';
      addLog(tutor.id, 'Academic Lead', 'DEMO_FAILED', Demo class failed. Feedback: );
      addNotification('Demo Class Result', Demo class failed for ., 'danger', /recruitment/demo-classes);
    }
  }

  saveDB(db);
  res.json({ success: true, demo, tutor });
});

// Parent Approval Decision
app.post('/api/parent-approvals/:id/decide', (req, res) => {
  const approval = (db.parentApprovals || []).find(a => a.id === req.params.id);
  if (!approval) return res.status(404).json({ error: 'Parent approval request not found' });

  const tutor = db.tutors.find(t => t.id === approval.tutorId);
  const { decision, rating, feedback, comments } = req.body;

  approval.rating = Number(rating) || 5;
  approval.feedback = feedback || '';
  approval.comments = comments || '';
  approval.decidedAt = new Date().toISOString();

  if (decision === 'APPROVE') {
    approval.status = 'APPROVED';
    if (tutor) tutor.status = 'PARENT_APPROVED';
    addLog(tutor.id, 'Parent', 'PARENT_APPROVED', Parent approved tutor with rating /5. "");
    addNotification('Parent Approved Tutor!', Parent approved . Tutor is now ready for Appointment., 'success', /tutors/);
  } else {
    approval.status = 'REJECTED';
    if (tutor) tutor.status = 'PARENT_REJECTED';
    addLog(tutor.id, 'Parent', 'PARENT_REJECTED', Parent rejected tutor. Feedback: "");
    addNotification('Parent Rejected Tutor', Parent rejected ., 'danger', /recruitment/parent-approval);
  }

  saveDB(db);
  res.json({ success: true, approval, tutor });
});

// Final Tutor Appointment (Strict rule enforcement)
app.post('/api/appointments', (req, res) => {
  const { tutorId, studentId, startDate, timing, salary, subject, location } = req.body;
  const tutor = db.tutors.find(t => t.id === tutorId || t.tutorId === tutorId);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found' });

  const student = db.students.find(s => s.id === studentId);
  const parent = student ? db.parents.find(p => p.id === student.parentId) : null;

  // Verify all 6 strict prerequisites:
  // 1. Validated
  // 2. Documents Verified
  const tutorDocs = (db.tutorDocuments || []).filter(d => d.tutorId === tutor.id);
  const docsVerified = tutorDocs.length > 0 && tutorDocs.every(d => d.status === 'Verified');

  // 3. Interview Passed
  const tutorInterview = (db.interviews || []).find(i => i.tutorId === tutor.id && i.result === 'Selected');

  // 4. Demo Class Passed
  const tutorDemo = (db.demoClasses || []).find(d => d.tutorId === tutor.id && d.result === 'Passed');

  // 5. Parent Approved
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

  const appointmentId = APT-2026-;
  const newAppointment = {
    id: pt-,
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

  // Update tutor status
  tutor.status = 'ACTIVE';
  tutor.result = 'Passed';

  // Update student status
  if (student) {
    student.assignedTutorId = tutor.id;
    student.status = 'TUTOR_ASSIGNED';
  }

  addLog(tutor.id, 'Admin', 'TUTOR_APPOINTED', Tutor  successfully appointed for student  ().);
  addNotification('?? Tutor Appointed!', ${tutor.fullName} has been appointed as Active Tutor ()., 'success', /tutors/);

  saveDB(db);
  res.status(201).json({ success: true, appointment: newAppointment, tutor, student });
});

// Students CRUD
app.get('/api/students', (req, res) => {
  res.json({ students: db.students || [] });
});

app.post('/api/students', (req, res) => {
  const nextNum = (db.students.length + 1).toString().padStart(3, '0');
  const newStudent = {
    id: stu-,
    studentId: STU-2026-,
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
  
  // Link to parent
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
  saveDB(db);
  res.json(db.students[index]);
});

app.delete('/api/students/:id', (req, res) => {
  db.students = db.students.filter(s => s.id !== req.params.id);
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
    id: par-,
    parentId: PAR-2026-,
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
      breakdown.push({ criteria: 'Location (Remote / Commute)', score: 10, max: 25, match: false });
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

// Excel Bulk Import with Row-Level Validation
app.post('/api/import/:type', (req, res) => {
  const { type } = req.params;
  const { rows, commit } = req.body; // rows is array of objects parsed from excel

  if (!rows || !Array.isArray(rows)) {
    return res.status(400).json({ error: 'Invalid data format. Expected an array of rows.' });
  }

  const validRecords = [];
  const invalidRecords = [];
  const errors = [];

  rows.forEach((row, idx) => {
    const rowNum = idx + 2; // header is row 1
    const rowErrors = [];

    if (type === 'tutors') {
      if (!row.FullName || !String(row.FullName).trim()) rowErrors.push('FullName is missing');
      if (!row.Mobile || !String(row.Mobile).trim()) rowErrors.push('Mobile Number is missing');
      if (!row.Email || !row.Email.includes('@')) rowErrors.push('Invalid Email');
      
      const exp = Number(row.ExperienceYears !== undefined ? row.ExperienceYears : row.Experience);
      if (isNaN(exp)) rowErrors.push('Experience must be a number');

      const prio = (row.Priority || '').toLowerCase();
      if (!prio.includes('high') && !prio.includes('low')) rowErrors.push('Priority must be High or Low');

      if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(Row : ));
      } else {
        const nextNum = (db.tutors.length + validRecords.length + 1).toString().padStart(3, '0');
        const isHigh = prio.includes('high');
        const subjects = typeof row.Subjects === 'string' ? row.Subjects.split(',').map(s => s.trim()) : (row.Subjects || ['General']);
        
        validRecords.push({
          id: 	ut-imp--,
          tutorId: TUT-2026-,
          fullName: row.FullName.trim(),
          mobile: String(row.Mobile).trim(),
          whatsapp: String(row.WhatsApp || row.Mobile).trim(),
          email: row.Email.trim(),
          gender: row.Gender || 'Male',
          dob: row.DateOfBirth || '1995-01-01',
          qualification: row.Qualification || 'Graduate',
          specialization: row.Specialization || 'General',
          experienceYears: exp,
          subjects: subjects,
          preferredLocation: row.Location || row.PreferredLocation || 'Tiruchirappalli',
          availableTiming: row.AvailableTiming || '5:00 PM - 7:00 PM',
          expectedSalary: Number(row.ExpectedSalary) || 15000,
          resume: 'resume_imported.pdf',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          priority: isHigh ? 'HIGH_PRIORITY' : 'LOW_PRIORITY',
          result: 'Pending',
          status: isHigh ? 'HIGH_PRIORITY' : 'NEW_APPLICATION',
          createdAt: new Date().toISOString()
        });
      }
    } else if (type === 'students') {
      if (!row.StudentName || !String(row.StudentName).trim()) rowErrors.push('StudentName is missing');
      if (!row.Class || !String(row.Class).trim()) rowErrors.push('Class is missing');
      const budget = Number(row.Budget);
      if (isNaN(budget)) rowErrors.push('Budget must be a number');

      if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(Row : ));
      } else {
        const nextNum = (db.students.length + validRecords.length + 1).toString().padStart(3, '0');
        const subjects = typeof row.RequiredSubjects === 'string' ? row.RequiredSubjects.split(',').map(s => s.trim()) : (row.RequiredSubjects || ['Mathematics']);
        validRecords.push({
          id: stu-imp--,
          studentId: STU-2026-,
          studentName: row.StudentName.trim(),
          gender: row.Gender || 'Male',
          dob: row.DateOfBirth || '2010-01-01',
          class: row.Class.trim(),
          school: row.School || 'School',
          requiredSubjects: subjects,
          learningRequirements: row.LearningRequirements || 'General Coaching',
          location: row.Location || 'Tiruchirappalli',
          preferredTiming: row.PreferredTiming || '5:00 PM',
          budget: budget || 15000,
          assignedTutorId: null,
          parentId: 'par-001',
          status: 'LOOKING_FOR_TUTOR'
        });
      }
    } else if (type === 'parents') {
      if (!row.ParentName || !String(row.ParentName).trim()) rowErrors.push('ParentName is missing');
      if (!row.Mobile || !String(row.Mobile).trim()) rowErrors.push('Mobile Number is missing');
      if (!row.Email || !row.Email.includes('@')) rowErrors.push('Invalid Email');

      if (rowErrors.length > 0) {
        invalidRecords.push({ rowNum, data: row, errors: rowErrors });
        rowErrors.forEach(err => errors.push(Row : ));
      } else {
        const nextNum = (db.parents.length + validRecords.length + 1).toString().padStart(3, '0');
        validRecords.push({
          id: par-imp--,
          parentId: PAR-2026-,
          parentName: row.ParentName.trim(),
          mobile: String(row.Mobile).trim(),
          whatsapp: String(row.WhatsApp || row.Mobile).trim(),
          email: row.Email.trim(),
          address: row.Address || 'Address',
          occupation: row.Occupation || 'Professional',
          budget: Number(row.Budget) || 15000,
          tutorPreference: row.TutorPreference || 'Experienced Tutor',
          studentIds: []
        });
      }
    }
  });

  if (commit && validRecords.length > 0) {
    if (type === 'tutors') {
      validRecords.forEach(t => {
        db.tutors.unshift(t);
        // add documents
        const docTypes = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Other Documents'];
        docTypes.forEach((dt, idx) => {
          db.tutorDocuments.push({
            id: doc--,
            tutorId: t.id,
            docType: dt,
            fileName: ${t.fullName.replace(/\s+/g, '_')}_.pdf,
            fileUrl: /mock-files/_.pdf,
            status: 'Pending',
            remarks: '',
            updatedAt: new Date().toISOString()
          });
        });
        addLog(t.id, 'Excel Import', 'IMPORT_SUCCESS', Tutor imported via bulk Excel import.);
      });
      addNotification('Excel Bulk Import Completed', Successfully imported  tutors., 'success', /tutors);
    } else if (type === 'students') {
      validRecords.forEach(s => db.students.unshift(s));
      addNotification('Excel Bulk Import Completed', Successfully imported  students., 'success', /students);
    } else if (type === 'parents') {
      validRecords.forEach(p => db.parents.unshift(p));
      addNotification('Excel Bulk Import Completed', Successfully imported  parents., 'success', /parents);
    }
    saveDB(db);
  }

  res.json({
    totalRecords: rows.length,
    validCount: validRecords.length,
    invalidCount: invalidRecords.length,
    validRecords,
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
  db = JSON.parse(JSON.stringify(require(seedPath)));
  saveDB(db);
  res.json({ success: true, message: 'Database reset to initial seed data' });
});

app.listen(PORT, () => {
  console.log(TutorConnect Server running on http://localhost:);
});
