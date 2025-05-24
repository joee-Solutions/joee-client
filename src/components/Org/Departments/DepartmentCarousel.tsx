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
}

interface DepartmentCarouselProps {
  departments: Department[];
  onDepartmentClick: (departmentId: string) => void;
  recentlyViewedId: string | null;
}

export default function DepartmentCarousel({
  departments,
  onDepartmentClick,
  recentlyViewedId,
}: DepartmentCarouselProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-snap-x scroll-snap-mandatory"
        style={{
          scrollPadding: '0 1rem',
        }}
      >
        {departments.map((department, index) => (
          <div
            key={department.id}
            className="flex-shrink-0 w-[calc(25%-1rem)] scroll-snap-align-start"
            style={{
              minWidth: 'calc(25% - 1rem)',
            }}
          >
            <DepartmentCard
              key={department.id}
              department={department}
              onClick={() => onDepartmentClick(department.id)}
              isRecentlyViewed={department.id === recentlyViewedId && index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}