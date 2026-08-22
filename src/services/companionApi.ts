import { CompanionProfile, PetType, PetPersonality, PetTheme } from '../config/petConfig';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : (import.meta.env.PROD ? '' : 'http://localhost:8000');

async function fetchJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export async function getCompanionProfile(): Promise<CompanionProfile> {
  return fetchJson<CompanionProfile>('/api/companion/profile');
}

export async function updateCompanionProfile(data: {
  pet_type?: PetType;
  pet_name?: string;
  personality?: PetPersonality;
  theme?: PetTheme;
  accessories?: string[];
  onboarding_done?: boolean;
}): Promise<CompanionProfile> {
  return fetchJson<CompanionProfile>('/api/companion/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
