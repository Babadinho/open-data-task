export interface WebIDProfile {
  webid: string;
  name?: string;
  image?: string;
  email?: string;
  phone?: string;
  homepage?: string;
  storage?: string[];
  friends?: string[];
  knows?: string[];
  organization?: string;
  role?: string;
  location?: string;
  bio?: string;
}

export interface Contact {
  type: 'email' | 'phone' | 'homepage' | 'other';
  value: string;
  label?: string;
}

export interface ParsedProfile {
  webid: string;
  name?: string;
  image?: string;
  contacts: Contact[];
  friends: string[];
  storage: string[];
  additionalInfo: Record<string, string>;
}

export interface WebIDError {
  message: string;
  type: 'network' | 'parse' | 'not-found' | 'invalid-webid';
}
