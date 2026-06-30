"use client";

import React, { useState, useMemo } from 'react';
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
          if (col === 'Status') {
            let colorClass = 'status-todo';
            if (val === 'In Progress') colorClass = 'status-inprogress';
            if (val === 'Done') colorClass = 'status-done';
            return <span className={`status-badge ${colorClass}`}>{val}</span>;
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
              <a href={val} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
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
              style={{ background: 'transparent', border: 'none' }}
            >
              {row.getIsExpanded() ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          ) : null;
        },
      },
      ...dynamicColumns,
      {
        id: 'actions',
        enableSorting: false,
        header: 'Actions',
        cell: ({ row }) => (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onAddUpdate(row.original)}
              className="action-icon"
              style={{ background: 'transparent', border: 'none' }}
              title="Add Update"
            >
              <PlusCircle size={18} />
            </button>
            <button
              onClick={() => onEditTask(row.original)}
              className="action-icon"
              style={{ background: 'transparent', border: 'none' }}
              title="Edit Task"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => {
                if(window.confirm('Are you sure you want to delete this task?')) {
                  onDeleteTask(row.original);
                }
              }}
              className="action-icon"
              style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)' }}
              title="Delete Task"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ),
      },
    ];
  }, [data.columns, data.metadata, onAddUpdate, onEditTask, onDeleteTask]);

  const table = useReactTable({
    data: data.tasks || [],
    columns,
    state: {
      expanded,
      sorting,
    },
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
    <div className="table-container">
      <table className="tracker-table">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  style={{ 
                    cursor: header.column.getCanSort() ? 'pointer' : 'default', 
                    userSelect: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ArrowUp size={14} />,
                      desc: <ArrowDown size={14} />,
                    }[header.column.getIsSorted()] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => {
            const isSubRow = row.depth > 0;
            return (
              <React.Fragment key={row.id}>
                <tr className={isSubRow ? 'sub-row' : ''}>
                  {row.getVisibleCells().map(cell => {
                    if (isSubRow) return null;
                    return (
                      <td key={cell.id}>
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
                      <td colSpan={columns.length} style={{ padding: '0 2rem 1rem 3rem' }}>
                        <table className="sub-table">
                          <thead>
                            <tr>
                              <th>Update Date</th>
                              <th>Week #</th>
                              <th>Description</th>
                              {(data.updateColumns || [])
                                .filter(c => !BASE_UPDATE_COLUMNS.includes(c))
                                .map(c => <th key={c}>{c}</th>)}
                              <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.updates.map(update => (
                              <tr key={update.updateId}>
                                <td>
                                  {(() => {
                                    try {
                                      return format(new Date(update.updateDate), 'MMM dd, yyyy');
                                    } catch(e) {
                                      return update.updateDate;
                                    }
                                  })()}
                                </td>
                                <td>{update.weekNumber}</td>
                                <td>{update.description}</td>
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
                                    
                                    return <td key={c}>{content}</td>;
                                  })}
                                <td>
                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => onEditUpdate(update)}
                                      className="action-icon"
                                      style={{ background: 'transparent', border: 'none', padding: '4px' }}
                                      title="Edit Update"
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this update?')) {
                                          onDeleteUpdate(update);
                                        }
                                      }}
                                      className="action-icon"
                                      style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', padding: '4px' }}
                                      title="Delete Update"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </motion.tr>
                  )}
                  {row.getIsExpanded() && (!row.original.updates || row.original.updates.length === 0) && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={columns.length} style={{ padding: '1rem 3rem', color: 'var(--text-secondary)' }}>
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
  );
}
