import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { getNextWorkingWeekDate } from '@/lib/dateUtils';

export default function AddTaskModal({ columns, metadata, onClose, onSave }) {
  const baseColumns = ['ID', 'Task Name', 'Owner', 'Status', 'Priority', 'Created Date', 'Next Update Due'];
  const customColumns = columns ? columns.filter(c => !baseColumns.includes(c)) : [];

  const defaultFields = ['Task Name', 'Owner', 'Status', 'Priority', 'Next Update Due', ...customColumns];
  const [fieldOrder, setFieldOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('addTaskFieldOrder');
      if (saved) {
        const parsed = JSON.parse(saved);
        const missing = defaultFields.filter(f => !parsed.includes(f));
        const valid = parsed.filter(f => defaultFields.includes(f));
        return [...valid, ...missing];
      }
    } catch(e) {}
    return defaultFields;
  });

  useEffect(() => {
    localStorage.setItem('addTaskFieldOrder', JSON.stringify(fieldOrder));
  }, [fieldOrder]);

  const [formData, setFormData] = useState({
    'Task Name': '',
    'Owner': '',
    'Status': 'To Do',
    'Priority': 'Medium',
    'Next Update Due': getNextWorkingWeekDate(),
    ...customColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {})
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (col, file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, [col]: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (e, field) => {
    e.dataTransfer.setData('text/plain', field);
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetField) => {
    e.preventDefault();
    const sourceField = e.dataTransfer.getData('text/plain');
    if (!sourceField || sourceField === targetField) return;

    setFieldOrder(prev => {
      const newOrder = [...prev];
      const sourceIndex = newOrder.indexOf(sourceField);
      const targetIndex = newOrder.indexOf(targetField);
      if (sourceIndex === -1 || targetIndex === -1) return newOrder;
      
      newOrder.splice(sourceIndex, 1);
      newOrder.splice(targetIndex, 0, sourceField);
      return newOrder;
    });
  };

  const renderField = (field) => {
    if (field === 'Task Name') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Task Name</label>
          <input required type="text" name="Task Name" value={formData['Task Name']} onChange={handleChange} className="form-input" placeholder="e.g., Implement Login Feature" />
        </div>
      );
    }
    if (field === 'Owner') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Owner</label>
          <input required type="text" name="Owner" value={formData['Owner']} onChange={handleChange} className="form-input" placeholder="e.g., John Doe" />
        </div>
      );
    }
    if (field === 'Status') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Status</label>
          <select name="Status" value={formData['Status']} onChange={handleChange} className="form-select">
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
      );
    }
    if (field === 'Priority') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Priority</label>
          <select name="Priority" value={formData['Priority']} onChange={handleChange} className="form-select">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      );
    }
    if (field === 'Next Update Due') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Next Update Due</label>
          <input type="date" name="Next Update Due" value={formData['Next Update Due']} onChange={handleChange} className="form-input" />
        </div>
      );
    }

    const type = metadata?.[field] || 'text';
    if (type === 'date') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{field}</label>
          <input type="date" name={field} value={formData[field] || ''} onChange={handleChange} className="form-input" />
        </div>
      );
    }
    if (type === 'attachment') {
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{field}</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input type="file" onChange={(e) => handleFileUpload(field, e.target.files[0])} style={{ display: 'none' }} id={`file-add-${field}`} />
            <label htmlFor={`file-add-${field}`} className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
            </label>
            {formData[field] && (
              <a href={formData[field]} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                Attached
              </a>
            )}
          </div>
        </div>
      );
    }
    if (type === 'dropdown') {
      const options = metadata?.options?.[field] || [];
      return (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">{field}</label>
          <select name={field} value={formData[field] || ''} onChange={handleChange} className="form-select">
            <option value="">-- Select --</option>
            {options.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">{field}</label>
        <input type="text" name={field} value={formData[field] || ''} onChange={handleChange} className="form-input" />
      </div>
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      'ID': 'TSK-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
      'Created Date': new Date().toISOString(),
      ...formData
    });
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="modal-title" style={{ margin: 0 }}>Add New Task</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {fieldOrder.map(field => (
              <div 
                key={field}
                draggable
                onDragStart={(e) => handleDragStart(e, field)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, field)}
                style={{ 
                  cursor: 'grab', 
                  padding: '0.5rem', 
                  border: '1px dashed transparent',
                  backgroundColor: 'transparent',
                  transition: 'border-color 0.2s',
                  borderRadius: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
              >
                {renderField(field)}
              </div>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Task</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
