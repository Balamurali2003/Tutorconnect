/**
 * Tutor Priority Scoring Engine for TutorConnect CRM
 * 
 * Scale: 0 to 100
 * Levels:
 * 80 - 100 = HIGH_PRIORITY
 * 60 - 79  = MEDIUM_PRIORITY
 * 0 - 59   = LOW_PRIORITY
 */

const DEFAULT_WEIGHTS = {
  experienceWeight: 30,
  subjectDemandWeight: 25,
  homeTuitionWeight: 15,
  qualificationWeight: 10,
  locationMatchWeight: 10,
  timingMatchWeight: 10
};

// Normalize string for comparison
function clean(str) {
  return (str || '').toString().trim().toLowerCase();
}

/**
 * Dynamic Student Demand Intelligence
 * Analyzes active student requirements in db.students
 */
function computeStudentDemand(students = []) {
  const activeStudents = (students || []).filter(s => s.status !== 'INACTIVE');
  const subjectCounts = {};
  const locationCounts = {};
  const timingCounts = {};

  activeStudents.forEach(s => {
    // 1. Subjects
    let subs = Array.isArray(s.requiredSubjects) ? s.requiredSubjects : (s.requiredSubjects ? [s.requiredSubjects] : []);
    if (subs.length === 0 && s.learningRequirements && s.learningRequirements !== 'Not Provided') {
      subs = [s.learningRequirements];
    }
    subs.forEach(sub => {
      const c = clean(sub);
      if (c && c !== 'not provided' && c !== 'none') {
        subjectCounts[c] = (subjectCounts[c] || 0) + 1;
        // Also index normalized keywords
        if (c.includes('math')) subjectCounts['mathematics'] = (subjectCounts['mathematics'] || 0) + 1;
        if (c.includes('science')) subjectCounts['science'] = (subjectCounts['science'] || 0) + 1;
        if (c.includes('physics')) subjectCounts['physics'] = (subjectCounts['physics'] || 0) + 1;
        if (c.includes('chemistry')) subjectCounts['chemistry'] = (subjectCounts['chemistry'] || 0) + 1;
        if (c.includes('tamil')) subjectCounts['tamil'] = (subjectCounts['tamil'] || 0) + 1;
        if (c.includes('english')) subjectCounts['english'] = (subjectCounts['english'] || 0) + 1;
        if (c.includes('biology')) subjectCounts['biology'] = (subjectCounts['biology'] || 0) + 1;
        if (c.includes('social')) subjectCounts['social'] = (subjectCounts['social'] || 0) + 1;
        if (c.includes('account') || c.includes('commerce')) subjectCounts['commerce'] = (subjectCounts['commerce'] || 0) + 1;
      }
    });

    // 2. Locations
    const loc = clean(s.location);
    if (loc && loc !== 'not provided') {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }

    // 3. Timings
    const tim = clean(s.preferredTiming);
    if (tim && tim !== 'not provided') {
      timingCounts[tim] = (timingCounts[tim] || 0) + 1;
    }
  });

  return {
    totalActiveStudents: activeStudents.length,
    subjectCounts,
    locationCounts,
    timingCounts
  };
}

/**
 * Metric 1: Teaching Experience (Max 30 pts)
 * 0 years = 0 points
 * 1-2 years = 10 points
 * 3-5 years = 20 points
 * 6+ years = 30 points
 */
function scoreExperience(tutor, maxWeight = 30) {
  let years = 0;
  if (typeof tutor.experienceYears === 'number' && !isNaN(tutor.experienceYears)) {
    years = tutor.experienceYears;
  } else if (tutor.experience && clean(tutor.experience) !== 'not provided') {
    const raw = clean(tutor.experience);
    if (raw.includes('6+') || raw.includes('6 years') || raw.includes('7') || raw.includes('8') || raw.includes('10') || raw.includes('15') || raw.includes('12')) {
      years = 6;
    } else if (raw.includes('3-5') || raw.includes('3 years') || raw.includes('4 years') || raw.includes('5 years')) {
      years = 4;
    } else if (raw.includes('1-2') || raw.includes('1 year') || raw.includes('2 years')) {
      years = 2;
    } else {
      const match = raw.match(/\d+/);
      if (match) years = parseInt(match[0], 10);
    }
  }

  let rawPoints = 0;
  let detail = 'No verified teaching experience';

  if (years >= 6) {
    rawPoints = 30;
    detail = `${years}+ years extensive teaching experience`;
  } else if (years >= 3) {
    rawPoints = 20;
    detail = `${years} years solid teaching experience`;
  } else if (years >= 1) {
    rawPoints = 10;
    detail = `${years} years foundational teaching experience`;
  } else {
    rawPoints = 0;
    detail = 'Missing or zero teaching experience';
  }

  const score = Math.round((rawPoints / 30) * maxWeight);
  return {
    score,
    max: maxWeight,
    rawPoints,
    years,
    detail
  };
}

