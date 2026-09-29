import React from 'react';
import { cn } from '@/lib/utils';

export interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, children, className }) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm', className)}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="px-6 py-3.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 font-normal">
          {children}
        </tbody>
      </table>
    </div>
  );
};
