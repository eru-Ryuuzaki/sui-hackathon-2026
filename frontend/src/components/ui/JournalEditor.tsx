import { useState, useEffect, useMemo } from 'react';
import { useUserStore } from '@/hooks/useUserStore';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { format, differenceInSeconds, isBefore, isAfter } from 'date-fns';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { LOG_TEMPLATES, getTypesForCategory, getTemplates, type LogTemplateCategory, type LogTemplateItem } from '@/data/logTemplates';
import { 
  Terminal as TerminalIcon, 
  Activity, 
  FileText, 
  Save, 
  XCircle, 
  Cloud,
  Smile,
  Zap,
  ChevronDown
} from 'lucide-react';

// --- Constants ---
const WEATHER_ICONS = ['☀️', '☁️', '🌧️', '⛈️', '❄️', '🌪️'];
const MOOD_ICONS = ['😊', '😐', '😔', '😡', '🤯', '😴'];
const COMMON_EMOJIS = ['💻', '📝', '🏃', '🍔', '🎮', '🎵', '📚', '💊', '💰', '🧹', '🚗', '✈️'];

interface JournalEditorProps {
  onExit: () => void;
}

export function JournalEditor({ onExit }: JournalEditorProps) {
  const account = useCurrentAccount();
  const { currentUser, updateBirthday } = useUserStore();
  const { addLog } = useMemoryStore();
  
  // Form State
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [category, setCategory] = useState<LogTemplateCategory>('system');
  const [type, setType] = useState('INFO');
  
  // Template & Customization State
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplateItem | null>(null);
  const [isCustomMessage, setIsCustomMessage] = useState(false);
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('📝');
  
  const [energy, setEnergy] = useState(80);
  const [weather, setWeather] = useState('☀️');
  const [mood, setMood] = useState('😊');
  
  // Birthday Check
  const [showBirthdayInput, setShowBirthdayInput] = useState(!currentUser?.birthday);
  const [birthdayInput, setBirthdayInput] = useState('');

  // Life Frame Calculation
  const [lifeFrame, setLifeFrame] = useState(0);
  
  // UI State
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Derived State
  const availableTypes = useMemo(() => getTypesForCategory(category), [category]);
  const availableTemplates = useMemo(() => getTemplates(category, type), [category, type]);

  // --- Effects ---

  // 1. Category Change Logic
  useEffect(() => {
    // Reset Type to first available
    const types = getTypesForCategory(category);
    const newType = types[0] || 'INFO';
    setType(newType);
    
    // Reset Template
    setSelectedTemplate(null);
    setIsCustomMessage(false);

    // Special Case: System Category Auto-fill
    if (category === 'system') {
      const defaultTemplate = LOG_TEMPLATES.system[0]; // INFO check
      if (defaultTemplate) {
        setBody(defaultTemplate.msg);
        setIcon(defaultTemplate.icon);
        // Note: We don't mark as custom, so it can still be overridden by selecting another template
      }
    } else {
      // For other categories, reset to defaults
      setBody('');
      setIcon('📝');
    }
  }, [category]);

  // 2. Type Change Logic
  useEffect(() => {
    // If switching FROM system.INFO default msg, clear it
    if (category === 'system' && type !== 'INFO' && body === LOG_TEMPLATES.system[0]?.msg && !isCustomMessage) {
       setBody('');
       setIcon('📝');
    }
    // Reset template selection when type changes (unless it matches somehow, but simpler to reset)
    setSelectedTemplate(null);
  }, [type, category]);

  // 3. Life Frame Calculation
  useEffect(() => {
    if (!currentUser?.birthday) return;
    
    const birthDate = new Date(currentUser.birthday);
    const logDateTime = new Date(`${date}T${time}`);
    
    // Formula: (Current - Birth) seconds * 60fps
    const seconds = differenceInSeconds(logDateTime, birthDate);
    setLifeFrame(Math.max(0, seconds * 60));
  }, [date, time, currentUser?.birthday]);

  // --- Handlers ---

  const handleTemplateSelect = (tmpl: LogTemplateItem | 'custom') => {
    if (tmpl === 'custom') {
      setSelectedTemplate(null);
      setIsCustomMessage(true);
      setBody(''); // Clear for user input
    } else {
      setSelectedTemplate(tmpl);
      setIsCustomMessage(false);
      setBody(tmpl.msg);
      setIcon(tmpl.icon);
    }
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    setIsCustomMessage(true);
  };

  const handleIconChange = (newIcon: string) => {
    setIcon(newIcon);
    setShowIconPicker(false);
  };

  const handleSaveBirthday = () => {
    if (account && birthdayInput) {
      updateBirthday(account.address, birthdayInput);
      setShowBirthdayInput(false);
    }
  };

  // --- Validation ---
  const validateDate = (): string | null => {
    if (!currentUser?.birthday) return null;
    const logDate = new Date(`${date}T${time}`);
    const birthDate = new Date(currentUser.birthday);
    const now = new Date();
    
    if (isBefore(logDate, birthDate)) return "TIME PARADOX: DATE PRE-DATES ORIGIN";
    if (isAfter(logDate, now)) return "TIME PARADOX: FUTURE EVENTS PROHIBITED";
    return null;
  };

  const validationError = validateDate();
  const sysTrace = `[${date} ${time}][FRAME::${lifeFrame}][${category.toUpperCase()}]${type}: ${icon} ${body.slice(0, 30)}${body.length > 30 ? '...' : ''}`;

  if (showBirthdayInput) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-4 text-center animate-in fade-in">
        <div className="text-glitch-red font-mono text-xl animate-pulse">⚠️ KERNEL PANIC: MISSING ORIGIN TIMESTAMP</div>
        <div className="text-titanium-grey text-sm max-w-md">
          To calculate your Life Frames correctly, the system needs to know your character's spawn date.
        </div>
        <div className="flex gap-2">
          <input 
            type="date" 
            value={birthdayInput}
            onChange={(e) => setBirthdayInput(e.target.value)}
            className="bg-void-black border border-neon-cyan/50 text-neon-cyan px-4 py-2 font-mono outline-none focus:border-neon-cyan"
          />
          <button 
            onClick={handleSaveBirthday}
            disabled={!birthdayInput}
            className="bg-neon-cyan/10 border border-neon-cyan text-neon-cyan px-4 py-2 hover:bg-neon-cyan hover:text-void-black transition-all disabled:opacity-50"
          >
            INITIALIZE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4 overflow-y-auto scrollbar-none font-mono text-xs">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-titanium-grey/30 pb-2">
        <div className="flex items-center gap-2 text-neon-cyan">
          <TerminalIcon size={14} />
          <span className="font-bold tracking-widest">KERNEL TRACE LOGGER</span>
        </div>
        <button onClick={onExit} className="text-titanium-grey hover:text-glitch-red transition-colors">
          <XCircle size={16} />
        </button>
      </div>

      {/* Section 1: Kernel Trace */}
      <div className="space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded">
        <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70">
          <Activity size={12} /> SECTION 01: TRACE PARAMS
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey">TIMESTAMP</label>
            <div className="flex gap-2">
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white" />
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white" />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey">FRAME ID</label>
            <div className="bg-void-black border border-matrix-green/30 text-matrix-green px-2 py-1 font-bold">
              FRAME::{lifeFrame}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey">CATEGORY</label>
            <div className="relative">
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value as LogTemplateCategory)} 
                className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none uppercase"
              >
                {Object.keys(LOG_TEMPLATES).map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey">TYPE</label>
            <div className="relative">
              <select 
                value={type} 
                onChange={e => setType(e.target.value)} 
                className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none"
              >
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Template Selector */}
        <div className="space-y-1">
           <label className="text-[10px] text-titanium-grey">TEMPLATE</label>
           <div className="relative">
             <select 
               value={selectedTemplate ? `${selectedTemplate.type}-${selectedTemplate.key || 'default'}` : 'custom'} 
               onChange={(e) => {
                 if (e.target.value === 'custom') {
                   handleTemplateSelect('custom');
                 } else {
                   const tmpl = availableTemplates.find(t => `${t.type}-${t.key || 'default'}` === e.target.value);
                   if (tmpl) handleTemplateSelect(tmpl);
                 }
               }}
               className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none truncate"
             >
               <option value="custom">✍️ Custom Message</option>
               {availableTemplates.map((t, idx) => (
                 <option key={idx} value={`${t.type}-${t.key || 'default'}`}>
                   {t.icon} {t.msg}
                 </option>
               ))}
             </select>
             <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
           </div>
        </div>

        <div className="bg-void-black p-2 border-l-2 border-neon-cyan text-[10px] text-titanium-grey break-all font-mono leading-relaxed">
          <span className="text-neon-cyan">&gt; PREVIEW:</span> {sysTrace}
        </div>
      </div>

      {/* Section 2: Vitals */}
      <div className="space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded">
        <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70">
          <Zap size={12} /> SECTION 02: VITALS
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] text-titanium-grey flex justify-between">
              <span>ENERGY</span>
              <span>{energy}%</span>
            </label>
            <input 
              type="range" 
              min="0" max="100" 
              value={energy} 
              onChange={e => setEnergy(parseInt(e.target.value))}
              className="w-full h-1 bg-titanium-grey/30 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey block text-center"><Cloud size={10} className="inline"/> WEATHER</label>
            <div className="flex bg-void-black border border-titanium-grey/30 rounded overflow-hidden">
              {WEATHER_ICONS.map(icon => (
                <button 
                  key={icon} 
                  onClick={() => setWeather(icon)}
                  className={`px-1.5 py-1 hover:bg-white/10 ${weather === icon ? 'bg-neon-cyan/20' : ''}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-titanium-grey block text-center"><Smile size={10} className="inline"/> MOOD</label>
            <div className="flex bg-void-black border border-titanium-grey/30 rounded overflow-hidden">
              {MOOD_ICONS.map(icon => (
                <button 
                  key={icon} 
                  onClick={() => setMood(icon)}
                  className={`px-1.5 py-1 hover:bg-white/10 ${mood === icon ? 'bg-neon-cyan/20' : ''}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Diary */}
      <div className="flex-1 space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded flex flex-col min-h-0">
        <div className="text-titanium-grey flex items-center justify-between font-bold opacity-70 shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={12} /> SECTION 03: LOG BODY
          </div>
          
          {/* Icon Picker Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center gap-1 bg-void-black border border-titanium-grey/30 px-2 py-0.5 rounded text-[10px] hover:border-neon-cyan transition-colors"
            >
              <span>ICON:</span>
              <span className="text-base leading-none">{icon}</span>
            </button>
            
            {showIconPicker && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-void-black border border-neon-cyan p-2 rounded shadow-[0_0_15px_rgba(0,243,255,0.2)] grid grid-cols-6 gap-1 w-48">
                {COMMON_EMOJIS.map(e => (
                  <button 
                    key={e} 
                    onClick={() => handleIconChange(e)}
                    className="p-1 hover:bg-white/10 rounded text-lg text-center"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <textarea 
          value={body}
          onChange={e => handleBodyChange(e.target.value)}
          placeholder="Enter log details or select a template..."
          className="flex-1 w-full bg-void-black border border-titanium-grey/50 p-2 focus:border-neon-cyan outline-none text-white resize-none scrollbar-thin"
        />
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-2 border-t border-titanium-grey/30">
        <button onClick={onExit} className="px-4 py-2 text-titanium-grey hover:text-white transition-colors">
          [CANCEL]
        </button>
        
        {validationError ? (
          <div className="px-4 py-2 border border-glitch-red text-glitch-red text-[10px] flex items-center gap-2 animate-pulse">
            <XCircle size={12} /> {validationError}
          </div>
        ) : (
          <button 
            className="bg-neon-cyan text-void-black px-6 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2"
            onClick={() => {
              addLog({
                content: body || (selectedTemplate?.msg || 'No content provided.'),
                category: category,
                type: type as any,
                metadata: {
                  energy,
                  weather,
                  mood,
                  lifeFrame,
                  icon // Include selected icon
                }
              });
              triggerAlert({
                type: 'success',
                title: 'TRACE UPLOADED',
                message: 'Journal entry successfully synchronized to Hive Mind.',
                duration: 3000
              });
              onExit();
            }}
          >
            <Save size={14} /> UPLOAD TRACE
          </button>
        )}
      </div>
    </div>
  );
}
