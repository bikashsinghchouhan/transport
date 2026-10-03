'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import styles from '../admin.module.css';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultMessage, setResultMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResultMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setResultMessage(data.message);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
            <KeyRound size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
            Password Recovery
          </span>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>Enter your Admin Email or Admin ID to receive a password reset link</p>
        </div>

        {error && (
          <div className={styles.errorAlert} style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {resultMessage && (
          <div className={styles.successAlert} style={{ marginBottom: '1.25rem' }}>
            <CheckCircle2 size={20} style={{ flexShrink: 0, color: '#4ade80' }} />
            <span>{resultMessage}</span>
          </div>
        )}

        {!resultMessage && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email or Admin ID</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter Email or Admin ID"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <>
                  <div className={styles.spinner} />
                  Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <Send size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div className={styles.footerLinks}>
          <Link href="/admin/login" className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
