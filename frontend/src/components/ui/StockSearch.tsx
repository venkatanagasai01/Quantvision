"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const MOCK_STOCKS = [
  { symbol: "TCS", name: "Tata Consultancy Services" },
  { symbol: "INFY", name: "Infosys" },
  { symbol: "RELIANCE", name: "Reliance Industries" },
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "MSFT", name: "Microsoft Corporation" },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd." },
  { symbol: "WIPRO", name: "Wipro Limited" },
];

export function StockSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Filter stocks based on query
  const filteredStocks = MOCK_STOCKS.filter((stock) => 
    stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
    stock.name.toLowerCase().includes(query.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    setQuery("");
    setIsOpen(false);
    // Navigate to the live analysis page with the search symbol
    router.push(`/dashboard/analyze?symbol=${symbol}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-0 w-4 h-4 text-gray-400" strokeWidth={1.5} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.length > 0) {
              handleSelect(query.toUpperCase());
            }
          }}
          placeholder="Search symbol, company, or ISIN..." 
          className="w-full pl-8 pr-4 py-2 bg-transparent text-sm text-gray-900 focus:outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-full max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md z-50">
          <ul className="py-2">
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <li 
                  key={stock.symbol}
                  onClick={() => handleSelect(stock.symbol)}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center group transition-colors"
                >
                  <div>
                    <div className="font-bold text-gray-900 text-sm group-hover:text-blue-700">{stock.symbol}</div>
                    <div className="text-xs text-gray-500 font-medium">{stock.name}</div>
                  </div>
                </li>
              ))
            ) : null}
            
            {/* Always allow searching for the typed query if it's not exactly in the list */}
            {!filteredStocks.find(s => s.symbol.toLowerCase() === query.toLowerCase()) && (
              <li 
                onClick={() => handleSelect(query.toUpperCase())}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-t border-gray-100"
              >
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Search for "{query.toUpperCase()}"
                </span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
