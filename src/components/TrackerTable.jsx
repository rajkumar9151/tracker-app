"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, PlusCircle, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_UPDATE_COLUMNS = ['Update ID', 'Task ID', 'Task Name', 'Week Number', 'Update Date', 'Description'];

export default function TrackerTable({ data, onAddUpdate, onEditTask, onDeleteTask, onEditUpdate, onDeleteUpdate }) {
  const [expanded, setExpanded] = useState({});
  const [sorting, setSorting] = useState([]);
  const [columnOrder, setColumnOrder] = useState([]);

  const columns = useMemo(() => {
    if (!data.columns || data.columns.length === 0) return [];
    const metadata = data.metadata || {};
    
    // Map Excel columns to React Table columns
    const dynamicColumns = data.columns.map(col => {
      return {
        accessorKey: col,
        header: col,
        cell: info => {
          const val = info.getValue();
          if (!val) return '';
          
          if (col === 'ID') return <span style={{ fontFamily: 'monospace' }}>{val}</span>;
          if (col === 'Task Name') return <strong>{val}</strong>;
          if (col === 'Owner') {
             return (
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-full bg-primary-fixed flex items-center justify-center text-primary text-[10px] font-bold">
                   {typeof val === 'string' && val ? val.charAt(0).toUpperCase() : '?'}
                 </div>
                 <span className="text-body-md text-text-main">{val}</span>
               </div>
             );
          }
          if (col === 'Priority') {
             let colorClass = 'bg-surface-container-high text-text-muted';
             if (val === 'High' || val === 'Critical') colorClass = 'bg-danger/10 text-danger';
             if (val === 'Medium') colorClass = 'bg-warning/10 text-warning';
             if (val === 'Low') colorClass = 'bg-success/10 text-success';
             return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{val}</span>;
          }
          if (col === 'Status') {
            let colorClass = 'bg-surface-container-high text-text-muted'; // To Do
            if (val === 'In Progress') colorClass = 'bg-primary/10 text-primary';
            if (val === 'Done' || val === 'Closed') colorClass = 'bg-success/10 text-success';
            return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>{val}</span>;
          }
          if (col === 'Created Date') {
            try {
              return format(new Date(val), 'MMM dd, yyyy');
            } catch (e) {
              return val;
            }
          }

          const type = metadata[col] || 'text';
          if (type === 'date') {
            try { return format(new Date(val), 'MMM dd, yyyy'); } catch(e) { return val; }
          }
          if (type === 'attachment') {
            return (
              <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
                View
              </a>
            );
          }

          return val;
        }
      };
    });

    return [
      {
        id: 'expander',
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="action-icon"
              className="action-icon hover:bg-surface-container-high flex items-center justify-center rounded transition-colors"
              style={{ background: 'transparent', border: 'none', padding: '4px' }}
            >
              <span className="material-symbols-outlined text-text-muted hover:text-primary transition-colors text-xl">
                {row.getIsExpanded() ? 'expand_more' : 'chevron_right'}
              </span>
            </button>
          ) : null;
        },
      },
      {
        id: 'actions',
        enableSorting: false,
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 justify-start">
            <button
              onClick={() => onAddUpdate(row.original)}
              className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-text-muted transition-colors"
              title="Add Update"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
            </button>
            <button
              onClick={() => onEditTask(row.original)}
              className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-text-muted transition-colors"
              title="Edit Task"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(row.original);
                }
              }}
              className="w-8 h-8 rounded-lg hover:bg-danger/10 flex items-center justify-center text-danger transition-colors"
              title="Delete Task"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        ),
      },
      {
        id: 'serial_no',
        header: '#',
        enableSorting: false,
        cell: ({ row }) => {
          if (row.depth === 0) {
            return <span className="text-body-md text-text-muted font-semibold pl-2">{row.index + 1}</span>;
          }
          return null;
        }
      },
      {
        id: 'week_number',
        header: 'Week #',
        enableSorting: true,
        accessorFn: row => {
          let val = '-';
          if (row.updates && row.updates.length > 0) {
            val = row.updates[0].weekNumber || row.updates[0]['Week Number'] || '-';
          } else if (row['Week Number']) {
            val = row['Week Number'];
          } else if (row['Week #']) {
            val = row['Week #'];
          }
          // Normalize by removing 'Week ' prefix if it exists to keep it compact
          if (typeof val === 'string' && val.toLowerCase().startsWith('week ')) {
            return val.substring(5).trim();
          }
          return val;
        },
        cell: info => <span className="text-body-md text-text-muted">{info.getValue()}</span>
      },
      ...dynamicColumns
    ];
  }, [data.columns, data.metadata, onAddUpdate, onEditTask, onDeleteTask]);

  useEffect(() => {
    setColumnOrder(currentOrder => {
      const newColumnsIds = columns.map(c => c.id || c.accessorKey);
      if (currentOrder.length === 0) return newColumnsIds;
      
      // Enforce the fixed columns at the very beginning to avoid hot-reload/state glitches
      const fixedLeft = ['expander', 'actions', 'serial_no', 'week_number'];
      const currentDynamic = currentOrder.filter(id => !fixedLeft.includes(id) && newColumnsIds.includes(id));
      const missingDynamic = newColumnsIds.filter(id => !fixedLeft.includes(id) && !currentDynamic.includes(id));
      
      return [...fixedLeft, ...currentDynamic, ...missingDynamic];
    });
  }, [columns]);

  const table = useReactTable({
    data: data.tasks || [],
    columns,
    state: {
      expanded,
      sorting,
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    onExpandedChange: setExpanded,
    onSortingChange: setSorting,
    getSubRows: row => row.updates,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!data.columns || data.columns.length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No data available for this project.</div>;
  }

  return (
    <div className="bg-white rounded-xl border border-border-subtle shadow-sm overflow-hidden mb-8">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-border-subtle bg-surface-container-lowest">
              {headerGroup.headers.map(header => {
                const canDrag = header.id !== 'expander' && header.id !== 'actions';
                return (
                <th 
                  key={header.id}
                  draggable={canDrag}
                  onDragStart={(e) => {
                    if (canDrag) {
                      e.dataTransfer.setData('text/plain', header.id);
                      e.currentTarget.style.opacity = '0.5';
                    }
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onDragOver={(e) => {
                    if (canDrag) {
                      e.preventDefault(); // Necessary to allow dropping
                    }
                  }}
                  onDrop={(e) => {
                    if (!canDrag) return;
                    e.preventDefault();
                    const sourceColumnId = e.dataTransfer.getData('text/plain');
                    const targetColumnId = header.id;
                    
                    if (!sourceColumnId || sourceColumnId === targetColumnId) return;
                    if (sourceColumnId === 'expander' || sourceColumnId === 'actions') return;

                    setColumnOrder(oldOrder => {
                      const newOrder = [...oldOrder];
                      const sourceIndex = newOrder.indexOf(sourceColumnId);
                      const targetIndex = newOrder.indexOf(targetColumnId);
                      if (sourceIndex === -1 || targetIndex === -1) return newOrder;
                      
                      newOrder.splice(sourceIndex, 1);
                      newOrder.splice(targetIndex, 0, sourceColumnId);
                      return newOrder;
                    });
                  }}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  style={{ 
                    cursor: canDrag ? 'grab' : (header.column.getCanSort() ? 'pointer' : 'default'), 
                    userSelect: 'none'
                  }}
                  className={`px-6 py-4 text-label-sm font-label-sm text-text-muted uppercase tracking-widest ${header.id === 'actions' ? 'text-right' : 'text-left'}`}
                >
                  <div className={`flex items-center gap-2 ${header.id === 'actions' ? 'justify-end' : ''}`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {(() => {
                      const sorted = header.column.getIsSorted();
                      if (sorted === 'asc') return <span className="material-symbols-outlined text-sm">arrow_upward</span>;
                      if (sorted === 'desc') return <span className="material-symbols-outlined text-sm">arrow_downward</span>;
                      return null;
                    })()}
                  </div>
                </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {table.getRowModel().rows.map(row => {
            const isSubRow = row.depth > 0;
            return (
              <React.Fragment key={row.id}>
                <tr className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${isSubRow ? 'bg-surface-container-low/50' : ''}`}>
                  {row.getVisibleCells().map(cell => {
                    if (isSubRow) return null;
                    return (
                      <td key={cell.id} className="px-6 py-6 text-body-md text-text-main">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
                {/* Custom Sub-Row Rendering */}
                <AnimatePresence>
                  {row.getIsExpanded() && row.original.updates && row.original.updates.length > 0 && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={columns.length} className="px-6 py-0">
                        <div className="py-6 px-12 border-l-4 border-primary bg-surface-container-low/30 rounded-r-lg my-2 flex flex-col gap-4">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="border-b border-border-subtle">
                                <th className="py-2 text-label-sm font-label-sm text-text-muted uppercase">Update Date</th>
                                <th className="py-2 text-label-sm font-label-sm text-text-muted uppercase">Week #</th>
                                <th className="py-2 text-label-sm font-label-sm text-text-muted uppercase">Description</th>
                                {(data.updateColumns || [])
                                  .filter(c => !BASE_UPDATE_COLUMNS.includes(c))
                                  .map(c => <th key={c} className="py-2 text-label-sm font-label-sm text-text-muted uppercase">{c}</th>)}
                                <th className="py-2 text-label-sm font-label-sm text-text-muted uppercase text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-subtle">
                              {row.original.updates.map(update => (
                                <tr key={update.updateId} className="hover:bg-surface-container-low transition-colors">
                                  <td className="py-3 text-body-md text-text-main">
                                  {(() => {
                                    try {
                                      return format(new Date(update.updateDate), 'MMM dd, yyyy');
                                    } catch(e) {
                                      return update.updateDate;
                                    }
                                  })()}
                                  </td>
                                  <td className="py-3 text-body-md text-text-main">{update.weekNumber}</td>
                                  <td className="py-3 text-body-md text-text-main max-w-xs truncate" title={update.description}>{update.description}</td>
                                  {(data.updateColumns || [])
                                  .filter(c => !BASE_UPDATE_COLUMNS.includes(c))
                                  .map(c => {
                                    const val = update[c];
                                    const metaType = (data.metadata || {})[`Updates_${c}`] || 'text';
                                    let content = val;
                                    
                                    if (val && metaType === 'date') {
                                      try { content = format(new Date(val), 'MMM dd, yyyy'); } catch(e) {}
                                    } else if (val && metaType === 'attachment') {
                                      content = (
                                        <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                                          View
                                        </a>
                                      );
                                    }
                                    
                                    return <td key={c} className="py-3 text-body-md text-text-main">{content}</td>;
                                  })}
                                  <td className="py-3">
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        onClick={() => onEditUpdate(update)}
                                        className="w-8 h-8 rounded-lg hover:bg-surface-container-high flex items-center justify-center text-text-muted transition-colors"
                                        title="Edit Update"
                                      >
                                        <span className="material-symbols-outlined text-lg">edit</span>
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (window.confirm('Are you sure you want to delete this update?')) {
                                            onDeleteUpdate(update);
                                          }
                                        }}
                                        className="w-8 h-8 rounded-lg hover:bg-danger/10 flex items-center justify-center text-danger transition-colors"
                                        title="Delete Update"
                                      >
                                        <span className="material-symbols-outlined text-lg">delete</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                  {row.getIsExpanded() && (!row.original.updates || row.original.updates.length === 0) && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={columns.length} className="px-6 py-6 text-center text-text-muted bg-surface-container-low/30 border-l-4 border-border-subtle">
                        No updates yet. Click the + icon to add an update.
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
