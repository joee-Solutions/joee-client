"use client"

import React, { useState } from 'react';
import ScheduleModal from '@/components/Org/Schedule/ScheduleModel';
import AddScheduleModal from '@/components/Org/Schedule/AddSchedule';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import Pagination from '@/components/shared/table/pagination';
import { Plus, Search } from 'lucide-react';
import { ListView } from '@/components/shared/table/DataTableFilter';
import { Button } from '@/components/ui/button';
import ScheduleCarousel from '@/components/Org/Schedule/ScheduleCarousel';

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
  status: "Active" | "Inactive";
}
interface FormData {
  name: string;
  role: string;
  department: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface TableDataItem {
  id: number;
  name: string;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
}

// Sample data for doctor schedules
const schedules: Schedule[] = [
  {
    id: '1',
    code: 'DH',
    name: 'Denise Hampton',
    role: 'Doctor',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '2',
    code: 'SD',
    name: 'Susan Denilson',
    role: 'Lab Attendant',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '3',
    code: 'CJ',
    name: 'Cole Joshua',
    role: 'Doctor',
    color: 'bg-red-600',
    textColor: 'text-red-600',
    borderColor: 'border-red-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipvsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '4',
    code: 'JG',
    name: 'Jenifer Gloria',
    role: 'Nurse',
    color: 'bg-yellow-600',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
  {
    id: '5',
    code: 'DS',
    name: 'Denilson Susan',
    role: 'Lab Attendant',
    color: 'bg-green-600',
    textColor: 'text-green-600',
    borderColor: 'border-green-600',
    image: '/api/placeholder/80/80',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cursus nec amet lorem in.',
    status: 'Active' as const
  },
];



const tableData: TableDataItem[] = [
  { id: 1, name: "Jeremy White", department: "Oncology", date: "20 Dec 2023", startTime: "11:00am", endTime: "12:00am" },
  { id: 2, name: "Gary Campbell", department: "Neurology", date: "18 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 3, name: "Richard Bills", department: "Orthopedics", date: "14 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 4, name: "Carol Tynese", department: "Gynaecology", date: "13 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 5, name: "Dare Adeleke", department: "Cardiology", date: "9 Dec 2023", startTime: "11:00am", endTime: "12:00pm" },
  { id: 6, name: "Rose Hilary", department: "Nephrology", date: "29 Nov 2023", startTime: "11:00am", endTime: "12:00pm" },
];

const columns: Column<TableDataItem>[] = [
  { header: "ID", key: "id" },
  { header: "Name", key: "name" },
  { header: "Department", key: "department" },
  { header: "Date", key: "date" },
  { header: "Start Time", key: "startTime" },
  { header: "End Time", key: "endTime" },
];

const SchedulesPage: React.FC = () => {
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");


  const handleViewSchedule = (schedule: Schedule): void => {
    setSelectedSchedule(schedule);
    setIsEditMode(false);
  };

  const handleEdit = (): void => {
    setIsEditMode(true);
  };
  const handleCreateSchedule = (): void => {
    setSelectedSchedule(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleDelete = (): void => {
    // Handle delete logic
    setSelectedSchedule(null);
    console.log('Delete schedule:', selectedSchedule?.id);
  };

  const handleCloseModal = (): void => {
    setSelectedSchedule(null);
    setIsEditMode(false);
    setIsAddModalOpen(false);
  };

  const handleSave = (formData: FormData): void => {
    // Handle save logic
    console.log('Save data:', formData);
    handleCloseModal();
  };

  // const handleAddSchedule = (): void => {
  //   setIsAddModalOpen(true);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
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

          <ScheduleCarousel
            schedules={schedules}
            onViewSchedule={handleViewSchedule}
            recentlyViewedId={selectedSchedule?.id || null}
          />
        </div>
        <section className="mt-10 shadow-[0px_0px_4px_1px_#0000004D]">
          <header className="flex items-center justify-between gap-5 border-b border-[#D9D9D9] h-[90px]">
            <h2 className="font-semibold text-xl text-black">Schedule List</h2>

            <Button
              onClick={handleCreateSchedule}
              className="text-base text-[#4E66A8] font-normal"
            >
              Add Schedule
            </Button>
          </header>
          <div className="px-[27px] pb-[35px]">
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
            <DataTable columns={columns} data={tableData} />
          </div>
          <Pagination
            dataLength={tableData.length}
            numOfPages={1000}
            pageSize={10}
          />
        </section>
        <Button
          onClick={handleCreateSchedule}
          className="flex justify-center items-center font-normal text-base text-white bg-[#003465] hover:bg-[#003465]/90 w-[306px] h-[60px] mt-7 self-end"
        >
          Create Schedule <Plus size={24} />
        </Button>
      </div>
      {/* Modals */}
      {selectedSchedule && (
        <ScheduleModal
          selectedSchedule={selectedSchedule}
          isEditMode={isEditMode}
          onClose={handleCloseModal}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSave={handleSave}
          setIsEditMode={setIsEditMode}
        />
      )}

      {isAddModalOpen && (
        <AddScheduleModal
          onClose={handleCloseModal}
          onSave={handleSave}
          employees={schedules.map(({ id, name }) => ({ id, name }))}
          editMode={false}
        />
      )}
    </div>
  );
};

export default SchedulesPage;