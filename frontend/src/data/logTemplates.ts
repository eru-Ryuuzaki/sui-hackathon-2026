export interface LogTemplateItem {
  type: string;
  icon: string;
  msg: string;
  key?: string;
}

export type LogTemplateCategory = 'system' | 'life_event' | 'daily_task' | 'challenge' | 'environment' | 'dream';

export const LOG_TEMPLATES: Record<LogTemplateCategory, LogTemplateItem[]> = {
  system: [
    { type: 'INFO', key: 'check', icon: '✅', msg: 'System check complete: ' },
    { type: 'INFO', key: 'sync', icon: '🔄', msg: 'Data synchronization finished: ' },
    { type: 'RECHARGE', icon: '🔋', msg: 'Energy recharge cycle complete.' },
    { type: 'STABLE', icon: '🟢', msg: 'Mental stability within optimal range.' },
    { type: 'OPTIMIZED', icon: '🚀', msg: 'Workflow efficiency improved by ' },
    { type: 'WARNING', icon: '⚠️', msg: 'System resource low: ' },
    { type: 'ERROR', icon: '❌', msg: 'Critical error detected in module: ' },
  ],
  life_event: [
    { type: 'MILESTONE', icon: '🏆', msg: 'Major milestone achieved: ' },
    { type: 'PROGRESS', icon: '📈', msg: 'Progress made on project: ' },
    { type: 'NEW_CHAPTER', icon: '📖', msg: 'Started a new chapter: ' },
    { type: 'ACHIEVEMENT', icon: '🏅', msg: 'Unlocked achievement: ' },
    { type: 'SKILL_UP', icon: '🧠', msg: 'Skill proficiency increased: ' },
    { type: 'TITLE', icon: '🏷️', msg: 'Acquired new title: ' },
  ],
  daily_task: [
    { type: 'COMPLETE', icon: '✅', msg: 'Daily task completed: ' },
    { type: 'NEW_TASK', icon: '🆕', msg: 'New task assigned: ' },
    { type: 'SOCIAL', icon: '💬', msg: 'Social interaction logged: ' },
    { type: 'TRANSACTION', icon: '💳', msg: 'Resource transaction: ' },
    { type: 'TRAVEL', icon: '🚀', msg: 'Relocated to sector: ' },
    { type: 'OPTIONAL', icon: '⚪', msg: 'Optional side-quest: ' },
  ],
  challenge: [
    { type: 'VICTORY', icon: '✌️', msg: 'Challenge overcome: ' },
    { type: 'SETBACK', icon: '🥀', msg: 'Temporary setback encountered: ' },
    { type: 'CONFLICT', icon: '⚔️', msg: 'Conflict resolution protocol engaged: ' },
    { type: 'OVERLOAD', icon: '🔥', msg: 'System overload imminent: ' },
    { type: 'HEALTH', icon: '💊', msg: 'Health status update: ' },
  ],
  environment: [
    { type: 'WEATHER', icon: '🌤️', msg: 'Environmental conditions update: ' },
    { type: 'EVENT', icon: '🎉', msg: 'Global event participation: ' },
  ],
  dream: [
    { type: 'REM_CYCLE', icon: '💤', msg: 'REM cycle data logged: ' },
    { type: 'NIGHTMARE', icon: '👹', msg: 'Stress simulation (Nightmare) detected: ' },
    { type: 'LUCID', icon: '✨', msg: 'Lucid state achieved. Control level: ' },
    { type: 'VISION', icon: '👁️', msg: 'Abstract data visualization (Vision): ' },
    { type: 'DEJA_VU', icon: '🌀', msg: 'Memory anomaly (Deja Vu) detected.' },
  ],
};

// Helper to get available types for a category
export const getTypesForCategory = (category: LogTemplateCategory): string[] => {
  const templates = LOG_TEMPLATES[category] || [];
  return Array.from(new Set(templates.map(t => t.type)));
};

// Helper to get templates for a category and type
export const getTemplates = (category: LogTemplateCategory, type: string): LogTemplateItem[] => {
  return (LOG_TEMPLATES[category] || []).filter(t => t.type === type);
};
