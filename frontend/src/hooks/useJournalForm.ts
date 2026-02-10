import { useState, useEffect, useRef, useMemo } from 'react';
import { format, isAfter } from 'date-fns';
import { LogTemplateCategory, LogTemplateItem, LOG_TEMPLATES, getTypesForCategory, getTemplates } from '@/data/logTemplates';
import { Attachment } from '@/components/ui/AttachmentUploader';

export function useJournalForm() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [category, setCategory] = useState<LogTemplateCategory>('system');
  const [type, setType] = useState('INFO');
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

  // Derived state
  const availableTypes = useMemo(() => getTypesForCategory(category), [category]);
  const availableTemplates = useMemo(() => getTemplates(category, type), [category, type]);

  // Effects
  useEffect(() => {
    const types = getTypesForCategory(category);
    const newType = types[0] || 'INFO';
    setType(newType);
    setSelectedTemplate(null);
    setIsCustomMessage(false);

    if (category === 'system') {
      const defaultTemplate = LOG_TEMPLATES.system[0]; 
      if (defaultTemplate) {
        setBody(defaultTemplate.msg);
        setIcon(defaultTemplate.icon);
      }
    } else {
      setBody('');
      setIcon('📝');
    }
  }, [category]);

  useEffect(() => {
    if (category === 'system' && type !== 'INFO' && body === LOG_TEMPLATES.system[0]?.msg && !isCustomMessage) {
       setBody('');
       setIcon('📝');
    }
    setSelectedTemplate(null);
  }, [type, category]);

  // Handlers
  const handleTemplateSelect = (tmpl: LogTemplateItem | 'custom') => {
    if (tmpl === 'custom') {
      setSelectedTemplate(null);
      setIsCustomMessage(true);
      setBody('');
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
    refs: { dateInputRef },
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