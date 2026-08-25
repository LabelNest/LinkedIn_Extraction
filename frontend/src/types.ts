export interface LocationData {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  raw?: string | null;
}

export interface PositionData {
  company_name?: string | null;
  company?: string | null;
  position?: string | null;
  title?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  description?: string | null;
  location?: string | LocationData | null;
  employment_type?: string | null;
}

export interface EducationData {
  degree?: string | null;
  school_name?: string | null;
  school?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  grade?: string | null;
  activities?: string | null;
}

export interface CertificationData {
  title?: string | null;
  name?: string | null;
  issued_at?: string | null;
  issued_date?: string | null;
  issued_by?: string | null;
  authority?: string | null;
  url?: string | null;
  credential_id?: string | null;
}

export interface PersonData {
  full_name?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  linkedin_url?: string | null;
  headline?: string | null;
  about?: string | null;
  summary?: string | null;
  profile_picture?: string | null;
  location?: LocationData | string | null;
  current_positions?: PositionData[];
  historical_positions?: PositionData[];
  past_positions?: PositionData[];
  positions?: PositionData[];
  education?: EducationData[];
  skills?: string[] | { name?: string; category?: string }[];
  certifications?: CertificationData[];
  languages?: string[];
  contact_info?: Record<string, any> | null;
  [key: string]: any;
}

export interface CompanyData {
  name?: string | null;
  company_name?: string | null;
  linkedin_url?: string | null;
  tagline?: string | null;
  description?: string | null;
  about?: string | null;
  industry?: string | null;
  company_size?: string | null;
  staff_count?: number | string | null;
  headquarters?: LocationData | string | null;
  location?: LocationData | string | null;
  website?: string | null;
  website_url?: string | null;
  founded?: string | number | null;
  specialties?: string[] | string | null;
  logo_url?: string | null;
  type?: string | null;
  [key: string]: any;
}

export interface EmployeeData {
  name?: string | null;
  full_name?: string | null;
  title?: string | null;
  headline?: string | null;
  linkedin_url?: string | null;
  department?: string | null;
  location?: string | LocationData | null;
  profile_picture?: string | null;
  [key: string]: any;
}

export interface EnrichmentResultItem {
  url?: string;
  canonical_url?: string;
  type?: 'person' | 'company' | string;
  status?: 'success' | 'failed' | 'error' | string;
  error?: string | null;
  data?: {
    person?: PersonData | null;
    company?: CompanyData | null;
    employees?: EmployeeData[] | Record<string, any> | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface EnrichmentApiResponse {
  status: string;
  count?: number;
  results?: EnrichmentResultItem[];
  error?: string;
  detail?: string;
  [key: string]: any;
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  url: string;
  type: string;
  status: string;
  targetName: string;
  response: EnrichmentResultItem;
}

export type BackendConnectionStatus = 'connected' | 'disconnected' | 'checking' | 'custom_url';
