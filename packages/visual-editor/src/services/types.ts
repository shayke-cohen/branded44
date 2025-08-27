import * as React from 'react';

export interface SessionInfo {
  sessionId: string;
  workspacePath: string;
  sessionPath: string;
  bundleReady?: boolean;
  bundleError?: string;
  bundleUrl?: string;
}

export interface BundledAppState {
  isLoaded: boolean;
  appComponent: React.ComponentType | null;
  error: string | null;
  isLoading: boolean;
  bundleStats?: {
    size: number;
    buildTime: number;
    age: number;
  };
}

export interface BundleCacheEntry {
  component: React.ComponentType;
  timestamp: number;
}
