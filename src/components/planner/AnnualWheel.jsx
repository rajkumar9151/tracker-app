import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Briefcase, DollarSign, Heart, Star, Activity, Home, Plane, Car, Book, Coffee, ShoppingBag, Circle, User, Users, Globe, Zap, Shield, Key } from 'lucide-react';

const ICON_MAP = {
  Target, Briefcase, DollarSign, Heart, Star, Activity, Home, Plane, Car, Book, Coffee, ShoppingBag, Circle, User, Users, Globe, Zap, Shield, Key
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: Number((centerX + (radius * Math.cos(angleInRadians))).toFixed(3)),
    y: Number((centerY + (radius * Math.sin(angleInRadians))).toFixed(3))
  };
};

// Helper to generate SVG path for an arc/wedge
const describeWedge = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", x, y, 
    "L", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y, 
    "Z"
  ].join(" ");
};

// Helper to generate an unclosed arc line (horizontal line in polar space)
const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  return [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

export default function AnnualWheel({ data }) {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState(null);
  const [timeFilter, setTimeFilter] = useState('week'); // 'all', 'month', 'week'

  const cx = 300;
  const cy = 300;
  const outerRadius = 240;
  
  // Calculate today's radius for the yellow highlight arc
  const today = new Date();
  const todayWeekOfMonth = Math.ceil(today.getDate() / 7);
  const todayWeekMultiplier = 0.4 + (todayWeekOfMonth * 0.1);
  const todayRadius = outerRadius * todayWeekMultiplier;
  
  // Calculate angle for a given month (JAN starts at top: -90deg)
  const getMonthAngle = (monthStr) => {
    const idx = MONTHS.indexOf(monthStr);
    return -90 + (idx * 30);
  };

  const getCategoryColor = (catId) => {
    const cat = data.categories?.find(c => c.id === catId);
    return cat ? cat.color : '#cbd5e1';
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div 
      className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start h-full w-full relative gap-8"
      onMouseMove={handleMouseMove}
    >
      {/* Legend (Left Side) */}
      <div className="flex flex-row md:flex-col items-start gap-4 flex-wrap md:mt-12 shrink-0">
        <div 
          onClick={() => setActiveCategory(null)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${activeCategory === null ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
        >
          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
            <Circle className="w-3.5 h-3.5" />
          </div>
          <span className={`text-sm font-bold tracking-wide ${activeCategory === null ? 'text-slate-800' : 'text-slate-500'}`}>All Goals</span>
        </div>
        {data.categories?.map(cat => {
          const isActive = activeCategory === cat.id;
          const IconComponent = ICON_MAP[cat.icon || 'Circle'] || Circle;
          return (
            <div 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${isActive ? 'bg-slate-100 shadow-sm' : 'hover:bg-slate-50'}`}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                <IconComponent className="w-3.5 h-3.5" />
              </div>
              <span className={`text-sm font-bold tracking-wide ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>{cat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Wheel SVG */}
      <svg viewBox="0 0 600 600" className="w-full max-w-[650px] h-auto antialiased flex-1" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.01))' }}>
        
        <defs>
          <radialGradient id="highlightWedge" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </radialGradient>
        </defs>

        {/* Concentric Grid Circles */}
        {[0.3, 0.6, 1.0].map((scale, i) => (
          <motion.circle 
            key={`grid-circle-${i}`}
            cx={cx} 
            cy={cy} 
            initial={{ r: 0, opacity: 0 }}
            animate={{ r: outerRadius * scale, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut", delay: i * 0.15 }}
            fill="none" 
            stroke="#f1f5f9" 
            strokeWidth="1.5"
            strokeDasharray={scale < 1 ? "4 4" : "none"}
          />
        ))}

        {/* Selected Month Highlight Wedge */}
        {data.currentMonth && (
          <motion.path
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
            transform={`translate(${cx}, ${cy}) scale(1) translate(${-cx}, ${-cy})`}
            d={describeWedge(cx, cy, outerRadius, getMonthAngle(data.currentMonth) - 15, getMonthAngle(data.currentMonth) + 15)}
            fill="url(#highlightWedge)"
            stroke="#3b82f6" 
            strokeWidth="2"
            className="transition-all duration-500"
          />
        )}

        {/* Today's Week Highlight Arc */}
        {data.currentMonth && (
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            d={describeArc(cx, cy, todayRadius, getMonthAngle(data.currentMonth) - 14, getMonthAngle(data.currentMonth) + 14)}
            fill="none"
            stroke="#fbbf24" // Yellow
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* Selected Month Bold Text */}
        {data.currentMonth && (
          <motion.text
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            x={cx}
            y={cy + 8}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontWeight="700"
            fontSize="18px"
            letterSpacing="2px"
            fill="#0247c7"
          >
            {data.currentMonth}
          </motion.text>
        )}
        {!data.currentMonth && (
          <text x={cx} y={cy + 5} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="12px" letterSpacing="1px" fill="#94a3b8" className="uppercase">
            Selected
          </text>
        )}

        {/* Radial Lines and Month Labels */}
        {MONTHS.map((month, idx) => {
          const angle = -90 + (idx * 30);
          const lineAngle = angle - 15; 
          const lineStart = polarToCartesian(cx, cy, outerRadius * 0.15, lineAngle);
          const lineEnd = polarToCartesian(cx, cy, outerRadius, lineAngle);
          const labelPos = polarToCartesian(cx, cy, outerRadius * 0.88, angle);
          const isSelected = data.currentMonth === month;

          return (
            <g key={month}>
              <motion.line 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                x1={lineStart.x} 
                y1={lineStart.y} 
                x2={lineEnd.x} 
                y2={lineEnd.y} 
                stroke="#f1f5f9" 
                strokeWidth="1.5"
              />
              {!isSelected && (
                <motion.text 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + (idx * 0.05) }}
                  x={labelPos.x} 
                  y={labelPos.y + 4} 
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fontSize="12px"
                  letterSpacing="1px"
                  fill="#94a3b8"
                >
                  {month}
                </motion.text>
              )}
            </g>
          );
        })}

        {/* Data Points */}
        {data.wheelEvents?.filter(e => !activeCategory || e.category === activeCategory).map((event, idx) => {
          const baseAngle = getMonthAngle(event.month);
          const finalAngle = baseAngle + (event.angleOffset || 0);
          const r = outerRadius * event.radius;
          const pos = polarToCartesian(cx, cy, r, finalAngle);
          
          const cat = data.categories?.find(c => c.id === event.category);
          const iconName = cat?.icon || 'Circle';
          const IconComponent = ICON_MAP[iconName] || Circle;
          const color = getCategoryColor(event.category);
          
          return (
            <g key={event.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <motion.g
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.5, filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))' }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.5, delay: 1 + (idx * 0.1) }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
              >
                {/* White background circle so lines don't show through the icon */}
                <circle cx="0" cy="0" r="8" fill="white" />
                {/* Render the icon properly centered */}
                <IconComponent 
                  x="-7" 
                  y="-7" 
                  width="14" 
                  height="14" 
                  color={color}
                  strokeWidth={2.5}
                />
              </motion.g>
            </g>
          );
        })}

      </svg>

      <AnimatePresence>
        {hoveredEvent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 pointer-events-none bg-slate-900 text-white rounded-lg shadow-xl p-3 border border-slate-700 max-w-[200px]"
            style={{
              left: mousePos.x + 15,
              top: mousePos.y + 15
            }}
          >
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: getCategoryColor(hoveredEvent.category) }}>
              {data.categories?.find(c => c.id === hoveredEvent.category)?.label || hoveredEvent.category}
            </div>
            <div className="text-sm font-medium leading-tight">
              {hoveredEvent.title || 'Event Details'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Goals List (Right Side) */}
      <div className="hidden lg:flex flex-col w-72 shrink-0 h-[600px] border-l border-slate-100 pl-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            <span className="material-symbols-outlined text-[18px] text-blue-600">list_alt</span>
            {activeCategory ? `${data.categories?.find(c => c.id === activeCategory)?.label} Goals` : 'All Active Goals'}
          </h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTimeFilter(timeFilter === 'month' ? 'all' : 'month')}
              className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border transition-all shrink-0 ${timeFilter === 'month' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              This Month
            </button>
            <button 
              onClick={() => setTimeFilter(timeFilter === 'week' ? 'all' : 'week')}
              className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded border transition-all shrink-0 ${timeFilter === 'week' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`}
            >
              This Week
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {data.activityLog?.filter(g => {
            if (activeCategory && g.category !== activeCategory) return false;
            
            if (timeFilter === 'week') {
              const hasEventThisWeek = data.wheelEvents?.some(e => 
                e.originalId === g.id && 
                e.month === data.currentMonth && 
                Math.abs(e.radius - todayWeekMultiplier) < 0.05
              );
              if (!hasEventThisWeek) return false;
            } else if (timeFilter === 'month') {
              const hasEventThisMonth = data.wheelEvents?.some(e => 
                e.originalId === g.id && 
                e.month === data.currentMonth
              );
              if (!hasEventThisMonth) return false;
            }
            
            return true;
          }).map((goal, idx) => {
            const cat = data.categories?.find(c => c.id === goal.category);
            const iconName = cat?.icon || 'Circle';
            const IconComponent = ICON_MAP[iconName] || Circle;
            const color = cat ? cat.color : '#cbd5e1';

            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="p-3 bg-white border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all group cursor-default flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15`, color: color }}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{goal.title}</h4>
                  <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }}></span>
                    {goal.date}
                  </p>
                </div>
              </motion.div>
            );
          })}
          
          {data.activityLog?.filter(g => {
            if (activeCategory && g.category !== activeCategory) return false;
            if (timeFilter === 'week') {
              const hasEventThisWeek = data.wheelEvents?.some(e => 
                e.originalId === g.id && 
                e.month === data.currentMonth && 
                Math.abs(e.radius - todayWeekMultiplier) < 0.05
              );
              if (!hasEventThisWeek) return false;
            } else if (timeFilter === 'month') {
              const hasEventThisMonth = data.wheelEvents?.some(e => 
                e.originalId === g.id && 
                e.month === data.currentMonth
              );
              if (!hasEventThisMonth) return false;
            }
            return true;
          }).length === 0 && (
            <div className="text-sm font-medium text-slate-400 text-center mt-10">No goals found.</div>
          )}
        </div>
      </div>

    </div>
  );
}
