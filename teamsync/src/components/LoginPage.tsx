import React, { useState } from 'react';
import { API_BASE_URL } from '../api';
import type { User } from '../types';
import Logo from './Logo';

export default function LoginPage({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password, deviceName: 'web' }),
      });
      if (!response.ok) throw new Error('Invalid email or password.');
      const payload = await response.json();
      sessionStorage.setItem('flow_api_token', payload.token);
      onAuthenticated(payload.user);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="min-h-screen bg-slate-950 text-white grid place-items-center p-6">
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-2xl space-y-5">
      <Logo />
      <div><h1 className="text-xl font-bold">Sign in</h1><p className="text-sm text-slate-400">Use your workspace account.</p></div>
      <input aria-label="Email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
      <input aria-label="Password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-violet-600 p-3 font-bold disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
}
