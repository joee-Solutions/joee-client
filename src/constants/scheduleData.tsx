import { Schedule, TableRow } from '../types/schedule';

export const SAMPLE_SCHEDULES: Schedule[] = [
  {
    id: '1',
    code: 'DH',
    name: 'Denise Hampton',
    role: 'Doctor',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active'
  },
  {
    id: '2',
    code: 'SD',
    name: 'Susan Denilson',
    role: 'Lab Attendant',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active'
  },
  {
    id: '3',
    code: 'CJ',
    name: 'Cole Joshua',
    role: 'Doctor',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active'
  },
  {
    id: '4',
    code: 'JG',
    name: 'Jenifer Gloria',
    role: 'Nurse',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active'
  }
];

export const SAMPLE_TABLE_DATA: TableRow[] = [
  { id: 1, name: 'Jeremy White', department: 'Oncology', date: '20 Dec 2023', startTime: '11:00am', endTime: '12:00am' },
  { id: 2, name: 'Gary Campbell', department: 'Neurology', date: '18 Dec 2023', startTime: '11:00am', endTime: '12:00pm' },
  { id: 3, name: 'Richard Bills', department: 'Orthopedics', date: '14 Dec 2023', startTime: '11:00am', endTime: '12:00pm' },
  { id: 4, name: 'Carol Tynese', department: 'Gynaecology', date: '13 Dec 2023', startTime: '11:00am', endTime: '12:00pm' },
  { id: 5, name: 'Dare Adeleke', department: 'Cardiology', date: '9 Dec 2023', startTime: '11:00am', endTime: '12:00pm' },
  { id: 6, name: 'Rose Hilary', department: 'Nephrology', date: '29 Nov 2023', startTime: '11:00am', endTime: '12:00pm' }
];

export const ROLE_COLORS = {
  Doctor: 'text-red-600',
  Nurse: 'text-yellow-600',
  'Lab Attendant': 'text-green-600'
} as const;