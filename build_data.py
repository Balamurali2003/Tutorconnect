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
