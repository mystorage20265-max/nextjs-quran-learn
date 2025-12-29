'use client';

import { PlayerProvider } from './state/PlayerState';
import RadioErrorBoundary from './components/RadioErrorBoundary';

export default function RadioLayout({ children }: { children: React.ReactNode }) {
  return (
    <RadioErrorBoundary>
      <PlayerProvider>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
          <div className="flex-1">{children}</div>
        </div>
      </PlayerProvider>
    </RadioErrorBoundary>
  );
}

