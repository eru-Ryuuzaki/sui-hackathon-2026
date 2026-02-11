import { useState, useEffect } from 'react';
import { useLogService } from '@/hooks/useLogService';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { useJournalForm } from '@/hooks/useJournalForm';
import { CATEGORY_COLORS, LOG_TEMPLATES } from '@/data/logTemplates';
import { AttachmentUploader } from '@/components/ui/AttachmentUploader';
import { useGlobalLoader } from '@/components/ui/GlobalLoader';
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
  // const account = useCurrentAccount(); // Removed direct account dep
  const { createLog, fetchLogs, isMock } = useLogService();
  const { setLogs } = useMemoryStore(); // Still used for optimistic UI updates
  const loader = useGlobalLoader();
  
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customIcon, setCustomIcon] = useState('📝');
  const [customMessage, setCustomMessage] = useState('');

  const [mode, setMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [showSubmitWarning, setShowSubmitWarning] = useState(() => {
    return localStorage.getItem('ENGRAM_SUBMIT_WARNING') !== 'false';
  });
  const [isSubmitWarningOpen, setIsSubmitWarningOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const { 
    formState: {
        date, setDate,
        time, setTime,
        category, setCategory,
        type, setType,
        isEncrypted, setIsEncrypted,
        selectedTemplate, 
        body, 
        icon, 
        weather, setWeather,
        mood, setMood,
        attachments, setAttachments,
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

  // Sync customMessage/customIcon when template changes via useJournalForm
  // This handles the "Initial Load" and "Category/Type Change" cases
  useEffect(() => {
    if (selectedTemplate) {
        setCustomIcon(selectedTemplate.icon);
        setCustomMessage(selectedTemplate.msg);
    }
  }, [selectedTemplate]);

  // Strict Map to Move Contract Enum:
  // 0:System, 1:Protocol, 2:Achievement, 3:Challenge, 4:Dream
  /* const CATEGORY_MAP: Record<LogTemplateCategory, number> = {
    system: 0,
    protocol: 1,
    achievement: 2,
    challenge: 3,
    dream: 4,
  }; */

  // Convert Mood String/Emoji to u8 (0-100)
  // Default neutral = 50
  /* const MOOD_MAP: Record<string, number> = {
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

  const getMoodValue = (m: string) => MOOD_MAP[m] || 50; */

  // Current Category Color
  const categoryColor = CATEGORY_COLORS[category];
  // Strict Validation: Ensure Date is present
  const validationError = !date ? "DATE REQUIRED" : validateDate();
  // Display template message if body is empty, ensuring preview is never blank
  // const displayBody = body || selectedTemplate?.msg || ''; // Removed old logic
  
  // Unified Preview Logic
  // Both AUTO and MANUAL now use customIcon/customMessage for the Header part
  const sysTrace = `[${date} ${time}][${category.toUpperCase()}]${type}: ${customIcon} ${customMessage}`;

  const previewTrace = `[${date} ${time}][${category.toUpperCase()}]${type}: ${customIcon} ${customMessage.slice(0, 30)}${customMessage.length > 30 ? '...' : ''}`;


  const handleCustomModalConfirm = () => {
    handleIconChange(customIcon);
    // Don't overwrite body with customMessage anymore
    // handleBodyChange(customMessage); 
    setIsCustomModalOpen(false);
  };

  const handleManualInit = () => {
      setCustomIcon(icon || '📝');
      // Don't clear customMessage so user can edit it
      // setCustomMessage(''); 
      setIsCustomModalOpen(true);
  };
  
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const tmpl = availableTemplates.find(t => `${t.type}-${t.key || 'default'}` === e.target.value);
      if (tmpl) {
          handleTemplateSelect(tmpl);
          // Set customMessage to template msg for Unified Header Logic
          setCustomMessage(tmpl.msg);
          // Set customIcon to template icon
          setCustomIcon(tmpl.icon);
      }
  };

  // Handle Submit Confirmation
  const confirmUpload = async () => {
    setIsSubmitWarningOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('ENGRAM_SUBMIT_WARNING', 'false');
      setShowSubmitWarning(false);
    }
    await executeUpload();
  };

  const handleUploadClick = () => {
    if (showSubmitWarning) {
      setIsSubmitWarningOpen(true);
    } else {
      executeUpload();
    }
  };

  // Actual Upload Logic (Renamed from handleUpload)
  const executeUpload = async () => {
    // if (!account) return; // Service handles auth check if needed, or we can check here
    
    // Display Body logic same as preview
    // Now we combine Header (sysTrace/previewTrace) and Body (body) into one content string
    // Separated by double newline for parsing
    
    // Header Logic:
    // Unified: Always use customIcon/customMessage as base for header
    // In AUTO mode, customMessage/customIcon are populated by the template selection.
    // In MANUAL mode, they are populated by the modal.
    
    const headerContent = `[${date} ${time}][${category.toUpperCase()}]${type}: ${customIcon} ${customMessage}`;

    // Combine: Header + \n\n + Body
    const finalContent = `${headerContent}\n\n${body}`;

    const validAttachments = attachments
    .filter(a => a.status === 'uploaded' && a.blobId)
    .map(a => ({
        blobId: a.blobId!,
        name: a.file.name,
        type: a.file.type,
        size: a.file.size,
        isEncrypted: a.isEncrypted,
        encryptionIv: a.encryptionIv
    }));

    // Optimistic Update (Local State) - STILL DOING THIS FOR INSTANT FEEDBACK
    // But we might want to wait for "Mock" success if we want to simulate delay strictly
    // For now, let's keep it instant for better UX, or move it after await if user wants "loading"
    // User asked for "submit -> update calendar", implying a flow.
    // Let's SHOW LOADING STATE instead of instant optimistic update for better "simulation" feel
    // But existing code did optimistic. Let's keep optimistic for now, but maybe add a spinner?
    
    // Actually, let's wait for the service to return to "Simulate" the delay properly
    // addLog({ ... }); <--- Moved down

    try {
        if (!constructId) {
             throw new Error("Construct ID is missing");
        }
        
        loader.show(isMock ? "SIMULATING NEURAL UPLOAD..." : "ENGRAVING TO SUI BLOCKCHAIN...");

        const result = await createLog({
            constructId,
            content: finalContent,
            category,
            type,
            mood,
            isEncrypted,
            attachments: validAttachments
        });

        if (result.success) {
            console.log("Log created successfully:", result);
            
            // Trigger fetch from chain (via Indexer API) immediately
            // Instead of optimistic local update, we want to fetch the real deal.
            if (constructId) {
                 // Fetch logs and replace local store
                 fetchLogs(constructId).then(logs => {
                     if (logs.length > 0) {
                         setLogs(logs);
                         console.log("Store synced with chain:", logs.length);
                     }
                 });
            }

            resetForm();
            onExit();
        } else {
            console.error("Log creation failed:", result.error);
            // Trigger error alert?
        }

    } catch (e) {
        console.error("Failed to execute upload:", e);
    } finally {
        loader.hide();
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
                      onChange={e => setCategory(e.target.value as any)} 
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
            {/* MOCK Indicator */}
            {isMock && (
              <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-500 text-yellow-500 text-[9px] font-bold rounded animate-pulse">
                MOCK MODE
              </div>
            )}

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
                onClick={handleUploadClick}
              >
                <Save size={14} /> UPLOAD TRACE
              </button>
            )}
        </div>
      </div>
    </div>

    {/* Submit Warning Modal */}
    <GlitchModal
        isOpen={isSubmitWarningOpen}
        onClose={() => setIsSubmitWarningOpen(false)}
        title="CONFIRM NEURAL ENGRAVING"
        className={cn(
            "max-w-md shadow-[0_0_50px_rgba(0,0,0,0.3)] transition-colors duration-300",
            isEncrypted 
                ? "border-matrix-green/50 shadow-[0_0_50px_rgba(0,255,65,0.15)]" // Green for Encrypted
                : "border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.15)]"   // Yellow for Public
        )}
    >
        <div className="space-y-4 font-mono">
             <div className={cn(
                 "text-xs border-l-2 pl-2 py-1 transition-colors duration-300",
                 isEncrypted 
                    ? "text-matrix-green border-matrix-green" 
                    : "text-yellow-500 border-yellow-500"
             )}>
                &gt; WARNING: IMMUTABLE ACTION DETECTED.<br/>
                &gt; PRIVACY MODE: {isEncrypted ? "SECURE ENCRYPTED" : "PUBLIC BROADCAST"}
            </div>

            <div className="bg-white/5 border border-titanium-grey/20 p-3 rounded space-y-2 text-[10px]">
                <div className="flex justify-between">
                    <span className="text-titanium-grey">PRIVACY PROTOCOL:</span>
                    <span className={cn("font-bold", isEncrypted ? "text-matrix-green" : "text-yellow-500")}>
                        {isEncrypted ? "[ENCRYPTED]" : "[PUBLIC CHAIN]"}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-titanium-grey">ATTACHMENTS:</span>
                    <span className="text-white">
                        {attachments.length > 0 
                            ? (attachments.length > 1 ? `1 of ${attachments.length} SELECTED` : "1 SELECTED")
                            : "NONE"}
                    </span>
                </div>
                {attachments.length > 1 && (
                    <div className="text-glitch-red text-[9px] mt-1 pt-1 border-t border-titanium-grey/20">
                        ⚠ SYSTEM LIMIT: Only the first attachment will be linked on-chain.
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2 pt-2">
                <div 
                    onClick={() => setDontShowAgain(!dontShowAgain)}
                    className="flex items-center gap-2 cursor-pointer group"
                >
                    <div className={cn(
                        "w-3 h-3 border flex items-center justify-center transition-colors",
                        dontShowAgain ? "bg-neon-cyan border-neon-cyan" : "border-titanium-grey group-hover:border-white"
                    )}>
                        {dontShowAgain && <div className="w-1.5 h-1.5 bg-void-black" />}
                    </div>
                    <span className="text-[10px] text-titanium-grey group-hover:text-white transition-colors">
                        Suppress future warnings (Local Protocol)
                    </span>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-titanium-grey/20">
                <button 
                    onClick={() => setIsSubmitWarningOpen(false)}
                    className="px-4 py-2 text-titanium-grey hover:text-white transition-colors text-xs"
                >
                    [ABORT]
                </button>
                <button 
                    onClick={confirmUpload}
                    className={cn(
                        "text-void-black px-4 py-2 text-xs font-bold hover:bg-white transition-colors flex items-center gap-2",
                        isEncrypted ? "bg-matrix-green" : "bg-yellow-500"
                    )}
                >
                    <Activity size={12} /> ENGRAVE
                </button>
            </div>
        </div>
    </GlitchModal>
    </>
  );
}