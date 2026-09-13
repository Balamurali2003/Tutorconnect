import {
  SubjectItem,
  FutureSkillItem,
  TimelineStepItem,
  ParentPillarItem,
  ChildDiscoveryItem,
  GalleryItem,
  TestimonialItem
} from '../types';

export const BRAND = {
  name: 'Charithra Learning Hub',
  tagline: 'Learn Today • Lead Tomorrow',
  subtitle: 'Modern Education + Kids Technology Lab + Creativity + Future Skills',
  phone: '+91 98765 43210',
  whatsapp: '919876543210',
  email: 'learn@charithrahub.com',
  address: 'Charithra Learning Hub, 2nd Floor, Innovation Square, Central Avenue',
  city: 'Chennai & Bengaluru Centres',
  hours: 'Mon - Sat: 9:00 AM - 7:30 PM | Sun: 9:30 AM - 5:00 PM (Workshops)',
  girlMascot: {
    name: 'Charithra Girl (Academic Star)',
    role: 'Learning • Academics • Confidence • Creativity',
    image: '/assets/mascots/charithra-girl-transparent.png',
    avatar: '/assets/mascots/charithra-girl-avatar.png',
    original: '/assets/mascots/charithra-girl.png'
  },
  boyMascot: {
    name: 'Charithra Boy (Tech & Robotics Explorer)',
    role: 'Robotics • Technology • Innovation • Experiments • RC Cars',
    image: '/assets/mascots/charithra-boy-transparent.png',
    avatar: '/assets/mascots/charithra-boy-avatar.png',
    original: '/assets/mascots/charithra-boy.png',
    rcCar: '/assets/mascots/rc-car.png'
  }
};

export const WHY_CHARITHRA_CARDS = [
  {
    id: 'learn',
    title: 'Learn',
    tagline: 'Build strong academic foundations.',
    description: 'We demystify textbook topics step-by-step with real-world examples, visual notes, and interactive worksheets.',
    color: '#0EA5E9',
    bg: 'bg-sky-500/10',
    border: 'border-sky-400/30',
    icon: 'BookOpen',
    badge: 'Core Foundation'
  },
  {
    id: 'understand',
    title: 'Understand',
    tagline: 'Learn concepts instead of simply memorising.',
    description: 'Moving beyond rote learning — our students grasp the "why" and "how" behind scientific laws and mathematical logic.',
    color: '#F5A623',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/30',
    icon: 'Lightbulb',
    badge: 'Deep Logic'
  },
  {
    id: 'create',
    title: 'Create',
    tagline: 'Turn curiosity into experiments and projects.',
    description: 'From programming miniature obstacle-avoiding rovers to testing paper drones, creativity is taught as an active superpower.',
    color: '#8B5CF6',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/30',
    icon: 'Sparkles',
    badge: 'Hands-On Labs'
  },
  {
    id: 'grow',
    title: 'Grow',
    tagline: 'Build confidence, communication and future skills.',
    description: 'Small class batches and student presentation days cultivate natural public speaking and fear-free questioning.',
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    icon: 'TrendingUp',
    badge: 'Life Readiness'
  }
];

export const WHY_Charithra_CARDS = WHY_CHARITHRA_CARDS;

