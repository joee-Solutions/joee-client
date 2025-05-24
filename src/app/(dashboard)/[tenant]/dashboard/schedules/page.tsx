import ScheduleCard from "@/components/Org/Schedule/ScheduleCard";
import ScheduleList from "@/components/Org/Schedule/ScheduleList";
import ScheduleModal from '../components/ScheduleModal';
import AddScheduleModal from '../components/AddScheduleModal';
import { useSchedules } from '../hooks/useSchedules';
import { SAMPLE_SCHEDULES, SAMPLE_TABLE_DATA } from '../constants/scheduleData';

const SchedulesPage: React.FC = () => {
  const {
    schedules,
    selectedSchedule,
    isEditMode,
    isAddModalOpen,
    handleViewSchedule,
    handleEditSchedule,
    handleDeleteSchedule,
    handleSaveSchedule,
    handleOpenAddModal,
    handleCloseModal,
    handleCancelEdit
  } = useSchedules(SAMPLE_SCHEDULES);

export default function page() {
  return <div>
    <section>
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center">Schedules</h1>
      </div>
    </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Schedules Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedules</h2>
          <p className="text-blue-600 mb-6">Top Search</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
              <div >
                <ScheduleCard />
              </div>
       
          </div>
        </div>
      </div>

      <ScheduleList />
    </section>
  </div>;
}
