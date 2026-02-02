"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchParams?.get("q") || "";
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      // TODO: Implement actual search API call
      // For now, this is a placeholder
      // You can search across: organizations, employees, patients, appointments, departments
      
      // Simulate search delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock results - replace with actual API call
      setSearchResults([]);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  return (
    <div className="min-h-screen w-full p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#003465] mb-6">Search</h1>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search organizations, employees, patients, appointments, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 h-[50px] rounded-[30px] pl-5 pr-14 bg-[#E4E8F2] outline-none focus:outline-2 focus:outline-[#003465] text-base"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-4 cursor-pointer hover:opacity-70 transition-opacity"
            >
              <SearchIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </form>

        {/* Search Results */}
        {isSearching ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Searching...</p>
          </div>
        ) : searchQuery && searchResults.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{searchQuery}"</p>
            <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
          </div>
        ) : searchQuery ? (
          <div className="space-y-4">
            {searchResults.map((result, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                {/* Render search results here */}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Enter a search query to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