export const SUBJECTS: SubjectItem[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    category: 'core',
    icon: 'Calculator',
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-500/10 to-indigo-500/10',
    description: 'Mental math shortcuts, geometric visualization, algebra problem-solving, and practical logic puzzles.',
    highlights: ['Concept breakdown', 'Formula visualization', 'Speed arithmetic drills'],
    animationType: 'math'
  },
  {
    id: 'science',
    name: 'Science',
    category: 'core',
    icon: 'Atom',
    accentColor: '#10B981',
    bgGradient: 'from-emerald-500/10 to-teal-500/10',
    description: 'Physics laws in action, chemistry model kits, plant and animal biology demonstrations that kids can see & touch.',
    highlights: ['Live micro-experiments', 'Scientific inquiry', 'Diagram mastery'],
    animationType: 'atom'
  },
  {
    id: 'english',
    name: 'English',
    category: 'core',
    icon: 'BookType',
    accentColor: '#EC4899',
    bgGradient: 'from-pink-500/10 to-rose-500/10',
    description: 'Grammar clarity, creative essay writing, reading comprehension, vocabulary expansion, and public speaking confidence.',
    highlights: ['Story crafting', 'Grammar without fear', 'Phonics & pronunciation'],
    animationType: 'letters'
  },
  {
    id: 'social',
    name: 'Social Science',
    category: 'core',
    icon: 'Globe',
    accentColor: '#F59E0B',
    bgGradient: 'from-amber-500/10 to-yellow-500/10',
    description: 'Timeline-based history stories, 3D topographical geography exploration, and engaging civics simulations.',
    highlights: ['Map navigation', 'Historical storytelling', 'Case study discussions'],
    animationType: 'globe'
  },
  {
    id: 'languages',
    name: 'Languages',
    category: 'core',
    icon: 'Languages',
    accentColor: '#8B5CF6',
    bgGradient: 'from-purple-500/10 to-violet-500/10',
    description: 'Regional language reading fluency, Hindi & Sanskrit foundations, script writing, and spoken conversational skills.',
    highlights: ['Phonetics practice', 'Reading clubs', 'Grammar essentials'],
    animationType: 'letters'
  },
  {
    id: 'homework',
    name: 'Homework Support',
    category: 'support',
    icon: 'PencilLine',
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-500/10 to-sky-500/10',
    description: 'Daily guided time where students complete school homework with qualified mentor assistance, eliminating evening stress.',
    highlights: ['Zero stress at home', 'Daily doubt clearance', 'Consistent habit building'],
    animationType: 'pencil'
  },
  {
    id: 'exam-prep',
    name: 'Exam Preparation',
    category: 'support',
    icon: 'Award',
    accentColor: '#F97316',
    bgGradient: 'from-orange-500/10 to-amber-500/10',
    description: 'Structured revision plans, model question papers, timed mock tests, and targeted score improvement techniques.',
    highlights: ['Question bank practice', 'Timed simulated exams', 'Weak-spot repair'],
    animationType: 'sparkle'
  },
  {
    id: 'concept-revision',
    name: 'Concept Revision',
    category: 'support',
    icon: 'RefreshCw',
    accentColor: '#6366F1',
    bgGradient: 'from-indigo-500/10 to-purple-500/10',
    description: 'Visual mind maps, memory flashcards, and summary audio/video recaps for long-term retention before any assessment.',
    highlights: ['Visual flashcards', 'Rapid mind-mapping', 'Doubt clinics'],
    animationType: 'sparkle'
  }
];

export const ONLINE_FEATURES = [
  {
    title: 'Live Interactive Classes',
    desc: 'Small student batches with two-way audio & video — no boring pre-recorded monologues.',
    icon: 'Video'
  },
  {
    title: 'Concept Explanation with Animations',
    desc: 'Visual 3D graphics and digital whiteboards turn abstract equations into easy diagrams.',
    icon: 'MonitorPlay'
  },
  {
    title: 'Instant Doubt Clearing',
    desc: 'Dedicated 1-on-1 breakout moments during every session so no child gets left behind.',
    icon: 'MessageCircleQuestion'
  },
  {
    title: 'Interactive Digital Assignments',
    desc: 'Gamified quizzes and worksheets with auto-graded instant feedback.',
    icon: 'CheckCircle2'
  },
  {
    title: 'Recorded Revision Vault',
    desc: 'Missed a lecture or need pre-exam recap? Access full HD session recordings 24/7.',
    icon: 'History'
  },
  {
    title: 'Weekly Parent WhatsApp Updates',
    desc: 'Attendance logs, weekly progress milestones, and teacher notes delivered right to mom & dad.',
    icon: 'Smartphone'
  }
];

