import React from 'react';

export interface TerminalLine {
  id: string;
  type: 'system' | 'user' | 'error' | 'success';
  content: React.ReactNode;
}
