import json, os

db = {'tutors': [], 'parents': [], 'students': [], 'tutorDocuments': [], 'interviews': [], 'demoClasses': [], 'parentApprovals': [], 'appointments': [], 'activityLogs': [], 'notifications': []}

t_specs = [
  ('Arun Kumar', 'Male', '1994-06-15', 'M.Sc Mathematics, B.Ed', 'Calculus & Pure Mathematics', 7, ['Mathematics', 'Vedic Maths'], 'Tiruchirappalli', '5:00 PM - 7:00 PM', 15000, 'HIGH_PRIORITY', 'HIGH_PRIORITY'),
  ('Priya Sundaram', 'Female', '1997-03-22', 'B.Tech Computer Science', 'Algorithms & Mathematics', 4, ['Mathematics', 'Computer Science'], 'Tiruchirappalli', '5:00 PM - 8:00 PM', 14000, 'LOW_PRIORITY', 'LOW_PRIORITY'),
  ('Dr. Rajesh Raman', 'Male', '1988-11-04', 'Ph.D Physics, M.Sc', 'Quantum & Thermodynamics', 10, ['Physics', 'Mathematics'], 'Chennai', '6:00 PM - 8:30 PM', 25000, 'HIGH_PRIORITY', 'DOCUMENT_VERIFICATION'),
  ('Kavitha Natarajan', 'Female', '1992-09-18', 'M.Sc Chemistry, M.Phil', 'Organic & Physical Chemistry', 6, ['Chemistry', 'Science'], 'Coimbatore', '4:30 PM - 6:30 PM', 16000, 'HIGH_PRIORITY', 'INTERVIEW_SCHEDULED'),
  ('Senthil Nathan', 'Male', '1990-01-30', 'M.A English, B.Ed', 'Grammar & Creative Writing', 8, ['English', 'Social Science'], 'Madurai', '5:00 PM - 7:30 PM', 18000, 'LOW_PRIORITY', 'DEMO_CLASS_SCHEDULED'),
  ('Deepa Balasubramanian', 'Female', '1995-12-05', 'M.Sc Botany, B.Ed', 'Botany & Zoology (NEET Prep)', 5, ['Biology', 'Science'], 'Chennai', '6:00 PM - 8:00 PM', 20000, 'HIGH_PRIORITY', 'PARENT_APPROVAL_PENDING'),
  ('Manoj Swaminathan', 'Male', '1993-07-11', 'M.Com, CA Inter', 'Accountancy & Business Economics', 6, ['Accountancy', 'Economics', 'Commerce'], 'Tiruchirappalli', '5:30 PM - 7:30 PM', 18000, 'HIGH_PRIORITY', 'PARENT_APPROVED'),
  ('Ananya Krishnan', 'Female', '1996-05-19', 'M.Sc Mathematics', 'Algebra & Coordinate Geometry', 4, ['Mathematics', 'Physics'], 'Salem', '4:00 PM - 6:00 PM', 14000, 'HIGH_PRIORITY', 'TUTOR_APPOINTED'),
  ('Vigneshwar Raj', 'Male', '1991-04-03', 'M.Sc Physics, B.Ed', 'Optics & Electromagnetism', 7, ['Physics', 'Science'], 'Tiruchirappalli', '5:00 PM - 7:00 PM', 17000, 'LOW_PRIORITY', 'ACTIVE'),
  ('Meenakshi Sundaresan', 'Female', '1989-10-28', 'M.A Tamil, B.Ed', 'Tamil Literature & Grammar', 9, ['Tamil', 'Social Science'], 'Madurai', '4:00 PM - 6:30 PM', 13000, 'LOW_PRIORITY', 'ACTIVE'),
  ('Karthik Subramanian', 'Male', '1998-02-14', 'B.E Mechanical, GATE', 'Applied Mechanics & Maths', 3, ['Mathematics', 'Physics'], 'Coimbatore', '6:00 PM - 8:00 PM', 13000, 'HIGH_PRIORITY', 'NEW_APPLICATION'),
  ('Sneha Varadharajan', 'Female', '1999-08-09', 'B.Sc Mathematics', 'Middle School Maths & Science', 2, ['Mathematics', 'Science'], 'Chennai', '4:00 PM - 6:00 PM', 11000, 'LOW_PRIORITY', 'NEW_APPLICATION'),
  ('Rohan Varma', 'Male', '1995-04-17', 'M.Sc Chemistry', 'Inorganic & Analytical Chemistry', 5, ['Chemistry', 'Science'], 'Bangalore', '5:30 PM - 7:30 PM', 22000, 'HIGH_PRIORITY', 'VALIDATED'),
  ('Shalini Jayakumar', 'Female', '1994-01-25', 'M.A English, CELTA', 'CBSE & ICSE English Writing', 6, ['English', 'Social Science'], 'Tiruchirappalli', '4:30 PM - 6:30 PM', 15000, 'LOW_PRIORITY', 'VALIDATED'),
  ('Ganesh Moorthy', 'Male', '1987-06-30', 'M.Sc Zoology, B.Ed', 'Human Physiology & Genetics', 11, ['Biology', 'Science'], 'Salem', '6:00 PM - 8:00 PM', 19000, 'HIGH_PRIORITY', 'DOCUMENT_VERIFICATION')
]

