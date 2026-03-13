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
    <div className="relative w-full">
      <div className="flex gap-6 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:thin]">
        {departments.map((department, index) => (
          <div
            key={department.id}
            className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start"
          >
            <DepartmentCard
              department={department}
              onClick={() => onDepartmentClick(department.id)}
              onViewClick={onViewClick ? () => onViewClick(department) : undefined}
              isRecentlyViewed={department.id === recentlyViewedId && index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
  
}