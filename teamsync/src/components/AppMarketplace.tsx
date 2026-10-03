/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Star, Layers, Check, Sparkles, X, ShieldAlert, Sliders } from 'lucide-react';
import { MarketplaceApp } from '../types';
import { mockMarketplaceApps } from '../data/mockData';

export default function AppMarketplace() {
  const [apps, setApps] = useState<MarketplaceApp[]>(mockMarketplaceApps);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'productivity' | 'development' | 'communication' | 'file_storage' | 'marketing'>('all');
  const [selectedAppReview, setSelectedAppReview] = useState<MarketplaceApp | null>(null);

  // Toggle install / uninstall
  const handleToggleInstall = (appId: string) => {
    setApps(apps.map(app => {
      if (app.id === appId) {
        return {
          ...app,
          isInstalled: !app.isInstalled
        };
      }
      return app;
    }));
  };

  const categories = [
    { id: 'all', name: 'All Ecosystem Tools' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'development', name: 'Coding & Dev' },
    { id: 'communication', name: 'Messaging' },
    { id: 'marketing', name: 'Design / Creative' }
  ];

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100" id="marketplace-root-p">
      
      {/* Title Header */}
      <div className="p-4 sm:p-6 border-b border-slate-800/60 bg-slate-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="marketplace-header-row">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            <span>FLOW App & Integrity Marketplace</span>
          </h2>
          <p className="text-xs text-slate-400">Synchronize commits logs, Figma design systems, Jira boards, or Google Sheets formulas with threads and tasks automatically.</p>
        </div>
        
        <div className="flex w-full sm:w-auto items-center gap-2.5" id="marketplace-controls">
          <div className="flex w-full sm:w-72 items-center gap-2 bg-[#0F172A] border border-slate-800 rounded-lg p-2 h-9">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-300 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Categories Toolbar switcher */}
      <div className="p-4 sm:px-6 border-b border-slate-800 bg-[#0F172A]/40 flex gap-2 overflow-x-auto" id="marketplace-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all ${selectedCategory === cat.id ? 'bg-violet-600 text-white' : 'bg-slate-850 hover:bg-slate-800 text-slate-400'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid List */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto" id="marketplace-grid-viewport">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="marketplace-grid-box">
          {filteredApps.map(app => (
            <div 
              key={app.id}
              className="p-5 rounded-xl bg-[#121B2E] border border-slate-800 flex flex-col justify-between hover:border-slate-700/60 transition-all duration-250 shadow-sm"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-905/60 border border-slate-805/50 flex items-center justify-center font-bold text-slate-300">
                    {app.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-mono font-bold text-slate-300">{app.rating}</span>
                    <span className="text-[10px] text-slate-500">({app.reviewsCount})</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{app.name}</h3>
                <span className="text-[9px] font-mono uppercase bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                  {app.vendor}
                </span>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-2">{app.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-800/40 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" id="marketplace-actions">
                <button 
                  onClick={() => setSelectedAppReview(app)}
                  className="text-violet-400 text-[11px] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  Review SOC-2 Tokens
                </button>

                <button
                  onClick={() => handleToggleInstall(app.id)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold cursor-pointer transition-all ${app.isInstalled ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-violet-600 hover:bg-violet-500 text-white'}`}
                >
                  {app.isInstalled ? (
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Installed
                    </span>
                  ) : (
                    'Authenticate App'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Tokens Review Modal */}
      {selectedAppReview && (
        <div id="permissions-check-modal" className="fixed inset-0 bg-[#020617]/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative space-y-4">
            <button 
              id="close-permissions-modal"
              onClick={() => setSelectedAppReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3.5 border-b border-indigo-905 pb-3">
              <div className="w-10 h-10 rounded-lg bg-violet-600/10 border border-violet-800/30 flex items-center justify-center text-sm font-bold text-violet-400">
                {selectedAppReview.name.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Token Audit Integrity</span>
                <h3 className="text-sm font-bold text-white">{selectedAppReview.name}</h3>
              </div>
            </div>

            <div className="bg-slate-950/40 rounded-lg p-3.5 border border-slate-850 text-xs text-slate-400 space-y-2.5">
              <div className="flex items-start gap-2 text-pink-400" id="soc-status">
                <ShieldAlert className="w-4.5 h-4.5 text-pink-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-[11px] uppercase tracking-wide block">Proposed Scope Mappings</span>
                  <span className="text-[10px] leading-relaxed block">Installing this connector allows the external endpoint to query metadata. Review active authorization scopes below:</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2" id="scopes-list">
                {selectedAppReview.permissionsProposed.map((scope, idx) => (
                  <div key={idx} className="flex gap-2 items-center text-[11px] text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{scope}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button 
                onClick={() => setSelectedAppReview(null)}
                className="px-4 py-2 bg-slate-850 hover:bg-slate-800 rounded font-medium cursor-pointer"
              >
                Close Audit
              </button>
              <button 
                onClick={() => {
                  handleToggleInstall(selectedAppReview.id);
                  setSelectedAppReview(null);
                }}
                className={`px-4 py-2 rounded font-bold cursor-pointer text-white ${selectedAppReview.isInstalled ? 'bg-rose-600 hover:bg-rose-500' : 'bg-violet-600 hover:bg-violet-500'}`}
              >
                {selectedAppReview.isInstalled ? 'Revoke Client Scope' : 'Approve & Authenticate Session'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
