// 1. Parse JSON content
export const parseLogContent = (content: string) => {
  try {
    if (!content) return null;
    // Check if it looks like JSON before parsing to avoid unnecessary throws
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
        return JSON.parse(content);
    }
    return { body: content };
  } catch (e) {
    // If not JSON, treat as plain text body
    return { body: content };
  }
};

// 2. Parse Trace String with Regex
// Expected format: "[2026-02-11 10:00][Frame 1234][CATEGORY]TYPE: Message"
export const parseLogTrace = (trace: string) => {
  if (!trace) return null;
  
  // Regex Logic:
  // Group 1: [TIME]   -> ^(\[.*?\]) - e.g., [2026-02-11 10:00]
  // Group 2: [CAT]    -> (\[.*?\]) - e.g., [PROTOCOL]
  // Group 3: TYPE     -> (.*?) - e.g., ROUTINE
  // Group 4: Message  -> :(.*) - Rest of the string
  
  // Removed [Frame] part as per request
  const match = trace.match(/^(\[.*?\])\s*(\[.*?\])(.*?):(.*)/);
  
  if (match) {
    return {
      time: match[1],      // e.g. "[2026-02-11 10:00]"
      category: match[2],  // e.g. "[PROTOCOL]"
      type: match[3],      // e.g. "ROUTINE"
      message: match[4],   // e.g. " 📝 Log content..."
    };
  }
  return null;
};
