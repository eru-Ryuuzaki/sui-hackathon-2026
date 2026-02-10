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
  Zap,
  ChevronDown,
  Paperclip,
  Calendar,
  Lock,
  Globe
} from 'lucide-react';
import { cn } from '@/utils/cn';

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
        showIconPicker, setShowIconPicker,
    },
    refs: { dateInputRef },
    derived: { availableTypes, availableTemplates },
    handlers: {
        handleTemplateSelect,
        handleBodyChange,
        handleIconChange,
        validateDate,
        resetForm
    }
  } = useJournalForm();

  // Current Category Color
  const categoryColor = CATEGORY_COLORS[category];
  const validationError = validateDate();
  const sysTrace = `[${date} ${time}][${category.toUpperCase()}]${type}: ${icon} ${body.slice(0, 30)}${body.length > 30 ? '...' : ''}`;

  const handleUpload = () => {
    // 1. Process Attachments
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

    // 2. Prepare content
    const content = body || (selectedTemplate?.msg || 'No content provided.');
    
    // 3. Try On-Chain Transaction if Construct ID is available
    if (constructId && account) {
        try {
            // Map category string to u8 (Example mapping)
            // 'system' -> 0, 'health' -> 1, 'work' -> 2, etc.
            const categoryMap: Record<string, number> = {
                'system': 0, 'health': 1, 'work': 2, 'social': 3, 'finance': 4, 'hobby': 5, 'travel': 6
            };
            const catVal = categoryMap[category] ?? 0;
            
            // Map mood/energy to emotionVal u8
            const emotionVal = 50; // TODO: Map from mood icon

            const tx = buildEngraveTx(
                constructId,
                content,
                emotionVal,
                catVal,
                isEncrypted,
                validAttachments.length > 0 ? validAttachments[0].blobId : undefined 
                // Currently contract supports 1 blob_id. 
                // For multiple, we'd need to update contract or serialize.
            );

            signAndExecuteTransaction(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        console.log("Transaction digest:", result.digest);
                        triggerAlert({
                            type: 'success',
                            title: 'TRACE ENGRAVED',
                            message: `Memory permanently etched into Hive Mind.\nDigest: ${result.digest.slice(0,8)}...`,
                            duration: 5000
                        });
                        // Add to local store for immediate feedback (optimistic)
                        addLog({
                            content,
                            category,
                            type: type as any,
                            metadata: { weather, mood, icon, attachments: validAttachments },
                            hash: result.digest // Use real digest
                        });
                        onExit();
                    },
                    onError: (err) => {
                        console.error("Engrave failed:", err);
                        triggerAlert({
                            type: 'error',
                            title: 'ENGRAVING FAILURE',
                            message: 'Neural link rejected the transaction. Saving locally instead.',
                        });
                        // Fallback: Save locally only? Or just show error?
                        // For now, let's allow local save as fallback so user doesn't lose data
                        addLog({
                            content,
                            category,
                            type: type as any,
                            metadata: { weather, mood, icon, attachments: validAttachments }
                        });
                        onExit();
                    }
                }
            );
            return;
        } catch (e) {
            console.error("Transaction build error:", e);
        }
    } else {
        // Fallback: Local Only (Mock Mode or No Wallet)
        if (!account) {
            triggerAlert({ type: 'warning', title: 'OFFLINE MODE', message: 'Wallet not connected. Saving locally.' });
        } else if (!constructId) {
            triggerAlert({ type: 'warning', title: 'NO CONSTRUCT', message: 'User construct not found. Saving locally.' });
        }

        addLog({
            content,
            category,
            type: type as any,
            metadata: { weather, mood, icon, attachments: validAttachments }
        });
        onExit();
    }
  };

  return (
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
        <div className="w-[30%] flex flex-col gap-4 min-h-0 overflow-y-auto scrollbar-thin pr-2">
          
          {/* Section 1: Metadata */}
          <div className="space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded animate-in fade-in slide-in-from-left-2">
            <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70">
              <Activity size={12} /> SECTION 01: PARAMETERS
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-titanium-grey">CATEGORY</label>
                <div className="relative">
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value as LogTemplateCategory)} 
                    className="w-full bg-void-black border px-2 py-1 outline-none text-white appearance-none uppercase transition-colors duration-300"
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
                    className="w-full bg-void-black border border-titanium-grey/50 px-2 py-1 focus:border-neon-cyan outline-none text-white appearance-none"
                  >
                    {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-titanium-grey pointer-events-none" />
                </div>
              </div>

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
            </div>
          </div>

          {/* Section 2: Vitals */}
          <div className="space-y-3 border border-titanium-grey/20 p-3 bg-white/5 rounded animate-in fade-in slide-in-from-left-2 delay-75">
            <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70">
              <Zap size={12} /> SECTION 02: VITALS
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-titanium-grey block"><Cloud size={10} className="inline mr-1"/> WEATHER</label>
                <div className="grid grid-cols-6 gap-1 bg-void-black border border-titanium-grey/30 rounded p-1">
                  {WEATHER_ICONS.map(ic => (
                    <button 
                      key={ic} 
                      onClick={() => setWeather(ic)}
                      className={`aspect-square flex items-center justify-center hover:bg-white/10 rounded ${weather === ic ? 'bg-neon-cyan/20' : ''}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-titanium-grey block"><Smile size={10} className="inline mr-1"/> MOOD</label>
                <div className="grid grid-cols-6 gap-1 bg-void-black border border-titanium-grey/30 rounded p-1">
                  {MOOD_ICONS.map(ic => (
                    <button 
                      key={ic} 
                      onClick={() => setMood(ic)}
                      className={`aspect-square flex items-center justify-center hover:bg-white/10 rounded ${mood === ic ? 'bg-neon-cyan/20' : ''}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Artifacts */}
          <div className="flex flex-col border border-titanium-grey/20 p-3 bg-white/5 rounded animate-in fade-in slide-in-from-left-2 delay-100">
            <div className="text-titanium-grey flex items-center gap-2 font-bold opacity-70 mb-3 shrink-0">
              <Paperclip size={12} /> SECTION 03: ARTIFACTS
            </div>
            <div className="flex-1 min-h-0">
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText size={12} /> SECTION 04: LOG BODY
                </div>

                {/* Date Picker Trigger */}
                <div className="relative group">
                  <button 
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="flex items-center gap-2 bg-void-black border border-titanium-grey/30 px-2 py-0.5 rounded text-[10px] hover:border-neon-cyan transition-colors text-neon-cyan/80"
                  >
                    <Calendar size={10} />
                    <span>{date} {time}</span>
                  </button>
                  {/* Hidden Inputs for Native Picker */}
                  <div className="absolute opacity-0 w-0 h-0 overflow-hidden">
                     <input 
                       ref={dateInputRef}
                       type="date" 
                       value={date} 
                       onChange={e => setDate(e.target.value)} 
                     />
                     <input 
                       type="time" 
                       value={time} 
                       onChange={e => setTime(e.target.value)} 
                     />
                  </div>
                </div>
              </div>
              
              {/* Icon Picker */}
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
            
            <div className="bg-void-black p-2 border-l-2 border-neon-cyan text-[10px] text-titanium-grey break-all font-mono leading-relaxed mb-2 shrink-0">
              <span className="text-neon-cyan">&gt; PREVIEW:</span> {sysTrace}
            </div>

            <textarea 
              value={body}
              onChange={e => handleBodyChange(e.target.value)}
              placeholder="Enter log details or select a template..."
              className="flex-1 w-full bg-void-black border border-titanium-grey/50 p-4 focus:border-neon-cyan outline-none text-white resize-none scrollbar-thin text-sm leading-relaxed font-mono"
              autoFocus
            />
          </div>
        </div>
      </div>


      {/* Footer Actions */}
      <div className="flex justify-end gap-4 pt-2 border-t border-titanium-grey/30 mt-4 shrink-0">
        <button onClick={onExit} className="px-4 py-2 text-titanium-grey hover:text-white transition-colors">
          [CANCEL]
        </button>

        <div className="flex items-center gap-2">
            {/* Encryption Toggle */}
            <button 
              onClick={() => setIsEncrypted(!isEncrypted)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-[10px] font-bold tracking-wider border transition-all duration-300",
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
  );
}