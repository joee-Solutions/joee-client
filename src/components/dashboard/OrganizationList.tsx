import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Organization {
  id: number;
  name: string;
  location: string;
  status: string;
  image: string;
}

interface OrganizationListProps {
  organizations: Organization[];
}

const OrganizationList: FC<OrganizationListProps> = ({ organizations }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-200 text-green-800';
      case 'Inactive':
        return 'bg-red-200 text-red-800';
      case 'Deactivated':
        return 'bg-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'border-green-500';
      case 'Inactive':
        return 'border-red-500';
      case 'Deactivated':
        return 'border-yellow-500';
      default:
        return 'border-gray-500';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-medium text-lg md:text-xl text-black">Organization List</h3>
        <Link href="/organizations" className="text-blue-600 text-sm flex items-center font-medium">
          View all
          <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      
      <div className="divide-y divide-gray-200">
        {organizations.map((org) => (
          <div key={org.id} className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <div className={`relative w-12 h-12 rounded-full overflow-hidden border-2 ${getBorderColor(org.status)} mr-3`}>
                <Image
                  src={org.image}
                  alt={org.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div>
                <Link href={"#"} className="font-semibold text-blue-900 text-sm ">{org.name}</Link>
                <p className="text-gray-500 text-xs">{org.location}</p>
              </div>
            </div>
        
            <span className={`px-4 py-2 rounded-lg text-xs font-semibold ${getStatusStyles(org.status)}`}>
              {org.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationList;
