'use client';

import { useState, useEffect } from 'react';
import DepartmentCarousel from '@/components/Org/Departments/DepartmentCarousel';
<<<<<<< HEAD
import DepartmentList from '@/components/Org/Departments/DepartmentList';
import AddDepartmentForm from '@/components/Org/Departments/AddDepartmentForm';
=======
// import DepartmentList from '@/components/Org/Departments/DepartmentList';
import AddDepartmentForm from '@/components/Org/Departments/AddDepartmentForm';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/table/pagination';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ListView } from '@/components/shared/table/DataTableFilter';

>>>>>>> 80695ed (schedule and department)

interface Department {
  id: string;
  code: string;
  name: string;
  color: string;
  textColor: string;
  borderColor: string;
  employeeCount: number;
  dateCreated: string;
  status: 'Active' | 'Inactive';
  image: string;
}

// Sample department data - replace with your actual data source
const initialDepartments: Department[] = [
  {
<<<<<<< HEAD
    id: 'opthamology',
=======
    id: '1',
>>>>>>> 80695ed (schedule and department)
    code: 'OP',
    name: 'Opthamology',
    color: 'bg-blue-800',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-800',
    employeeCount: 30,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/opthamology.jpg',
  },
  {
<<<<<<< HEAD
    id: 'neurology',
=======
    id: '2',
>>>>>>> 80695ed (schedule and department)
    code: 'NE',
    name: 'Neurology',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    employeeCount: 32,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/neurology.jpg',
  },
  {
<<<<<<< HEAD
    id: 'oncology',
=======
    id: '3',
>>>>>>> 80695ed (schedule and department)
    code: 'ON',
    name: 'Oncology',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    employeeCount: 38,
    dateCreated: '20 Jan 2024',
    status: 'Inactive',
    image: '/images/oncology.jpg',
  },
  {
<<<<<<< HEAD
    id: 'radiology',
=======
    id: '4',
>>>>>>> 80695ed (schedule and department)
    code: 'RA',
    name: 'Radiology',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    employeeCount: 36,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/radiology.jpg',
  },
  {
<<<<<<< HEAD
    id: 'nephrology',
=======
    id: '5',
>>>>>>> 80695ed (schedule and department)
    code: 'NP',
    name: 'Nephrology',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-600',
    employeeCount: 24,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/nephrology.jpg',
  },
  {
<<<<<<< HEAD
    id: 'orthopedics',
=======
    id: '6',
>>>>>>> 80695ed (schedule and department)
    code: 'OR',
    name: 'Orthopedics',
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-600',
    employeeCount: 36,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/orthopedics.jpg',
  },
  {
<<<<<<< HEAD
    id: 'dentistry',
=======
    id: '7',
>>>>>>> 80695ed (schedule and department)
    code: 'DE',
    name: 'Dentistry',
    color: 'bg-pink-600',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-600',
    employeeCount: 46,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/images/dentistry.jpg',
  },
];

<<<<<<< HEAD
=======
const columns: Column<Department>[] = [
  { header: "ID", key: "id" },
  { header: "Department Name", key: "name" },
  { header: "No. of Employee", key: "employeeCount" },
  { header: "Date Created", key: "dateCreated" },
  { header: "Status", key: "status" },
];

>>>>>>> 80695ed (schedule and department)
export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [showForm, setShowForm] = useState(false);
  const [recentlyViewedDepartment, setRecentlyViewedDepartment] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
>>>>>>> 80695ed (schedule and department)

  // Load recently viewed department from localStorage on component mount
  useEffect(() => {
    const recent = localStorage.getItem('recentlyViewedDepartment');
    if (recent) {
      setRecentlyViewedDepartment(recent);
      reorderDepartments(recent);
    }
  }, []);

  // Function to reorder departments based on recently viewed
  const reorderDepartments = (departmentId: string) => {
    setDepartments(prevDepartments => {
      const recentDept = prevDepartments.find(dept => dept.id === departmentId);
      if (!recentDept) return prevDepartments;
      
      const otherDepts = prevDepartments.filter(dept => dept.id !== departmentId);
      return [recentDept, ...otherDepts];
    });
  };

  // Handle department card click
  const handleDepartmentClick = (departmentId: string) => {
    localStorage.setItem('recentlyViewedDepartment', departmentId);
    setRecentlyViewedDepartment(departmentId);
    // Navigation will be handled by the Link component in DepartmentCard
  };

  const handleCreateDepartment = () => {
    setShowForm(true);
  };

<<<<<<< HEAD
  const handleFormSubmit = (newDepartment: Omit<Department, 'id'> ) => {
    const department: Department = {
      ...newDepartment,
      id: newDepartment.name.toLowerCase().replace(/\s+/g, '-'),
  
    };
    
    setDepartments(prev => [...prev, department]);
=======
  const handleFormSubmit = (newDepartment: Omit<Department, 'id' | 'dateCreated'>) => {
    const department: Department = {
      ...newDepartment,
      id: newDepartment.name.toLowerCase().replace(/\s+/g, '-'),
      dateCreated: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };
  
    setDepartments((prev) => [...prev, department]);
>>>>>>> 80695ed (schedule and department)
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-900 h-64">
        <div className="absolute inset-0 bg-blue-900 bg-opacity-80"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold text-center">Departments</h1>
          <p className="text-white text-center mt-2">
            Employees are the foundation for ensuring good health
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Departments</h2>
        
        {/* Department Cards Carousel */}
        <DepartmentCarousel 
          departments={departments} 
          onDepartmentClick={handleDepartmentClick}
          recentlyViewedId={recentlyViewedDepartment}
        />

<<<<<<< HEAD
        {/* Department List/Form Section */}
        <div className="mt-16">
=======

        {/* Department List/Form Section */}
        <div className="px-[27px] pb-[35px]">
        
>>>>>>> 80695ed (schedule and department)
           {showForm ? (
            <AddDepartmentForm 
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
<<<<<<< HEAD
            <DepartmentList 
              departments={departments}
              onCreateClick={handleCreateDepartment}
            />
          )} 
        </div>
=======
            <section className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
        <header className="flex items-center justify-between  gap-5 border-b border-[#D9D9D9] h-[90px] ">
          <h2 className="text-xl font-semibold text-black">Department List</h2>
          <Button 
            onClick={handleCreateDepartment} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Department
          </Button>
        </header>
        <div className="py-[30px] flex justify-between gap-10">
                        <ListView pageSize={pageSize} setPageSize={setPageSize} />
                        <div className="relative">
                          <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search data..."
                            className="py-[10px] px-5 pr-11 rounded-[30px] min-w-[318px] bg-[#E6EBF0] w-full font-medium text-sm text-[#4F504F] border-[0.2px] border-[#F9F9F9] outline-none"
                          />
                          <Search className="size-5 text-[#999999] absolute right-4 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    <DataTable columns={columns} data={departments} />
                    <Pagination
                               dataLength={departments.length}
                               numOfPages={1000}
                               pageSize={10}
                               />
          </section>
            
          )} 
        </div>

>>>>>>> 80695ed (schedule and department)
      </div>
    </div>
  );
}