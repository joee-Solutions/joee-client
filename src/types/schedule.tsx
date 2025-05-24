export interface Schedule {
    id: string;
    code: string;
    name: string;
    role: 'Doctor' | 'Nurse' | 'Lab Attendant';
    color: string;
    textColor: string;
    borderColor: string;
    image: string;
    description: string;
    status: 'Active' | 'Inactive';
  }
  
  export interface TableRow {
    id: number;
    name: string;
    department: string;
    date: string;
    startTime: string;
    endTime: string;
  }
  
  export interface ScheduleFormData {
    name: string;
    role: 'Doctor' | 'Nurse' | 'Lab Attendant';
    department: string;
    startTime: string;
    endTime: string;
    date: string;
  }