export const OFFLINE_FEATURES = [
  {
    title: 'Modern Ergonomic Classrooms',
    desc: 'Bright, colorful, air-conditioned seating designed specifically for school kids.',
    icon: 'School'
  },
  {
    title: 'Interactive Physical Learning Aids',
    desc: 'Manipulatives, geometric models, circuit boards, and 3D globe globes for tactile memory.',
    icon: 'Boxes'
  },
  {
    title: 'Peer Problem Solving',
    desc: 'Kids collaborate in pairs to crack puzzles, building social and team communication skills.',
    icon: 'Users'
  },
  {
    title: 'Safe & Monitored Campus',
    desc: 'CCTV monitored premises, biometric check-in, and loving, certified teacher mentors.',
    icon: 'ShieldCheck'
  }
];

export const FUTURE_SKILLS: FutureSkillItem[] = [
  {
    id: 'robotics',
    code: '01',
    title: 'ROBOTICS',
    tagline: 'Build. Program. Discover.',
    description: 'Hands-on hardware labs where students wire real electronic sensors, plug DC motors, and write drag-and-drop code to bring autonomous robots to life.',
    icon: 'Bot',
    accent: 'from-amber-500 to-yellow-400',
    colorHex: '#F5A623',
    highlights: [
      'Microcontroller & Breadboard wiring',
      'Ultrasonic distance & infrared sensors',
      'Block programming (Scratch & MakeCode)',
      'Line-following & obstacle avoiding rovers'
    ],
    equipment: ['Arduino UNO / Micro:bit', 'Gear Motors & Wheels', 'Obstacle Sensors', 'LED Matrices']
  },
  {
    id: 'drones',
    code: '02',
    title: 'DRONES',
    tagline: 'Explore the World From Above.',
    description: 'Learn aerodynamics and flight physics! Kids assemble miniature quadcopters, practice on precision flight simulators, and pilot indoor drones through hoop courses safely.',
    icon: 'Plane',
    accent: 'from-sky-500 to-cyan-400',
    colorHex: '#0EA5E9',
    highlights: [
      'Principles of lift, thrust, roll & yaw',
      'Safe indoor drone cage flight training',
      'Propeller balancing and motor calibration',
      'FPV camera basics and obstacle navigation'
    ],
    equipment: ['Safe Prop-Guarded Quadcopters', 'Radio Transmitters', 'Simulator Consoles', 'Landing Pads']
  },
  {
    id: 'remote-cars',
    code: '03',
    title: 'REMOTE CARS',
    tagline: 'Control. Race. Experiment.',
    description: 'Step into our mini race garage! Children understand gear ratios, differential steering, suspension physics, and battery electronics while racing and timing real RC cars.',
    icon: 'Gamepad2',
    accent: 'from-orange-500 to-red-500',
    colorHex: '#F97316',
    highlights: [
      'Steering servo mechanics & throttle control',
      'Suspension tuning for track friction & grip',
      '2.4GHz RF communication fundamentals',
      'Time-trial precision racing challenges'
    ],
    equipment: ['High-Torque RC Buggies', 'Proportional Controllers', 'Track Cones & Chicanes', 'Lap Timers']
  },
  {
    id: 'future-tech',
    code: '04',
    title: 'FUTURE TECHNOLOGY',
    tagline: 'Turn Curiosity Into Creativity.',
    description: 'Demystifying AI, smart home sensors, Internet of Things (IoT), and 3D printing in a kid-friendly visual environment that inspires the innovators of tomorrow.',
    icon: 'Cpu',
    accent: 'from-purple-500 to-indigo-500',
    colorHex: '#8B5CF6',
    highlights: [
      'How Voice AI & Chatbots think',
      'Smart sensor circuits (light, motion, sound)',
      '3D CAD design for beginners',
      'Inventor mindset & prototype building'
    ],
    equipment: ['Smart IoT Breadboards', '3D Pen & Printers', 'Speech Recognition Demos', 'Logic Gates']
  }
];

