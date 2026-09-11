/** Dropdown of YouTube search suggestions — Google-style keyboard navigation. */
import { Search as SearchIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

interface Props {
  suggestions: string[];
  activeIndex: number;
  onSelect: (value: string) => void;
  onHover: (index: number) => void;
  /** optional label showing at the top when nothing is typed yet */
  visible: boolean;
}

export function SearchSuggestions({
  suggestions,
  activeIndex,
  onSelect,
  onHover,
  visible,
}: Props) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div
      role="listbox"
      className="absolute left-0 right-0 top-full z-50 mt-1 border border-border bg-surface shadow-card"
    >
      {suggestions.map((s, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={s}
            role="option"
            aria-selected={active}
            type="button"
            onMouseDown={(e) => {
              // prevent blur-before-click losing the input focus
              e.preventDefault();
              onSelect(s);
            }}
            onMouseEnter={() => onHover(i)}
            className={cn(
              'flex w-full items-center gap-2.5 border-l-2 px-3 py-2 text-left text-xs',
              'transition-colors duration-100',
              active
                ? 'border-accent bg-selection text-text-primary'
                : 'border-transparent text-text-secondary hover:bg-hover',
            )}
          >
            <SearchIcon className={cn('h-3.5 w-3.5 shrink-0', active ? 'text-accent' : 'text-muted')} />
            <span className="truncate font-mono">{s}</span>
          </button>
        );
      })}
    </div>
  );
}