t_specs += [
  ('Nithya Soundar', 'Female', '1996-10-12', 'B.Tech IT, M.S', 'Python & Data Structures', 4, ['Computer Science', 'Mathematics'], 'Chennai', '5:00 PM - 7:00 PM', 18000, 'LOW_PRIORITY', 'DOCUMENT_APPROVED'),
  ('Praveen Chandran', 'Male', '1992-03-08', 'B.Sc Mathematics', 'Secondary School Maths', 5, ['Mathematics'], 'Tiruchirappalli', '6:30 PM - 8:30 PM', 14000, 'HIGH_PRIORITY', 'DOCUMENT_REJECTED'),
  ('Divya Bharathi', 'Female', '1993-11-20', 'M.A Hindi, B.Ed', 'Rashtrabhasha & Hindi Grammar', 6, ['Hindi', 'Social Science'], 'Coimbatore', '4:00 PM - 6:00 PM', 12000, 'LOW_PRIORITY', 'INTERVIEW_SELECTED'),
  ('Suresh Babu', 'Male', '1985-05-14', 'M.Sc Physics', 'General Physics', 8, ['Physics'], 'Madurai', '5:00 PM - 7:00 PM', 16000, 'HIGH_PRIORITY', 'INTERVIEW_REJECTED'),
  ('Gayathri Shankaran', 'Female', '1994-08-16', 'M.Sc Mathematics, B.Ed', 'Trigonometry & Calculus', 7, ['Mathematics', 'Science'], 'Tiruchirappalli', '5:00 PM - 7:00 PM', 16000, 'HIGH_PRIORITY', 'DEMO_CLASS_PASSED'),
  ('Vasanth Kumar', 'Male', '1993-02-28', 'M.Sc Chemistry', 'Physical Chemistry', 5, ['Chemistry'], 'Chennai', '6:00 PM - 8:00 PM', 17000, 'LOW_PRIORITY', 'DEMO_CLASS_FAILED'),
  ('Aishwarya Ram', 'Female', '1996-07-04', 'M.A French, DELF B2', 'French Language & Grammar', 4, ['French', 'English'], 'Chennai', '4:00 PM - 6:00 PM', 18000, 'HIGH_PRIORITY', 'PARENT_REJECTED'),
  ('Balamurugan Velusamy', 'Male', '1986-12-19', 'M.Sc Mathematics, M.Phil', 'Calculus & Linear Algebra', 12, ['Mathematics', 'Physics'], 'Coimbatore', '5:30 PM - 7:30 PM', 22000, 'HIGH_PRIORITY', 'HIGH_PRIORITY'),
  ('Keerthana Raghu', 'Female', '1997-09-30', 'B.Sc Physics, M.Sc', 'Secondary Physics & Labs', 3, ['Physics', 'Science'], 'Tiruchirappalli', '4:30 PM - 6:30 PM', 13000, 'LOW_PRIORITY', 'LOW_PRIORITY'),
  ('Harish Venkat', 'Male', '1995-05-11', 'B.Tech CSE, MBA', 'Computer Science & Commerce', 4, ['Computer Science', 'Commerce'], 'Bangalore', '6:00 PM - 8:30 PM', 20000, 'HIGH_PRIORITY', 'HIGH_PRIORITY'),
  ('Radhika Anand', 'Female', '1992-06-25', 'M.Sc Biotechnology', 'Cell Biology & Genetics', 6, ['Biology', 'Chemistry'], 'Chennai', '5:00 PM - 7:00 PM', 17000, 'LOW_PRIORITY', 'LOW_PRIORITY'),
  ('Dinesh Pandian', 'Male', '1990-10-14', 'M.A Economics, B.Ed', 'Macroeconomics & Statistics', 8, ['Economics', 'Social Science'], 'Madurai', '4:00 PM - 6:00 PM', 15000, 'LOW_PRIORITY', 'DOCUMENT_VERIFICATION'),
  ('Abirami Sethuraman', 'Female', '1991-03-12', 'M.Sc Mathematics, M.Phil', 'Pure Mathematics (CBSE 12)', 8, ['Mathematics'], 'Tiruchirappalli', '5:00 PM - 7:00 PM', 16000, 'HIGH_PRIORITY', 'INTERVIEW_SELECTED'),
  ('Naveen Prasath', 'Male', '1994-11-03', 'B.Tech Mechanical, M.Tech', 'Physics & Engineering Mechanics', 5, ['Physics', 'Mathematics'], 'Salem', '6:00 PM - 8:00 PM', 15000, 'HIGH_PRIORITY', 'VALIDATED'),
  ('Swathi Sundaram', 'Female', '1995-02-18', 'M.Com, UGC NET', 'Financial Accounting & Commerce', 5, ['Accountancy', 'Commerce'], 'Coimbatore', '5:00 PM - 7:00 PM', 16000, 'HIGH_PRIORITY', 'NEW_APPLICATION')
]

