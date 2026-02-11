import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { MemoryLog } from '@/hooks/useMemoryStore';
import { extractIcon } from '@/utils/logHelpers';
import { Card } from '@/components/ui/Card';

interface HiveMindCalendarProps {
  logs: MemoryLog[];
  // isOpen: boolean; // Removed unused
  // onClose: () => void; // Removed unused
  onDateClick: (date: Date, logId?: string) => void;
}

export function HiveMindCalendar({ logs, onDateClick }: HiveMindCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [isHovered, setIsHovered] = useState(false); // Removed unused
  const [globalTick, setGlobalTick] = useState(0);

  // Global Ticker for rotating logs on the same day
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalTick(t => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- Sync Hovered Log with Carousel ---
  // No explicit useEffect needed if we render derived from hoveredDate + globalTick
  
  // New State for Tooltip: Store the DATE being hovered, not the specific log
  const [hoveredDate, setHoveredDate] = useState<{ date: Date; rect: DOMRect } | null>(null);

  // ... (Update handlers below)

  // Derive calendar days
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

  const calendarDays: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    calendarDays.push(d);
  }

  // Group logs by date (Using metadata.date if available, fallback to timestamp)
  const logsByDate = new Map<string, MemoryLog[]>();
  logs.forEach(log => {
    // Determine Date Source: Metadata > Timestamp
    let d: Date;
    if (log.metadata && log.metadata.date) {
        // Handle "YYYY-MM-DD" string manually to avoid timezone issues with new Date()
        const [y, m, day] = log.metadata.date.split('-').map(Number);
        d = new Date(y, m - 1, day);
    } else {
        d = new Date(log.timestamp);
    }
    
    const key = format(d, 'yyyy-MM-dd');
    if (!logsByDate.has(key)) logsByDate.set(key, []);
    logsByDate.get(key)!.push(log);
  });

  return (
    <Card 
      className="flex flex-col h-full overflow-hidden relative z-10 bg-void-black/80 backdrop-blur-sm border-none p-4"
    >
        {/* Header - Modular Cyberpunk Style */}
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <CalendarIcon size={20} className="text-neon-cyan" />
            <div className="flex flex-col leading-none">
               <span className="text-xl font-bold text-neon-cyan font-heading tracking-[0.2em] uppercase">
                 {format(currentMonth, 'MMMM')}
               </span>
               <span className="text-xs text-titanium-grey font-mono tracking-widest">
                 {format(currentMonth, 'yyyy')}
               </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/5 rounded-full text-titanium-grey hover:text-neon-cyan transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-white/5 rounded-full text-titanium-grey hover:text-neon-cyan transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Grid Header - Minimal */}
        <div className="grid grid-cols-7 mb-2 shrink-0 px-1">
          {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map((day, i) => (
            <div key={`${day}-${i}`} className="text-center text-[10px] text-titanium-grey/60 font-bold tracking-widest">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body - Modular Blocks with Gaps */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 gap-1.5 min-h-0">
          {calendarDays.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayLogs = logsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date());
            
            // Ticker Logic
  const activeLogIndex = dayLogs.length > 0 ? globalTick % dayLogs.length : 0;
  const activeLog = dayLogs[activeLogIndex];

  return (
    <div 
      key={day.toString()}
                onClick={() => {
                    // Pass the active log ID if available, otherwise just the date
                    if (activeLog && isCurrentMonth) {
                        onDateClick(day, activeLog.id);
                    } else {
                        onDateClick(day);
                    }
                }}
                onMouseEnter={(e) => {
                    if (activeLog && isCurrentMonth) {
                        setHoveredDate({ date: day, rect: e.currentTarget.getBoundingClientRect() });
                    }
                }}
                onMouseLeave={() => setHoveredDate(null)}
                className={cn(
                  "relative rounded transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center border",
                  // Base Styles
                  "bg-white/5 border-titanium-grey/10 hover:border-neon-cyan/50 hover:bg-white/10 hover:shadow-[0_0_10px_rgba(0,243,255,0.1)]",
                  // Dim non-current month
                  !isCurrentMonth && "opacity-30 border-transparent bg-transparent",
                  // Highlight Today
                  isToday && "border-neon-cyan bg-neon-cyan/10 shadow-[0_0_15px_rgba(0,243,255,0.2)]",
                  // Active Log Style
                  dayLogs.length > 0 && isCurrentMonth && "border-matrix-green/30 bg-matrix-green/5"
                )}
              >
                {/* Date Number - Dynamic Positioning */}
                <div className={cn(
                  "font-mono leading-none transition-all duration-300 absolute",
                  activeLog && isCurrentMonth 
                    ? "top-0.5 left-1 text-[8px] text-white/70" // Has log: Top-left, small, brighter
                    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs", // No log: Center, normal
                  isToday && !activeLog && isCurrentMonth && "text-neon-cyan font-bold scale-110",
                  isToday && activeLog && isCurrentMonth && "text-neon-cyan font-bold",
                  !isCurrentMonth && "text-titanium-grey/30"
                )}>
                  {format(day, 'd')}
                </div>

                {/* Content - Centered Icon */}
                {activeLog && isCurrentMonth && (
                  <div className="flex items-center justify-center w-full h-full pt-1.5 pl-0.5">
                    <span className="text-[10px] filter drop-shadow-[0_0_5px_rgba(0,255,65,0.4)] transition-all duration-500 transform group-hover:scale-110 group-hover:-translate-y-0.5">
                      {extractIcon(activeLog)}
                    </span>
                  </div>
                )}

                {/* Multi-log Indicator - Bottom Right Dot */}
                {dayLogs.length > 1 && isCurrentMonth && (
                  <div className="absolute bottom-1.5 right-1.5 flex gap-0.5">
                     <div className="w-1 h-1 rounded-full bg-neon-cyan animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Portal Tooltip */}
        {hoveredDate && (() => {
            const dateKey = format(hoveredDate.date, 'yyyy-MM-dd');
            const logs = logsByDate.get(dateKey) || [];
            const activeIndex = logs.length > 0 ? globalTick % logs.length : 0;
            const currentLog = logs[activeIndex];
            
            if (!currentLog) return null;

            return createPortal(
            <div 
                className="fixed z-[9999] pointer-events-none w-40 p-2 bg-void-black/90 border border-neon-cyan/30 text-[10px] rounded shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                style={{
                    top: hoveredDate.rect.top - 10, // Just above the cell
                    left: hoveredDate.rect.left + (hoveredDate.rect.width / 2),
                    transform: 'translate(-50%, -100%)'
                }}
            >
                <div className="flex justify-between items-center mb-1 border-b border-white/10 pb-1">
                    <span className="text-neon-cyan font-bold font-mono">{format(new Date(currentLog.timestamp), 'HH:mm')}</span>
                    <span className="text-[8px] text-titanium-grey bg-white/10 px-1 rounded">LOG</span>
                </div>
                <div className="text-white leading-relaxed line-clamp-3">{currentLog.content}</div>
                
                {/* Tiny triangle pointer */}
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-void-black border-r border-b border-neon-cyan/30 transform rotate-45" />
            </div>,
            document.body
            );
        })()}
    </Card>
  );
}
