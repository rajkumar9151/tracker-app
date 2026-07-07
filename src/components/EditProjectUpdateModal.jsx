import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';

export default function EditProjectUpdateModal({ update, onClose, onSave }) {
  const [formData, setFormData] = useState({
    description: update.description || '',
    updateDate: update.updateDate ? new Date(update.updateDate).toISOString().split('T')[0] : '',
    weekNumber: update.weekNumber || '',
    attachment: update.attachment || '',
    status: update.status || 'Open'
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, attachment: data.url }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...update,
      ...formData,
      // If updateDate was changed to a YYYY-MM-DD string, convert back to ISO
      updateDate: formData.updateDate ? new Date(formData.updateDate).toISOString() : update.updateDate
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
          <h2 className="modal-title" style={{ margin: 0 }}>Edit General Update</h2>
          <button onClick={onClose} className="action-icon" style={{ background: 'transparent', border: 'none' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Update Date</label>
              <input type="date" name="updateDate" value={formData.updateDate} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Week Number</label>
              <input type="number" name="weekNumber" value={formData.weekNumber} onChange={handleChange} className="form-input" />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="form-select"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Update Description</label>
            <textarea 
              required 
              rows="4"
              name="description"
              value={formData.description} 
              onChange={handleChange} 
              className="form-textarea" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (Optional)</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} style={{ display: 'none' }} id="file-edit-pupd" />
              <label htmlFor="file-edit-pupd" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                <Upload size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
              </label>
              {formData.attachment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a href={formData.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>
                    Attached File
                  </a>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, attachment: '' }))} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>Save Changes</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
