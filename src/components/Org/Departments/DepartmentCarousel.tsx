'use client';

import DepartmentCard from '@/components/Org/Departments/DepartmentCard';

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
  description?: string;
  [key: string]: string | number | boolean | undefined;
}

interface DepartmentCarouselProps {
  departments: Department[];
  onDepartmentClick: (departmentId: string) => void;
  onViewClick?: (department: Department) => void;
  recentlyViewedId: string | null;
}

export default function DepartmentCarousel({
  departments,
  onDepartmentClick,
  onViewClick,
  recentlyViewedId,
}: DepartmentCarouselProps) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {departments.map((department, index) => (
          <DepartmentCard
            key={department.id}
            department={department}
            onClick={() => onDepartmentClick(department.id)}
            onViewClick={onViewClick ? () => onViewClick(department) : undefined}
            isRecentlyViewed={department.id === recentlyViewedId && index === 0}
          />
        ))}
      </div>
    </div>
  );
  
}