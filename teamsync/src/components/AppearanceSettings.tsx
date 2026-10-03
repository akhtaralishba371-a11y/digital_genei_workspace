/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Palette, Layers, Sparkles, Sliders, Type, Check, Eye } from 'lucide-react';
import { AppearancePreferences } from '../types';

interface AppearanceSettingsProps {
  preferences: AppearancePreferences;
  onUpdatePreferences: (updated: Partial<AppearancePreferences>) => void;
}

export default function AppearanceSettings({ preferences, onUpdatePreferences }: AppearanceSettingsProps) {
  
  const accentColors = [
    { name: 'Purple', hex: '#8B5CF6', bg: 'bg-violet-600' },
    { name: 'Ocean', hex: '#3B82F6', bg: 'bg-blue-600' },
    { name: 'Emerald', hex: '#10B981', bg: 'bg-emerald-600' },
    { name: 'Amber', hex: '#F59E0B', bg: 'bg-amber-600' },
    { name: 'Rose', hex: '#F43F5E', bg: 'bg-rose-500' }
  ];

  const wallpapers = [
    { id: 'none', name: 'Minimal Solid' },
    { id: 'aurora', name: 'Aurora Borealis (Violet Mesh)' },
    { id: 'cyberpunk', name: 'cyberpunk Wave (Indigo Hue)' },
    { id: 'nebula', name: 'Cosmic Nebula (Deep Blue Pulse)' },
    { id: 'light-gradient', name: 'Mesh Breeze (Light Theme Gradient)' }
  ];

  return (
    <div className="space-y-6" id="appearance-settings-container">
      <div>
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1 font-mono">Personalization Core</h4>
        <p className="text-xs text-slate-500">Fine-tune the typography, background meshes, and responsive rendering density parameters.</p>
      </div>

      {/* Theme Picker */}
      <div className="space-y-2" id="theme-selector">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-slate-400" />
          <span>General Appearance Interface</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['dark', 'light', 'system'].map((t) => (
            <button
              key={t}
              onClick={() => onUpdatePreferences({ theme: t as any })}
              className={`py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-all border capitalize text-center ${preferences.theme === t ? 'bg-violet-900/40 border-violet-500 text-white shadow shadow-violet-950/40' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              {t} Mode
            </button>
          ))}
        </div>
      </div>

      {/* Accent Colors */}
      <div className="space-y-2" id="accent-selector">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: preferences.accentColor }} />
          <span>Dynamic Focus Accent Color</span>
        </label>
        <div className="flex flex-wrap gap-2.5" id="accent-colors-list">
          {accentColors.map((color) => (
            <button
              key={color.name}
              onClick={() => onUpdatePreferences({ accentColor: color.hex, accentName: color.name })}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${color.bg} border-2 relative hover:scale-110 ${preferences.accentName === color.name ? 'border-white ring-2 ring-violet-500/50' : 'border-transparent'}`}
              title={color.name}
            >
              {preferences.accentName === color.name && <Check className="w-4 h-4 text-white font-extrabold" />}
            </button>
          ))}
        </div>
      </div>

      {/* Font & Sizing */}
      <div className="grid grid-cols-2 gap-4" id="font-family-selectors">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>Font Scale</span>
          </label>
          <select
            value={preferences.fontSize}
            onChange={(e) => onUpdatePreferences({ fontSize: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="sm">Small (12px / Cozy)</option>
            <option value="md">Medium (14px / Default)</option>
            <option value="lg">Large (16px / Expanded)</option>
            <option value="xl">Extra Large (18px)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-400" />
            <span>Font Family Theme</span>
          </label>
          <select
            value={preferences.fontFamily}
            onChange={(e) => onUpdatePreferences({ fontFamily: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
          >
            <option value="sans">Inter (Elegant Sans)</option>
            <option value="display">Space Grotesk (Modern Display)</option>
            <option value="mono">JetBrains Mono (Technical)</option>
          </select>
        </div>
      </div>

      {/* Workspace wallpapers */}
      <div className="space-y-2" id="wallpaper-selector">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Backdrop Mesh Wallpaper</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" id="wallpapers-list">
          {wallpapers.map((wp) => (
            <button
              key={wp.id}
              onClick={() => onUpdatePreferences({ wallpaper: wp.id })}
              className={`text-left p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${preferences.wallpaper === wp.id ? 'bg-indigo-950/40 border-violet-500 text-slate-100 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            >
              {wp.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders: Glassmorphism and Motion */}
      <div className="space-y-4 pt-2 border-t border-slate-800/40" id="appearance-sliders">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-350 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Glassmorphism Strength (Backdrop Blur)</span>
            </label>
            <span className="font-mono text-slate-500 text-[10px] bg-slate-900 px-1 py-0.5 rounded font-bold border border-slate-800/80">{preferences.glassmorphismStrength}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={preferences.glassmorphismStrength}
            onChange={(e) => onUpdatePreferences({ glassmorphismStrength: parseInt(e.target.value) })}
            className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label className="font-bold text-slate-350 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Animation Timing Rate</span>
            </label>
            <span className="font-mono text-slate-500 text-[10px] bg-slate-900 px-1 py-0.5 rounded font-bold border border-slate-800/80">{preferences.animationStrength}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={preferences.animationStrength}
            onChange={(e) => onUpdatePreferences({ animationStrength: parseInt(e.target.value) })}
            className="w-full accent-violet-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs">
          <div>
            <span className="font-bold text-slate-300">Reduced Motion Mode</span>
            <p className="text-[10px] text-slate-500">Deactivate active spin cycles or glowing hover transitions.</p>
          </div>
          <input
            type="checkbox"
            checked={preferences.reducedMotion}
            onChange={(e) => onUpdatePreferences({ reducedMotion: e.target.checked })}
            className="w-4 h-4 rounded accent-violet-500 text-slate-900 cursor-pointer"
          />
        </div>
      </div>

      {/* live preview box */}
      <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-850/80 mt-4 relative overflow-hidden" id="appearance-live-preview-box">
        <span className="absolute top-2.5 right-2.5 text-[9px] font-bold font-mono tracking-widest text-[#06D6A0] bg-emerald-950/40 border border-emerald-900/30 px-1 py-0.5 rounded uppercase">
          Live Mockup
        </span>
        <h5 className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1">
          <Eye className="w-3 h-3" /> Real-time System Render
        </h5>
        <div 
          className="p-3 rounded-lg border text-xs"
          style={{
            borderColor: `${preferences.accentColor}25`,
            backgroundColor: preferences.theme === 'light' ? 'rgba(255,255,255,0.7)' : 'rgba(30,41,59,0.5)',
            fontFamily: preferences.fontFamily === 'mono' ? 'var(--font-mono)' : preferences.fontFamily === 'display' ? 'var(--font-display)' : 'var(--font-sans)',
            backdropFilter: `blur(${preferences.glassmorphismStrength * 0.2}px)`
          }}
        >
          <span className="font-bold block" style={{ color: preferences.accentColor }}>Dynamic Header Callout</span>
          <p className="text-[11px] text-slate-400 mt-1">
            Observe typography, borders, and glassy blur indices matching custom options seamlessly. Enjoy fluid interaction speeds calibrated to {preferences.animationStrength}% metrics.
          </p>
        </div>
      </div>
    </div>
  );
}
