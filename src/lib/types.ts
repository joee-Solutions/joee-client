export interface Organization {
    id: number;
    name: string;
    location: string;
    status: 'Active' | 'Inactive';
    image: string;
  }
  
  export interface Employee {
    id: number;
    name: string;
    role: string;
    organization: string;
    description?: string;
    image: string;
  }
  
  export interface Patient {
    id: number;
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    condition: string;
    organization: string;
  }
  
  export interface AgeGroup {
    range: string;
    percentage: number;
    color: string;
  }
  
  export interface AppointmentData {
    day: string;
    male: number;
    female: number;
  }
  
  export interface StatData {
    count: number;
    growth: number | null;
  }