export const TIMELINE_STEPS: TimelineStepItem[] = [
  {
    id: 'step-1',
    timeSlot: 'Stage 01 • Morning',
    title: 'Learn',
    subtitle: 'Academic Concepts & Core Fundamentals',
    description: 'Starting with lively visual breakdowns of school curriculum topics. No heavy lectures — just interactive dialogue and crystal clear principles.',
    icon: 'BookOpen',
    color: '#0EA5E9',
    mascotRole: 'girl'
  },
  {
    id: 'step-2',
    timeSlot: 'Stage 02 • Midday',
    title: 'Think',
    subtitle: 'Problem Solving & Critical Inquiry',
    description: 'Challenging puzzles, logic riddles, and collaborative group discussions that teach young minds to break big problems into manageable pieces.',
    icon: 'Brain',
    color: '#8B5CF6',
    mascotRole: 'girl'
  },
  {
    id: 'step-3',
    timeSlot: 'Stage 03 • Hands-on',
    title: 'Create',
    subtitle: 'Experiments & Project Building',
    description: 'Moving from theory to creation! Assembling circuits, mixing science test-tube reactions, or sketching prototype models.',
    icon: 'Wrench',
    color: '#F5A623',
    mascotRole: 'both'
  },
  {
    id: 'step-4',
    timeSlot: 'Stage 04 • Technology Lab',
    title: 'Explore',
    subtitle: 'Robotics, Drones & RC Car Challenges',
    description: 'Entering the technology lab with our Boy Mascot: testing code on robotic rovers, piloting quadcopters, or timing RC cars on the track.',
    icon: 'Rocket',
    color: '#F97316',
    mascotRole: 'boy'
  },
  {
    id: 'step-5',
    timeSlot: 'Stage 05 • Reflection',
    title: 'Share',
    subtitle: 'Show What You Learned & Celebrate',
    description: 'Students stand up, demonstrate their working robot or solved problem to mentors and peers, earning stars and glowing confidence.',
    icon: 'Sparkles',
    color: '#10B981',
    mascotRole: 'both'
  }
];

export const PARENT_PILLARS: ParentPillarItem[] = [
  {
    id: 'concept',
    title: 'Concept Clarity',
    shortDesc: 'Deep understanding over rote cramming.',
    details: 'Our curriculum ensures your child knows how concepts connect to everyday reality, turning homework dread into genuine curiosity.',
    icon: 'Compass',
    stat: '100% Concept First'
  },
  {
    id: 'personal',
    title: 'Personal Attention',
    shortDesc: 'Strict 1:8 mentor-to-student ratio.',
    details: 'No crowded 40-student tuition halls. Every student has their strengths noticed and their questions answered patiently.',
    icon: 'UserCheck',
    stat: 'Max 8 Per Batch'
  },
  {
    id: 'interactive',
    title: 'Interactive Learning',
    shortDesc: 'Engaged minds retain 4x more.',
    details: 'Through animated slides, physical models, and gamified challenges, children participate actively rather than daydreaming passively.',
    icon: 'Sparkles',
    stat: '4x Higher Recall'
  },
  {
    id: 'skills',
    title: 'Skill Development',
    shortDesc: 'Analytical reasoning & practical skills.',
    details: 'Problem-solving, spatial reasoning, logic flow, and basic computing are naturally woven into every single subject lesson.',
    icon: 'Zap',
    stat: '21st Century Skills'
  },
  {
    id: 'exposure',
    title: 'Future Exposure',
    shortDesc: 'Robotics, Drones & AI for young minds.',
    details: 'Preparing your child for the future world where technology literacy is as fundamental as reading and arithmetic.',
    icon: 'Cpu',
    stat: 'Future-Proof Tech'
  },
  {
    id: 'confidence',
    title: 'Confidence Building',
    shortDesc: 'Empowered, articulate children.',
    details: 'Through regular mini-presentations and celebratory positive reinforcement, shy children blossom into confident self-advocates.',
    icon: 'Award',
    stat: 'Fear-Free Speech'
  }
];

