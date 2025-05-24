"use client"

import { useState, useCallback } from 'react';
import { Schedule, ScheduleFormData } from '../types/schedule';

export const useSchedules = (initialSchedules: Schedule[]) => {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewSchedule = useCallback((schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsEditMode(false);
  }, []);

  const handleEditSchedule = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleDeleteSchedule = useCallback(() => {
    if (selectedSchedule) {
      setSchedules(prev => prev.filter(s => s.id !== selectedSchedule.id));
      setSelectedSchedule(null);
    }
  }, [selectedSchedule]);

  const handleSaveSchedule = useCallback((formData: ScheduleFormData) => {
    if (isEditMode && selectedSchedule) {
      // Update existing schedule
      setSchedules(prev => 
        prev.map(s => 
          s.id === selectedSchedule.id 
            ? { ...s, name: formData.name, role: formData.role }
            : s
        )
      );
    } else {
      // Add new schedule
      const newSchedule: Schedule = {
        id: Date.now().toString(),
        code: formData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        name: formData.name,
        role: formData.role,
        color: 'bg-blue-600',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-600',
        image: '/api/placeholder/80/80',
        description: 'New schedule description',
        status: 'Active'
      };
      setSchedules(prev => [...prev, newSchedule]);
    }
    handleCloseModal();
  }, [isEditMode, selectedSchedule]);

  const handleOpenAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSchedule(null);
    setIsEditMode(false);
    setIsAddModalOpen(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return {
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
  };
};