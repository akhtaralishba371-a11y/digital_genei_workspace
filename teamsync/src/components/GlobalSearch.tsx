/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Search, Hash, File, CheckSquare, Sparkles, X, Terminal, ArrowRight } from 'lucide-react';
import { Channel, Document, Task } from '../types';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  documents: Document[];
  tasks: Task[];
  onSelectChannel: (id: string) => void;
  onSelectDocument: (id: string) => void;
  onSelectTask: (id: string) => void;
}

export default function GlobalSearch({
  isOpen,
  onClose,
  channels,
  documents,
  tasks,
  onSelectChannel,
  onSelectDocument,
  onSelectTask
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter lists based on query
  const lowercaseQuery = query.toLowerCase();

  const filteredChannels = lowercaseQuery
    ? channels.filter(c => c.name.toLowerCase().includes(lowercaseQuery) || c.description.toLowerCase().includes(lowercaseQuery))
    : channels.slice(0, 3);

  const filteredDocs = lowercaseQuery
    ? documents.filter(d => d.title.toLowerCase().includes(lowercaseQuery))
    : documents.slice(0, 3);

  const filteredTasks = lowercaseQuery
    ? tasks.filter(t => t.title.toLowerCase().includes(lowercaseQuery) || t.project.toLowerCase().includes(lowercaseQuery))
    : tasks.slice(0, 3);

  const isSearching = !!query;

  return (
    <div id="search-modal-backdrop" className="fixed inset-0 bg-[#020617]/70 backdrop-blur-md z-50 flex items-start justify-center pt-[10vh] p-4">
      <div 
        ref={modalRef}
        id="search-palette-box"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div id="search-bar" className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Type command / search threads, docs, tasks or triggers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-450 focus:outline-none text-sm font-sans"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-slate-800 border border-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono font-bold select-none">
            ESC
          </kbd>
          <button 
            id="close-search-btn"
            onClick={onClose}
            className="p-1 rounded-md hover:bg-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Insight banner if empty context */}
        {!isSearching && (
          <div id="ai-insight-banner" className="bg-violet-950/20 border-b border-violet-850/40 p-3 px-4 flex items-center justify-between text-xs text-violet-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span>Tip: Ask AI or type a custom query context to locate exact specifications.</span>
            </div>
            <span className="font-mono text-[9px] bg-violet-900/30 px-1.5 py-0.5 rounded border border-violet-850/30">Gemini Grounded</span>
          </div>
        )}

        {/* Search Results */}
        <div id="search-scroll-area" className="flex-1 overflow-y-auto p-2 space-y-4 max-h-[50vh]">
          
          {/* Quick Commands / Tasks Action Segment */}
          {!isSearching && (
            <div id="quick-action-set">
              <h6 className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">Quick Workspace Commands</h6>
              <div className="mt-1 space-y-0.5">
                <button 
                  onClick={() => { setQuery('> Configure White Label Branding'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                >
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Customize company logos and domains</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-slate-600" />
                </button>
                <button 
                  onClick={() => { setQuery('> Adjust Glassmorphism Density'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                >
                  <Terminal className="w-4 h-4 text-pink-400" />
                  <span>Modify visual blur strengths</span>
                  <ArrowRight className="w-3 h-3 ml-auto text-slate-600" />
                </button>
              </div>
            </div>
          )}

          {/* CHANNELS */}
          {filteredChannels.length > 0 && (
            <div id="search-channels-section">
              <h6 className="px-3 py-1 text-[10px] font-semibold text-slate-550 uppercase tracking-wider font-mono">
                {isSearching ? 'Matching Channels' : 'Recent Channels'}
              </h6>
              <div className="mt-1 space-y-0.5" id="search-channels-list">
                {filteredChannels.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectChannel(c.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                  >
                    <Hash className="w-4 h-4 text-violet-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">#{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {filteredDocs.length > 0 && (
            <div id="search-docs-section">
              <h6 className="px-3 py-1 text-[10px] font-semibold text-slate-550 uppercase tracking-wider font-mono">
                {isSearching ? 'Matching Documents' : 'Recent Documents'}
              </h6>
              <div className="mt-1 space-y-0.5" id="search-docs-list">
                {filteredDocs.map(d => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDocument(d.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                  >
                    <File className="w-4 h-4 text-cyan-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{d.emoji} {d.title}</div>
                      <div className="text-[10px] text-slate-550">Last updated {d.updatedAt}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TASKS */}
          {filteredTasks.length > 0 && (
            <div id="search-tasks-section">
              <h6 className="px-3 py-1 text-[10px] font-semibold text-slate-550 uppercase tracking-wider font-mono">
                {isSearching ? 'Matching Tasks' : 'Assigned Tasks'}
              </h6>
              <div className="mt-1 space-y-0.5" id="search-tasks-list">
                {filteredTasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectTask(t.id);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{t.project} &bull; {t.status} &bull; {t.priority}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY MATCHES */}
          {isSearching && filteredChannels.length === 0 && filteredDocs.length === 0 && filteredTasks.length === 0 && (
            <div id="search-empty-state" className="p-8 text-center text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-655 mb-2.5 opacity-50" />
              <p className="text-xs">No matching entries found for "{query}".</p>
              <p className="text-[11px] text-violet-400 mt-1">Tip: Ask AI to synthesize a topic or adjust parameters.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
