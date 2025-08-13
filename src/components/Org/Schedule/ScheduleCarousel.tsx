'use client';

import ScheduleCard from './ScheduleCard';

interface Schedule {
  id: string;
  code: string;
  name: string;
  role: string;
  color: string;
  textColor: string;
  borderColor: string;
  image: string;
  description: string;
  status: 'Active' | 'Inactive';
}

interface ScheduleCarouselProps {
  schedules: Schedule[];
  onViewSchedule: (schedule: Schedule) => void;
  recentlyViewedId: string | null;
}

export default function ScheduleCarousel({
  schedules,
  onViewSchedule,
  recentlyViewedId,
}: ScheduleCarouselProps) {
  return (
    <div className="relative">
      <div
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-snap-x scroll-snap-mandatory"
        style={{ scrollPadding: '0 1rem' }}
      >
        {schedules.map((schedule, index) => (
          <div
            key={schedule.id}
            className="flex-shrink-0 w-[calc(25%-1rem)] scroll-snap-align-start"
            style={{
              minWidth: 'calc(25% - 1rem)',
            }}
          >
            <ScheduleCard
              schedule={schedule}
              onViewSchedule={onViewSchedule}
              isRecentlyViewed={schedule.id === recentlyViewedId && index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
