import React, { useState, useRef, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COLUMN_DEFS, toggleColumn, ColumnGroup } from '@/dealCompsV1/lib/columns';

const GROUPS: ColumnGroup[] = ['Company', 'Transaction', 'Multiples'];

export function ColumnPicker({
  visible,
  onChange,
}: {
  visible: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const id = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all active:scale-[0.97]"
      >
        <Settings2 className="w-4 h-4" /> Columns
      </button>
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.13, ease: 'easeOut' }}
          style={{ transformOrigin: 'top right' }}
          className="absolute top-full right-0 mt-1.5 z-30 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[220px] max-h-[360px] overflow-y-auto">
          {GROUPS.map((group) => (
            <div key={group} className="px-1 pb-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{group}</div>
              {COLUMN_DEFS.filter((c) => c.group === group).map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={visible.has(c.key)}
                    disabled={c.alwaysOn}
                    onChange={() => onChange(toggleColumn(visible, c.key))}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  {c.label}
                  {c.alwaysOn && <span className="text-[10px] text-gray-400 ml-auto">always</span>}
                </label>
              ))}
            </div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
