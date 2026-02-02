export const appointmentsData = {
    clinic: 'Raven Heights Clinic',
    weeklyGrowth: 5.45,
    appointmentsByDay: [
      { day: 'Mon', male: 20, female: 15 },
      { day: 'Tue', male: 35, female: 25 },
      { day: 'Wed', male: 60, female: 40 },
      { day: 'Thu', male: 45, female: 30 },
      { day: 'Fri', male: 20, female: 10 },
      { day: 'Sat', male: 50, female: 30 },
      { day: 'Sun', male: 40, female: 25 },
    ],
  };
  
  export const patientData = {
    totalPatients: 1980,
    ageDistribution: [
      { range: 'Below 30 years', percentage: 50, color: '#0A3161' },
      { range: '30-49 years', percentage: 25, color: '#E63946' },
      { range: '50-69 years', percentage: 15, color: '#FFD700' },
      { range: 'Above 70 years', percentage: 10, color: '#D3D3D3' },
    ],
  };
  
  export const employees = [
    {
      id: 1,
      name: 'Denise Hampton',
      role: 'Doctor',
      organization: 'Orlando Medical Center',
      description: 'Lorem ipsum dolor sit amet consectetur. Cursus nec amet ipsum a. Faucibus volutpat quis cras aliquam a sed.',
      image: '/assets/images/employeeprofile.png',
    },
    {
      id: 2,
      name: 'Jenifer Gloria',
      role: 'Nurse',
      organization: 'Bridgeton Clinic',
      image: '/assets/images/profilepic.png',
    },
    {
      id: 3,
      name: 'Cole Joshua',
      role: 'Doctor',
      organization: 'Raven Heights Clinic',
      image: '/assets/images/profilepic.png',
    },
  ];
  
  export const organizations = [
    { id: 1, name: 'JON-KEN Hospital', location: 'Lagos, Nigeria', status: 'Active', image: '/assets/images/profilepic.png' },
    { id: 2, name: 'Raven Heights Clinic', location: 'Abuja, Nigeria', status: 'Active', image: '/assets/images/profilepic.png' },
    { id: 3, name: 'Bridgeton Clinic', location: 'Abuja, Nigeria', status: 'Inactive', image: '/assets/images/profilepic.png' },
    { id: 4, name: 'John Hopkins Clinic', location: 'Abuja, Nigeria', status: 'Inactive', image: '/assets/images/profilepic.png' },
  ];
  
  export const organizationStats = {
    totalCount: 490,
    activeCount: 250,
    inactiveCount: 100,
    completionPercentage: 99,
  };
  
  export const colors = {
    active: "#003465",
    inactive: "#FAD900",
  };

  export const departmentsStats = {
    totalCount: 35,
    activeCount: 30,
    inactiveCount: 5,
    completionPercentage: 99,
  };