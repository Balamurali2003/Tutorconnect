const mysql = require('mysql2/promise');

let pool = null;

function isMySQLConfigured() {
  return Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);
}

async function getPool() {
  if (!isMySQLConfigured()) return null;
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

async function insertLeadToMySQL(lead) {
  if (!isMySQLConfigured()) return null;
  try {
    const p = await getPool();
    if (!p) return null;
    const subjectsStr = Array.isArray(lead.subjects) ? lead.subjects.join(', ') : (lead.subjects || '');
    await p.execute(
      INSERT INTO leads (id, leadSource, platform, name, phoneNumber, email, campaignName, adName, subjects, experience, message, status, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE updatedAt = NOW(),
      [
        lead.id,
        lead.leadSource || 'WEBSITE',
        lead.platform || 'website',
        lead.name,
        lead.phoneNumber,
        lead.email || 'Not Provided',
        lead.campaignName || 'Academic Tuition Enquiry',
        lead.adName || '',
        subjectsStr,
        lead.experience || '',
        lead.message || '',
        lead.status || 'NEW_LEAD'
      ]
    );
    return true;
  } catch (err) {
    console.error('MySQL lead insert error:', err.message);
    return false;
  }
}

async function insertTutorToMySQL(tutor) {
  if (!isMySQLConfigured()) return null;
  try {
    const p = await getPool();
    if (!p) return null;
    const subjectsStr = Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : (tutor.subjectsText || '');
    await p.execute(
      INSERT INTO tutors (id, tutorId, fullName, mobile, phone, whatsapp, email, qualification, experience, subjects, subjectsText, preferredLocation, status, leadSource, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE updatedAt = NOW(),
      [
        tutor.id,
        tutor.tutorId,
        tutor.fullName,
        tutor.mobile,
        tutor.phone || tutor.mobile,
        tutor.whatsapp || tutor.mobile,
        tutor.email || '',
        tutor.qualification || 'Graduate',
        tutor.experience || '1 Year',
        subjectsStr,
        subjectsStr,
        tutor.preferredLocation || 'Centre / Online',
        tutor.status || 'NEW_APPLICATION',
        tutor.leadSource || 'WEBSITE'
      ]
    );
    return true;
  } catch (err) {
    console.error('MySQL tutor insert error:', err.message);
    return false;
  }
}

module.exports = {
  isMySQLConfigured,
  getPool,
  insertLeadToMySQL,
  insertTutorToMySQL
};
