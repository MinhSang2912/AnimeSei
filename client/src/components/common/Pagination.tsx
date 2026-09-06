import React, { useState, useEffect } from 'react';

interface PaginationProps {
  page: number;
  lastPage: number;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, lastPage, onPageChange }) => {
  const [inputPage, setInputPage] = useState<string>(page.toString());
  const effectiveLastPage = Math.max(1, lastPage);

  useEffect(() => {
    setInputPage(page.toString());
  }, [page]);

  const handleJumpPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputPage, 10);
    if (isNaN(parsed)) {
      setInputPage(page.toString());
      return;
    }
    const target = Math.max(1, Math.min(parsed, effectiveLastPage));
    onPageChange(target);
    setInputPage(target.toString());
  };

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      {/* Page Number Badges */}
      <div className="flex items-center space-x-1.5 px-2 overflow-x-auto max-w-[600px] py-1">
        {(() => {
          const delta = 2;
          const left = page - delta;
          const right = page + delta;
          const range: (number | string)[] = [];
          let l: number | null = null;

          for (let i = 1; i <= effectiveLastPage; i++) {
            if (i === 1 || i === effectiveLastPage || (i >= left && i <= right)) {
              if (l !== null) {
                if (i - l === 2) {
                  range.push(l + 1);
                } else if (i - l > 2) {
                  range.push('...');
                }
              }
              range.push(i);
              l = i;
            }
          }

          return range.map((item, idx) => {
            if (item === '...') {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-slate-500 font-bold text-xs select-none">
                  ...
                </span>
              );
            }
            const pNum = Number(item);
            return (
              <button
                key={pNum}
                onClick={() => onPageChange(pNum)}
                className={`w-9 h-9 rounded-xl font-bold text-xs transition border flex items-center justify-center flex-shrink-0 cursor-pointer ${pNum === page
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/20'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
              >
                {pNum}
              </button>
            );
          });
        })()}
      </div>

      {/* Jump to Page Form */}
      <form
        onSubmit={handleJumpPageSubmit}
        className="flex items-center space-x-2 border-l border-slate-800/80 pl-4 ml-1"
      >
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Đến trang:</span>
        <input
          type="number"
          min={1}
          max={effectiveLastPage}
          value={inputPage}
          onChange={(e) => setInputPage(e.target.value)}
          onBlur={() => {
            const parsed = parseInt(inputPage, 10);
            if (isNaN(parsed) || parsed < 1) {
              setInputPage('1');
            } else if (parsed > effectiveLastPage) {
              setInputPage(effectiveLastPage.toString());
            }
          }}
          className="w-16 px-2.5 py-1.5 bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl text-center text-xs font-semibold text-white focus:outline-none transition shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          placeholder="1"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
        >
          Đi
        </button>
      </form>
    </div>
  );
};
