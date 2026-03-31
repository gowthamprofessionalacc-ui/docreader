"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { search } from "@/lib/api";
import { SearchResult } from "@/lib/types";

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      const data = await search(query);
      setResults(data.results);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Semantic Search</h1>
      <p className="text-gray-500 mb-8">
        Search your documents directly. Results are ranked by semantic similarity.
      </p>
      <SearchBar onSearch={handleSearch} loading={loading} />
      {results !== null && (
        <div className="mt-8">
          <SearchResults results={results} />
        </div>
      )}
    </div>
  );
}
