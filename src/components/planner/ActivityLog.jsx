import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const FULL_MONTHS = {
  JAN: 'January', FEB: 'February', MAR: 'March', APR: 'April', MAY: 'May', JUN: 'June',
  JUL: 'July', AUG: 'August', SEP: 'September', OCT: 'October', NOV: 'November', DEC: 'December'
};

export default function ActivityLog({ events, wheelEvents, currentMonth, categories, onGoalClick }) {
  const [filterMonth, setFilterMonth] = useState(currentMonth || 'ALL');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const getCategoryColor = (catId) => {
    const cat = categories?.find(c => c.id === catId);
    return cat ? cat.color : '#cbd5e1';
  };

  const filteredEvents = events.filter(g => {
    if (filterMonth === 'ALL') return true;
    return wheelEvents?.some(e => e.originalId === g.id && e.month === filterMonth);
  });

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex items-center justify-between p-6 pb-0 mb-6">
        <div>
          <h3 className="font-semibold text-slate-900">
            {filterMonth === 'ALL' ? 'All Activity Log' : `${FULL_MONTHS[filterMonth]} Activity Log`}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-0.5">{filteredEvents.length} active tasks {filterMonth === 'ALL' ? '' : 'this month'}</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 rounded-lg transition-colors ${isDropdownOpen ? 'bg-blue-50 text-blue-600' : 'hover:bg-slate-50 text-slate-400 hover:text-slate-600'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
          
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-50 max-h-64 overflow-y-auto custom-scrollbar"
              >
                <button
                  onClick={() => { setFilterMonth('ALL'); setIsDropdownOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                >
                  <span className={filterMonth === 'ALL' ? 'font-bold text-blue-600' : 'text-slate-700 font-medium'}>All Months</span>
                  {filterMonth === 'ALL' && <Check className="w-4 h-4 text-blue-600" />}
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                {MONTHS.map(month => (
                  <button
                    key={month}
                    onClick={() => { setFilterMonth(month); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className={filterMonth === month ? 'font-bold text-blue-600' : 'text-slate-700 font-medium'}>{FULL_MONTHS[month]}</span>
                    {filterMonth === month && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-6 relative">
        {filteredEvents.map((event, idx) => (
          <motion.div 
            key={event.id} 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.8 + (idx * 0.1) }}
            className="flex items-start gap-4 group cursor-pointer"
            onClick={() => onGoalClick && onGoalClick(event.id)}
          >
            <div 
              className="mt-[5px] w-2 h-2 rounded-full shrink-0 shadow-sm" 
              style={{ backgroundColor: getCategoryColor(event.category) }}
            ></div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <h4 className="text-sm font-bold text-slate-900 leading-tight tracking-tight group-hover:text-[#0247c7] transition-colors">{event.title}</h4>
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0">{event.date}</span>
              </div>
              
              {event.description && event.description.trim() !== event.title.trim() && (
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed font-medium">
                  {event.description}
                </p>
              )}
              
              {event.tags && event.tags.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 mt-3">
                  {event.tags.map((tag, tagIdx) => (
                    <span 
                      key={tagIdx} 
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${
                        tag.type === 'priority' ? 'bg-blue-50 text-blue-600' :
                        tag.type === 'status' ? 'bg-emerald-50 text-emerald-600' :
                        'text-slate-400'
                      }`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 border-t border-slate-100">
        <button className="w-full text-sm font-semibold text-[#0247c7] hover:text-blue-800 transition-colors">
          View All {filterMonth === 'ALL' ? '' : FULL_MONTHS[filterMonth].substring(0, 3)} Events
        </button>
      </div>
    </div>
  );
}
