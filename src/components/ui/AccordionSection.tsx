import React, { useState, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function AccordionSection({ 
  title, 
  children, 
  defaultExpanded = false 
}: AccordionSectionProps): React.ReactElement {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div className="border-b">
      <button
        className="w-full flex items-center justify-between py-4 px-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg font-medium">{title}</span>
        <ChevronDown
          className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          size={24}
        />
      </button>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );
}