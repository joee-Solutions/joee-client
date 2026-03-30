import { useState } from "react";
import { Search } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  /** Called on every keystroke, Enter, and search icon click */
  onSearch?: (query: string) => void;
};

const SearchInput = ({
  placeholder = "Search data...",
  onSearch,
}: SearchInputProps) => {
  const [query, setQuery] = useState("");

  const pushQuery = (q: string) => {
    onSearch?.(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      pushQuery(query);
    }
  };

  return (
    <div className="flex items-center w-fll max-w-md bg-[#E9EEF3] rounded-full px-4 py-2">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          pushQuery(next);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-grow bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none"
      />
      <button type="button" onClick={() => pushQuery(query)} aria-label="Search">
        <Search className="text-gray-400 w-5 h-5" />
      </button>
    </div>
  );
};

export { Search, SearchInput };
