import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { getISOWeek } from 'date-fns';

const BASE_UPDATE_COLUMNS = ['Update ID', 'Task ID', 'Task Name', 'Week Number', 'Update Date', 'Description'];

export default function WeeklySummaryModal({ data, onClose }) {
  const [weekNumber, setWeekNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setWeekNumber(getISOWeek(new Date()).toString());
  }, []);

  const summaryText = useMemo(() => {
    if (!weekNumber || !data.updates) return '';

    const customColumns = (data.updateColumns || []).filter(c => !BASE_UPDATE_COLUMNS.includes(c));
    const targetWeek = parseInt(weekNumber, 10);
    
    // Filter updates for the week
    const weekUpdates = data.updates.filter(u => parseInt(u.weekNumber, 10) === targetWeek);
    
    if (weekUpdates.length === 0) {
      return `No updates found for week ${weekNumber}.`;
    }

    // Group by Task Name
    const grouped = weekUpdates.reduce((acc, update) => {
      if (!acc[update.taskName]) acc[update.taskName] = [];
      acc[update.taskName].push(update);
      return acc;
    }, {});

    let text = `Weekly Summary - Week ${weekNumber}\n`;
    text += `================================\n\n`;

    for (const [taskName, updates] of Object.entries(grouped)) {
      text += `Task: ${taskName}\n`;
      text += `-----------------\n`;
      
      updates.forEach((update, idx) => {
        if (updates.length > 1) text += `Update ${idx + 1}:\n`;
        text += `- Description: ${update.description}\n`;
        
        customColumns.forEach(col => {
          if (update[col]) {
            text += `- ${col}: ${update[col]}\n`;
          }
        });
        
        if (idx < updates.length - 1) text += '\n';
      });
      
      text += `\n`;
    }

    return text;
  }, [weekNumber, data.updates, data.updateColumns]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ maxWidth: '600px', width: '90%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Weekly Summary</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Select Week Number</label>
          <input 
            type="number" 
            value={weekNumber} 
            onChange={(e) => setWeekNumber(e.target.value)} 
            className="form-input" 
            placeholder="e.g. 26"
          />
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Summary Output</label>
            <button 
              onClick={handleCopy} 
              className="btn btn-secondary" 
              style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              disabled={!summaryText || summaryText.startsWith('No updates')}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
          <textarea 
            readOnly
            rows={12}
            value={summaryText}
            className="form-textarea"
            style={{ fontFamily: 'monospace', fontSize: '0.875rem', backgroundColor: 'var(--bg-color)' }}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