export const CHILD_DISCOVERIES: ChildDiscoveryItem[] = [
  {
    id: 'learn',
    emoji: '📚',
    title: 'Learn',
    actionWord: 'Discover Secret Math Tricks!',
    funFact: 'Did you know? If you add up the digits of any multiple of 9, they always add up to 9! (e.g. 9 × 7 = 63 → 6 + 3 = 9)',
    miniChallenge: 'What is 9 × 8? Add the digits of the answer!',
    badge: 'Number Wizard',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    id: 'experiment',
    emoji: '🔬',
    title: 'Experiment',
    actionWord: 'Make Magic Science Potions!',
    funFact: 'Lemon juice and baking soda react to create carbon dioxide gas bubbles — the exact same gas that makes soda fizzy!',
    miniChallenge: 'Can gas blow up a balloon? Yes, ask us in lab!',
    badge: 'Junior Scientist',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    id: 'build',
    emoji: '🤖',
    title: 'Build',
    actionWord: 'Command Your Own Robot!',
    funFact: 'Robots use ultrasonic sound waves (just like bats!) to "see" walls and turn away before bumping into them!',
    miniChallenge: 'Write a 3-step command: Move forward → Stop → Turn left!',
    badge: 'Robo Architect',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'explore',
    emoji: '🚁',
    title: 'Explore',
    actionWord: 'Fly High with Drone Wings!',
    funFact: 'A quadcopter has 2 propellers spinning clockwise and 2 counter-clockwise so the drone stays perfectly steady in air!',
    miniChallenge: 'Can you balance on one foot for 10 seconds like a hovering drone?',
    badge: 'Ace Pilot',
    color: 'from-sky-500 to-indigo-400'
  },
  {
    id: 'drive',
    emoji: '🏎️',
    title: 'Drive',
    actionWord: 'Zoom with High-Speed RC Cars!',
    funFact: 'Our official Charithra RC buggy can reach scale speeds equal to 70 km/h with high-grip all-terrain rubber tires!',
    miniChallenge: 'Hit the Drive button in our RC section below!',
    badge: 'Track Champion',
    color: 'from-orange-500 to-rose-500'
  },
  {
    id: 'create',
    emoji: '💡',
    title: 'Create',
    actionWord: 'Invent Tomorrow’s Gadgets!',
    funFact: 'Every great invention — from smartphones to space rockets — started with a child asking "Why not?" and drawing an idea!',
    miniChallenge: 'What invention would you build? Tell us in our workshop!',
    badge: 'Master Inventor',
    color: 'from-purple-500 to-fuchsia-400'
  }
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Robotics Coding Lab in Action',
    category: 'robotics',
    categoryLabel: 'Robotics',
    description: 'Students programming obstacle-sensing rovers with block code.',
    badge: 'Hardware Lab',
    aspect: 'landscape',
    accentColor: '#F5A623'
  },
  {
    id: 'g-2',
    title: 'Interactive Drone Flight Training',
    category: 'drone',
    categoryLabel: 'Drone Learning',
    description: 'Safe indoor quadcopter hover challenges and aerodynamic testing.',
    badge: 'Flight Cage',
    aspect: 'landscape',
    accentColor: '#0EA5E9'
  },
  {
    id: 'g-3',
    title: 'Remote Car Time-Trial Track',
    category: 'cars',
    categoryLabel: 'RC Cars',
    description: 'Precision racing and steering servo adjustments on the circuit.',
    badge: 'Racing Arena',
    aspect: 'landscape',
    accentColor: '#F97316'
  },
  {
    id: 'g-4',
    title: 'Small-Group Math Problem Solving',
    category: 'classes',
    categoryLabel: 'Academic Classes',
    description: 'Visual geometry and mental math drills with energetic peer teams.',
    badge: 'Maths Lab',
    aspect: 'landscape',
    accentColor: '#3B82F6'
  },
  {
    id: 'g-5',
    title: 'Future Tech Workshop Celebration',
    category: 'workshops',
    categoryLabel: 'Workshops',
    description: 'Young inventors proudly receiving their official achievement certificates.',
    badge: 'Certification',
    aspect: 'landscape',
    accentColor: '#10B981'
  },
  {
    id: 'g-6',
    title: 'Live Online Classroom Interaction',
    category: 'classes',
    categoryLabel: 'Online Classes',
    description: 'Crystal-clear screen sharing, digital quizzes, and instant doubt resolution.',
    badge: 'Digital Campus',
    aspect: 'landscape',
    accentColor: '#8B5CF6'
  },
  {
    id: 'g-7',
    title: 'Hands-on Science Chemistry Fun',
    category: 'activities',
    categoryLabel: 'Activities',
    description: 'Safe colorful density columns and volcano gas bubble reactions.',
    badge: 'Fun Science',
    aspect: 'landscape',
    accentColor: '#EC4899'
  },
  {
    id: 'g-8',
    title: 'Autonomous Rover Competition',
    category: 'robotics',
    categoryLabel: 'Robotics',
    description: 'Line-following bots navigating speed turns without human touch.',
    badge: 'Innovation',
    aspect: 'landscape',
    accentColor: '#F5A623'
  },
  {
    id: 'g-9',
    title: 'Sunday Super Technology Bootcamp',
    category: 'workshops',
    categoryLabel: 'Workshops',
    description: 'Full-day immersive sprint covering Drones, Robotics, and RC Cars.',
    badge: 'Weekend Special',
    aspect: 'landscape',
    accentColor: '#6366F1'
  }
];

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    quote: '“Learning became much more interesting when my child started understanding concepts instead of memorising them. Charithra’s approach completely changed his attitude toward Maths and Science!”',
    parentName: 'Mrs. Priya Ramanathan',
    studentName: 'Aarav (Grade 7)',
    studentGrade: 'Class 7 • CBSE',
    rating: 5,
    highlight: 'Math anxiety transformed to 94% score',
    tag: 'Academics'
  },
  {
    id: 't-2',
    quote: '“The one-day robotics and drone workshop blew our minds! My daughter came home with her eyes shining, explaining how sensors and propellers work. It is nothing like traditional boring tuition.”',
    parentName: 'Mr. Rajesh Kulkarni',
    studentName: 'Ananya (Grade 5)',
    studentGrade: 'Class 5 • ICSE',
    rating: 5,
    highlight: 'Built her first autonomous rover',
    tag: 'Robotics'
  },
  {
    id: 't-3',
    quote: '“The online classes are so well organized. The teacher never ignores any question and the weekly WhatsApp updates give working parents immense peace of mind.”',
    parentName: 'Dr. Sunita Varma',
    studentName: 'Dhruv (Grade 9)',
    studentGrade: 'Class 9 • State Board',
    rating: 5,
    highlight: 'Exceptional 1-on-1 attention',
    tag: 'Academics'
  },
  {
    id: 't-4',
    quote: '“The RC car garage and drone obstacle sessions are pure genius. My boy learned mechanical gears, throttle control, and electronics while having the time of his life.”',
    parentName: 'Mr. Arvind Subramaniam',
    studentName: 'Siddharth (Grade 6)',
    studentGrade: 'Class 6 • Cambridge',
    rating: 5,
    highlight: 'Hands-on physics in action',
    tag: 'Drone'
  }
];