/**
 * Metric 2: Subject Demand Coverage (Max 25 pts)
 */
function scoreSubjectDemand(tutor, studentDemand, maxWeight = 25) {
  const tutorSubs = Array.isArray(tutor.subjects) ? tutor.subjects : (tutor.subjects ? [tutor.subjects] : []);
  if (tutorSubs.length === 0 || clean(tutorSubs[0]) === 'not provided') {
    return {
      score: 0,
      max: maxWeight,
      matchedDemandCount: 0,
      matchedSubjects: [],
      detail: 'No subjects listed by tutor'
    };
  }

  const demandMap = studentDemand.subjectCounts || {};
  let totalMatchedDemand = 0;
  const matchedSubjects = [];

  tutorSubs.forEach(s => {
    const cs = clean(s);
    if (cs === 'all' || cs === 'all subjects' || cs === 'all primary subjects' || cs === 'any subject') {
      totalMatchedDemand += 12;
      matchedSubjects.push(s);
      return;
    }

    let matchCount = 0;
    Object.keys(demandMap).forEach(demSub => {
      if (cs.includes(demSub) || demSub.includes(cs)) {
        matchCount += demandMap[demSub];
      }
    });

    if (matchCount > 0) {
      totalMatchedDemand += matchCount;
      matchedSubjects.push(s);
    }
  });

  // Calculate score based on demand scale
  let rawPoints = 0;
  if (totalMatchedDemand >= 15) {
    rawPoints = 25;
  } else if (totalMatchedDemand >= 10) {
    rawPoints = 22;
  } else if (totalMatchedDemand >= 6) {
    rawPoints = 18;
  } else if (totalMatchedDemand >= 3) {
    rawPoints = 14;
  } else if (totalMatchedDemand >= 1) {
    rawPoints = 10;
  } else {
    rawPoints = 4;
  }

  const score = Math.min(maxWeight, Math.round((rawPoints / 25) * maxWeight));
  return {
    score,
    max: maxWeight,
    matchedDemandCount: totalMatchedDemand,
    matchedSubjects,
    detail: totalMatchedDemand > 0
      ? `Teaches ${matchedSubjects.slice(0, 3).join(', ')} matching ${totalMatchedDemand} active student inquiries`
      : 'Listed subjects currently have low student inquiry volume'
  };
}

/**
 * Metric 3: Home Tuition Availability (Max 15 pts)
 */
function scoreHomeTuition(tutor, maxWeight = 15) {
  const val = clean(tutor.homeTuitionAvailable);
  let rawPoints = 0;
  let detail = 'Home tuition availability not provided';

  if (val === 'yes' || val === 'true' || val === 'available') {
    rawPoints = 15;
    detail = 'Available for home tuition visits (YES)';
  } else if (val === 'no' || val === 'false') {
    rawPoints = 5;
    detail = 'Online / centre only, no home tuition (NO)';
  } else {
    rawPoints = 0;
    detail = 'Home tuition availability not confirmed';
  }

  const score = Math.round((rawPoints / 15) * maxWeight);
  return {
    score,
    max: maxWeight,
    rawPoints,
    detail
  };
}

/**
 * Metric 4: Qualification (Max 10 pts)
 */
function scoreQualification(tutor, maxWeight = 10) {
  const qual = clean(tutor.qualification);
  if (!qual || qual === 'not provided' || qual === 'none') {
    return {
      score: 0,
      max: maxWeight,
      detail: 'Qualification information not provided'
    };
  }

  let rawPoints = 0;
  let detail = 'Basic qualification';

  if (qual.includes('phd') || qual.includes('doctorate') || qual.includes('m.phil') ||
      qual.includes('m.sc') || qual.includes('m.ed') || qual.includes('m.tech') ||
      qual.includes('post graduate') || qual.includes('master') || qual.includes('ma')) {
    rawPoints = 10;
    detail = `Advanced postgraduate degree (${tutor.qualification})`;
  } else if (qual.includes('b.ed') || qual.includes('b.sc') || qual.includes('b.tech') ||
             qual.includes('be') || qual.includes('bachelor') || qual.includes('ba') || qual.includes('degree')) {
    rawPoints = 8;
    detail = `Bachelor's degree qualification (${tutor.qualification})`;
  } else if (qual.includes('diploma') || qual.includes('hsc') || qual.includes('certificate')) {
    rawPoints = 5;
    detail = `Diploma / certificate (${tutor.qualification})`;
  } else {
    rawPoints = 6;
    detail = `Recognized qualification (${tutor.qualification})`;
  }

  const score = Math.round((rawPoints / 10) * maxWeight);
  return {
    score,
    max: maxWeight,
    detail
  };
}

