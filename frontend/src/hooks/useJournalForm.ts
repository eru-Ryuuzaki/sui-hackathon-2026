import { useState, useEffect, useRef, useMemo } from 'react';
import { format, isAfter } from 'date-fns';
import { type LogTemplateCategory, type LogTemplateItem, getTypesForCategory, getTemplates } from '@/data/logTemplates';
import type { Attachment } from '@/components/ui/AttachmentUploader';

export function useJournalForm() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  // Default to Protocol -> Routine
  const [category, setCategory] = useState<LogTemplateCategory>('protocol');
  const [type, setType] = useState('ROUTINE');
  const [isEncrypted, setIsEncrypted] = useState(true);
  
  const [selectedTemplate, setSelectedTemplate] = useState<LogTemplateItem | null>(null);
  const [isCustomMessage, setIsCustomMessage] = useState(false);
  const [body, setBody] = useState('');
  const [icon, setIcon] = useState('📝');
  
  const [weather, setWeather] = useState('☀️');
  const [mood, setMood] = useState('😊');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [showIconPicker, setShowIconPicker] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Derived state
  const availableTypes = useMemo(() => getTypesForCategory(category), [category]);
  const availableTemplates = useMemo(() => getTemplates(category, type), [category, type]);

  // Effects
  // Note: The [category, type] effect below handles the initial load as well, 
  // since it runs on mount with default values.


  useEffect(() => {
    const types = getTypesForCategory(category);
    const defaultType = types[0] || 'INFO';
    
    // When category changes, reset type to the default for that category
    // This ensures we don't stay on a type that doesn't exist for the new category
    if (!types.includes(type)) {
      setType(defaultType);
    }
  }, [category]);

  useEffect(() => {
    // When Category or Type changes, auto-select the first template
    // This ensures the "Preview" and body content always reflect the current selection
    const templates = getTemplates(category, type);
    const defaultTemplate = templates[0];

    if (defaultTemplate) {
      setSelectedTemplate(defaultTemplate);
      // We do NOT set body here anymore, as the user wants the input to start empty
      // setBody(defaultTemplate.msg); 
      setBody(''); // Ensure body is cleared when category/type changes
      setIcon(defaultTemplate.icon);
      setIsCustomMessage(false);
    } else {
      setSelectedTemplate(null);
      setBody('');
      setIcon('📝');
    }
  }, [category, type]);

  // Handlers
  const handleTemplateSelect = (tmpl: LogTemplateItem | 'custom') => {
    if (tmpl === 'custom') {
      setSelectedTemplate(null);
      setIsCustomMessage(true);
      setBody('');
    } else {
      setSelectedTemplate(tmpl);
      setIsCustomMessage(false);
      // Don't auto-fill body
      // setBody(tmpl.msg);
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

  const validateDate = (): string | null => {
    const logDate = new Date(`${date}T${time}`);
    const now = new Date();
    if (isAfter(logDate, now)) return "TIME PARADOX: FUTURE EVENTS PROHIBITED";
    return null;
  };

  const resetForm = () => {
      setBody('');
      setAttachments([]);
      setIsCustomMessage(false);
  }

  return {
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
  };
}