p_specs = [
  ('Senthil Kumaran', '+91 98421 11223', 'senthil.kumaran@gmail.com', '14, Thillai Nagar 10th Cross, Tiruchirappalli', 'Senior Software Architect', 16000, 'Experienced Maths tutor for Class 10 Board exam prep', ['stu-001']),
  ('Dr. Lakshmi Narayanan', '+91 94432 22334', 'dr.lakshmi.narayanan@apollo.com', '88, Anna Nagar West, Chennai', 'Chief Pediatrician', 25000, 'Ph.D or highly qualified tutor for NEET Physics & Chemistry', ['stu-002', 'stu-003']),
  ('Ramesh Kannan', '+91 97890 33445', 'ramesh.kannan@textiles.com', '24, RS Puram, Coimbatore', 'Business Owner (Textile Exports)', 18000, 'Patient tutor for 12th CBSE Chemistry', ['stu-004']),
  ('Anandh Kumaravel', '+91 98840 44556', 'anandh.kumaravel@bankofbaroda.com', '42, KK Nagar, Madurai', 'Assistant General Manager, Bank', 15000, 'English grammar & creative writing specialist', ['stu-005']),
  ('Meena Chandrasekar', '+91 94421 55667', 'meena.chandra@gmail.com', '19, Cantonment, Tiruchirappalli', 'College Professor', 20000, 'Commerce & Accountancy mentor for Class 11', ['stu-006']),
  ('Venkatesh Prasad', '+91 98401 66778', 'venkatesh.prasad@tcs.com', '71, Fairlands, Salem', 'IT Delivery Manager', 15000, 'Experienced mathematics tutor for 9th standard', ['stu-007']),
  ('Saraswathi Natarajan', '+91 99655 77889', 'saraswathi.n@gmail.com', '12, K.K. Nagar, Tiruchirappalli', 'Government High School Headmistress (Retd)', 17000, 'Physics tutor with strong experimental explanation', ['stu-008']),
  ('Balaji Parthasarathy', '+91 97100 88990', 'balaji.partha@gmail.com', '15, Adyar Gate Road, Chennai', 'Chartered Accountant', 22000, 'NEET Biology coaching specialist', ['stu-009']),
  ('Karthikeyan Raju', '+91 94860 99001', 'karthik.raju@gmail.com', '55, Gandhi Nagar, Tiruchirappalli', 'Civil Contractor', 14000, 'Foundation maths and science for Class 8', ['stu-010']),
  ('Vijayalakshmi Sundaram', '+91 98430 00112', 'vijaya.sundaram@gmail.com', '31, Saibaba Colony, Coimbatore', 'HR Director', 16000, 'Computer Science (Python) tutor for 11th CBSE', ['stu-011']),
  ('Gopinath Murugan', '+91 99400 22334', 'gopinath.murugan@bhel.in', 'BHEL Township, Kailasapuram, Tiruchirappalli', 'Senior Engineer, BHEL', 15000, 'Mathematics & Physics for Class 10 CBSE', ['stu-012']),
  ('Nalini Krishnaswamy', '+91 98845 44556', 'nalini.krishna@gmail.com', '10, Alwarpet Street, Chennai', 'Architect', 20000, 'French tutor for CBSE board', ['stu-013']),
  ('Muthukumar Ramasamy', '+91 96001 55667', 'muthu.ramasamy@gmail.com', '27, TVS Nagar, Madurai', 'Automobile Dealer', 14000, 'Science and Social Science for Class 7', ['stu-014']),
  ('Revathi Shankar', '+91 98412 66778', 'revathi.shankar@gmail.com', '9, Saravanampatti, Coimbatore', 'Biotech Scientist', 17000, 'Class 12 Botany and Zoology specialist', ['stu-015']),
  ('Dhanasekar Palanivel', '+91 94441 77889', 'dhana.palanivel@gmail.com', '48, Srirangam West Gopuram Street, Tiruchirappalli', 'Temple Administrator', 13000, 'Tamil and Sanskrit language tutor', ['stu-016']),
  ('Geetha Govindarajan', '+91 97910 88990', 'geetha.govind@gmail.com', '33, Hasthampatti, Salem', 'Principal, Nursery School', 16000, 'Mathematics for 11th State Board', ['stu-017']),
  ('Senthil Vadivel', '+91 98409 99001', 'senthil.vadivel@wipro.com', '66, Velachery Main Road, Chennai', 'Cybersecurity Analyst', 21000, 'Computer Science & AI for 12th', ['stu-018']),
  ('Jothilakshmi Sundaram', '+91 99520 00112', 'jothi.sundaram@gmail.com', '80, Subramaniapuram, Tiruchirappalli', 'Pharmacist', 15000, 'High priority Maths tutor for Rahul', ['stu-019']),
  ('Krishnan Subramanian', '+91 94430 11223', 'krishnan.subbu@gmail.com', '18, Anna Nagar, Madurai', 'Senior Advocate', 18000, 'Economics and Political Science tutor', ['stu-020']),
  ('Subramanian Venkat', '+91 98842 22334', 'subbu.venkat@infosys.com', '51, Koramangala 4th Block, Bangalore', 'VP Engineering', 24000, 'Senior Physics faculty for Olympiad coaching', [])
]

