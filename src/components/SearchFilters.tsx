/** Advanced filters panel for the Search page — hidden behind a toggle. */
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  useSearchStore,
  type DurationFilter,
  type DateFilter,
  type SortBy,
} from '@/store/useSearchStore';
import { cn } from '@/lib/cn';

const DURATIONS: { value: DurationFilter; label: string }[] = [
  { value: 'any', label: 'Any length' },
  { value: 'short', label: 'Under 4 min' },
  { value: 'medium', label: '4 – 20 min' },
  { value: 'long', label: 'Over 20 min' },
];

const DATES: { value: DateFilter; label: string }[] = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
];

const SORTS: { value: SortBy; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest first' },
  { value: 'views', label: 'Most viewed' },
  { value: 'duration', label: 'Longest' },
];

export function SearchFilters() {
  const [open, setOpen] = useState(false);
  const filters = useSearchStore((s) => s.filters);
  const setFilters = useSearchStore((s) => s.setFilters);
  const resetFilters = useSearchStore((s) => s.resetFilters);

  const activeCount =
    (filters.duration !== 'any' ? 1 : 0) +
    (filters.date !== 'any' ? 1 : 0) +
    (filters.sort !== 'relevance' ? 1 : 0);

  return (
    <div className="border border-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between px-3 py-2',
          'text-[10px] font-semibold uppercase tracking-widest text-text-secondary',
          'transition-colors duration-150 hover:bg-hover hover:text-text-primary',
        )}
      >
        <span>
          Filters{activeCount > 0 ? ` (${activeCount})` : ''}
        </span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t border-border bg-surface p-3">
          <div className="grid grid-cols-3 gap-3">
            <FilterSelect
              label="Duration"
              value={filters.duration}
              options={DURATIONS}
              onChange={(v) => setFilters({ duration: v as DurationFilter })}
            />
            <FilterSelect
              label="Uploaded"
              value={filters.date}
              options={DATES}
              onChange={(v) => setFilters({ date: v as DateFilter })}
            />
            <FilterSelect
              label="Sort by"
              value={filters.sort}
              options={SORTS}
              onChange={(v) => setFilters({ sort: v as SortBy })}
            />
          </div>

          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted hover:text-accent"
            >
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-bordered text-xs"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}