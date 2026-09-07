
const path = require('path');
const priorityEngine = require(path.resolve(__dirname, '../server/src/services/priorityEngine'));
const fs = require('fs');
const dbPath = path.resolve(__dirname, '../server/src/data/db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

console.log('Testing recalculateAllTutorPriorities...');
const summary = priorityEngine.recalculateAllTutorPriorities(db);
console.log('Recalculation Summary:', JSON.stringify(summary, null, 2));

console.log('\nSample Top 3 Tutors by Priority Score:');
const sorted = [...db.tutors].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
sorted.slice(0, 3).forEach(t => {
  console.log({
    name: t.fullName,
    score: t.priorityScore,
    level: t.priorityLevel,
    exp: t.priorityBreakdown.experience,
    sub: t.priorityBreakdown.subjectDemand,
    ht: t.priorityBreakdown.homeTuition,
    explanation: t.priorityExplanation
  });
});
