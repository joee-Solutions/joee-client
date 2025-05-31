import orgPlaceholder from "./../../../../public/assets/orgPlaceholder.png";
import { StaticImageData } from "next/image";

export const AllOrgTableData: {
  id: number;
  organization: {
    name: string;
    image: StaticImageData;
  };
  created_at: string;
  location: string;
  status: string;
}[] = [
  {
    id: 1,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 2,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Inactive",
  },
  {
    id: 3,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 4,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 5,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Inactive",
  },
  {
    id: 6,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 7,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 8,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
  {
    id: 9,
    organization: {
      name: "JON-KEN Hospital",
      image: orgPlaceholder,
    },
    created_at: "20 Jan 2024",
    location: "Lagos",
    status: "Active",
  },
];

export const DepartmentList: {
  id: number;
  department: {
    department_name: string;
  };
  no_of_empployees: number;
  date_created: string;
  status: string;
}[] = [
  {
    id: 1,
    department: {
      department_name: "Opthamology",
    },
    no_of_empployees: 30,
    date_created: "20 Jan 2024",
    status: "Active",
  },
  {
    id: 2,
    department: {
      department_name: "Nephrology",
    },
    no_of_empployees: 24,
    date_created: "20 Jan 2024",
    status: "Inactive",
  },
  {
    id: 3,
    department: {
      department_name: "Oncology",
    },
    no_of_empployees: 38,
    date_created: "20 Jan 2024",
    status: "Active",
  },
  {
    id: 4,
    department: {
      department_name: "Neurology",
    },
    no_of_empployees: 32,
    date_created: "20 Jan 2024",
    status: "Active",
  },
  {
    id: 5,
    department: {
      department_name: "Jorthopedics",
    },
    no_of_empployees: 36,
    date_created: "20 Jan 2024",
    status: "Inactive",
  },
  {
    id: 6,
    department: {
      department_name: "Dentistary",
    },
    no_of_empployees: 46,
    date_created: "20 Jan 2024",
    status: "Active",
  },
];

export const EmployeesData: {
  id: number;
  employee: {
    employee_name: string;
    image: StaticImageData;
  };
  department: string;
  designation: string;
  status: string;
}[] = [
  {
    id: 1,
    employee: {
      employee_name: "Isaac Chicago",
      image: orgPlaceholder,
    },
    department: "Opthamology",
    designation: "Doctor",
    status: "Active",
  },
  {
    id: 2,
    employee: {
      employee_name: " Oluwatobi Ayo",
      image: orgPlaceholder,
    },
    department: "Nephrology",
    designation: "Nurse",
    status: "Inactive",
  },
  {
    id: 3,
    employee: {
      employee_name: "Umaru Newton",
      image: orgPlaceholder,
    },
    department: "Oncology",
    designation: "Doctor",
    status: "Active",
  },
  {
    id: 4,
    employee: {
      employee_name: "Jenifer Gloria",
      image: orgPlaceholder,
    },
    department: "Neurology",
    designation: "Nurse",
    status: "Active",
  },
  {
    id: 5,
    employee: {
      employee_name: "Jemimah Oluwaseun",
      image: orgPlaceholder,
    },
    department: "Orthopedics",
    designation: "Doctor",
    status: "Inactive",
  },
  {
    id: 6,
    employee: {
      employee_name: "Cole Joshua",
      image: orgPlaceholder,
    },
    department: "Dentistary",
    designation: "Doctor",
    status: "Active",
  },
];

export const PatientData: {
  id: number;
  patience: {
    name: string;
    image: StaticImageData;
  };
  address: string;
  gender: string;
  age: number;
  phone: string;
  email: string;
  status: string;
}[] = [
  {
    id: 1,
    patience: {
      name: "Jenifa Chicago",
      image: orgPlaceholder,
    },
    address: "Los Angeles, U.S.A",
    gender: "Female",
    age: 43,
    phone: "(218) 661 8316",
    email: "jenifahudson@gmail.com",
    status: "Active",
  },
  {
    id: 2,
    patience: {
      name: " David  Ayo",
      image: orgPlaceholder,
    },
    address: "Lagos, Nigeria ",
    gender: "Male",
    age: 52,
    phone: "(797) 506 1265",
    email: "davidbanks@yahoo,com",
    status: "Inactive",
  },
  {
    id: 3,
    patience: {
      name: "Haruna Newton",
      image: orgPlaceholder,
    },
    address: "Lagos, Nigeria ",
    gender: "Male",
    age: 49,
    phone: "(380) 141 1885",
    email: "Harunajamal@yahoo.com",
    status: "Active",
  },
  {
    id: 4,
    patience: {
      name: "Mariam  Gloria",
      image: orgPlaceholder,
    },
    address: "Lagos, Nigeria ",
    gender: "Female",
    age: 71,
    phone: "(680) 432 2662",
    email: "mariamliam@gmail.com",
    status: "Active",
  },
  {
    id: 5,
    patience: {
      name: " Timon Oluwaseun",
      image: orgPlaceholder,
    },
    address: "Lagos, Nigeria ",
    gender: "Male",
    age: 38,
    phone: "(981) 756 6128",
    email: "timon_pumba@gmail.com",
    status: "Inactive",
  },
  {
    id: 6,
    patience: {
      name: "Tobiah Joshua",
      image: orgPlaceholder,
    },
    address: "Lagos, Nigeria ",
    gender: "Male",
    age: 49,
    phone: "(680) 432 2662",
    email: "tobiah4everyone@gmail.com",
    status: "Active",
  },
];
export const AdminListData: {
  ID: string;
  name: string;
  role: string;
  address: string;
  phoneNumber: string;
  email: string;
}[] = [
  {
    ID: "ADM001",
    name: "Richard Adebayo",
    role: "Super Admin",
    address: "23 Marine Drive, Lagos Island, Lagos",
    phoneNumber: "08012345678",
    email: "richard.adebayo@company.com",
  },
  {
    ID: "ADM002",
    name: "Chioma Okafor",
    role: "HR Manager",
    address: "5 Ikorodu Road, Ojota, Lagos",
    phoneNumber: "08087654321",
    email: "chioma.okafor@company.com",
  },
  {
    ID: "ADM003",
    name: "Tunde Balogun",
    role: "Finance Admin",
    address: "18 Bourdillon Road, Ikoyi, Lagos",
    phoneNumber: "07023456789",
    email: "tunde.balogun@company.com",
  },
  {
    ID: "ADM004",
    name: "Maryam Sule",
    role: "Operations Lead",
    address: "45 Ahmadu Bello Way, Kaduna",
    phoneNumber: "09034567890",
    email: "maryam.sule@company.com",
  },
  {
    ID: "ADM005",
    name: "John Uche",
    role: "IT Admin",
    address: "12 Trans Amadi Layout, Port Harcourt",
    phoneNumber: "08123456789",
    email: "john.uche@company.com",
  },
];

export const AppointmentData: {
  ID: string;
  appointment: {
    patient_name: string;
    image: StaticImageData;
  };
  age: number;
  doctor_name: string;
  department: string;
  date: string;
  time: string;
}[] = [
  {
    ID: "JOE101",
    appointment: {
      patient_name: "Jenifa ",
      image: orgPlaceholder,
    },
    age: 43,
    doctor_name: "Daniel James",
    department: "Nephrology",
    date: "11 Dec 2022",
    time: "10am-12am",
  },
  {
    ID: "JOE102",
    appointment: {
      patient_name: " David  ",
      image: orgPlaceholder,
    },
    age: 52,
    doctor_name: "Kishane Josh",
    department: "Cardiology",
    date: "15 Dec 2022",
    time: "10am-12am",
  },
  {
    ID: "JOE103",
    appointment: {
      patient_name: " Newton",
      image: orgPlaceholder,
    },
    age: 49,
    doctor_name: "Aminu Umar ",
    department: "Oncology",
    date: "13 Dec 2022",
    time: "10am-12am",
  },
  {
    ID: "JOE104",
    appointment: {
      patient_name: "  Gloria",
      image: orgPlaceholder,
    },
    age: 71,
    doctor_name: "Jimmy Carl ",
    department: "Neurology",
    date: "9 Dec 2022",
    time: "10am-12am",
  },
  {
    ID: "JOE105",
    appointment: {
      patient_name: "  Oluwaseun",
      image: orgPlaceholder,
    },
    age: 38,
    doctor_name: "Jamie York ",
    department: "Orthopedics",
    date: "5 Dec 2022",
    time: "10am-12am",
  },
  {
    ID: "JOE106",
    appointment: {
      patient_name: " Joshua",
      image: orgPlaceholder,
    },
    age: 49,
    doctor_name: "Palmer David ",
    department: "Gynaecology",
    date: "2 Dec 2022",
    time: "10am-12am",
  },
];

export const ScheduleData: {
  id: number;
  schedule: {
    doctor_name: string;
  };
  department: string;
  day: string;
  start_time: string;
  end_time: string;
}[] = [
  {
    id: 1,
    schedule: {
      doctor_name: "Jeremy White",
    },
    department: "Oncology",
    day: "20 Dec 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
  {
    id: 2,
    schedule: {
      doctor_name: "Gary Campbell",
    },
    department: "Neurology",
    day: "18 Dec 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
  {
    id: 3,
    schedule: {
      doctor_name: "Richard Bills",
    },
    department: "Orthopedics",
    day: "14 Dec 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
  {
    id: 4,
    schedule: {
      doctor_name: "Carol Tynese",
    },
    department: "Gynaecology",
    day: "13 Dec 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
  {
    id: 5,
    schedule: {
      doctor_name: "Dare Adeleke",
    },
    department: "Cardiology",
    day: "9 Dec 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
  {
    id: 6,
    schedule: {
      doctor_name: "Rose Hilary",
    },
    department: "Nephrology",
    day: "29 Nov 2023",
    start_time: "11:00am",
    end_time: "12:00pm",
  },
];
