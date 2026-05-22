// Design tokens — Option C: Terracotta + Warm Indigo
// Single source of truth for all colors, spacing, typography

export const Colors = {
  terra: {
    DEFAULT: '#D97B66',
    light: '#F2C4B8',
    dim: '#3D2420',
  },
  indigo: {
    DEFAULT: '#6B5EA8',
    light: '#A89FCC',
    dim: '#1E1B38',
  },
  amber: {
    DEFAULT: '#F0A832',
    light: '#F9DFA0',
    dim: '#2C2010',
  },
  lavender: '#A89FCC',

  light: {
    bg: '#FAF8FC',
    surf: '#FFFFFF',
    surf2: '#F2F0F7',
    text: '#1A1720',
    text2: '#6B6880',
    text3: '#A8A5B8',
    border: '#E8E4F0',
  },
  dark: {
    bg: '#16141E',
    surf: '#1E1C28',
    surf2: '#252334',
    text: '#F0EDF8',
    text2: '#8A87A0',
    text3: '#3E3C50',
    border: '#2A2838',
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  h1: { fontSize: 24, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '600' as const },
  h3: { fontSize: 16, fontWeight: '600' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '400' as const },
  tiny: { fontSize: 10, fontWeight: '400' as const },
  mono: { fontSize: 13, fontFamily: 'SpaceMono_400Regular' },
} as const;

// Role options for the role selector
export const ROLES = [
  // 🧑‍💻 Engineering & Tech
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Mobile App Developer',
  'Data Scientist',
  'Data Analyst',
  'Data Engineer',
  'Machine Learning Engineer',
  'AI Engineer',
  'DevOps Engineer',
  'Cloud Engineer',
  'Site Reliability Engineer',
  'Cybersecurity Engineer',
  'QA Engineer',
  'Automation Test Engineer',
  'Solutions Architect',
  'System Engineer',

  // 📦 Product & Design
  'Product Manager',
  'Associate Product Manager',
  'Product Owner',
  'Product Designer',
  'UX Designer',
  'UI Designer',
  'UX Researcher',
  'Design Lead',

  // 📊 Business & Operations
  'Business Analyst',
  'Operations Manager',
  'Strategy Manager',
  'Program Manager',
  'Project Manager',
  'Scrum Master',
  'Process Manager',

  // 📣 Marketing & Growth
  'Marketing Manager',
  'Digital Marketing Specialist',
  'Growth Manager',
  'SEO Specialist',
  'Performance Marketing Manager',
  'Brand Manager',
  'Content Marketing Manager',
  'Social Media Manager',

  // 💰 Sales & Revenue
  'Sales Executive',
  'Account Executive',
  'Account Manager',
  'Business Development Manager',
  'Sales Manager',
  'Enterprise Sales Manager',
  'Pre-Sales Consultant',

  // 🤝 Customer Success & Support
  'Customer Success Manager',
  'Customer Support Specialist',
  'Technical Support Engineer',
  'Client Relationship Manager',
  'Support Lead',

  // 🏢 Founding Team / Leadership
  'Founder',
  'Co-Founder',
  'Chief Executive Officer (CEO)',
  'Chief Technology Officer (CTO)',
  'Chief Product Officer (CPO)',
  'Chief Marketing Officer (CMO)',
  'Chief Operating Officer (COO)',
  'VP Engineering',
  'VP Product',
  'Director of Engineering',
  'Director of Product',

  // ⚖️ Compliance / Legal / Finance
  'Compliance Officer',
  'Legal Counsel',
  'Risk Analyst',
  'Financial Analyst',
  'Accountant',
  'Audit Manager',
  'Tax Consultant',

  // ✍️ Content & Creative
  'Content Writer',
  'Copywriter',
  'Technical Writer',
  'Content Strategist',
  'Editor',
  'Video Content Creator',
  'Creative Director',
] as const;;

export const SENIORITY_LEVELS = [
  'Junior',
  'Mid',
  'Senior',
  'Lead',
  'Principal',
] as const;

export const QUESTION_TYPES = [
  'mixed',
  'behavioural',
  'technical',
  'situational',
] as const;