/**
 * Metric 5: Location Match (Max 10 pts)
 */
function scoreLocationMatch(tutor, studentDemand, maxWeight = 10) {
  const loc = clean(tutor.preferredLocation);
  if (!loc || loc === 'not provided') {
    return {
      score: 0,
      max: maxWeight,
      matchedCount: 0,
      detail: 'Location information not provided'
    };
  }

  const locMap = studentDemand.locationCounts || {};
  let matchCount = 0;
  Object.keys(locMap).forEach(studentLoc => {
    if (loc.includes(studentLoc) || studentLoc.includes(loc)) {
      matchCount += locMap[studentLoc];
    }
  });

  let rawPoints = 0;
  let detail = '';

  if (matchCount >= 5) {
    rawPoints = 10;
    detail = `High location match in ${tutor.preferredLocation} (${matchCount} student requests)`;
  } else if (matchCount >= 2) {
    rawPoints = 8;
    detail = `Good location match in ${tutor.preferredLocation} (${matchCount} student requests)`;
  } else if (matchCount >= 1) {
    rawPoints = 6;
    detail = `Location match in ${tutor.preferredLocation} (1 student request)`;
  } else {
    rawPoints = 0;
    detail = `No active student inquiries in ${tutor.preferredLocation}`;
  }

  const score = Math.round((rawPoints / 10) * maxWeight);
  return {
    score,
    max: maxWeight,
    matchedCount: matchCount,
    detail
  };
}

/**
 * Metric 6: Timing Match (Max 10 pts)
 */
function scoreTimingMatch(tutor, studentDemand, maxWeight = 10) {
  const timing = clean(tutor.availableTiming);
  if (!timing || timing === 'not provided') {
    return {
      score: 0,
      max: maxWeight,
      matchedCount: 0,
      detail: 'Timing information not provided'
    };
  }

  const timingMap = studentDemand.timingCounts || {};
  let matchCount = 0;
  Object.keys(timingMap).forEach(studentTime => {
    if (timing.includes(studentTime) || studentTime.includes(timing) ||
       (timing.includes('evening') && (studentTime.includes('5') || studentTime.includes('6') || studentTime.includes('pm')))) {
      matchCount += timingMap[studentTime];
    }
  });

  let rawPoints = 0;
  let detail = '';

  if (matchCount >= 4) {
    rawPoints = 10;
    detail = `Prime timing match with active student preferred slots`;
  } else if (matchCount >= 1) {
    rawPoints = 8;
    detail = `Timing matches active student requirements`;
  } else {
    rawPoints = 0;
    detail = 'Tutor available timings do not match current student slots';
  }

  const score = Math.round((rawPoints / 10) * maxWeight);
  return {
    score,
    max: maxWeight,
    matchedCount: matchCount,
    detail
  };
}

/**
 * Generates dynamic explanation and deduction reasons supported by actual data
 */
function generateExplanations(tutor, score, level, breakdown) {
  const pros = [];
  const deductions = [];

  // Experience
  if (breakdown.experience.score >= 20) {
    pros.push('strong teaching experience');
  } else if (breakdown.experience.score === 0) {
    deductions.push('Limited or missing teaching experience');
  }

  // Subjects
  if (breakdown.subjectDemand.score >= 18) {
    pros.push('teaches subjects currently in high student demand');
  } else if (breakdown.subjectDemand.score <= 10) {
    deductions.push('Low current student demand for listed subjects');
  }

  // Home Tuition
  if (breakdown.homeTuition.score === 15) {
    pros.push('is confirmed available for home tuition');
  } else if (clean(tutor.homeTuitionAvailable) === 'no') {
    deductions.push('Not available for home tuition (centre/online only)');
  } else {
    deductions.push('Home tuition availability not confirmed');
  }

  // Qualification
  if (breakdown.qualification.score >= 8) {
    pros.push('verified advanced academic qualifications');
  } else if (breakdown.qualification.score === 0) {
    deductions.push('Qualification information not provided');
  }

  // Location
  if (breakdown.locationMatch.score > 0) {
    pros.push('location matches active student inquiries');
  } else {
    deductions.push('Location information not provided or no local student demand');
  }

  // Timing
  if (breakdown.timingMatch.score > 0) {
    pros.push('available timings match student preferred slots');
  }

  let explanation = '';
  if (level === 'HIGH_PRIORITY') {
    explanation = `High Priority because this candidate ${pros.join(', ')}.`;
  } else if (level === 'MEDIUM_PRIORITY') {
    explanation = `Medium Priority because this candidate has good baseline credentials (${pros.slice(0, 2).join(', ') || 'verified profile'}), with potential for placement.`;
  } else {
    explanation = `Low Priority due to lower demand alignment or missing profile metrics.`;
  }

  return {
    explanation,
    lowPriorityReasons: deductions
  };
}

