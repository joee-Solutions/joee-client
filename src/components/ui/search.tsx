import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchInput = ({ placeholder = 'Search data...', onSearch }) => {
    const [query, setQuery] = useState('');
  
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(query);
      }
    };

    return (
        <div className="flex items-center w-fll max-w-md bg-[#E9EEF3] rounded-full px-4 py-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-grow bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          <button onClick={() => onSearch?.(query)}>
            <Search className="text-gray-400 w-5 h-5" />
          </button>
        </div>
      );
    }

export { Search, SearchInput };
