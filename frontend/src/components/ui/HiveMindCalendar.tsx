import { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  startOfWeek, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

// --- Types ---
interface CalendarLog {
  id: string;
  date: Date;
  content: string;
  icon?: string;
  emotionVal: number; // 0-100
}

interface HiveMindCalendarProps {
  logs: CalendarLog[];
  isOpen: boolean;
  onClose: () => void;
  onDateClick: (date: Date) => void;
}

// --- Helper: Extract Icon ---
  function extractIcon(log: CalendarLog): string {
    if (log.icon) return log.icon;
    
    // Check if content is empty
    if (!log.content) return '?';
    
    // NEW: Handle split content (Summary is first part)
    // We only want to search for emojis in the summary, not the whole body
    const summary = log.content.split('\n\n')[0];
    
    // Try regex match emoji
    const emojiMatch = summary.match(/[\u{1F300}-\u{1F9FF}]/u);
    if (emojiMatch) return emojiMatch[0];
  
    // Fallback to first char
    return summary.charAt(0).toUpperCase();
  }

export function HiveMindCalendar({ logs, isOpen, onDateClick }: HiveMindCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [globalTick, setGlobalTick] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // --- Global Ticker (2s interval) ---
  useEffect(() => {
    if (!isOpen || isHovered) return;
    const interval = setInterval(() => {
      setGlobalTick(t => t + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen, isHovered]);

  // --- Calendar Grid Generation (Fixed 6 Rows) ---
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    
    // Always generate 42 days (6 weeks * 7 days) to keep height constant
    return Array.from({ length: 42 }).map((_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  }, [currentMonth]);

  // --- Group Logs by Date ---
  const logsByDate = useMemo(() => {
    const map = new Map<string, CalendarLog[]>();
    logs.forEach(log => {
      const key = format(log.date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(log);
    });
    return map;
  }, [logs]);

  // if (!isOpen) return null; // Removed Modal Logic

  return (
    <Card 
      className="flex flex-col h-full overflow-hidden relative z-10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-titanium-grey/30 bg-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
            <span className="text-neon-cyan text-sm font-heading tracking-widest">
              CALENDAR // {format(currentMonth, 'yyyy.MM')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-mono">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1 hover:text-neon-cyan transition-colors"
            >
              [&lt;]
            </button>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1 hover:text-neon-cyan transition-colors"
            >
              [&gt;]
            </button>
          </div>
        </div>

        {/* Grid Header */}
        <div className="grid grid-cols-7 border-b border-titanium-grey/30 bg-void-black shrink-0">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={`${day}-${i}`} className="py-1 text-center text-[10px] text-titanium-grey font-mono">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="grid grid-cols-7 grid-rows-6 flex-1 bg-void-black/50 min-h-0">
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
                onClick={() => onDateClick(day)}
                className={cn(
                  "relative border-r border-b border-titanium-grey/10 transition-all hover:bg-white/5 cursor-pointer group flex flex-col items-center justify-center",
                  !isCurrentMonth && "opacity-60 grayscale bg-void-black",
                  isToday && "shadow-[inset_0_0_10px_rgba(0,243,255,0.2)] bg-neon-cyan/5",
                  dayLogs.length > 0 && isCurrentMonth && "bg-matrix-green/5"
                )}
              >
                {/* Date Number */}
                <div className={cn(
                  "absolute top-0.5 left-1 text-[9px] font-mono leading-none",
                  isToday ? "text-neon-cyan font-bold" : "text-titanium-grey/50"
                )}>
                  {format(day, 'd')}
                </div>

                {/* Content - Ticker Icon */}
                {activeLog && isCurrentMonth && (
                  <div className="flex items-center justify-center">
                    <span className="text-sm filter drop-shadow-[0_0_3px_rgba(0,255,65,0.5)] transition-all duration-500 transform group-hover:scale-110">
                      {extractIcon(activeLog)}
                    </span>
                  </div>
                )}

                {/* Indicators (Dots) */}
                {dayLogs.length > 1 && isCurrentMonth && (
                  <div className="absolute bottom-0.5 right-1 flex gap-0.5">
                    {dayLogs.slice(0, 3).map((_, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "w-0.5 h-0.5 rounded-full",
                          idx === activeLogIndex ? "bg-neon-cyan" : "bg-titanium-grey/50"
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Tooltip */}
                {activeLog && isCurrentMonth && (
                  <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 w-32 p-1.5 bg-void-black/95 border border-titanium-grey text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none backdrop-blur-md shadow-xl">
                    <div className="text-neon-cyan mb-0.5 font-mono">{format(activeLog.date, 'HH:mm')}</div>
                    <div className="text-white line-clamp-2 leading-tight">{activeLog.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
    </Card>
  );
}
