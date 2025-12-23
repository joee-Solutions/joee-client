'use client';

import { useState, useEffect } from 'react';
import DepartmentCarousel from '@/components/Org/Departments/DepartmentCarousel';
import DepartmentList from '@/components/Org/Departments/DepartmentList';
import AddDepartmentForm from '@/components/Org/Departments/AddDepartmentForm';
// import DepartmentList from '@/components/Org/Departments/DepartmentList';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/table/pagination';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { ListView } from '@/components/shared/table/DataTableFilter';


interface Department extends Record<string, string | number> {
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
    id: '1',
    code: 'OP',
    name: 'Opthamology',
    color: 'bg-blue-800',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-800',
    employeeCount: 30,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/opthamology.jpg',
  },
  {
    id: '2',
    code: 'NE',
    name: 'Neurology',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    employeeCount: 32,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/neurology.png',
  },
  {
    id: '3',
    code: 'ON',
    name: 'Oncology',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    employeeCount: 38,
    dateCreated: '20 Jan 2024',
    status: 'Inactive',
    image: '/assets/department/oncology.png',
  },
  {
    id: '4',
    code: 'RA',
    name: 'Radiology',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    employeeCount: 36,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/radiology.png',
  },
  {
    id: '5',
    code: 'NP',
    name: 'Nephrology',
    color: 'bg-purple-600',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-600',
    employeeCount: 24,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/department-bg.jpg',
  },
  {
    id: '6',
    code: 'OR',
    name: 'Orthopedics',
    color: 'bg-indigo-600',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-600',
    employeeCount: 36,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/department-bg.jpg',
  },
  {
    id: '7',
    code: 'DE',
    name: 'Dentistry',
    color: 'bg-pink-600',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-600',
    employeeCount: 46,
    dateCreated: '20 Jan 2024',
    status: 'Active',
    image: '/assets/department/department-bg.jpg',
  },
];

const columns: Column<Department>[] = [
  { header: "ID", key: "id" },
  { header: "Department Name", key: "name" },
  { header: "No. of Employee", key: "employeeCount" },
  { header: "Date Created", key: "dateCreated" },
  { header: "Status", key: "status" },
];

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [showForm, setShowForm] = useState(false);
  const [recentlyViewedDepartment, setRecentlyViewedDepartment] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
  };

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

  const handleFormSubmit = (newDepartment: any) => {
    const departmentName = String(newDepartment.name);
    const department: Department = {
      code: String(newDepartment.code),
      name: String(newDepartment.name),
      color: String(newDepartment.color),
      textColor: String(newDepartment.textColor),
      borderColor: String(newDepartment.borderColor),
      employeeCount: Number(newDepartment.employeeCount),
      status: newDepartment.status as 'Active' | 'Inactive',
      image: String(newDepartment.image),
      id: departmentName.toLowerCase().replace(/\s+/g, '-'),
      dateCreated: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    setDepartments((prev) => [...prev, department]);
    setShowForm(false);
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-64 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/assets/department/department-bg.jpg')`,
          backgroundColor: '#003465',
        }}
      >
        <div className="absolute inset-0 bg-[#003465] bg-opacity-80"></div>
        <div className="relative w-full px-4 md:px-6 lg:px-8 h-full flex flex-col justify-center">
          <h1 className="text-white text-4xl font-bold text-center">Departments</h1>
          <p className="text-white text-center mt-2">
            Employees are the foundation for ensuring good health
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold mb-8">Departments</h2>

        {/* Department Cards Carousel */}
        <DepartmentCarousel
          departments={departments}
          onDepartmentClick={handleDepartmentClick}
          recentlyViewedId={recentlyViewedDepartment}
        />


        {/* Department List/Form Section */}
        <div className="px-[27px] pb-[35px]">

          {showForm ? (
            <AddDepartmentForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
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
                numOfPages={Math.ceil(departments.length / pageSize)}
                pageSize={pageSize}
                handlePageClick={handlePageClick}
              />
            </section>

          )}
        </div>

      </div>
    </div>
  );
}