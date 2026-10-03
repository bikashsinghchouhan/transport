'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      setSuccess('Login successful! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.glowBg} />

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.badge}>
            <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            Secure Portal
          </span>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>Sign in to access the b2 Transport administration panel</p>
        </div>

        {error && (
          <div className={styles.errorAlert} style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className={styles.successAlert} style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email or Admin ID</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder="Enter Email or Admin ID"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.togglePasswordBtn}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.spinner} />
                Authenticating...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footerLinks}>
          <Link href="/admin/forgot-password" className={styles.link}>
            Forgot your password? Get reset link
          </Link>
          <Link href="/" className={styles.link} style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            ← Back to Main Website
          </Link>
        </div>
      </div>
    </div>
  );
}
