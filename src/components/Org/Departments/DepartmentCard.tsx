'use client';

import Link from 'next/link';
import Image from 'next/image';

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

interface DepartmentCardProps {
  department: Department;
  onClick: () => void;
  isRecentlyViewed?: boolean;
}

export default function DepartmentCard({ 
  department, 
  onClick,
  isRecentlyViewed = false 
}: DepartmentCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    onClick();
  };

  return (
    <div
      className={`relative rounded-lg shadow-md overflow-hidden cursor-pointer ${
        isRecentlyViewed ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      }`}
    >
      <Link href={`/dashboard/department/${department.id}`} onClick={handleCardClick}>
        <div 
          className={`h-32 relative bg-cover bg-center bg-no-repeat ${department.color}`}
          style={{
            backgroundImage: `url('/assets/department/department-bg.jpg')`,
          }}
        >
          {/* Overlay */}
          <div className={`absolute inset-0 ${department.color} bg-opacity-70`}></div>
          
          {/* Department Code Badge */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-white rounded-md flex items-center justify-center shadow-sm z-10">
            <span className={`font-bold text-lg ${department.textColor}`}>
              {department.code}
            </span>
          </div>

          {/* Recently Viewed Badge */}
          {isRecentlyViewed && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
              Recent
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 pb-8">
          {/* Profile Image Circle */}
          <div className={`relative -mt-16 w-24 h-24 mx-auto rounded-full overflow-hidden border-4 ${department.borderColor} bg-white`}>
            <div className="w-full h-full relative">
              <Image
                src={department.image}
                alt={department.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          
          {/* Department Name */}
          <h3 className={`text-center text-xl font-bold mt-4 ${department.textColor}`}>
            {department.name}
          </h3>
          
          {/* Description */}
          <p className="text-center text-gray-500 text-sm mt-2">
            Providing specialized medical care and services with a dedicated team of healthcare professionals.
          </p>

          {/* Employee Count (Optional) */}
          <div className="text-center mt-3">
            <span className="text-gray-600 text-sm">
              {department.employeeCount} employees
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}