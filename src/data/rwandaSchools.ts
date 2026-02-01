// Sample seed data for Rwanda schools
export interface School {
  id: string;
  name: string;
  province: string;
  district: string;
  sector: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  schoolType: 'Public' | 'Private';
  educationLevel: 'Primary' | 'Secondary' | 'TVET' | 'Combined';
  verificationStatus: 'Verified' | 'Pending' | 'Unverified' | 'Rejected';
  photoUrl?: string;
  dateAdded: string;
  lastUpdated: string;
  studentCount?: number;
  teacherCount?: number;
  addedBy?: string;
  verifiedBy?: string;
  rejectionReason?: string;
}

export interface VerificationHistory {
  id: string;
  schoolId: string;
  action: 'Created' | 'Updated' | 'Verified' | 'Rejected' | 'StatusChanged';
  previousStatus?: string;
  newStatus?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

// Rwanda provinces and districts
export const rwandaProvinces = [
  'Kigali City',
  'Eastern Province',
  'Western Province',
  'Northern Province',
  'Southern Province',
] as const;

export const rwandaDistricts: Record<string, string[]> = {
  'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
  'Eastern Province': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
  'Western Province': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
  'Northern Province': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
  'Southern Province': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
};

// Sample schools data
export const sampleSchools: School[] = [
  {
    id: 'SCH-001',
    name: 'Groupe Scolaire Officiel de Butare',
    province: 'Southern Province',
    district: 'Huye',
    sector: 'Ngoma',
    coordinates: { lat: -2.5977, lng: 29.7408 },
    schoolType: 'Public',
    educationLevel: 'Combined',
    verificationStatus: 'Verified',
    dateAdded: '2024-01-15',
    lastUpdated: '2024-12-01',
    studentCount: 1250,
    teacherCount: 45,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-002',
    name: 'Lycée de Kigali',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    coordinates: { lat: -1.9403, lng: 30.0628 },
    schoolType: 'Public',
    educationLevel: 'Secondary',
    verificationStatus: 'Verified',
    dateAdded: '2024-01-10',
    lastUpdated: '2024-11-28',
    studentCount: 890,
    teacherCount: 38,
    addedBy: 'mapper_002',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-003',
    name: 'Green Hills Academy',
    province: 'Kigali City',
    district: 'Kicukiro',
    sector: 'Nyarugunga',
    coordinates: { lat: -1.9706, lng: 30.1044 },
    schoolType: 'Private',
    educationLevel: 'Combined',
    verificationStatus: 'Verified',
    dateAdded: '2024-02-05',
    lastUpdated: '2024-11-20',
    studentCount: 650,
    teacherCount: 52,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_002',
  },
  {
    id: 'SCH-004',
    name: 'EP Kacyiru Primary',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Kacyiru',
    coordinates: { lat: -1.9356, lng: 30.0715 },
    schoolType: 'Public',
    educationLevel: 'Primary',
    verificationStatus: 'Pending',
    dateAdded: '2024-10-12',
    lastUpdated: '2024-10-12',
    studentCount: 420,
    teacherCount: 18,
    addedBy: 'mapper_003',
  },
  {
    id: 'SCH-005',
    name: 'Collège Saint André',
    province: 'Eastern Province',
    district: 'Rwamagana',
    sector: 'Muhazi',
    coordinates: { lat: -1.9489, lng: 30.4347 },
    schoolType: 'Private',
    educationLevel: 'Secondary',
    verificationStatus: 'Verified',
    dateAdded: '2024-03-20',
    lastUpdated: '2024-09-15',
    studentCount: 380,
    teacherCount: 24,
    addedBy: 'mapper_002',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-006',
    name: 'IPRC Musanze',
    province: 'Northern Province',
    district: 'Musanze',
    sector: 'Muhoza',
    coordinates: { lat: -1.4997, lng: 29.6346 },
    schoolType: 'Public',
    educationLevel: 'TVET',
    verificationStatus: 'Verified',
    dateAdded: '2024-02-28',
    lastUpdated: '2024-08-10',
    studentCount: 1800,
    teacherCount: 85,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_002',
  },
  {
    id: 'SCH-007',
    name: 'Nyanza Primary School',
    province: 'Southern Province',
    district: 'Nyanza',
    sector: 'Busasamana',
    coordinates: { lat: -2.3522, lng: 29.7500 },
    schoolType: 'Public',
    educationLevel: 'Primary',
    verificationStatus: 'Unverified',
    dateAdded: '2024-11-05',
    lastUpdated: '2024-11-05',
    studentCount: 280,
    teacherCount: 12,
    addedBy: 'mapper_004',
  },
  {
    id: 'SCH-008',
    name: 'Gisenyi Secondary School',
    province: 'Western Province',
    district: 'Rubavu',
    sector: 'Gisenyi',
    coordinates: { lat: -1.6765, lng: 29.2567 },
    schoolType: 'Public',
    educationLevel: 'Secondary',
    verificationStatus: 'Pending',
    dateAdded: '2024-09-18',
    lastUpdated: '2024-10-02',
    studentCount: 520,
    teacherCount: 28,
    addedBy: 'mapper_002',
  },
  {
    id: 'SCH-009',
    name: 'Ecole des Sciences de Musanze',
    province: 'Northern Province',
    district: 'Musanze',
    sector: 'Muhoza',
    coordinates: { lat: -1.5012, lng: 29.6298 },
    schoolType: 'Public',
    educationLevel: 'Secondary',
    verificationStatus: 'Verified',
    dateAdded: '2024-04-10',
    lastUpdated: '2024-07-22',
    studentCount: 680,
    teacherCount: 35,
    addedBy: 'mapper_003',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-010',
    name: 'Kayonza TVET School',
    province: 'Eastern Province',
    district: 'Kayonza',
    sector: 'Mukarange',
    coordinates: { lat: -1.8556, lng: 30.6589 },
    schoolType: 'Public',
    educationLevel: 'TVET',
    verificationStatus: 'Rejected',
    dateAdded: '2024-08-15',
    lastUpdated: '2024-09-20',
    studentCount: 0,
    teacherCount: 0,
    addedBy: 'mapper_004',
    rejectionReason: 'School location not found at specified coordinates. Building appears to be residential.',
  },
  {
    id: 'SCH-011',
    name: 'Kimisagara Primary',
    province: 'Kigali City',
    district: 'Nyarugenge',
    sector: 'Kimisagara',
    coordinates: { lat: -1.9589, lng: 30.0423 },
    schoolType: 'Public',
    educationLevel: 'Primary',
    verificationStatus: 'Verified',
    dateAdded: '2024-05-08',
    lastUpdated: '2024-06-15',
    studentCount: 590,
    teacherCount: 22,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_002',
  },
  {
    id: 'SCH-012',
    name: 'Riviera High School',
    province: 'Kigali City',
    district: 'Gasabo',
    sector: 'Remera',
    coordinates: { lat: -1.9512, lng: 30.1089 },
    schoolType: 'Private',
    educationLevel: 'Secondary',
    verificationStatus: 'Pending',
    dateAdded: '2024-10-25',
    lastUpdated: '2024-10-25',
    studentCount: 320,
    teacherCount: 25,
    addedBy: 'mapper_005',
  },
  {
    id: 'SCH-013',
    name: 'Burera Primary School',
    province: 'Northern Province',
    district: 'Burera',
    sector: 'Cyanika',
    coordinates: { lat: -1.4234, lng: 29.8012 },
    schoolType: 'Public',
    educationLevel: 'Primary',
    verificationStatus: 'Unverified',
    dateAdded: '2024-11-10',
    lastUpdated: '2024-11-10',
    studentCount: 180,
    teacherCount: 8,
    addedBy: 'mapper_003',
  },
  {
    id: 'SCH-014',
    name: 'Muhanga Technical School',
    province: 'Southern Province',
    district: 'Muhanga',
    sector: 'Nyamabuye',
    coordinates: { lat: -2.0845, lng: 29.7512 },
    schoolType: 'Public',
    educationLevel: 'TVET',
    verificationStatus: 'Verified',
    dateAdded: '2024-06-20',
    lastUpdated: '2024-08-05',
    studentCount: 720,
    teacherCount: 42,
    addedBy: 'mapper_002',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-015',
    name: 'Rusizi International',
    province: 'Western Province',
    district: 'Rusizi',
    sector: 'Kamembe',
    coordinates: { lat: -2.4789, lng: 28.9078 },
    schoolType: 'Private',
    educationLevel: 'Combined',
    verificationStatus: 'Verified',
    dateAdded: '2024-07-12',
    lastUpdated: '2024-09-28',
    studentCount: 410,
    teacherCount: 30,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_002',
  },
  {
    id: 'SCH-016',
    name: 'Gicumbi Secondary',
    province: 'Northern Province',
    district: 'Gicumbi',
    sector: 'Byumba',
    coordinates: { lat: -1.5756, lng: 30.0678 },
    schoolType: 'Public',
    educationLevel: 'Secondary',
    verificationStatus: 'Unverified',
    dateAdded: '2024-11-15',
    lastUpdated: '2024-11-15',
    studentCount: 450,
    teacherCount: 20,
    addedBy: 'mapper_004',
  },
  {
    id: 'SCH-017',
    name: 'Nyagatare Primary School',
    province: 'Eastern Province',
    district: 'Nyagatare',
    sector: 'Nyagatare',
    coordinates: { lat: -1.2989, lng: 30.3267 },
    schoolType: 'Public',
    educationLevel: 'Primary',
    verificationStatus: 'Pending',
    dateAdded: '2024-10-05',
    lastUpdated: '2024-10-18',
    studentCount: 380,
    teacherCount: 15,
    addedBy: 'mapper_005',
  },
  {
    id: 'SCH-018',
    name: 'Karongi Girls Secondary',
    province: 'Western Province',
    district: 'Karongi',
    sector: 'Rubengera',
    coordinates: { lat: -2.0789, lng: 29.3745 },
    schoolType: 'Public',
    educationLevel: 'Secondary',
    verificationStatus: 'Verified',
    dateAdded: '2024-04-25',
    lastUpdated: '2024-07-10',
    studentCount: 540,
    teacherCount: 28,
    addedBy: 'mapper_002',
    verifiedBy: 'validator_001',
  },
  {
    id: 'SCH-019',
    name: 'Kicukiro College of Technology',
    province: 'Kigali City',
    district: 'Kicukiro',
    sector: 'Gikondo',
    coordinates: { lat: -1.9823, lng: 30.0745 },
    schoolType: 'Public',
    educationLevel: 'TVET',
    verificationStatus: 'Verified',
    dateAdded: '2024-03-15',
    lastUpdated: '2024-06-20',
    studentCount: 950,
    teacherCount: 55,
    addedBy: 'mapper_001',
    verifiedBy: 'validator_002',
  },
  {
    id: 'SCH-020',
    name: 'Ngoma District School',
    province: 'Eastern Province',
    district: 'Ngoma',
    sector: 'Kibungo',
    coordinates: { lat: -2.1567, lng: 30.5234 },
    schoolType: 'Public',
    educationLevel: 'Combined',
    verificationStatus: 'Pending',
    dateAdded: '2024-09-28',
    lastUpdated: '2024-10-08',
    studentCount: 620,
    teacherCount: 32,
    addedBy: 'mapper_003',
  },
];

// Sample verification history
export const sampleVerificationHistory: VerificationHistory[] = [
  {
    id: 'VH-001',
    schoolId: 'SCH-001',
    action: 'Created',
    performedBy: 'mapper_001',
    timestamp: '2024-01-15T10:30:00Z',
    notes: 'Initial school entry from OSM data',
  },
  {
    id: 'VH-002',
    schoolId: 'SCH-001',
    action: 'Verified',
    previousStatus: 'Unverified',
    newStatus: 'Verified',
    performedBy: 'validator_001',
    timestamp: '2024-01-20T14:15:00Z',
    notes: 'Field validation completed. GPS coordinates confirmed.',
  },
  {
    id: 'VH-003',
    schoolId: 'SCH-010',
    action: 'Rejected',
    previousStatus: 'Pending',
    newStatus: 'Rejected',
    performedBy: 'validator_002',
    timestamp: '2024-09-20T09:45:00Z',
    notes: 'School location not found at specified coordinates.',
  },
];

// Statistics helpers
export const getSchoolStats = (schools: School[]) => {
  const total = schools.length;
  const verified = schools.filter(s => s.verificationStatus === 'Verified').length;
  const pending = schools.filter(s => s.verificationStatus === 'Pending').length;
  const unverified = schools.filter(s => s.verificationStatus === 'Unverified').length;
  const rejected = schools.filter(s => s.verificationStatus === 'Rejected').length;
  
  const publicSchools = schools.filter(s => s.schoolType === 'Public').length;
  const privateSchools = schools.filter(s => s.schoolType === 'Private').length;

  const byDistrict = schools.reduce((acc, school) => {
    acc[school.district] = (acc[school.district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byProvince = schools.reduce((acc, school) => {
    acc[school.province] = (acc[school.province] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byEducationLevel = schools.reduce((acc, school) => {
    acc[school.educationLevel] = (acc[school.educationLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total,
    verified,
    pending,
    unverified,
    rejected,
    verificationRate: total > 0 ? Math.round((verified / total) * 100) : 0,
    publicSchools,
    privateSchools,
    byDistrict,
    byProvince,
    byEducationLevel,
  };
};