s_specs = [
  ('Rahul Senthil', 'Male', '2010-08-14', '10th Standard', 'Campion AIHSS, Tiruchirappalli', ['Mathematics'], 'Targeting 95+ in Board Exam. Needs concept clarity in Trigonometry and Quadratic Equations.', 'Tiruchirappalli', '5:00 PM', 15000, None, 'par-001', 'LOOKING_FOR_TUTOR'),
  ('Aditya Narayanan', 'Male', '2008-11-20', '12th Standard', 'Chettinad Vidyashram, Chennai', ['Physics', 'Mathematics'], 'Intensive preparation for NEET & JEE Mains Physics numericals.', 'Chennai', '6:30 PM', 25000, 'tut-003', 'par-002', 'TUTOR_ASSIGNED'),
  ('Ananya Narayanan', 'Female', '2011-04-10', '9th Standard', 'Chettinad Vidyashram, Chennai', ['Science', 'Mathematics'], 'Regular homework support and term exam coaching.', 'Chennai', '5:00 PM', 16000, None, 'par-002', 'LOOKING_FOR_TUTOR'),
  ('Sanjay Kannan', 'Male', '2009-02-15', '11th Standard', 'Chinmaya Vidyalaya, Coimbatore', ['Chemistry'], 'Organic Chemistry reaction mechanisms and laboratory prep.', 'Coimbatore', '5:00 PM', 17000, None, 'par-003', 'LOOKING_FOR_TUTOR'),
  ('Pooja Kumaravel', 'Female', '2012-07-08', '8th Standard', 'TVS Academy, Madurai', ['English', 'Social Science'], 'Spoken English fluency, vocabulary building, and history essay writing.', 'Madurai', '5:30 PM', 14000, None, 'par-004', 'LOOKING_FOR_TUTOR'),
  ('Varun Chandrasekar', 'Male', '2008-09-25', '12th Standard', 'Montfort Matriculation, Tiruchirappalli', ['Accountancy', 'Economics'], 'Partnership accounts, company balance sheet analysis.', 'Tiruchirappalli', '5:30 PM', 18000, 'tut-007', 'par-005', 'TUTOR_ASSIGNED'),
  ('Karthika Prasad', 'Female', '2011-12-01', '9th Standard', 'Cluny Convent, Salem', ['Mathematics'], 'Struggles with geometry proofs. Needs patient step-by-step guidance.', 'Salem', '4:30 PM', 14000, 'tut-008', 'par-006', 'TUTOR_ASSIGNED'),
  ('Dinesh Natarajan', 'Male', '2009-06-18', '11th Standard', 'Bishop Heber HSS, Tiruchirappalli', ['Physics'], 'Gravitation, rotational dynamics, numerical problem solving.', 'Tiruchirappalli', '5:00 PM', 17000, 'tut-009', 'par-007', 'TUTOR_ASSIGNED'),
  ('Divya Parthasarathy', 'Female', '2008-03-30', '12th Standard', 'Bhavans Rajaji Vidyashram, Chennai', ['Biology'], 'Genetics and biotechnology revision for NEET.', 'Chennai', '6:00 PM', 20000, 'tut-006', 'par-008', 'TUTOR_ASSIGNED'),
  ('Pranav Raju', 'Male', '2013-05-14', '7th Standard', 'St. Josephs College HSS, Tiruchirappalli', ['Mathematics', 'Science'], 'Basic arithmetic foundation, fractions, general science curiosity.', 'Tiruchirappalli', '5:00 PM', 13000, None, 'par-009', 'LOOKING_FOR_TUTOR'),
  ('Shruti Sundaram', 'Female', '2009-10-05', '11th Standard', 'PSG Public School, Coimbatore', ['Computer Science'], 'Python programming, object-oriented concepts, SQL queries.', 'Coimbatore', '6:00 PM', 16000, None, 'par-010', 'LOOKING_FOR_TUTOR'),
  ('Gautham Murugan', 'Male', '2010-01-22', '10th Standard', 'RSK Higher Secondary School, Tiruchirappalli', ['Mathematics', 'Physics'], 'CBSE Class 10 full syllabus revision and sample papers.', 'Tiruchirappalli', '5:30 PM', 16000, None, 'par-011', 'LOOKING_FOR_TUTOR'),
  ('Tara Krishnaswamy', 'Female', '2010-11-19', '10th Standard', 'Sishya School, Chennai', ['French'], 'CBSE French literature, grammar tenses, comprehension.', 'Chennai', '4:30 PM', 19000, None, 'par-012', 'LOOKING_FOR_TUTOR'),
  ('Naveen Ramasamy', 'Male', '2013-08-04', '7th Standard', 'Mahatma Montessori, Madurai', ['Science'], 'Physics and Chemistry everyday concepts, regular practice.', 'Madurai', '4:00 PM', 13000, None, 'par-013', 'LOOKING_FOR_TUTOR'),
  ('Sneha Shankar', 'Female', '2008-04-12', '12th Standard', 'Kendriya Vidyalaya, Coimbatore', ['Biology'], 'NEET Biology crash test preparation.', 'Coimbatore', '6:00 PM', 18000, None, 'par-014', 'LOOKING_FOR_TUTOR'),
  ('Manikandan Palanivel', 'Male', '2012-09-17', '8th Standard', 'National High School, Tiruchirappalli', ['Tamil', 'Social Science'], 'Tamil poetry recitation and grammatical analysis.', 'Tiruchirappalli', '5:00 PM', 12000, None, 'par-015', 'LOOKING_FOR_TUTOR'),
  ('Deepak Govindarajan', 'Male', '2009-07-28', '11th Standard', 'Holy Cross Matriculation, Salem', ['Mathematics'], 'State board calculus and trigonometry.', 'Salem', '5:00 PM', 15000, None, 'par-016', 'LOOKING_FOR_TUTOR'),
  ('Vidyuth Vadivel', 'Male', '2008-10-10', '12th Standard', 'DAV Public School, Chennai', ['Computer Science'], 'Full stack web development foundation & CBSE CS exam prep.', 'Chennai', '6:00 PM', 20000, None, 'par-017', 'LOOKING_FOR_TUTOR'),
  ('Nithil Sundaram', 'Male', '2011-03-21', '9th Standard', 'St. Johns Vestry, Tiruchirappalli', ['Mathematics'], 'CBSE Class 9 polynomials, coordinate geometry.', 'Tiruchirappalli', '5:00 PM', 15000, None, 'par-018', 'LOOKING_FOR_TUTOR'),
  ('Aswath Subramanian', 'Male', '2009-05-06', '11th Standard', 'Vikaasa School, Madurai', ['Economics'], 'Indian economic development, microeconomics curves.', 'Madurai', '4:30 PM', 17000, None, 'par-019', 'LOOKING_FOR_TUTOR')
]

