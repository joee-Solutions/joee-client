import { useState } from 'react';
import PersonalInformationTab from '@/components/Org/Patients/PersonalInformationTab';
import MedicalInformationTab from '@/components/Org/Patients/MedicalInformationTab';
import { Button } from '@/components/ui/button';

export default function PatientFormContainer(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<'personal' | 'medical'>('personal');

  return (
    <div className=" mx-auto">
      <div className="py-8 p-[29px_14px_30px_24px] my-8 shadow-[0px_0px_4px_1px_#0000004D] mx-8">
        <div className="flex justify-between items-center border-b-2  py-4 mb-8">
          <h1 className="font-semibold text-xl text-black">Instruction - Click on a section to view and fill information</h1>
          <Button
                              
                              className="text-base text-[#003465] font-normal"
                            >
                              Patients List
                            </Button>
        </div>

        <div className="flex border-b">
          <button
            className={`flex-1 py-4 text-center text-lg font-medium relative ${
              activeTab === 'personal' ? 'text-[#003465]' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Information
            {activeTab === 'personal' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#003465]"></div>
            )}
          </button>
          <button
            className={`flex-1 py-4 text-center text-lg font-medium relative ${
              activeTab === 'medical' ? 'text-[#003465]' : 'text-gray-600'
            }`}
            onClick={() => setActiveTab('medical')}
          >
            Medical Information
            {activeTab === 'medical' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#003465]"></div>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'personal' && <PersonalInformationTab />}
          {activeTab === 'medical' && <MedicalInformationTab />}
        </div>
      </div>
    </div>
  );
}