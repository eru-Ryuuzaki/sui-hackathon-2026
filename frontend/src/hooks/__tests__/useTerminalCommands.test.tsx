import { renderHook, act } from '@testing-library/react';
import { useTerminalCommands } from '../useTerminalCommands';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock stores
const mockAddLog = vi.fn();
const mockCurrentUser = { codename: 'TestUser', address: '0x123' };

vi.mock('@/hooks/useUserStore', () => ({
  useUserStore: () => ({
    currentUser: mockCurrentUser
  })
}));

vi.mock('@/hooks/useMemoryStore', () => ({
  useMemoryStore: () => ({
    addLog: mockAddLog,
    logs: []
  }),
  // For getState used in handleStatus
  getState: () => ({ logs: [] })
}));

vi.mock('@/components/ui/SystemAlert', () => ({
  triggerAlert: vi.fn()
}));

describe('useTerminalCommands', () => {
  let setHistory: any;
  let setCommand: any;
  let setMode: any;

  beforeEach(() => {
    setHistory = vi.fn();
    setCommand = vi.fn();
    setMode = vi.fn();
    mockAddLog.mockClear();
  });

  it('should handle "help" command', async () => {
    const { result } = renderHook(() => useTerminalCommands({
      setHistory,
      setCommand,
      setMode,
      isConnected: true,
      currentAddress: '0x123'
    }));

    act(() => {
      result.current.handleCommand('help');
    });

    // Check immediate updates
    expect(setCommand).toHaveBeenCalledWith('');
    // First call adds user command
    expect(setHistory).toHaveBeenCalled(); 

    // Wait for timeout (300ms)
    await new Promise(r => setTimeout(r, 350));

    // Second call adds response
    expect(setHistory).toHaveBeenCalledTimes(2); 
  });

  it('should handle "guide" command', async () => {
    const { result } = renderHook(() => useTerminalCommands({
      setHistory,
      setCommand,
      setMode,
      isConnected: true,
      currentAddress: '0x123'
    }));

    act(() => {
      result.current.handleCommand('guide');
    });

    // Wait for timeout (300ms)
    await new Promise(r => setTimeout(r, 350));

    // Check if history was updated
    expect(setHistory).toHaveBeenCalledTimes(2);
    
    // Get the updater function from the last call
    const lastCallArg = setHistory.mock.calls[1][0];
    expect(typeof lastCallArg).toBe('function');
    
    // Simulate the update
    const prevHistory: any[] = [];
    const newHistory = lastCallArg(prevHistory);
    
    expect(newHistory).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: 'system',
      })
    ]));
  });

  it('should handle "engrave" command when connected', async () => {
    const { result } = renderHook(() => useTerminalCommands({
      setHistory,
      setCommand,
      setMode,
      isConnected: true,
      currentAddress: '0x123'
    }));

    act(() => {
      result.current.handleCommand('engrave My Memory');
    });

    await new Promise(r => setTimeout(r, 350));

    expect(mockAddLog).toHaveBeenCalledWith(expect.objectContaining({
        content: 'My Memory',
        category: 'CLI_UPLOAD'
    }));
  });

  it('should deny "engrave" when disconnected', async () => {
    const { result } = renderHook(() => useTerminalCommands({
      setHistory,
      setCommand,
      setMode,
      isConnected: false,
      currentAddress: null
    }));

    act(() => {
      result.current.handleCommand('engrave My Memory');
    });

    await new Promise(r => setTimeout(r, 350));

    expect(mockAddLog).not.toHaveBeenCalled();
  });

  it('should handle "clear" command', async () => {
    const { result } = renderHook(() => useTerminalCommands({
      setHistory,
      setCommand,
      setMode,
      isConnected: true,
      currentAddress: '0x123'
    }));

    act(() => {
      result.current.handleCommand('clear');
    });

    await new Promise(r => setTimeout(r, 350));

    expect(setHistory).toHaveBeenCalledWith([]);
  });
});
