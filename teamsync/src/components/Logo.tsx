/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = '', iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`} id="teamsync-logo-container">
      <div 
        id="teamsync-logo-icon"
        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20"
      >
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4.5 h-4.5 text-white"
        >
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
      </div>
      {!iconOnly && (
        <span 
          id="teamsync-logo-text"
          className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-200 bg-clip-text text-transparent"
        >
          F<span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">LOW</span>
          <span className="ml-1 text-[10px] uppercase tracking-widest font-mono text-cyan-400 font-semibold px-1 rounded bg-cyan-950/40 border border-cyan-800/20">
            Enterprise
          </span>
        </span>
      )}
    </div>
  );
}
