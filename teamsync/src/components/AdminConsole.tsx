/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Shield, BarChart3, CreditCard, Sparkles, Plus, Trash2, 
  Lock, RefreshCw, Key, CheckCircle, Globe, Image, Settings, Search, Check
} from 'lucide-react';
import { User, ActivityLog, BillingConfig, WhiteLabelConfig } from '../types';
import { mockActivityLogs, mockBillingConfig } from '../data/mockData';

interface AdminConsoleProps {
  currentUser: User;
  onUpdateWhiteLabel: (updated: Partial<WhiteLabelConfig>) => void;
  whiteLabel: WhiteLabelConfig;
  workspaceUsers: User[];
}

export default function AdminConsole({ currentUser, onUpdateWhiteLabel, whiteLabel, workspaceUsers }: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'security' | 'intelligence' | 'billing' | 'branding'>('members');
  const [users, setUsers] = useState<User[]>(workspaceUsers);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New member mock fields
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'member' | 'guest'>('member');

  // Security SSO form mock fields
  const [samlEntityId, setSamlEntityId] = useState('https://idp.teamsync-app.com/saml2/metadata');
  const [samlSsoUrl, setSamlSsoUrl] = useState('https://idp.teamsync-app.com/saml2/sso');
  const [isSsoEnabled, setIsSsoEnabled] = useState(true);
  const [is2faEnforced, setIs2faEnforced] = useState(true);

  // Billing management states
  const [billing, setBilling] = useState<BillingConfig>(mockBillingConfig);
  const [allocatedSeats, setAllocatedSeats] = useState(mockBillingConfig.currentSeats);

  // Branding states
  const [companyNameStr, setCompanyNameStr] = useState(whiteLabel.companyName);
  const [customDomainStr, setCustomDomainStr] = useState(whiteLabel.customDomain);
  const [heroTextStr, setHeroTextStr] = useState(whiteLabel.loginHeroText);
  const [isWhiteLabelSaved, setIsWhiteLabelSaved] = useState(false);

  // Add guest/member mechanism
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    const newId = `u${users.length + 1}`;
    const newUser: User = {
      id: newId,
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole as any,
      status: 'online',
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?w=150`
    };
    setUsers([...users, newUser]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  // Remove member
  const handleRemoveMember = (id: string) => {
    if (id === currentUser.id) return; // Cant delete self
    setUsers(users.filter(u => u.id !== id));
  };

  // Safe Seat adjustment
  const handleSeatAdjustment = (change: number) => {
    const newSeats = Math.max(10, Math.min(billing.maxSeats, allocatedSeats + change));
    setAllocatedSeats(newSeats);
    setBilling({
      ...billing,
      currentSeats: newSeats
    });
  };

  // Save branding updates
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWhiteLabel({
      companyName: companyNameStr,
      customDomain: customDomainStr,
      loginHeroText: heroTextStr
    });
    setIsWhiteLabelSaved(true);
    setTimeout(() => setIsWhiteLabelSaved(false), 2500);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100" id="admin-console-root">
      
      {/* Admin Title Section */}
      <div className="p-4 sm:p-6 border-b border-slate-800/60 bg-slate-950/20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4" id="admin-header-row">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-400" />
            <span>Enterprise Organization Control Suite</span>
          </h2>
          <p className="text-xs text-slate-400">Configure global SAML SSO credentials, brand whitelist details, track active employee seats, and access continuous telemetry logs.</p>
        </div>
        <div className="flex w-full lg:w-auto items-center gap-2 bg-[#0F172A] border border-slate-800 rounded-lg p-1.5 overflow-x-auto" id="admin-subtabs">
          <button 
            onClick={() => setActiveTab('members')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer ${activeTab === 'members' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Directory List ({users.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer ${activeTab === 'security' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SAML SSO</span>
          </button>
          <button 
            onClick={() => setActiveTab('intelligence')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer ${activeTab === 'intelligence' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Workspace Stats</span>
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer ${activeTab === 'billing' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Billing Gate</span>
          </button>
          <button 
            onClick={() => setActiveTab('branding')}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold select-none cursor-pointer ${activeTab === 'branding' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>White-Label</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto" id="admin-main-scrollable">
        
        {/* MEMBERS TAB */}
        {activeTab === 'members' && (
          <div className="space-y-6" id="admin-members-viewport">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Directory list panel */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-2 bg-[#0F172A] border border-slate-800 rounded-lg p-2 px-3">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search inside user database directory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none text-xs text-slate-250 focus:outline-none w-full"
                  />
                </div>

                <div className="bg-[#121B2E] border border-slate-800 rounded-xl overflow-x-auto shadow">
                  <table className="w-full text-left border-collapse text-xs" id="members-list-table">
                    <thead>
                      <tr className="bg-slate-850/40 text-slate-450 border-b border-slate-805/50 font-mono text-[10px] uppercase">
                        <th className="p-3.5 font-semibold">User details</th>
                        <th className="p-3.5 font-semibold">Corporate Role</th>
                        <th className="p-3.5 font-semibold">Status</th>
                        <th className="p-3.5 font-semibold text-right">Admin Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-slate-850/20 transition-colors">
                          <td className="p-3.5 flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-slate-700/50 object-cover" />
                            <div>
                              <span className="font-bold text-white text-xs block">{u.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono">{u.email}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-bold ${u.role === 'admin' ? 'bg-violet-950/40 text-violet-300 border border-violet-800/30' : 'bg-slate-800/50 text-slate-400'}`}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="flex items-center gap-1.5 capitalize text-[10px]">
                              <span className={`w-2 h-2 rounded-full ${u.status === 'online' ? 'bg-[#06D6A0]' : u.status === 'away' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                              <span>{u.status}</span>
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => handleRemoveMember(u.id)}
                              disabled={u.id === currentUser.id}
                              className="text-slate-500 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-500 p-1.5 rounded hover:bg-rose-500/10 cursor-pointer"
                              title="Revoke active seat mapping"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add member form panel */}
              <div className="bg-[#121B2E] border border-slate-800 rounded-xl p-5 shadow space-y-4 h-fit" id="addon-user-panel">
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-450 tracking-wider font-semibold mb-1">Provision Member Account</h4>
                  <p className="text-[11px] text-slate-500">Allocate an offline team seat instantly by entering credentials. Safe password guidelines triggered automatically.</p>
                </div>
                <form onSubmit={handleAddMember} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Liam Vance"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Corporate Email Pointer</label>
                    <input 
                      type="email" 
                      placeholder="liam.v@teamsync.io"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">Assigned Security Role</label>
                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-slate-400 focus:outline-none focus:border-violet-500"
                    >
                      <option value="member">Corporate Member</option>
                      <option value="admin">SaaS Administrator</option>
                      <option value="guest">External Client (Guest)</option>
                    </select>
                  </div>
                  <button 
                    type="submit"
                    className="w-full h-9 rounded bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow cursor-pointer transition-all active:scale-97 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Map Active Seat</span>
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* SECURITY SAML SSO TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-4xl" id="admin-security-viewport">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SSO SAML credentials */}
              <div className="bg-[#121B2E] border border-slate-800 rounded-xl p-6 shadow space-y-4">
                <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h4 className="text-xs font-mono uppercase text-cyan-400 tracking-wider font-semibold">SAML 2.0 Integration Pointer</h4>
                    <p className="text-[10px] text-slate-500">Provide keys parsed from identity directory charts.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs" id="sso-fields">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-350 block">Enforce Single Sign-on (SSO)</span>
                      <span className="text-[10px] text-slate-500 block">Deny standard email credentials automatically.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isSsoEnabled}
                      onChange={(e) => setIsSsoEnabled(e.target.checked)}
                      className="w-4 h-4 rounded accent-violet-500 text-slate-900 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-450 block font-semibold">Metadata Issuer URL</label>
                    <input 
                      type="text" 
                      value={samlEntityId}
                      onChange={(e) => setSamlEntityId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-slate-450 block font-semibold">SSO Gateway Endpoint</label>
                    <input 
                      type="text" 
                      value={samlSsoUrl}
                      onChange={(e) => setSamlSsoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded border border-slate-800">
                    <div>
                      <span className="font-bold text-slate-350 block">Enforce 2-Factor Authentication (2FA)</span>
                      <span className="text-[10px] text-slate-500 block">Deploy dynamic code challenge limits.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={is2faEnforced}
                      onChange={(e) => setIs2faEnforced(e.target.checked)}
                      className="w-4 h-4 rounded accent-violet-500 text-slate-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Live Audit Log Stream */}
              <div className="bg-[#121B2E] border border-slate-800 rounded-xl p-6 shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3 mb-4">
                    <Lock className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-xs font-mono uppercase text-amber-500 tracking-wider font-semibold">Active Security Audit Trails</h4>
                      <p className="text-[10px] text-slate-500">Live system events with IP addresses and signatures.</p>
                    </div>
                  </div>

                  <div className="space-y-2.5 h-64 overflow-y-auto pr-1" id="audit-log-stream">
                    {mockActivityLogs.map(log => (
                      <div key={log.id} className="p-2.5 rounded bg-[#0F172A] border border-slate-805/40 text-[11px] font-mono space-y-1">
                        <div className="flex justify-between items-center text-slate-450">
                          <span className="font-bold text-slate-300">{log.userName}</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="text-cyan-400">{log.action}</div>
                        <div className="text-[10px] text-slate-505 flex justify-between">
                          <span>Target: {log.target}</span>
                          <span>IP: {log.ip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/40 text-[10px] text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  <span>Real-time syslog ingestion operational. Socket links active.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STATS ANALYTICS TAB */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6" id="admin-stats-viewport">
            {/* KPI grid panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Active DAU / MAU Core Ratio</span>
                <div className="text-2xl font-bold mt-1 text-white">84.2% <span className="text-xs text-emerald-400 font-medium font-sans">+3.1%</span></div>
                <p className="text-[10px] text-slate-500 mt-1">Excellent standard retention benchmark.</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Weekly Messages Dispatched</span>
                <div className="text-2xl font-bold mt-1 text-white">14,204 <span className="text-xs text-emerald-400 font-medium font-sans">+12%</span></div>
                <p className="text-[10px] text-slate-500 mt-1">Reflects active collaborative engagement.</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">Server Response Speeds</span>
                <div className="text-2xl font-bold mt-1 text-white">18.4 ms <span className="text-xs text-indigo-400 font-medium font-sans">&bull; Stable</span></div>
                <p className="text-[10px] text-slate-500 mt-1">Powered by edge database proxies.</p>
              </div>
              <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase font-semibold">SOC-2 Audit Compliance Rate</span>
                <div className="text-2xl font-bold mt-1 text-emerald-400">100%</div>
                <p className="text-[10px] text-slate-500 mt-1">TLS tunnels parsed securely.</p>
              </div>
            </div>

            {/* Custom Bar Graphs Representing Employee engagement across channels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="stats-graphic-panels">
              <div className="bg-[#121B2E] border border-slate-805 rounded-xl p-5 shadow space-y-4">
                <h5 className="text-xs font-mono uppercase text-slate-450 font-bold">Message Volume Distribution per Channel</h5>
                
                <div className="space-y-3.5 pt-2" id="bar-charts-container">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>#general</span>
                      <span className="font-bold">4.2k messages</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-violet-500 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>#engineering-hq</span>
                      <span className="font-bold">3.5k messages</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>#product-roadmap</span>
                      <span className="font-bold">2.8k messages</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-[#06D6A0] h-2 rounded-full" style={{ width: '56%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>#security-compliance</span>
                      <span className="font-bold">1.2k messages</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '28%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Area engagement progression plot */}
              <div className="bg-[#121B2E] border border-slate-805 rounded-xl p-5 shadow space-y-4">
                <h5 className="text-xs font-mono uppercase text-slate-450 font-bold">Historical Login Success Rate (Monthly)</h5>
                
                <div className="h-44 flex items-end justify-between pt-4 px-2 bg-slate-950/40 rounded-lg border border-slate-850/40 relative overflow-hidden" id="area-sparkline">
                  {/* Decorative faint horizontal grids */}
                  <div className="absolute top-1/4 inset-x-0 border-t border-slate-800/20" />
                  <div className="absolute top-2/4 inset-x-0 border-t border-slate-800/20" />
                  <div className="absolute top-3/4 inset-x-0 border-t border-slate-800/20" />

                  {/* Pristine columns to model area charts progression */}
                  <div className="flex flex-col items-center gap-1 w-10">
                    <div className="bg-violet-500/20 border-t-2 border-violet-500 h-16 w-4 rounded-t-sm" />
                    <span className="text-[9px] text-slate-550 font-mono">Jan</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-10">
                    <div className="bg-violet-500/30 border-t-2 border-violet-500 h-20 w-4 rounded-t-sm" />
                    <span className="text-[9px] text-slate-550 font-mono">Feb</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-10">
                    <div className="bg-violet-500/40 border-t-2 border-violet-500 h-24 w-4 rounded-t-sm" />
                    <span className="text-[9px] text-slate-550 font-mono">Mar</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 w-10">
                    <div className="bg-violet-500/60 border-t-2 border-violet-500 h-32 w-4 rounded-t-sm animate-pulse" />
                    <span className="text-[9px] text-slate-550 font-mono">Jun 26</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING GATE TAB */}
        {activeTab === 'billing' && (
          <div className="space-y-6 max-w-4xl" id="admin-billing-viewport">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Active Plan Specifications */}
              <div className="bg-[#121B2E] border border-slate-800 rounded-xl p-6 shadow space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-mono bg-violet-955/40 text-violet-300 border border-violet-800/30 px-2 py-0.5 rounded-full font-bold">ACTIVE SUBSCRIPTION</span>
                    <h4 className="text-lg font-bold text-white mt-1.5">{billing.planName} Tier Agreement</h4>
                  </div>
                  <span className="text-2xl font-extrabold text-white">${billing.nextInvoiceAmount / 12} <span className="text-[10px] text-slate-500 font-sans">/ mo base</span></span>
                </div>

                <div className="space-y-4">
                  {/* Seat Allocation Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-350">Allocated Organization Seats Mapped</span>
                      <span className="font-mono text-slate-400">{billing.currentSeats} / {billing.maxSeats} active users</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                      <div className="bg-[#06D6A0] h-2.5 rounded-full shadow shadow-emerald-950/50" style={{ width: `${(billing.currentSeats / billing.maxSeats) * 100}%` }} />
                    </div>
                  </div>

                  {/* Seat manual adjustment controls */}
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-850 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">Seat Limits Multiplier</span>
                      <span className="text-[10px] text-slate-500">Inject additional seats down with dynamic cost scales.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleSeatAdjustment(-10)}
                        className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Remove 10 seats"
                      >
                        -
                      </button>
                      <span className="font-mono text-xs font-bold">{allocatedSeats}</span>
                      <button 
                        onClick={() => handleSeatAdjustment(10)}
                        className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 flex items-center justify-center font-bold text-sm cursor-pointer"
                        title="Add 10 seats"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="text-xs space-y-2 text-slate-400 pt-2">
                    <div className="flex justify-between">
                      <span>Billing Cycle:</span>
                      <span className="font-mono capitalize text-white">{billing.billingCycle}ly system routing</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Invoice Trigger Date:</span>
                      <span className="text-white font-mono">{billing.nextInvoiceDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Invoice Amount Due:</span>
                      <span className="text-amber-400 font-bold font-mono">${billing.nextInvoiceAmount.toLocaleString()} USD</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoices List / Multiplier info */}
              <div className="bg-[#121B2E] border border-slate-800 rounded-xl p-6 shadow space-y-4">
                <h4 className="text-xs font-mono uppercase text-slate-450 tracking-wider font-semibold">Payment Credentials</h4>
                
                <div className="p-4 rounded-lg bg-slate-900 border border-slate-850 flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-violet-400 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">Stripe Card Endpoints</span>
                    <span className="text-slate-400 block font-mono">Brand: {billing.paymentMethod.brand} [&bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {billing.paymentMethod.last4}]</span>
                    <button className="text-violet-400 text-[10px] font-bold hover:underline mt-1 cursor-pointer">Modify payment system logs</button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-wide font-semibold">Past Invoice Registers</h5>
                  <div className="space-y-1.5" id="billing-past-invoices">
                    <div className="p-2.5 rounded bg-slate-950/30 border border-slate-850/40 text-[11px] flex justify-between items-center text-slate-400">
                      <div>
                        <span className="font-mono font-bold text-white block">Invoice #8902-TS</span>
                        <span className="text-[10px]">Processed Dec 15, 2025</span>
                      </div>
                      <span className="font-bold text-white font-mono">$28,800.00</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-950/30 border border-slate-850/40 text-[11px] flex justify-between items-center text-slate-400">
                      <div>
                        <span className="font-mono font-bold text-white block">Invoice #6712-TS</span>
                        <span className="text-[10px]">Processed Dec 15, 2024</span>
                      </div>
                      <span className="font-bold text-white font-mono">$24,200.00</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* WHITE LABELS / BRANDING TAB */}
        {activeTab === 'branding' && (
          <div className="space-y-6 max-w-2xl" id="admin-branding-viewport">
            <form onSubmit={handleSaveBranding} className="bg-[#121B2E] border border-slate-805 rounded-xl p-6 shadow space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Globe className="w-5 h-5 text-violet-400" />
                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-450 tracking-wider font-semibold">Custom Domain & White-Label Schemes</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Enforce branding rules across client screens seamlessly.</p>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-450 block font-bold">Organization Brand Name</label>
                  <input 
                    type="text" 
                    value={companyNameStr}
                    onChange={(e) => setCompanyNameStr(e.target.value)}
                    placeholder="e.g. Acme Enterprise"
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-violet-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-450 block font-bold">Custom Reverse Proxy CNAME Domain</label>
                  <div className="flex">
                    <span className="bg-slate-850 px-3 py-2 rounded-l border border-r-0 border-slate-800 text-slate-500 font-mono text-[11px]">https://</span>
                    <input 
                      type="text" 
                      value={customDomainStr}
                      onChange={(e) => setCustomDomainStr(e.target.value)}
                      placeholder="sync.acme-corp.com"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-r p-2 text-slate-300 focus:outline-none focus:border-violet-500 font-mono text-[11px]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-450 block font-bold">Marketing / Hero Welcome Text</label>
                  <textarea 
                    value={heroTextStr}
                    onChange={(e) => setHeroTextStr(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-300 focus:outline-none focus:border-violet-500 text-xs"
                    placeholder="Smarter workspaces, safe audits."
                  />
                </div>

                {/* Simulated File Upload Component matching instructions */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-450 block font-bold">Corporate Company Branding Logo</label>
                  <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/20 text-center space-y-2">
                    <Image className="w-8 h-8 text-slate-655 mx-auto opacity-50" />
                    <div className="text-[11px] text-slate-400">
                      <span className="text-violet-400 font-semibold cursor-pointer">Click to map asset files</span> or drag Vector/PNG mockups in.
                    </div>
                    <span className="text-[9px] text-slate-550 block font-mono">Max size limits: 5MB &bull; Recommended transparent SVG files.</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800/50">
                  <button
                    type="submit"
                    className="px-5 h-9 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded cursor-pointer transition-all active:scale-97 flex items-center gap-1.5"
                  >
                    <span>Save White-Label rules</span>
                  </button>
                  {isWhiteLabelSaved && (
                    <span className="text-xs text-[#06D6A0] inline-flex items-center gap-1 animate-pulse font-mono">
                      <Check className="w-3.5 h-3.5" />
                      Saved globally!
                    </span>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
