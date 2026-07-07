import React from 'react';
import { TrendingUp, Flag, ClipboardList, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatCards({ type, stats, cards }) {
  if (type === 'yearly') {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Yearly Statistics</h3>
          <TrendingUp className="w-5 h-5 text-slate-400" />
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-slate-500">Overall Progress</span>
            <span className="text-[#0247c7]">{stats.progress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-[#0247c7] rounded-full"
            ></motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <div className="text-sm font-semibold text-slate-500">Total Tasks</div>
            <div className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{stats.totalTasks}</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}>
            <div className="text-sm font-semibold text-slate-500">Milestones</div>
            <div className="text-3xl font-black text-[#10b981] mt-1 tracking-tight">{stats.milestones}</div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (type === 'bottom' && cards) {
    const getIcon = (iconName, colorClass) => {
      switch(iconName) {
        case 'flag': return <Flag className={`w-5 h-5 ${colorClass}`} />;
        case 'clipboard-list': return <ClipboardList className={`w-5 h-5 ${colorClass}`} />;
        case 'check-circle': return <CheckCircle className={`w-5 h-5 ${colorClass}`} />;
        default: return null;
      }
    };

    const getColorClasses = (color) => {
      switch(color) {
        case 'blue': return { bg: 'bg-blue-50', text: 'text-blue-600' };
        case 'orange': return { bg: 'bg-orange-50', text: 'text-orange-500' };
        case 'green': return { bg: 'bg-emerald-50', text: 'text-emerald-500' };
        default: return { bg: 'bg-slate-50', text: 'text-slate-500' };
      }
    };

    return (
      <>
        {cards.map((card, idx) => {
          const colors = getColorClasses(card.color);
          return (
            <motion.div 
              key={idx} 
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer group"
            >
              <div className={`p-3 rounded-xl transition-colors ${colors.bg}`}>
                {getIcon(card.icon, colors.text)}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</div>
                <div className="text-[15px] font-black text-slate-900 mt-1 leading-tight tracking-tight group-hover:text-[#0247c7] transition-colors">{card.value}</div>
                <div className="text-[13px] font-medium text-slate-500 mt-1">{card.subValue}</div>
              </div>
            </motion.div>
          );
        })}
      </>
    );
  }

  return null;
}
