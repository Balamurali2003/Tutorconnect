
// =========================================================================
// AUTHENTICATION, JWT, ROLE PROTECTION & DAILY TUTOR UPDATES
// =========================================================================

const crypto = require('crypto');
const multer = require('multer');
const JWT_SECRET = process.env.JWT_SECRET || 'tutorconnect-jwt-secret-key-2026';

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
    .update(${encodedHeader}.)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return ${encodedHeader}..;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(${encodedHeader}.)
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
        error: Access denied. Requires role: .
      });
    }
    next();
  };
}

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
      ${tutorName} posted daily update for  (),
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
