/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowRight, Shield, Zap, Sparkles, Layout, ChevronRight, CheckCircle, 
  MessageSquare, FileText, CheckSquare, Settings, Award, Users, RefreshCw, Layers
} from 'lucide-react';
import Logo from './Logo';

interface LandingPageProps {
  onLaunchApp: () => void;
  accentColor: string;
}

export default function LandingPage({ onLaunchApp, accentColor }: LandingPageProps) {
  const [activePlan, setActivePlan] = useState<'monthly' | 'yearly'>('yearly');
  const [demoPrompt, setDemoPrompt] = useState('Create an enterprise security policy doc and extract backlog items for next sprint.');
  const [demoResponse, setDemoResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSimulateAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoPrompt.trim() || isAiLoading) return;
    setIsAiLoading(true);
    setDemoResponse('');
    
    setTimeout(() => {
      setDemoResponse(
        `**FLOW AI Copilot:** \n\n` +
        `I have formulated an action plan based on your request:\n` +
        `1. Created a draft document: **"Sec-Ops Strategy & SOC-2 compliance"** mapping TLS proxies.\n` +
        `2. Extracted **3 high-priority tasks** for **Sprint 24**:\n` +
        `   - *Task:* Configure 2FA token generation limits \`[Security]\`\n` +
        `   - *Task:* Audit SCIM group-mapping engine \`[IAM Integration]\`\n` +
        `   - *Task:* Set Sentry error-bounds fallback thresholds \`[DevOps]\`\n\n` +
        `👉 Click **Launch Platform** to check these draft files live in your customized workspace!`
      );
      setIsAiLoading(false);
    }, 1200);
  };

  const trustedCompanies = [
    { name: 'Stripe', logo: '💳 Stripe' },
    { name: 'Linear', logo: '📐 Linear' },
    { name: 'Figma', logo: '📐 Figma' },
    { name: 'Notion', logo: '📓 Notion' },
    { name: 'Google Workspace', logo: '📦 Google' },
  ];

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6 text-violet-400" />,
      title: 'Real-Time Communications',
      description: 'Nested threads, smart notifications, custom emoji feedback, and integrated voice clips for distributed team structures.'
    },
    {
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      title: 'Confluence & Notion Block Editors',
      description: 'Frictionless document authoring with drag-n-drop columns, full markdown support, interactive checklists, code syntax blocks.'
    },
    {
      icon: <CheckSquare className="w-6 h-6 text-emerald-400" />,
      title: 'Linear-Grade Issue Pipelines',
      description: 'Clean Kanban configurations, agile velocity trackers, automatic gantt timelines, user capacity charts.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      title: 'Server-Side Gemini AI Integration',
      description: 'Summarize long technical discussions, synthesize specifications, extract action lists, and search through document networks.'
    },
    {
      icon: <Shield className="w-6 h-6 text-indigo-400" />,
      title: 'Military-Grade Compliance Suite',
      description: 'Single Sign-on (SSO), automated provisioning directory sync, SCIM attribute layouts, active security log monitors.'
    },
    {
      icon: <Layers className="w-6 h-6 text-rose-400" />,
      title: 'Custom Brand White-Labeling',
      description: 'Fully map custom domain, enforce organization-wide theme policies, inject custom logo imagery, custom CSS accents.'
    }
  ];

  const FAQs = [
    {
      q: 'Does FLOW support single sign-on (SSO) and SCIM provisioning?',
      a: 'Yes, FLOW Enterprise connects via SAML 2.0, OpenID Connect, and standard SCIM 2.0 specs with Okta, Azure AD, Ping Identity, and customized providers.'
    },
    {
      q: 'Is our data encrypted at rest and in transit?',
      a: 'Absolutely. We enforce TLS 1.3 for in-transit communication and AES-256 with Customer-Managed Keys (BYOK options) protecting documents and messaging servers.'
    },
    {
      q: 'Can we white-label the software with our corporate logos and brand schemes?',
      a: 'Yes. Our Administration Suite lets you map your domain, set customized font pairings, upload corporate brand logos, and restrict color presets across all teams.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 selection:bg-violet-600/30 selection:text-white relative" id="landing-root">
      
      {/* Decorative Aurora Background Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20 overflow-hidden" id="landing-glow">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute -top-20 right-1/4 w-[400px] h-[400px] bg-cyan-500 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Landing Header */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-800/40" id="landing-navbar">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300" id="landing-nav-links">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ai-co-pilot" className="hover:text-white transition-colors">AI Sync</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4" id="landing-nav-actions">
          <button 
            id="launch-workspace-navbar-btn"
            onClick={onLaunchApp}
            className="group flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm font-medium shadow-md transition-all border border-violet-500/30 bg-violet-600/90 hover:bg-violet-600 text-white cursor-pointer active:scale-98"
          >
            Launch Platform
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-16 lg:pt-24 pb-16 text-center" id="landing-hero">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/45 border border-violet-800/30 text-xs font-mono text-violet-300 mb-6" id="hero-pill">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FLOW ENTERPRISE RE-IMAGINED</span>
        </div>
        
        <h1 
          className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white max-w-4xl mx-auto leading-none mb-6"
          id="hero-title"
        >
          Dynamic Collaboration <br />
          <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Built for Enterprise SaaS
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed" id="hero-tagline">
          The unified digital workspace of Confluence documentation, Slack threads, and Linear schedules. Highly customizable, securely isolated, and powered by server-side Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20" id="hero-ctas">
          <button 
            id="launch-platform-main-btn"
            onClick={onLaunchApp}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-xl text-base font-semibold shadow-xl shadow-violet-900/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white cursor-pointer transition-all active:scale-98 border-t border-violet-400/20"
          >
            Launch Free Sandbox
            <ArrowRight className="w-5 h-5" />
          </button>
          <a 
            href="#faq"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-xl text-base font-semibold bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white transition-all border border-slate-700/60"
          >
            Examine Standards
          </a>
        </div>

        {/* Dynamic Static App Preview with Neon Grads */}
        <div className="relative max-w-5xl mx-auto rounded-2xl p-1.5 bg-gradient-to-tr from-slate-800/60 via-slate-700/30 to-slate-800/60 shadow-2xl shadow-indigo-950/50" id="app-preview-container">
          <div className="absolute inset-x-20 -bottom-4 h-1/4 bg-violet-600/10 blur-3xl pointer-events-none" />
          <div className="bg-[#121B2E] rounded-xl overflow-hidden border border-slate-700/30 aspect-[16/10] relative flex shadow-inner">
            {/* Minimal App Chrome Design */}
            <div className="w-48 bg-[#0B111E] border-r border-slate-800/50 flex flex-col p-3 text-left">
              <Logo iconOnly={true} className="mb-6 px-1" />
              <div className="space-y-3">
                <div className="h-4 bg-slate-800/50 rounded w-4/5" />
                <div className="h-3 bg-slate-800/30 rounded w-2/3" />
                <div className="h-3 bg-slate-800/30 rounded w-3/4 animate-pulse" />
                <div className="h-1 bg-slate-800/10 rounded w-full my-4" />
                <div className="h-3 bg-slate-800/20 rounded w-1/2" />
                <div className="h-3 bg-slate-800/20 rounded w-3/4" />
                <div className="h-3 bg-slate-800/20 rounded w-2/3" />
              </div>
            </div>
            <div className="flex-1 bg-[#121B2E] flex flex-col p-4 text-left relative">
              <div className="flex items-center justify-between border-b border-slate-800/50 pb-3 mb-4">
                <div className="h-4 bg-slate-800/60 rounded w-1/4" />
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800" />
                  <div className="w-5 h-5 rounded-full bg-slate-800" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[#1D2942]/60 p-3 rounded-lg border border-slate-700/20">
                  <div className="w-6 h-6 rounded bg-violet-500/10 mb-2" />
                  <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                </div>
                <div className="bg-[#1D2942]/60 p-3 rounded-lg border border-slate-700/20">
                  <div className="w-6 h-6 rounded bg-cyan-500/10 mb-2" />
                  <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                </div>
                <div className="bg-[#1D2942]/60 p-3 rounded-lg border border-slate-700/20">
                  <div className="w-6 h-6 rounded bg-emerald-500/10 mb-2" />
                  <div className="h-3 bg-slate-700/50 rounded w-2/3" />
                </div>
              </div>
              <div className="flex-1 bg-[#0F172A]/40 border border-slate-800/40 rounded-lg p-3 space-y-2 font-mono text-[11px] text-slate-500 overflow-hidden">
                <div className="flex gap-1.5"><span className="text-violet-400">INFO:</span> Loaded FLOW Core Workspace successfully.</div>
                <div className="flex gap-1.5"><span className="text-cyan-400">INFO:</span> Connected to multi-region PostgreSQL cluster ap-east-1.</div>
                <div className="flex gap-1.5 text-slate-600"><span className="text-emerald-400">SEC:</span> SSL/SCIM attributes parsed OK. 480 seats active.</div>
              </div>
            </div>
            {/* Absolute overlay button */}
            <div className="absolute inset-0 bg-[#0F172A]/30 backdrop-blur-[2px] flex items-center justify-center">
              <button 
                id="interactive-preview-btn"
                onClick={onLaunchApp}
                className="px-6 py-3 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:scale-105 active:scale-95 shadow-xl shadow-black/40 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Launch Fully Functional Sandbox 🎛️
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Trust Line */}
      <section className="border-t border-b border-slate-800/50 bg-slate-950/20 py-8 relative z-10" id="landing-trust">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-widest font-mono text-slate-500 mb-4">ENGINEERED TO EMBED FLUIDLY WITH LEADING ENTERPRISES</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-400 font-semibold text-sm" id="trust-logos">
            {trustedCompanies.map((tc) => (
              <span key={tc.name} className="hover:text-slate-200 transition-colors cursor-default opacity-70 hover:opacity-100 font-display">
                {tc.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6 relative z-10" id="features">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/50 border border-cyan-800/40 text-xs font-mono text-cyan-300 mb-4">
            <Layout className="w-3.5 h-3.5" />
            <span>THE ALL-IN-ONE VALUE SUITE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
            Unraveling Silos. Connecting Contexts.
          </h2>
          <p className="text-slate-400 text-base">
            Why navigate through 6 contrasting tabs when you can unify threads, task pipelines, custom branding settings, and document structures with real-time UI synchronizations?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="features-bento-grid">
          {features.map((f, idx) => (
            <div 
              key={idx}
              className="group p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/60 transition-all duration-300 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs text-violet-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore Sandbox capability</span>
                <ChevronRight className="w-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant Showcase */}
      <section className="py-16 bg-slate-950/30 border-t border-slate-900" id="ai-co-pilot">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded bg-amber-950/45 border border-amber-800/30">AI COPILOT GROUNDING</span>
              <h3 className="text-3xl font-display font-semibold text-white">Ask anything. Action everything.</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Our local and server-side integrated smart framework translates ambiguous user intentions directly into formatted documentation draft segments, sprint goals, and calendar schedules instantly.
              </p>
              <div className="space-y-3 text-slate-300 text-sm">
                <div className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Synthesize 2-hour channel threads into scannable action vectors</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Interactive Slash Commands inside the document editor blocks</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5" />
                  <span>Draft checklists, markdown tables, and TypeScript code blocks</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#131D31] rounded-2xl border border-slate-800 p-6 shadow-xl" id="landing-ai-sandbox">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Interactive AI Playground</span>
              </div>
              <form onSubmit={handleSimulateAi} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    value={demoPrompt}
                    onChange={(e) => setDemoPrompt(e.target.value)}
                    placeholder="Enter an instruction..."
                    className="w-full bg-[#0F172A] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors pr-10"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                {isAiLoading ? (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/40 text-xs text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Synthesizing enterprise specifications with server-side AI rules...</span>
                  </div>
                ) : demoResponse ? (
                  <div className="p-4 rounded-xl bg-[#0B1221] border border-slate-800/60 text-xs whitespace-pre-line text-slate-300 font-mono leading-relaxed max-h-56 overflow-y-auto">
                    {demoResponse}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/20 text-xs text-slate-500 italic">
                    Type a prompt above or click the launch button below to let Gemini analyze your workspace context on-the-fly.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 lg:py-28 max-w-7xl mx-auto px-6 relative z-10" id="pricing">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs uppercase tracking-wider text-violet-400 px-3 py-1 rounded-full bg-violet-950/45 border border-violet-800/30">CLEAR & PREDICTABLE PRICING</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mt-4 mb-4">
            Built to Scale as You Propel
          </h2>
          <div className="inline-flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg mt-2 mb-4" id="billing-period-switch">
            <button 
              onClick={() => setActivePlan('monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${activePlan === 'monthly' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setActivePlan('yearly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${activePlan === 'yearly' ? 'bg-violet-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Yearly (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" id="pricing-grid">
          {/* Plan 1 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between" id="pricing-plan-starter">
            <div>
              <h4 className="text-base font-bold text-slate-300">Starter</h4>
              <p className="text-slate-500 text-xs mt-1 mb-6">Best for lightweight agile teams</p>
              <div className="flex items-baseline gap-1 text-white mb-6">
                <span className="text-3xl font-extrabold font-display">$8</span>
                <span className="text-slate-500 text-xs">/ seat / {activePlan === 'yearly' ? 'yr' : 'mo'}</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8" id="starter-features">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Unlimited Channels & Spaces</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> 10 GB file capacity limits</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Standard Google integrations</li>
              </ul>
            </div>
            <button 
              onClick={onLaunchApp}
              className="w-full h-11 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer active:scale-98 transition-all"
            >
              Explore Free Demo
            </button>
          </div>

          {/* Plan 2 - Promoted */}
          <div className="p-8 rounded-2xl bg-[#19243C] border border-violet-500/40 flex flex-col justify-between relative" id="pricing-plan-business">
            <div className="absolute top-4 right-4 bg-violet-600 text-white font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
              MOST POPULAR
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Business</h4>
              <p className="text-violet-300/70 text-xs mt-1 mb-6">Optimized for scaling tech cohorts</p>
              <div className="flex items-baseline gap-1 text-white mb-6">
                <span className="text-3xl font-extrabold font-display">${activePlan === 'yearly' ? '15' : '19'}</span>
                <span className="text-slate-400 text-xs">/ seat / {activePlan === 'yearly' ? 'yr' : 'mo'}</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-200 mb-8" id="business-features">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Unlimited block pages & lists</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Automatic Slack/Linear syncing</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> 100 GB files upload limits</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Built-in custom theme templates</li>
              </ul>
            </div>
            <button 
              onClick={onLaunchApp}
              className="w-full h-11 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-955/20 cursor-pointer active:scale-98 transition-all border-t border-violet-400/20"
            >
              Launch Sandbox Mode 🚀
            </button>
          </div>

          {/* Plan 3 */}
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between" id="pricing-plan-enterprise">
            <div>
              <h4 className="text-base font-bold text-slate-300">Enterprise</h4>
              <p className="text-slate-500 text-xs mt-1 mb-6">Advanced SOC-2 & White labeling</p>
              <div className="flex items-baseline gap-1 text-white mb-6">
                <span className="text-3xl font-extrabold font-display">$29</span>
                <span className="text-slate-500 text-xs">/ seat / {activePlan === 'yearly' ? 'yr' : 'mo'}</span>
              </div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8" id="enterprise-features">
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Custom Domain & Custom Logo support</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> SCIM Active Directory integration</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> Audit Logging for critical actions</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-violet-400" /> 2FA enforced authentication parameters</li>
              </ul>
            </div>
            <button 
              onClick={onLaunchApp}
              className="w-full h-11 rounded-lg border border-slate-700/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold cursor-pointer active:scale-98 transition-all"
            >
              Open Enterprise view
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 border-t border-slate-800/40 max-w-4xl mx-auto px-6 relative z-10" id="faq">
        <h3 className="text-2xl sm:text-3xl font-display font-semibold text-center text-white mb-10">Frequently Addressed Inquiries</h3>
        <div className="space-y-6" id="faq-list">
          {FAQs.map((qa, i) => (
            <div key={i} className="p-6 rounded-xl bg-slate-900/30 border border-slate-800/60">
              <h5 className="text-sm font-bold text-white mb-2">{qa.q}</h5>
              <p className="text-slate-400 text-xs leading-relaxed">{qa.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final Enterprise CTA */}
      <section className="py-20 relative z-10 text-center max-w-4xl mx-auto px-6" id="landing-cta">
        <div className="relative rounded-3xl p-12 bg-gradient-to-tr from-violet-950/50 via-slate-900/80 to-cyan-950/50 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_bottom_left,#8B5CF6,transparent_40%)]" />
          
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">Empower Your Corporation with FLOW</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8">
            Create an workspace, map your branding logos, and start dispatching sprint targets dynamically in seconds. No credit card required to evaluate.
          </p>
          <button 
            id="launch-sandbox-bottom-btn"
            onClick={onLaunchApp}
            className="group inline-flex items-center gap-2 px-8 h-12 rounded-xl text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 transition-all shadow-lg shadow-black/30 cursor-pointer active:scale-98"
          >
            Launch Platform Sandbox
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer border-t border-slate-800/60 bg-slate-950/40 py-12 relative z-10" id="landing-footer">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <p className="text-slate-500 text-xs">
            &copy; 2026 FLOW Enterprise Inc. Built with production-ready Vite and React modular frameworks. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400" id="footer-links">
            <a href="#features" className="hover:text-white transition-colors">Compliance</a>
            <a href="#ai-co-pilot" className="hover:text-white transition-colors">Privacy Charter</a>
            <a href="#pricing" className="hover:text-white transition-colors">System Health</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
