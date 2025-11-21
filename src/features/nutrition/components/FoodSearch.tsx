/**
 * USDA Food Search Component
 * Provides autocomplete search for 350,000+ foods from USDA database
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, Plus } from "lucide-react";
import { usdaFoodService, type USDAFood } from "@/services/usda/usdaFoodService";
import { debounce } from "@/shared/utils/debounce";

interface FoodSearchProps {
  onSelectFood: (food: USDAFood, servings: number) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function FoodSearch({
  onSelectFood,
  placeholder = "Search for foods (e.g., 'chicken breast', 'apple')...",
  autoFocus = false,
}: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<USDAFood[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [servings, setServings] = useState<{ [key: number]: number }>({});
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const foods = await usdaFoodService.autocomplete(searchQuery, 15);
        setResults(foods);
        setShowResults(true);
      } catch (error) {
        console.error("Food search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim()) {
      setIsSearching(true);
      debouncedSearch(value.trim());
    } else {
      setResults([]);
      setIsSearching(false);
      setShowResults(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleAddFood(results[selectedIndex]);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle food selection
  const handleAddFood = (food: USDAFood) => {
    const foodServings = servings[food.fdcId] || 1;
    onSelectFood(food, foodServings);

    // Reset
    setQuery("");
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setServings({});
  };

  // Handle servings change
  const handleServingsChange = (fdcId: number, value: number) => {
    setServings((prev) => ({
      ...prev,
      [fdcId]: Math.max(0.1, value),
    }));
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />

        {/* Loading or Clear button */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setShowResults(false);
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto">
          <div className="p-2 text-xs text-muted-foreground border-b border-slate-200 dark:border-slate-700">
            Found {results.length} foods from USDA database
          </div>

          {results.map((food, index) => (
            <div
              key={food.fdcId}
              className={`p-3 border-b border-slate-100 dark:border-slate-700/50 last:border-b-0 transition-colors ${
                selectedIndex === index
                  ? "bg-primary/10 dark:bg-primary/20"
                  : "hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Food Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground truncate mb-1">
                    {food.description}
                  </div>

                  {(food.brandName || food.brandOwner) && (
                    <div className="text-xs text-muted-foreground mb-1">
                      {food.brandName || food.brandOwner}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      {food.nutrition?.calories || 0} cal
                    </span>
                    <span>P: {food.nutrition?.protein || 0}g</span>
                    <span>C: {food.nutrition?.carbs || 0}g</span>
                    <span>F: {food.nutrition?.fat || 0}g</span>
                  </div>

                  {food.householdServingFullText && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Serving: {food.householdServingFullText}
                    </div>
                  )}
                </div>

                {/* Servings Input & Add Button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <label className="text-xs text-muted-foreground mb-1">
                      Servings
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={servings[food.fdcId] || 1}
                      onChange={(e) =>
                        handleServingsChange(food.fdcId, parseFloat(e.target.value) || 1)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-16 px-2 py-1 text-sm text-center bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>

                  <button
                    onClick={() => handleAddFood(food)}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                    title="Add to meal"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="p-2 text-xs text-center text-muted-foreground bg-slate-50 dark:bg-slate-800/50">
            Use ↑↓ arrows to navigate, Enter to select
          </div>
        </div>
      )}

      {/* No Results */}
      {showResults && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-6 text-center">
          <p className="text-muted-foreground">
            No foods found for "{query}"
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Try a different search term
          </p>
        </div>
      )}
    </div>
  );
}

export default FoodSearch;
