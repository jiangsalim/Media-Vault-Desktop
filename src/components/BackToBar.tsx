/** Small "back to ..." bar shown on Video / Search pages when applicable. */
import { ArrowLeft } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

const LABEL_MAX = 42;

function truncate(s: string, max = LABEL_MAX): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export function BackToBar() {
  const returnTo = useUiStore((s) => s.returnTo);
  const returnLabel = useUiStore((s) => s.returnLabel);
  const goBack = useUiStore((s) => s.goBack);

  if (!returnTo) return null;

  const label = returnLabel ? truncate(returnLabel) : `Back to ${returnTo}`;

  return (
    <button
      onClick={goBack}
      className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-widest text-muted transition-colors hover:text-accent"
      title={returnLabel ?? `Back to ${returnTo}`}
    >
      <ArrowLeft className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}