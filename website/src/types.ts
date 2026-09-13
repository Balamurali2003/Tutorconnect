export interface SubjectItem {
  id: string;
  name: string;
  category: 'core' | 'support';
  icon: string;
  accentColor: string;
  bgGradient: string;
  description: string;
  highlights: string[];
  animationType: 'math' | 'atom' | 'letters' | 'globe' | 'pencil' | 'sparkle';
}

export interface FutureSkillItem {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  colorHex: string;
  highlights: string[];
  equipment: string[];
}

export interface TimelineStepItem {
  id: string;
  timeSlot: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  mascotRole: 'girl' | 'boy' | 'both';
}

export interface ParentPillarItem {
  id: string;
  title: string;
  shortDesc: string;
  details: string;
  icon: string;
  stat: string;
}

export interface ChildDiscoveryItem {
  id: string;
  emoji: string;
  title: string;
  actionWord: string;
  funFact: string;
  miniChallenge: string;
  badge: string;
  color: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'classes' | 'activities' | 'robotics' | 'drone' | 'cars' | 'workshops';
  categoryLabel: string;
  description: string;
  badge: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  accentColor: string;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  parentName: string;
  studentName: string;
  studentGrade: string;
  rating: number;
  highlight: string;
  tag: 'Academics' | 'Robotics' | 'Drone' | 'Workshops';
}
