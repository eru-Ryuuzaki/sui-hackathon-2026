import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useJournalForm } from '@/hooks/useJournalForm';
import { triggerAlert } from '@/components/ui/SystemAlert';
import { LOG_TEMPLATES, CATEGORY_COLORS, type LogTemplateCategory } from '@/data/logTemplates';
import { AttachmentUploader } from '@/components/ui/AttachmentUploader';
import { buildEngraveTx } from '@/utils/sui/transactions';
import { 
  Terminal as TerminalIcon, 
  Activity, 
  FileText, 
  Save, 
  XCircle, 
  Cloud,
  Smile,
  ChevronDown,
  Paperclip,
  Calendar,
  Clock,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { GlitchModal } from '@/components/ui/GlitchModal';

// --- Constants ---
const WEATHER_ICONS = ['☀️', '☁️', '🌧️', '⛈️', '❄️', '🌪️'];
const MOOD_ICONS = ['😊', '😐', '😔', '😡', '🤯', '😴'];
const COMMON_EMOJIS = ['💻', '📝', '🏃', '🍔', '🎮', '🎵', '📚', '💊', '💰', '🧹', '🚗', '✈️', '⛽', '💎', '📉'];

interface JournalEditorProps {
  onExit: () => void;
  constructId?: string; // Passed from parent if available
}

export function JournalEditor({ onExit, constructId }: JournalEditorProps) {
  const account = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { addLog } = useMemoryStore(); // Still used for local optimism/fallback
  
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customIcon, setCustomIcon] = useState('📝');
  const [customMessage, setCustomMessage] = useState('');

  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');

  const { 
    formState: {
        date, setDate,
        time, setTime,
        category, setCategory,
        type, setType,
        isEncrypted, setIsEncrypted,
        selectedTemplate, 
        isCustomMessage,
        body, 
        icon, 
        weather, setWeather,
        mood, setMood,
        attachments, setAttachments,
        showIconPicker, setShowIconPicker,
    },
    refs: { dateInputRef, timeInputRef },
    derived: { availableTypes, availableTemplates },
    handlers: {
        handleTemplateSelect,
        handleBodyChange,
        handleIconChange,
        validateDate,
        resetForm
    }
  } = useJournalForm();

  // Strict Map to Move Contract Enum:
  // 0:System, 1:Protocol, 2:Achievement, 3:Challenge, 4:Dream
  const CATEGORY_MAP: Record<LogTemplateCategory, number> = {
    system: 0,
    protocol: 1,
    achievement: 2,
    challenge: 3,
    dream: 4,
  };

  // Convert Mood String/Emoji to u8 (0-100)
  // Default neutral = 50
  const MOOD_MAP: Record<string, number> = {
     '😊': 75,
     '😐': 50,
     '😢': 25,
     '😡': 10,
     '🥳': 90,
     '😴': 40,
     '🤢': 20,
     '🤯': 80,
     '🥶': 30,
     '🥵': 30
  };

  const getMoodValue = (m: string) => MOOD_MAP[m] || 50;

  // Current Category Color
  const categoryColor = CATEGORY_COLORS[category];
  const validationError = validateDate();
  // Display template message if body is empty, ensuring preview is never blank
  const displayBody = body || selectedTemplate?.msg || '';
  // Removed manual truncation to let CSS handle it
  const sysTrace = `[${date} ${time}][${category.toUpperCase()}]${type}: ${icon} ${displayBody}`;

  const previewTrace = `[${date} ${time}][${category.toUpperCase()}]${type}: ${customIcon} ${customMessage.slice(0, 30)}${customMessage.length > 30 ? '...' : ''}`;


  const handleCustomModalConfirm = () => {
    handleIconChange(customIcon);
    handleBodyChange(customMessage);
    setIsCustomModalOpen(false);
    // Ensure we stay in MANUAL mode if confirmed
    setMode('MANUAL');
  };

  const handleManualInit = () => {
      setCustomIcon(icon || '📝');
      setCustomMessage(''); // Clear body for manual entry
      setIsCustomModalOpen(true);
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tmpl = availableTemplates.find(t => `${t.type}-${t.key || 'default'}` === e.target.value);
      if (tmpl) handleTemplateSelect(tmpl);
  };

  // Handle Submit (Write to Blockchain)
  const handleUpload = async () => {
    if (!account) return;
    
    // Display Body logic same as preview
    const finalContent = body || selectedTemplate?.msg || '';

    // Optimistic Update (Local State)
    addLog({
        content: finalContent,
        category: category,
        type: type as any,
        metadata: {
            date,
            time,
            icon,
            isEncrypted,
            mood,
            attachments
        }
    });

    try {
        // Construct Transaction
        // Current limitation: Move contract only accepts ONE blob_id and ONE media_type
        // We take the first attachment if available.
        const primaryAttachment = attachments.length > 0 ? attachments[0] : undefined;

        const tx = buildEngraveTx(
            constructId,
            finalContent,
            getMoodValue(mood), // Converted Mood
            CATEGORY_MAP[category], // Correct Category Enum
            isEncrypted,
            primaryAttachment?.blobId,
            primaryAttachment?.type // Pass Media Type
        );

        await signAndExecuteTransaction({ transaction: tx }, {
            onSuccess: (result) => {
                console.log('Engraved successfully:', result);
                resetForm();
                onExit();
            },
            onError: (err) => {
                console.error('Engraving failed:', err);
                // Ideally rollback optimistic update here
            }
        });
    } catch (e) {
        console.error("Failed to build transaction:", e);
    }
  };

  return (
    <>
    {/* Custom Message Modal */}
    <GlitchModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        title="CUSTOM TRACE CONFIGURATION"
        className="max-w-md border-neon-cyan/50 shadow-[0_0_50px_rgba(0,243,255,0.15)]"
    >
        <div className="space-y-4 font-mono">
            <div className="text-xs text-titanium-grey border-l-2 border-neon-cyan pl-2 py-1">
                &gt; INITIALIZE CUSTOM PROTOCOL.<br/>
                &gt; SELECT IDENTIFIER AND CONTENT.
            </div>

            {/* Icon Selection */}
            <div className="space-y-2">
                <label className="text-[10px] text-neon-cyan flex items-center gap-2">
                    ICON IDENTIFIER
                </label>
                <div className="grid grid-cols-8 gap-1 bg-white/5 p-2 rounded border border-titanium-grey/20">
                    {COMMON_EMOJIS.map(e => (
                        <button
                            key={e}
                            onClick={() => setCustomIcon(e)}
                            className={`aspect-square flex items-center justify-center rounded text-lg hover:bg-white/10 transition-colors ${customIcon === e ? 'bg-neon-cyan/20 ring-1 ring-neon-cyan' : ''}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {/* Message Body */}
            <div className="space-y-2">
                <label className="text-[10px] text-neon-cyan flex items-center gap-2">
                    TRACE CONTENT
                </label>
                <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Enter trace data..."
                    className="w-full bg-void-black border border-titanium-grey/50 p-3 focus:border-neon-cyan outline-none text-white text-sm font-mono h-32 resize-none"
                    autoFocus
                />
            </div>

             {/* Preview */}
             <div className="bg-void-black p-2 border border-titanium-grey/30 rounded text-[10px] text-titanium-grey break-all font-mono">
                  <span className="text-neon-cyan">&gt; PREVIEW:</span> {previewTrace}
             </div>

            <div className="flex justify-end gap-2 mt-4">
                <button 
                    onClick={() => setIsCustomModalOpen(false)}
                    className="px-4 py-2 text-titanium-grey hover:text-white transition-colors text-xs"
                >
                    [CANCEL]
                </button>
                <button 
                    onClick={handleCustomModalConfirm}
                    className="bg-neon-cyan text-void-black px-4 py-2 text-xs font-bold hover:bg-white transition-colors flex items-center gap-2"
                >
                    <Save size={12} /> CONFIRM
                </button>
            </div>
        </div>
    </GlitchModal>

    <div className="h-full flex flex-col p-4 overflow-hidden font-mono text-xs">
      {/* Header */}
      <div 
        className="flex justify-between items-center border-b pb-2 shrink-0 mb-4 transition-colors duration-300"
        style={{ borderColor: `${categoryColor}50` }} 
      >
        <div 
          className="flex items-center gap-2 transition-colors duration-300"
          style={{ color: categoryColor }}
        >
          <TerminalIcon size={14} />
          <span className="font-bold tracking-widest">KERNEL TRACE LOGGER</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-titanium-grey hover:text-glitch-red transition-colors">
            <XCircle size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Left Column: Waterfall Layout (Scrollable) */}
        <div className="w-[30%] flex flex-col gap-4 min-h-0">
          
          {/* Section 1: Configuration */}
          <div className="space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded animate-in fade-in slide-in-from-left-2">
            <div className="flex items-center justify-between">
                <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70">
                  <Activity size={12} /> SECTION 01: CONFIGURATION
                </div>
            </div>

            {/* Mode Switcher - Full Width */}
            <div className="flex border border-titanium-grey/30 rounded overflow-hidden text-[9px] shrink-0 w-full">
                <button 
                    onClick={() => setMode('AUTO')}
                    className={cn(
                        "flex-1 px-2 py-1 transition-colors whitespace-nowrap text-center",
                        mode === 'AUTO' ? "bg-neon-cyan text-void-black font-bold" : "text-titanium-grey hover:text-white"
                    )}
                >
                    🤖 AUTO
                </button>
                <div className="w-px bg-titanium-grey/30"></div>
                <button 
                    onClick={() => setMode('MANUAL')}
                    className={cn(
                        "flex-1 px-2 py-1 transition-colors whitespace-nowrap text-center",
                        mode === 'MANUAL' ? "bg-neon-purple text-void-black font-bold" : "text-titanium-grey hover:text-white"
                    )}
                >
                    ✍️ MANUAL
                </button>
            </div>
            
            <div className="space-y-3">
              {/* Row 1: Category & Type */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-titanium-grey">CATEGORY</label>
                  <div className="relative">
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value as LogTemplateCategory)} 
                      className="w-full bg-void-black border px-2 py-1 outline-none text-white appearance-none uppercase transition-colors duration-300 text-[10px]"
                      style={{ 
                        borderColor: `${categoryColor}80`,
                        boxShadow: `0 0 5px ${categoryColor}20` 
                      }}
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
                      className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none text-[10px]"
                    >
                      {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 2: Template (Auto) OR Manual Button (Manual) */}
              <div className="space-y-1 h-[42px] flex flex-col justify-end">
                 {mode === 'AUTO' ? (
                   <>
                    <label className="text-[10px] text-titanium-grey">TEMPLATE</label>
                    <div className="relative">
                      <select 
                        value={selectedTemplate ? `${selectedTemplate.type}-${selectedTemplate.key || 'default'}` : ''} 
                        onChange={handleTemplateChange}
                        className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none truncate text-[10px]"
                      >
                        {availableTemplates.map((t, idx) => (
                          <option key={idx} value={`${t.type}-${t.key || 'default'}`}>
                            {t.icon} {t.msg}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
                    </div>
                   </>
                 ) : (
                    <button 
                        onClick={handleManualInit}
                        className="w-full bg-transparent border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 hover:border-neon-purple transition-all px-3 py-1.5 text-[10px] font-bold tracking-widest flex items-center justify-center gap-2 group h-[32px]"
                    >
                        <span>&gt; INITIALIZE CUSTOM TRACE &lt;</span>
                    </button>
                 )}
              </div>

              {/* Row 3: Vitals (Weather & Mood) */}
              <div className="pt-2 border-t border-titanium-grey/20">
                <div className="flex flex-col gap-3">
                   {/* Weather Block */}
                   <div className="space-y-1.5">
                     <label className="text-[10px] text-titanium-grey flex items-center gap-1.5 font-bold tracking-wider">
                       <Cloud size={10} className="text-neon-cyan"/> 
                       WEATHER
                     </label>
                     <div className="grid grid-cols-6 gap-1 p-1 bg-void-black/50 border border-titanium-grey/10 rounded">
                        {WEATHER_ICONS.map(ic => (
                          <button 
                            key={ic} 
                            onClick={() => setWeather(ic)}
                            className={`aspect-square flex items-center justify-center rounded text-sm transition-all duration-200 ${
                              weather === ic 
                                ? 'bg-neon-cyan text-void-black scale-110 shadow-[0_0_8px_rgba(0,243,255,0.4)]' 
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                            title={ic}
                          >
                            {ic}
                          </button>
                        ))}
                     </div>
                   </div>

                   {/* Mood Block */}
                   <div className="space-y-1.5">
                     <label className="text-[10px] text-titanium-grey flex items-center gap-1.5 font-bold tracking-wider">
                       <Smile size={10} className="text-neon-cyan"/> 
                       MOOD
                     </label>
                     <div className="grid grid-cols-6 gap-1 p-1 bg-void-black/50 border border-titanium-grey/10 rounded">
                        {MOOD_ICONS.map(ic => (
                          <button 
                            key={ic} 
                            onClick={() => setMood(ic)}
                            className={`aspect-square flex items-center justify-center rounded text-sm transition-all duration-200 ${
                              mood === ic 
                                ? 'bg-neon-cyan text-void-black scale-110 shadow-[0_0_8px_rgba(0,243,255,0.4)]' 
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                            title={ic}
                          >
                            {ic}
                          </button>
                        ))}
                     </div>
                   </div>
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Artifacts */}
          <div className="flex flex-col border border-titanium-grey/20 p-3 bg-white/5 rounded animate-in fade-in slide-in-from-left-2 delay-100 flex-1 min-h-0">
            <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70 mb-3 shrink-0">
              <Paperclip size={12} /> SECTION 02: ARTIFACTS
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
              <AttachmentUploader 
                attachments={attachments} 
                onAttachmentsChange={setAttachments} 
                isEncryptedGlobal={isEncrypted}
              />
            </div>
          </div>

        </div>

        {/* Right Column: Editor (70%) */}
        <div className="w-[70%] flex flex-col gap-4">
          {/* Section 4: Log Body */}
          <div className="flex-1 space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded flex flex-col h-full">
            <div className="text-titanium-grey flex items-center justify-between font-bold opacity-70 shrink-0">
              <div className="flex items-center gap-2">
                <FileText size={12} /> SECTION 03: LOG BODY
              </div>

              {/* Date & Time Pickers - Split Button Group */}
              <div className="flex items-center bg-void-black border border-titanium-grey/30 rounded text-[10px] overflow-hidden">
                {/* Date Picker Trigger */}
                <div className="relative group border-r border-titanium-grey/30">
                  <button 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors text-titanium-grey whitespace-nowrap"
                  >
                    <Calendar size={12} />
                    <span>{date}</span>
                  </button>
                  {/* Hidden Date Input */}
                  <div className="absolute opacity-0 w-0 h-0 overflow-hidden">
                     <input 
                       ref={dateInputRef}
                       type="date" 
                       value={date} 
                       onChange={e => setDate(e.target.value)} 
                     />
                  </div>
                </div>

                {/* Time Picker Trigger */}
                <div className="relative group">
                  <button 
                    onClick={() => timeInputRef.current?.showPicker()}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-neon-cyan/10 hover:text-neon-cyan transition-colors text-titanium-grey whitespace-nowrap"
                  >
                    <Clock size={12} />
                    <span>{time}</span>
                  </button>
                  {/* Hidden Time Input */}
                  <div className="absolute opacity-0 w-0 h-0 overflow-hidden">
                     <input 
                       ref={timeInputRef}
                       type="time" 
                       value={time} 
                       onChange={e => setTime(e.target.value)} 
                     />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-void-black p-2 border-l-2 border-neon-cyan text-[10px] text-titanium-grey font-mono leading-relaxed mb-2 shrink-0 truncate h-[34px]">
              <span className="text-neon-cyan">&gt; PREVIEW:</span> {sysTrace}
            </div>

            <textarea 
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              placeholder="> Awaiting input..."
              className="flex-1 w-full bg-void-black border border-titanium-grey/50 p-4 focus:border-neon-cyan outline-none text-white resize-none scrollbar-thin text-sm leading-relaxed font-mono placeholder:text-titanium-grey/30"
              autoFocus
            />
          </div>
        </div>
      </div>


      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-2 border-t border-titanium-grey/30 mt-4 shrink-0">
        <div className="flex items-center gap-2">
            {/* Encryption Toggle */}
            <button 
              onClick={() => setIsEncrypted(!isEncrypted)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold tracking-wider border transition-all duration-300 w-32",
                isEncrypted 
                  ? "border-matrix-green text-matrix-green bg-matrix-green/10" 
                  : "border-titanium-grey text-titanium-grey hover:text-white"
              )}
              title={isEncrypted ? "Trace will be encrypted" : "Trace will be public"}
            >
              {isEncrypted ? <Lock size={12} /> : <Globe size={12} />}
              {isEncrypted ? "ENCRYPTED" : "PUBLIC"}
            </button>
        
            {validationError ? (
              <div className="px-4 py-2 border border-glitch-red text-glitch-red text-[10px] flex items-center gap-2 animate-pulse">
                <XCircle size={12} /> {validationError}
              </div>
            ) : (
              <button 
                className="bg-neon-cyan text-void-black px-6 py-2 font-bold hover:bg-white transition-colors flex items-center gap-2"
                onClick={handleUpload}
              >
                <Save size={14} /> UPLOAD TRACE
              </button>
            )}
        </div>
      </div>
    </div>
    </>
  );
}