photos = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80'
]

for idx, t in enumerate(t_specs):
    tid = f'tut-{idx+1:03d}'
    t_code = f'TUT-2026-{idx+1:03d}'
    res = 'Passed' if t[11] in ['ACTIVE', 'TUTOR_APPOINTED', 'PARENT_APPROVED', 'INTERVIEW_SELECTED', 'DEMO_CLASS_PASSED'] else ('Rejected' if 'REJECT' in t[11] or 'FAILED' in t[11] else 'Pending')
    clean_email = t[0].lower().replace(' ', '.').replace('dr.', '') + '@gmail.com'
    db['tutors'].append({
        'id': tid,
        'tutorId': t_code,
        'fullName': t[0],
        'mobile': f'+91 9842{idx+1:05d}',
        'whatsapp': f'+91 9842{idx+1:05d}',
        'email': clean_email,
        'gender': t[1],
        'dob': t[2],
        'qualification': t[3],
        'specialization': t[4],
        'experienceYears': t[5],
        'subjects': t[6],
        'preferredLocation': t[7],
        'availableTiming': t[8],
        'expectedSalary': t[9],
        'resume': f'{tid}_resume.pdf',
        'photo': photos[idx % len(photos)],
        'priority': t[10],
        'result': res,
        'status': t[11],
        'createdAt': '2026-08-15T10:00:00Z'
    })

for idx, p in enumerate(p_specs):
    pid = f'par-{idx+1:03d}'
    db['parents'].append({
        'id': pid,
        'parentId': f'PAR-2026-{idx+1:03d}',
        'parentName': p[0],
        'mobile': p[1],
        'whatsapp': p[1],
        'email': p[2],
        'address': p[3],
        'occupation': p[4],
        'budget': p[5],
        'tutorPreference': p[6],
        'studentIds': p[7]
    })

