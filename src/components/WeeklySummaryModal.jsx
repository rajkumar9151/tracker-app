import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Sparkles, Settings, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { getISOWeek } from 'date-fns';

const BASE_UPDATE_COLUMNS = ['Update ID', 'Task ID', 'Task Name', 'Week Number', 'Update Date', 'Description'];

const DEFAULT_PROMPT = `You are a professional project manager. Write a concise, professional, and well-structured email to stakeholders summarizing the project's progress for Week {{WEEK_NUMBER}}.

### General Project Updates this week:
{{GENERAL_UPDATES}}

### Specific Task Updates this week:
{{TASK_UPDATES}}

Write the email with a subject line at the top. Be professional, highlighting key accomplishments and overall status. Do not invent any facts that are not present in the data provided above. Sign off as 'Project Management Team'.`;

export default function WeeklySummaryModal({ data, onClose, refreshData }) {
  const [weekNumber, setWeekNumber] = useState('');
  const [copied, setCopied] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummaryText, setAiSummaryText] = useState('');
  const [showSettings, setShowSettings] = useState(true);
  const [promptTemplate, setPromptTemplate] = useState(data.metadata?.aiPromptTemplate || DEFAULT_PROMPT);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(true);
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    setWeekNumber(getISOWeek(new Date()).toString());
  }, []);

  const summaryText = useMemo(() => {
    if (!weekNumber || !data.updates) return '';

    const customColumns = (data.updateColumns || []).filter(c => !BASE_UPDATE_COLUMNS.includes(c));
    const targetWeek = parseInt(weekNumber, 10);
    
    const extractWk = (val) => {
      if (!val) return 0;
      const m = String(val).match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };
    
    // Filter updates for the week
    const weekUpdates = (data.updates || []).filter(u => extractWk(u.weekNumber) === targetWeek);
    const weekProjectUpdates = (data.projectUpdates || []).filter(u => extractWk(u.weekNumber) === targetWeek && u.status !== 'Closed');
    
    if (weekUpdates.length === 0 && weekProjectUpdates.length === 0) {
      return `No updates found for week ${weekNumber}.`;
    }

    let text = `Weekly Summary - Week ${weekNumber}\n`;
    text += `================================\n\n`;

    if (weekProjectUpdates.length > 0) {
      text += `General Project Updates:\n`;
      text += `------------------------\n`;
      weekProjectUpdates.forEach(update => {
        text += `- [${update.status || 'Open'}] ${update.description}\n`;
      });
      text += `\n`;
    }

    if (weekUpdates.length > 0) {
      // Group by Region first, then by Task ID/Name
      const updatesByRegion = {};
      weekUpdates.forEach(update => {
        const task = (data.tasks || []).find(t => t['ID'] === update.taskId);
        const region = task ? (task['Region'] || task['REGION'] || task['region'] || 'Global') : 'Global';
        if (!updatesByRegion[region]) {
          updatesByRegion[region] = {};
        }
        const key = update.taskId || update.taskName;
        if (!updatesByRegion[region][key]) {
          updatesByRegion[region][key] = [];
        }
        updatesByRegion[region][key].push(update);
      });

      for (const [region, tasks] of Object.entries(updatesByRegion)) {
        text += `Region: ${region}\n`;
        text += `====================\n`;
        
        for (const [key, updates] of Object.entries(tasks)) {
          const taskName = updates[0].taskName || 'Unknown Task';
          const taskIdStr = updates[0].taskId ? ` [${updates[0].taskId}]` : '';
          text += `Task${taskIdStr}: ${taskName}\n`;
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
        text += `\n`;
      }
    }

    return text;
  }, [weekNumber, data.updates, data.projectUpdates, data.updateColumns]);

  const resolvedPrompt = useMemo(() => {
    if (!weekNumber) return promptTemplate;
    const targetWeek = parseInt(weekNumber, 10);
    const customColumns = (data.updateColumns || []).filter(c => !BASE_UPDATE_COLUMNS.includes(c));
    
    const extractWk = (val) => {
      if (!val) return 0;
      const m = String(val).match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    };

    const taskUpdates = (data.updates || []).filter(u => extractWk(u.weekNumber) === targetWeek);
    const projectUpdates = (data.projectUpdates || []).filter(u => extractWk(u.weekNumber) === targetWeek && u.status !== 'Closed');

    let generalUpdatesText = '';
    if (projectUpdates.length > 0) {
      projectUpdates.forEach(u => {
        generalUpdatesText += `- [Status: ${u.status || 'Open'}] ${u.description}\n`;
      });
    }

    let taskUpdatesText = '';
    if (taskUpdates.length > 0) {
      // Group by Region first, then by Task ID/Name
      const updatesByRegion = {};
      taskUpdates.forEach(u => {
        const task = (data.tasks || []).find(t => t['ID'] === u.taskId);
        const region = task ? (task['Region'] || task['REGION'] || task['region'] || 'Global') : 'Global';
        if (!updatesByRegion[region]) {
          updatesByRegion[region] = {};
        }
        const key = u.taskId || u.taskName;
        if (!updatesByRegion[region][key]) {
          updatesByRegion[region][key] = [];
        }
        updatesByRegion[region][key].push(u);
      });

      // Format updates by region
      for (const [region, tasks] of Object.entries(updatesByRegion)) {
        taskUpdatesText += `Region: ${region}\n`;
        taskUpdatesText += `====================\n`;
        for (const [key, updates] of Object.entries(tasks)) {
          const taskName = updates[0].taskName || 'Unknown Task';
          const taskIdStr = updates[0].taskId ? ` [${updates[0].taskId}]` : '';
          taskUpdatesText += `  Task${taskIdStr}: ${taskName}\n`;
          updates.forEach(u => {
            taskUpdatesText += `    - ${u.description}\n`;
            customColumns.forEach(col => {
              if (u[col]) {
                taskUpdatesText += `      * ${col}: ${u[col]}\n`;
              }
            });
          });
        }
        taskUpdatesText += `\n`;
      }
    }

    let prompt = promptTemplate;
    
    // Extract unique regions from the tasks updated this week
    const uniqueRegions = [...new Set(taskUpdates.map(u => {
      const task = (data.tasks || []).find(t => t['ID'] === u.taskId);
      return task ? (task['REGION'] || task['Region'] || task['region']) : null;
    }).filter(Boolean))].join(', ');

    prompt = prompt.replace('{{WEEK_NUMBER}}', weekNumber);
    prompt = prompt.replace('{{REGION}}', uniqueRegions || 'All Regions');
    prompt = prompt.replace('{{GENERAL_UPDATES}}', generalUpdatesText || 'No general project updates this week.');
    prompt = prompt.replace('{{TASK_UPDATES}}', taskUpdatesText || 'No specific task updates this week.');
    
    return prompt;
  }, [promptTemplate, weekNumber, data.updates, data.projectUpdates, data.updateColumns]);

  const displaySummary = aiSummaryText || summaryText;

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiPromptTemplate: promptTemplate })
      });
      if (res.ok) {
        if (refreshData) refreshData();
        setShowSettings(false);
      } else {
        alert('Failed to save settings');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!weekNumber) return;
    if (!passcode) {
      alert('Please enter the security passcode. Hint: Civic');
      return;
    }
    setAiGenerating(true);
    setAiSummaryText('');

    const targetWeek = parseInt(weekNumber, 10);
    const taskUpdates = (data.updates || []).filter(u => parseInt(u.weekNumber, 10) === targetWeek);
    const projectUpdates = (data.projectUpdates || []).filter(u => parseInt(u.weekNumber, 10) === targetWeek && u.status !== 'Closed');
    const customColumns = (data.updateColumns || []).filter(c => !BASE_UPDATE_COLUMNS.includes(c));

    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedPrompt, passcode })
      });
      const result = await res.json();
      if (res.ok && result.summary) {
        setAiSummaryText(result.summary);
      } else {
        alert(result.error || 'Failed to generate AI summary');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while calling AI API');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(displaySummary);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = displaySummary;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(textArea);
      }
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

        <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <div 
            onClick={() => setShowSettings(!showSettings)}
            style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <Settings size={16} /> AI Prompt Settings
            </div>
            {showSettings ? <ChevronUp size={16} color="var(--text-secondary)" /> : <ChevronDown size={16} color="var(--text-secondary)" />}
          </div>
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ borderTop: '1px solid var(--border-color)' }}
              >
                <div style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                    <button 
                      onClick={() => setShowPromptPreview(false)}
                      className={`text-sm font-semibold transition-colors ${!showPromptPreview ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      style={{ paddingBottom: '0.25rem' }}
                    >
                      Edit Template
                    </button>
                    <button 
                      onClick={() => setShowPromptPreview(true)}
                      className={`text-sm font-semibold transition-colors ${showPromptPreview ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                      style={{ paddingBottom: '0.25rem' }}
                    >
                      Preview Final Prompt
                    </button>
                  </div>
                  
                  {!showPromptPreview ? (
                    <>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', marginTop: 0 }}>
                        Customize the instructions sent to the AI. Use <code style={{ backgroundColor: 'var(--bg-color)', padding: '2px 4px', borderRadius: '4px' }}>{`{{WEEK_NUMBER}}`}</code>, <code style={{ backgroundColor: 'var(--bg-color)', padding: '2px 4px', borderRadius: '4px' }}>{`{{REGION}}`}</code>, <code style={{ backgroundColor: 'var(--bg-color)', padding: '2px 4px', borderRadius: '4px' }}>{`{{GENERAL_UPDATES}}`}</code>, and <code style={{ backgroundColor: 'var(--bg-color)', padding: '2px 4px', borderRadius: '4px' }}>{`{{TASK_UPDATES}}`}</code> as placeholders.
                      </p>
                      <textarea 
                        value={promptTemplate}
                        onChange={(e) => setPromptTemplate(e.target.value)}
                        className="form-textarea"
                        rows={8}
                        style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', gap: '0.5rem' }}>
                        <button onClick={() => setPromptTemplate(DEFAULT_PROMPT)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Reset Default</button>
                        <button onClick={handleSaveSettings} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} disabled={isSavingSettings}>
                          <Save size={14} /> {isSavingSettings ? 'Saving...' : 'Save Settings'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-y-auto max-h-64 custom-scrollbar text-xs font-mono text-slate-700 whitespace-pre-wrap">
                      {resolvedPrompt}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label className="form-label">AI Security Passcode</label>
          <input 
            type="password" 
            value={passcode} 
            onChange={(e) => setPasscode(e.target.value)} 
            className="form-input" 
            placeholder="Enter passcode (Hint: Civic)"
            style={{ width: '100%' }}
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleGenerateAI}
            className="btn btn-primary"
            disabled={aiGenerating || summaryText.startsWith('No updates')}
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              backgroundColor: '#a855f7',
              boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)',
              fontWeight: 600
            }}
          >
            {aiGenerating ? 'Generating...' : <><Sparkles size={18} /> Generate AI Email Summary</>}
          </button>
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
            value={displaySummary}
            className="form-textarea"
            style={{ fontFamily: aiSummaryText ? 'inherit' : 'monospace', fontSize: '0.875rem', backgroundColor: 'var(--bg-color)' }}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn btn-secondary">Close</button>
        </div>
      </motion.div>
    </div>
  );
}
