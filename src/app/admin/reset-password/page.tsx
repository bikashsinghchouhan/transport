'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, KeyRound, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import styles from '../admin.module.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token in URL');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/admin/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>
          <KeyRound size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }} />
          New Credentials
        </span>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>Enter a new password for your Admin account</p>
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
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder="Minimum 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Confirm New Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.input}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading || !token}>
          {loading ? (
            <>
              <div className={styles.spinner} />
              Updating Password...
            </>
          ) : (
            <>
              Update Password
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className={styles.footerLinks}>
        <Link href="/admin/login" className={styles.link}>
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.adminContainer}>
      <div className={styles.glowBg} />
      <Suspense fallback={<div className={styles.card}>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