for idx, s in enumerate(s_specs):
    sid = f'stu-{idx+1:03d}'
    db['students'].append({
        'id': sid,
        'studentId': f'STU-2026-{idx+1:03d}',
        'studentName': s[0],
        'gender': s[1],
        'dob': s[2],
        'class': s[3],
        'school': s[4],
        'requiredSubjects': s[5],
        'learningRequirements': s[6],
        'location': s[7],
        'preferredTiming': s[8],
        'budget': s[9],
        'assignedTutorId': s[10],
        'parentId': s[11],
        'status': s[12]
    })

doc_types = ['Resume', 'Qualification Certificate', 'Degree Certificate', 'Experience Certificate', 'Address Proof', 'Other Documents']
for i, t in enumerate(db['tutors']):
    t_id = t['id']
    st = t['status']
    for idx, dt in enumerate(doc_types):
        doc_id = f'doc-{i+1:03d}-{idx+1}'
        if st in ['DOCUMENT_APPROVED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_SELECTED', 'DEMO_CLASS_SCHEDULED', 'DEMO_CLASS_PASSED', 'PARENT_APPROVAL_PENDING', 'PARENT_APPROVED', 'TUTOR_APPOINTED', 'ACTIVE']:
            doc_status = 'Verified'
            remarks = 'Verified by verification team.'
        elif st == 'DOCUMENT_REJECTED':
            doc_status = 'Rejected' if idx == 1 else ('Verified' if idx == 0 else 'Pending')
            remarks = 'Certificate discrepancy found during review.' if idx == 1 else ''
        elif st == 'DOCUMENT_VERIFICATION':
            doc_status = 'Verified' if idx < 3 else 'Pending'
            remarks = 'Verified' if idx < 3 else ''
        else:
            doc_status = 'Pending'
            remarks = ''
            
        clean_name = t['fullName'].replace(' ', '_')
        clean_type = dt.replace(' ', '_')
        db['tutorDocuments'].append({
            'id': doc_id,
            'tutorId': t_id,
            'docType': dt,
            'fileName': f'{clean_name}_{clean_type}.pdf',
            'fileUrl': f'/mock-files/{t_id}_{clean_type.lower()}.pdf',
            'status': doc_status,
            'remarks': remarks,
            'updatedAt': '2026-08-20T11:00:00Z'
        })

db['interviews'] = [
  { 'id': 'int-001', 'interviewId': 'INT-2026-001', 'tutorId': 'tut-004', 'date': '2026-09-05', 'time': '11:00 AM', 'interviewer': 'Dr. K. Raghavan', 'type': 'In-Person', 'communicationRating': 4, 'subjectKnowledgeRating': 5, 'teachingAbilityRating': 4, 'overallRating': 4.3, 'result': 'Pending', 'comments': 'Scheduled for upcoming Saturday in Tiruchirappalli office.' },
  { 'id': 'int-002', 'interviewId': 'INT-2026-002', 'tutorId': 'tut-005', 'date': '2026-08-18', 'time': '02:30 PM', 'interviewer': 'Prof. S. Murali', 'type': 'Online', 'communicationRating': 5, 'subjectKnowledgeRating': 5, 'teachingAbilityRating': 4, 'overallRating': 4.7, 'result': 'Selected', 'comments': 'Outstanding grammar clarity. Selected for Demo class.' },
  { 'id': 'int-003', 'interviewId': 'INT-2026-003', 'tutorId': 'tut-006', 'date': '2026-08-14', 'time': '10:00 AM', 'interviewer': 'Mrs. Revathi', 'type': 'In-Person', 'communicationRating': 4, 'subjectKnowledgeRating': 5, 'teachingAbilityRating': 5, 'overallRating': 4.7, 'result': 'Selected', 'comments': 'Exceptional mastery in NEET Botany diagrams.' },
  { 'id': 'int-004', 'interviewId': 'INT-2026-004', 'tutorId': 'tut-007', 'date': '2026-08-10', 'time': '04:00 PM', 'interviewer': 'Mr. T. Saravanan', 'type': 'Online', 'communicationRating': 5, 'subjectKnowledgeRating': 5, 'teachingAbilityRating': 5, 'overallRating': 5.0, 'result': 'Selected', 'comments': 'CA background adds practical value.' },
  { 'id': 'int-005', 'interviewId': 'INT-2026-005', 'tutorId': 'tut-019', 'date': '2026-08-12', 'time': '03:00 PM', 'interviewer': 'Dr. K. Raghavan', 'type': 'Online', 'communicationRating': 2, 'subjectKnowledgeRating': 3, 'teachingAbilityRating': 2, 'overallRating': 2.3, 'result': 'Rejected', 'comments': 'Struggled to articulate basic laws clearly in English.' }
]