export const WORKSHOP_OPTIONS = [
  {
    id: 'ws-all',
    title: 'All-in-One Future Tech Bootcamp (Recommended)',
    duration: 'Full Day (10:00 AM - 4:30 PM)',
    ageGroup: 'Ages 7 - 15',
    includes: ['Robotics Kit Coding', 'Drone Pilot Training', 'RC Car Racetrack', 'Certificate & Refreshments'],
    popular: true
  },
  {
    id: 'ws-robotics',
    title: 'Robotics & Sensor Building Masterclass',
    duration: '3.5 Hours',
    ageGroup: 'Ages 8 - 16',
    includes: ['Microcontroller Wiring', 'Ultrasonic Sensors', 'Rover Programming', 'Take-home mini badge'],
    popular: false
  },
  {
    id: 'ws-drones',
    title: 'Drone Aerodynamics & Flight Pilot Camp',
    duration: '3 Hours',
    ageGroup: 'Ages 7 - 14',
    includes: ['Flight Physics', 'Indoor Drone Simulator', 'Ring Obstacle Navigation', 'Pilot Badge'],
    popular: false
  },
  {
    id: 'ws-rc',
    title: 'RC Car Engineering & Racing Challenge',
    duration: '3 Hours',
    ageGroup: 'Ages 6 - 13',
    includes: ['Chassis & Suspension Mechanics', 'Gear Ratios', 'Speed Lap Time-Trials', 'Trophy Challenge'],
    popular: false
  }
];
