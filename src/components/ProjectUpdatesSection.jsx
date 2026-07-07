import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function ProjectUpdatesSection({ projectUpdates, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showClosed, setShowClosed] = useState(false);

  if (!projectUpdates || projectUpdates.length === 0) return null;

  // Filter and sort updates
  const filteredUpdates = projectUpdates.filter(u => showClosed || u.status !== 'Closed');
  const sortedUpdates = [...filteredUpdates].sort((a, b) => new Date(b.updateDate) - new Date(a.updateDate));

  return (
    <div className="mb-8">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-6 py-4 flex justify-between items-center cursor-pointer bg-white border border-border-subtle transition-colors ${isExpanded ? 'rounded-t-xl border-b-0' : 'rounded-xl hover:border-primary/30'}`}
      >
        <h3 className="m-0 text-headline-sm font-headline-sm text-text-main flex items-center gap-2">
          General Project Updates 
          <span className="text-xs font-semibold bg-primary-container text-on-primary px-2.5 py-0.5 rounded-full">
            {filteredUpdates.length}
          </span>
        </h3>
        <div className="flex items-center gap-4">
          <label 
            className="flex items-center gap-2 text-label-md text-text-muted cursor-pointer" 
            onClick={(e) => e.stopPropagation()}
          >
            <input 
              type="checkbox" 
              checked={showClosed} 
              onChange={() => setShowClosed(!showClosed)} 
              className="cursor-pointer rounded border-border-subtle text-primary focus:ring-primary"
            />
            Show Closed
          </label>
          <button className="text-text-muted hover:text-text-main transition-colors bg-transparent border-none flex items-center justify-center p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-xl">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white rounded-b-xl border border-t-0 border-border-subtle overflow-hidden"
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle bg-surface-container-lowest">
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[60px]">#</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[150px]">Update Date</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[100px]">Week #</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[100px]">Status</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[120px]">Attachment</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest w-[100px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {sortedUpdates.map((update, idx) => (
                    <motion.tr 
                      key={update.updateId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-surface-container-low transition-colors group cursor-default"
                    >
                      <td className="px-6 py-6 text-body-md text-text-muted font-semibold">{idx + 1}</td>
                      <td className="px-6 py-6 text-body-md text-text-main">
                        {(() => {
                          try {
                            return format(new Date(update.updateDate), 'MMM dd, yyyy');
                          } catch(e) {
                            return update.updateDate;
                          }
                        })()}
                      </td>
                      <td className="px-6 py-6 text-body-md text-text-main">{update.weekNumber}</td>
                      <td className="px-6 py-6 text-body-md text-text-main">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${update.status === 'Closed' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                          {update.status || 'Open'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-body-md text-text-main whitespace-pre-wrap max-w-lg">{update.description}</td>
                      <td className="px-6 py-6 text-body-md text-text-main">
                        {update.attachment && (
                          <a href={update.attachment} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                            View
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-6 text-body-md text-text-main">
                        <div className="flex items-center gap-2 justify-end">
                          <button 
                            onClick={() => onEdit(update)} 
                            className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-text-muted transition-colors" 
                            title="Edit Update"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button 
                            onClick={() => onDelete(update.updateId)} 
                            className="w-8 h-8 rounded-lg hover:bg-danger/10 flex items-center justify-center text-danger transition-colors" 
                            title="Delete Update"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