db['demoClasses'] = [
  { 'id': 'dem-001', 'demoId': 'DEM-2026-001', 'tutorId': 'tut-005', 'studentId': 'stu-005', 'subject': 'English', 'class': '8th Standard', 'date': '2026-09-04', 'time': '05:00 PM', 'location': 'Student Home (Madurai)', 'teachingMethod': 'Interactive Storytelling', 'adminRating': 0, 'studentRating': 0, 'parentRating': 0, 'result': 'Pending', 'comments': 'Demo class scheduled.' },
  { 'id': 'dem-002', 'demoId': 'DEM-2026-002', 'tutorId': 'tut-006', 'studentId': 'stu-009', 'subject': 'Biology', 'class': '12th Standard', 'date': '2026-08-22', 'time': '06:00 PM', 'location': 'Online', 'teachingMethod': 'NEET Mindmaps', 'adminRating': 5, 'studentRating': 5, 'parentRating': 4, 'result': 'Passed', 'comments': 'Student Divya thoroughly impressed.' },
  { 'id': 'dem-003', 'demoId': 'DEM-2026-003', 'tutorId': 'tut-007', 'studentId': 'stu-006', 'subject': 'Accountancy', 'class': '12th Standard', 'date': '2026-08-16', 'time': '05:30 PM', 'location': 'Student Home (Tiruchirappalli)', 'teachingMethod': 'Ledger Practice', 'adminRating': 5, 'studentRating': 5, 'parentRating': 5, 'result': 'Passed', 'comments': 'Excellent rapport created.' },
  { 'id': 'dem-004', 'demoId': 'DEM-2026-004', 'tutorId': 'tut-008', 'studentId': 'stu-007', 'subject': 'Mathematics', 'class': '9th Standard', 'date': '2026-08-11', 'time': '04:30 PM', 'location': 'Student Home (Salem)', 'teachingMethod': 'Geometric proofs', 'adminRating': 5, 'studentRating': 5, 'parentRating': 5, 'result': 'Passed', 'comments': 'Student felt confident.' },
  { 'id': 'dem-005', 'demoId': 'DEM-2026-005', 'tutorId': 'tut-021', 'studentId': 'stu-004', 'subject': 'Chemistry', 'class': '11th Standard', 'date': '2026-08-15', 'time': '06:00 PM', 'location': 'Online', 'teachingMethod': 'Lecture style', 'adminRating': 2, 'studentRating': 2, 'parentRating': 2, 'result': 'Failed', 'comments': 'Explanations too fast.' }
]

db['parentApprovals'] = [
  { 'id': 'appr-001', 'tutorId': 'tut-006', 'parentId': 'par-008', 'studentId': 'stu-009', 'demoId': 'dem-002', 'status': 'PENDING', 'rating': 0, 'feedback': '', 'comments': 'Awaiting parent review.', 'decidedAt': None },
  { 'id': 'appr-002', 'tutorId': 'tut-007', 'parentId': 'par-005', 'studentId': 'stu-006', 'demoId': 'dem-003', 'status': 'APPROVED', 'rating': 5, 'feedback': 'Highly impressed by Mr. Manoj CA background.', 'comments': 'Parent signed consent.', 'decidedAt': '2026-08-18T14:30:00Z' },
  { 'id': 'appr-003', 'tutorId': 'tut-008', 'parentId': 'par-006', 'studentId': 'stu-007', 'demoId': 'dem-004', 'status': 'APPROVED', 'rating': 5, 'feedback': 'Ananya is wonderful with our daughter.', 'comments': 'Parent enthusiastically approved.', 'decidedAt': '2026-08-14T18:00:00Z' },
  { 'id': 'appr-004', 'tutorId': 'tut-022', 'parentId': 'par-012', 'studentId': 'stu-013', 'demoId': None, 'status': 'REJECTED', 'rating': 2, 'feedback': 'Teaching methodology did not match CBSE expectation.', 'comments': 'Parent requested replacement.', 'decidedAt': '2026-08-05T16:00:00Z' }
]

db['appointments'] = [
  { 'id': 'apt-001', 'appointmentId': 'APT-2026-001', 'tutorId': 'tut-008', 'studentId': 'stu-007', 'parentId': 'par-006', 'subject': 'Mathematics', 'location': 'Student Home (Salem)', 'timing': '4:00 PM - 6:00 PM (Mon, Wed, Fri)', 'salary': 14000, 'startDate': '2026-08-18', 'status': 'ACTIVE' },
  { 'id': 'apt-002', 'appointmentId': 'APT-2026-002', 'tutorId': 'tut-009', 'studentId': 'stu-008', 'parentId': 'par-007', 'subject': 'Physics', 'location': 'Student Home (Tiruchirappalli)', 'timing': '5:00 PM - 7:00 PM (Tue, Thu, Sat)', 'salary': 17000, 'startDate': '2026-08-01', 'status': 'ACTIVE' },
  { 'id': 'apt-003', 'appointmentId': 'APT-2026-003', 'tutorId': 'tut-010', 'studentId': 'stu-016', 'parentId': 'par-015', 'subject': 'Tamil & Social Science', 'location': 'Student Home (Srirangam)', 'timing': '4:00 PM - 6:30 PM (Mon-Fri)', 'salary': 13000, 'startDate': '2026-07-22', 'status': 'ACTIVE' }
]