/**
 * Complete Tutor Priority Calculator
 */
function calculateTutorPriority(tutor, studentDemand, config = DEFAULT_WEIGHTS) {
  const expRes = scoreExperience(tutor, config.experienceWeight);
  const subRes = scoreSubjectDemand(tutor, studentDemand, config.subjectDemandWeight);
  const htRes = scoreHomeTuition(tutor, config.homeTuitionWeight);
  const qualRes = scoreQualification(tutor, config.qualificationWeight);
  const locRes = scoreLocationMatch(tutor, studentDemand, config.locationMatchWeight);
  const timRes = scoreTimingMatch(tutor, studentDemand, config.timingMatchWeight);

  const rawTotal = expRes.score + subRes.score + htRes.score + qualRes.score + locRes.score + timRes.score;
  const priorityScore = Math.max(0, Math.min(100, Math.round(rawTotal)));

  let priorityLevel = 'LOW_PRIORITY';
  if (priorityScore >= 80) {
    priorityLevel = 'HIGH_PRIORITY';
  } else if (priorityScore >= 60) {
    priorityLevel = 'MEDIUM_PRIORITY';
  } else {
    priorityLevel = 'LOW_PRIORITY';
  }

  const breakdown = {
    experience: expRes,
    subjectDemand: subRes,
    homeTuition: htRes,
    qualification: qualRes,
    locationMatch: locRes,
    timingMatch: timRes,
    total: priorityScore,
    maxTotal: 100
  };

  const { explanation, lowPriorityReasons } = generateExplanations(tutor, priorityScore, priorityLevel, breakdown);

  return {
    priorityScore,
    priorityLevel,
    priorityBreakdown: breakdown,
    priorityExplanation: explanation,
    lowPriorityReasons,
    lastPriorityCalculatedAt: new Date().toISOString()
  };
}

/**
 * Batch Recalculate All Tutors in Database
 */
function recalculateAllTutorPriorities(db, config = DEFAULT_WEIGHTS) {
  if (!db || !Array.isArray(db.tutors)) return { total: 0, high: 0, medium: 0, low: 0 };

  const studentDemand = computeStudentDemand(db.students || []);

  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let totalScore = 0;

  db.tutors.forEach(tutor => {
    const calc = calculateTutorPriority(tutor, studentDemand, config);

    tutor.priorityScore = calc.priorityScore;
    tutor.lastPriorityCalculatedAt = calc.lastPriorityCalculatedAt;
    tutor.priorityBreakdown = calc.priorityBreakdown;
    tutor.priorityExplanation = calc.priorityExplanation;
    tutor.lowPriorityReasons = calc.lowPriorityReasons;

    // Respect manual override if admin set one
    if (tutor.prioritySource === 'MANUAL' && tutor.manualPriorityLevel) {
      tutor.priorityLevel = tutor.manualPriorityLevel;
      tutor.priority = tutor.manualPriorityLevel;
    } else {
      tutor.prioritySource = 'AUTOMATIC';
      tutor.priorityLevel = calc.priorityLevel;
      tutor.priority = calc.priorityLevel;
    }

    if (tutor.priorityLevel === 'HIGH_PRIORITY') highCount++;
    else if (tutor.priorityLevel === 'MEDIUM_PRIORITY') mediumCount++;
    else lowCount++;

    totalScore += calc.priorityScore;
  });

  const total = db.tutors.length;
  const avgScore = total > 0 ? Number((totalScore / total).toFixed(1)) : 0;

  return {
    total,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
    highPercent: total > 0 ? Number(((highCount / total) * 100).toFixed(1)) : 0,
    mediumPercent: total > 0 ? Number(((mediumCount / total) * 100).toFixed(1)) : 0,
    lowPercent: total > 0 ? Number(((lowCount / total) * 100).toFixed(1)) : 0,
    averageScore: avgScore,
    studentDemand
  };
}

module.exports = {
  DEFAULT_WEIGHTS,
  computeStudentDemand,
  scoreExperience,
  scoreSubjectDemand,
  scoreHomeTuition,
  scoreQualification,
  scoreLocationMatch,
  scoreTimingMatch,
  calculateTutorPriority,
  recalculateAllTutorPriorities
};
