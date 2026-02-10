export interface LogTemplateItem {
  type: string;
  icon: string;
  msg: string;
  key?: string;
}

export type LogTemplateCategory =
  | "system"
  | "protocol"
  | "achievement"
  | "challenge"
  | "dream";

// Map Categories to u8 for On-Chain Storage
export const CATEGORY_MAP: Record<LogTemplateCategory, number> = {
  system: 0,
  protocol: 1,
  achievement: 2,
  challenge: 3,
  dream: 4,
};

// UI Colors for Categories (Neon Cyberpunk Theme)
export const CATEGORY_COLORS: Record<LogTemplateCategory, string> = {
  system: "#00f3ff", // Cyan
  protocol: "#ffffff", // White
  achievement: "#ffd700", // Gold
  challenge: "#ff2a6d", // Neon Red
  dream: "#bd00ff", // Neon Purple
};

export const LOG_TEMPLATES: Record<LogTemplateCategory, LogTemplateItem[]> = {
  system: [
    { type: "INFO", key: "check", icon: "✅", msg: "System check complete: " },
    {
      type: "INFO",
      key: "sync",
      icon: "🔄",
      msg: "Data synchronization finished: ",
    },
    { type: "RECHARGE", icon: "🔋", msg: "Energy recharge cycle complete." },
    {
      type: "STABLE",
      icon: "🟢",
      msg: "Mental stability within optimal range.",
    },
    { type: "OPTIMIZED", icon: "🚀", msg: "Workflow efficiency improved by " },
    { type: "WARNING", icon: "⚠️", msg: "System resource low: " },
    { type: "ERROR", icon: "❌", msg: "Critical error detected in module: " },
    // New Web3/Cyberpunk Flavors
    { type: "GAS_LEAK", icon: "⛽", msg: "High energy consumption detected: " },
    {
      type: "HODL_MODE",
      icon: "💎",
      msg: "Diamond hands protocol engaged for: ",
    },
    { type: "RUG_PULLED", icon: "📉", msg: "Unexpected resource loss event: " },
  ],
  protocol: [
    // Merged daily_task + life_event (Routine)
    { type: "ROUTINE", icon: "✅", msg: "Daily protocol executed: " },
    { type: "TASK", icon: "🆕", msg: "New directive received: " },
    { type: "SOCIAL", icon: "💬", msg: "Inter-subject communication logged: " },
    {
      type: "TRANSACTION",
      icon: "💳",
      msg: "Resource transaction confirmed: ",
    },
    { type: "TRAVEL", icon: "🚀", msg: "Relocated to sector: " },
    { type: "LEARNING", icon: "🧠", msg: "Knowledge database updated: " },
  ],
  achievement: [
    // Merged life_event (Milestones)
    { type: "MILESTONE", icon: "🏆", msg: "Major milestone reached: " },
    {
      type: "LEVEL_UP",
      icon: "🆙",
      msg: "Construct level increased. New capabilities: ",
    },
    { type: "TITLE", icon: "🏷️", msg: "Acquired new designation: " },
    { type: "BADGE", icon: "🏅", msg: "Neural Badge unlocked: " },
  ],
  challenge: [
    { type: "VICTORY", icon: "✌️", msg: "Obstacle overcome: " },
    { type: "SETBACK", icon: "🥀", msg: "Temporary system setback: " },
    {
      type: "CONFLICT",
      icon: "⚔️",
      msg: "Conflict resolution protocol engaged: ",
    },
    { type: "OVERLOAD", icon: "🔥", msg: "Mental overload imminent: " },
    { type: "HEALTH", icon: "💊", msg: "Biological status update: " },
  ],
  dream: [
    { type: "REM_CYCLE", icon: "💤", msg: "REM cycle data logged: " },
    {
      type: "NIGHTMARE",
      icon: "👹",
      msg: "Stress simulation (Nightmare) detected: ",
    },
    { type: "LUCID", icon: "✨", msg: "Lucid state achieved. Control level: " },
    {
      type: "VISION",
      icon: "👁️",
      msg: "Abstract data visualization (Vision): ",
    },
    { type: "DEJA_VU", icon: "🌀", msg: "Memory anomaly (Deja Vu) detected." },
  ],
};

// Helper to get available types for a category
export const getTypesForCategory = (
  category: LogTemplateCategory,
): string[] => {
  const templates = LOG_TEMPLATES[category] || [];
  return Array.from(new Set(templates.map((t) => t.type)));
};

// Helper to get templates for a category and type
export const getTemplates = (
  category: LogTemplateCategory,
  type: string,
): LogTemplateItem[] => {
  return (LOG_TEMPLATES[category] || []).filter((t) => t.type === type);
};