db['activityLogs'] = [
  { 'id': 'act-001', 'tutorId': 'tut-001', 'actor': 'Admin', 'action': 'APPLICATION_RECEIVED', 'description': 'Application received from Arun Kumar for Mathematics.', 'timestamp': '2026-08-15T09:30:00Z' },
  { 'id': 'act-002', 'tutorId': 'tut-001', 'actor': 'Admin', 'action': 'PRIORITY_ASSIGNED', 'description': 'Assigned HIGH_PRIORITY based on 7 years experience and M.Sc + B.Ed.', 'timestamp': '2026-08-15T09:45:00Z' },
  { 'id': 'act-003', 'tutorId': 'tut-003', 'actor': 'Admin', 'action': 'TUTOR_VALIDATED', 'description': 'Admin validated tutor Dr. Rajesh Raman. Moved to Document Verification.', 'timestamp': '2026-08-10T09:00:00Z' },
  { 'id': 'act-004', 'tutorId': 'tut-003', 'actor': 'Staff', 'action': 'DOCUMENT_VERIFIED', 'description': 'Degree Certificate (PhD Physics) verified from IIT Madras records.', 'timestamp': '2026-08-11T14:30:00Z' },
  { 'id': 'act-005', 'tutorId': 'tut-004', 'actor': 'Staff', 'action': 'INTERVIEW_SCHEDULED', 'description': 'In-Person interview scheduled for Kavitha Natarajan with Dr. K. Raghavan.', 'timestamp': '2026-08-14T10:00:00Z' },
  { 'id': 'act-006', 'tutorId': 'tut-006', 'actor': 'Staff', 'action': 'DEMO_PASSED', 'description': 'Demo class passed with student Divya Parthasarathy with 4.7/5 score.', 'timestamp': '2026-08-22T19:00:00Z' },
  { 'id': 'act-007', 'tutorId': 'tut-007', 'actor': 'Parent (Meena)', 'action': 'PARENT_APPROVED', 'description': 'Parent approved tutor Manoj Swaminathan for Accountancy.', 'timestamp': '2026-08-18T14:30:00Z' },
  { 'id': 'act-008', 'tutorId': 'tut-008', 'actor': 'Admin', 'action': 'TUTOR_APPOINTED', 'description': 'Tutor Ananya Krishnan appointed for student Karthika Prasad.', 'timestamp': '2026-08-18T16:00:00Z' }
]

db['notifications'] = [
  { 'id': 'notif-001', 'title': 'Parent Approval Pending', 'message': 'Tutor Deepa Balasubramanian completed demo class. Awaiting parent approval.', 'type': 'warning', 'read': False, 'link': '/recruitment/parent-approval', 'timestamp': '2026-08-22T19:30:00Z' },
  { 'id': 'notif-002', 'title': 'High Priority Tutor Ready for Validation', 'message': 'Arun Kumar (M.Sc Mathematics, 7 yrs exp) is awaiting validation.', 'type': 'info', 'read': False, 'link': '/tutors/high-priority', 'timestamp': '2026-08-15T09:45:00Z' },
  { 'id': 'notif-003', 'title': 'Interview Scheduled', 'message': 'Interview scheduled for Kavitha Natarajan on Sep 5 at 11:00 AM.', 'type': 'info', 'read': False, 'link': '/recruitment/interview', 'timestamp': '2026-08-14T10:00:00Z' },
  { 'id': 'notif-004', 'title': 'Document Rejected', 'message': 'Praveen Chandran mark sheet rejected due to discrepancy.', 'type': 'danger', 'read': True, 'link': '/recruitment/document-verification', 'timestamp': '2026-08-12T13:00:00Z' },
  { 'id': 'notif-005', 'title': 'Tutor Appointed Successfully', 'message': 'Ananya Krishnan appointed as Active Tutor.', 'type': 'success', 'read': True, 'link': '/tutors/appointed', 'timestamp': '2026-08-18T16:00:00Z' }
]

base_dir = r'server/src'
os.makedirs(os.path.join(base_dir, 'data'), exist_ok=True)
os.makedirs(os.path.join(base_dir, 'seed'), exist_ok=True)

with open(os.path.join(base_dir, 'data', 'db.json'), 'w', encoding='utf-8') as f:
    json.dump(db, f, indent=2)

with open(os.path.join(base_dir, 'seed', 'seedData.js'), 'w', encoding='utf-8') as f:
    f.write('module.exports = ' + json.dumps(db, indent=2) + ';\n')

print(f'Successfully built database: {len(db["tutors"])} tutors, {len(db["parents"])} parents, {len(db["students"])} students, {len(db["tutorDocuments"])} documents!')
