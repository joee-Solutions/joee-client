'use client';

import { useState, useEffect } from 'react';
import DepartmentCarousel from '@/components/Org/Departments/DepartmentCarousel';
import DepartmentList from '@/components/Org/Departments/DepartmentList';
import AddDepartmentForm from '@/components/Org/Departments/AddDepartmentForm';

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
    id: 'opthamology',
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
    id: 'neurology',
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
    id: 'oncology',
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
    id: 'radiology',
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
    id: 'nephrology',
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
    id: 'orthopedics',
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
    id: 'dentistry',
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

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [showForm, setShowForm] = useState(false);
  const [recentlyViewedDepartment, setRecentlyViewedDepartment] = useState<string | null>(null);

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

  const handleFormSubmit = (newDepartment: Omit<Department, 'id'> ) => {
    const department: Department = {
      ...newDepartment,
      id: newDepartment.name.toLowerCase().replace(/\s+/g, '-'),
  
    };
    
    setDepartments(prev => [...prev, department]);
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

        {/* Department List/Form Section */}
        <div className="mt-16">
           {showForm ? (
            <AddDepartmentForm 
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          ) : (
            <DepartmentList 
              departments={departments}
              onCreateClick={handleCreateDepartment}
            />
          )} 
        </div>
      </div>
    </div>
  );
}