'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  LogOut,
  Database,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Truck,
  Plus,
  Edit2,
  Trash2,
  X,
  Layers,
  Scale,
  Box,
  ExternalLink,
  Calculator,
  Eye,
  EyeOff,
  Menu,
  PhoneCall,
  MapPin,
  MessageSquare
} from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import styles from '../admin.module.css';

interface AdminInfo {
  id: string;
  email: string;
  adminId: string;
  createdAt?: string;
}

interface VehicleItem {
  _id?: string;
  name: string;
  capacity: string;
  dimensions: string;
  description: string;
  tag?: string;
  basePrice: number | string;
  perKmPrice: number | string;
  rateFirst100: number | string;
  rateAfter100: number | string;
  minFareMin: number | string;
  minFareMax: number | string;
  isActive: boolean;
  displayOrder?: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { contact, refetchContact } = useContact();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vehicles' | 'contact' | 'security'>('overview');
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Contact settings state
  const [contactForm, setContactForm] = useState({
    phone: contact.phone || '7654722708',
    whatsapp: contact.whatsapp || '917654722708',
    address: contact.address || 'Ranchi, Jharkhand (HQ)',
    email: contact.email || 'support@b2transport.in',
  });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactError, setContactError] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  useEffect(() => {
    if (contact) {
      setContactForm({
        phone: contact.phone || '7654722708',
        whatsapp: contact.whatsapp || '917654722708',
        address: contact.address || 'Ranchi, Jharkhand (HQ)',
        email: contact.email || 'support@b2transport.in',
      });
    }
  }, [contact]);

  // Vehicles state
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [modalAnimateIn, setModalAnimateIn] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Form state
  const [vehicleForm, setVehicleForm] = useState<VehicleItem>({
    name: '',
    capacity: '',
    dimensions: '',
    description: '',
    tag: '',
    basePrice: 500,
    perKmPrice: 25,
    rateFirst100: 35,
    rateAfter100: 30,
    minFareMin: 1500,
    minFareMax: 1800,
    isActive: true,
  });

  // Calculation Simulator State inside Modal
  const [previewKm, setPreviewKm] = useState<number | string>(120);

  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changePassLoading, setChangePassLoading] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');

  // Email reset trigger
  const [emailResetLoading, setEmailResetLoading] = useState(false);
  const [emailResetMsg, setEmailResetMsg] = useState('');
  const [devResetUrl, setDevResetUrl] = useState('');

  useEffect(() => {
    fetchAdminInfo();
    fetchVehicles();
  }, []);

  const fetchAdminInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/me');
      const data = await res.json();

      if (!res.ok || !data.success) {
        router.push('/admin/login');
        return;
      }

      setAdmin(data.admin);
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const res = await fetch('/api/vehicles?all=true');
      const data = await res.json();
      if (data.success && data.vehicles) {
        setVehicles(data.vehicles);
      }
    } catch (err) {
      console.error('Failed to load vehicles:', err);
    } finally {
      setVehiclesLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleTabChange = (tab: 'overview' | 'vehicles' | 'contact' | 'security') => {
    setActiveTab(tab);
    setMobileSidebarOpen(false);
  };

  // Save Contact & Business Settings
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess('');
    setContactSaving(true);

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update contact settings');
      }

      setContactSuccess('Contact & Business Settings updated successfully! Live everywhere across the website.');
      refetchContact();
    } catch (err: any) {
      setContactError(err.message || 'Error updating contact settings');
    } finally {
      setContactSaving(false);
    }
  };

  // Close Vehicle Modal with Smooth Slide-Out Animation
  const handleCloseVehicleModal = () => {
    setModalAnimateIn(false);
    setTimeout(() => {
      setShowVehicleModal(false);
    }, 350);
  };

  // Open Vehicle Modal for Add
  const handleOpenAddVehicle = () => {
    setEditingVehicleId(null);
    setVehicleForm({
      name: '',
      capacity: '750 kg',
      dimensions: '7 ft x 4.8 ft x 4.8 ft',
      description: 'Best for narrow streets, local shop deliveries, shifting a single bed, fridge, or wardrobe.',
      tag: 'New Vehicle',
      basePrice: 500,
      perKmPrice: 25,
      rateFirst100: 35,
      rateAfter100: 30,
      minFareMin: 1500,
      minFareMax: 1800,
      isActive: true,
      displayOrder: 0,
    });
    setPreviewKm(120);
    setModalError('');
    setModalSuccess('');
    setShowVehicleModal(true);
    setTimeout(() => {
      setModalAnimateIn(true);
    }, 20);
  };

  // Open Vehicle Modal for Edit
  const handleOpenEditVehicle = (veh: VehicleItem) => {
    setEditingVehicleId(veh._id || null);
    setVehicleForm({
      name: veh.name,
      capacity: veh.capacity,
      dimensions: veh.dimensions,
      description: veh.description,
      tag: veh.tag || '',
      basePrice: veh.basePrice ?? 500,
      perKmPrice: veh.perKmPrice ?? 25,
      rateFirst100: veh.rateFirst100 ?? 35,
      rateAfter100: veh.rateAfter100 ?? 30,
      minFareMin: veh.minFareMin ?? 1500,
      minFareMax: veh.minFareMax ?? 1800,
      isActive: veh.isActive,
      displayOrder: veh.displayOrder ?? 0,
    });
    setPreviewKm(120);
    setModalError('');
    setModalSuccess('');
    setShowVehicleModal(true);
    setTimeout(() => {
      setModalAnimateIn(true);
    }, 20);
  };

  // Save Vehicle (Create or Update)
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setModalSaving(true);

    try {
      const endpoint = editingVehicleId
        ? `/api/vehicles/${editingVehicleId}`
        : '/api/vehicles';
      const method = editingVehicleId ? 'PUT' : 'POST';

      const payload = {
        ...vehicleForm,
        basePrice: Number(vehicleForm.basePrice) || 0,
        perKmPrice: Number(vehicleForm.perKmPrice) || 0,
        rateFirst100: Number(vehicleForm.rateFirst100) || 0,
        rateAfter100: Number(vehicleForm.rateAfter100) || 0,
        minFareMin: Number(vehicleForm.minFareMin) || 0,
        minFareMax: Number(vehicleForm.minFareMax) || 0,
        displayOrder: Number(vehicleForm.displayOrder) || 0,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save vehicle');
      }

      setModalSuccess(editingVehicleId ? 'Vehicle updated successfully!' : 'Vehicle created successfully!');
      fetchVehicles();
      setTimeout(() => {
        handleCloseVehicleModal();
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Error saving vehicle');
    } finally {
      setModalSaving(false);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle from the database?')) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchVehicles();
      } else {
        alert(data.error || 'Failed to delete vehicle');
      }
    } catch (err) {
      alert('Error deleting vehicle');
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');

    if (newPassword !== confirmPassword) {
      setChangePassError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setChangePassError('New password must be at least 6 characters long');
      return;
    }

    setChangePassLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setChangePassSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setChangePassError(err.message || 'Error changing password');
    } finally {
      setChangePassLoading(false);
    }
  };

  // Trigger Email Reset Link
  const handleSendResetEmail = async () => {
    if (!admin) return;
    setEmailResetMsg('');
    setDevResetUrl('');
    setEmailResetLoading(true);

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: admin.email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setEmailResetMsg(data.message);
      if (data.resetUrl) {
        setDevResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setEmailResetMsg(`Error: ${err.message}`);
    } finally {
      setEmailResetLoading(false);
    }
  };

  // Live preview calculation helper
  const calculatePreviewFare = (distInput: number | string) => {
    const distKm = typeof distInput === 'number' ? distInput : (Number(distInput) || 0);
    const r100 = Number(vehicleForm.rateFirst100) || 0;
    const rAfter = Number(vehicleForm.rateAfter100) || 0;
    const minMin = Number(vehicleForm.minFareMin) || 0;
    const minMax = Number(vehicleForm.minFareMax) || 0;

    let distanceFare = 0;
    let part1 = 0;
    let part2 = 0;

    if (distKm <= 100) {
      part1 = distKm * r100;
      distanceFare = part1;
    } else {
      part1 = 100 * r100;
      part2 = (distKm - 100) * rAfter;
      distanceFare = part1 + part2;
    }

    const variance = Math.max(150, Math.round((distanceFare * 0.035) / 50) * 50);
    let fareMin = Math.round((distanceFare - variance) / 100) * 100;
    let fareMax = Math.round((distanceFare + variance) / 100) * 100;

    if (fareMin < minMin) fareMin = minMin;
    if (fareMax < minMax) fareMax = minMax;

    if (distKm <= 25) {
      fareMin = minMin;
      fareMax = minMax;
    }

    return {
      distKm,
      part1,
      part2,
      distanceFare,
      fareMin,
      fareMax,
    };
  };

  const previewResult = calculatePreviewFare(previewKm);

  if (loading) {
    return (
      <div className={styles.adminShell} style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className={styles.spinner} style={{ width: '40px', height: '40px' }} />
        <p style={{ marginLeft: '1rem', color: '#94a3b8' }}>Loading Admin Console...</p>
      </div>
    );
  }

  return (
    <div className={styles.adminShell}>
      {/* Dark Mobile Overlay backdrop when drawer is open */}
      {mobileSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* Admin Sidebar */}
      <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div>
          <div className={styles.sidebarBrand}>
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/b2transport_logo_circle.png`}
              alt="B2 Transport Logo"
              className={styles.brandLogoImg}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className={styles.brandTitle}>b2 Transport</div>
              <div className={styles.brandSubtitle}>Super Admin</div>
            </div>
            {/* Close button on mobile sidebar header */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className={styles.closeBtn}
              style={{ display: mobileSidebarOpen ? 'flex' : 'none' }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          </div>

          <nav className={styles.navGroup}>
            <button
              className={`${styles.navItem} ${activeTab === 'overview' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <Layers size={18} /> Overview
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'vehicles' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('vehicles')}
            >
              <Truck size={18} /> Manage Vehicles & Rates
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'contact' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('contact')}
            >
              <PhoneCall size={18} /> Contact & Business Settings
            </button>
            <button
              className={`${styles.navItem} ${activeTab === 'security' ? styles.navItemActive : ''}`}
              onClick={() => handleTabChange('security')}
            >
              <KeyRound size={18} /> Password & Security
            </button>
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <Link href="/" target="_blank" className={styles.navItem} onClick={() => setMobileSidebarOpen(false)} style={{ color: '#38bdf8' }}>
            <ExternalLink size={16} /> View Website
          </Link>
          <button onClick={() => { setMobileSidebarOpen(false); handleLogout(); }} className={styles.navItem} style={{ color: '#ef4444' }}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.topBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Hamburger button for mobile devices */}
            <button
              className={styles.mobileMenuToggle}
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <h2 className={styles.topTitle}>
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'vehicles' && 'Vehicle Fleet & Fare Rate Controls'}
              {activeTab === 'contact' && 'Contact & Business Settings'}
              {activeTab === 'security' && 'Security & Password Settings'}
            </h2>
          </div>

          <div className={styles.userBadge}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
              {admin?.email}
            </span>
          </div>
        </div>

        <div className={styles.contentBody}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>System Status & Fleet Overview</h3>
                  <p className={styles.sectionDesc}>Manage your transport fleet and admin configurations</p>
                </div>
              </div>

              <div className={styles.dashboardGrid}>
                {/* Profile Card */}
                <div className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>
                    <User size={18} color="#38bdf8" /> Super Admin Details
                  </h3>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email</span>
                    <span className={styles.detailValue}>{admin?.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Admin ID</span>
                    <span className={styles.detailValue}>{admin?.adminId}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>MongoDB Backend</span>
                    <span className={styles.detailValue} style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Database size={14} /> Connected
                    </span>
                  </div>
                </div>

                {/* Quick Fleet Card */}
                <div className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>
                    <Truck size={18} color="#38bdf8" /> Active Vehicles
                  </h3>
                  <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#38bdf8', margin: '0.5rem 0' }}>
                    {vehicles.length}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                    High-Performance Vehicles with dynamic fare calculation configuration.
                  </p>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className={styles.actionBtn}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                  >
                    Manage Vehicles & Fare Control →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLES & FARE RATES MANAGEMENT */}
          {activeTab === 'vehicles' && (
            <div>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>High-Performance Vehicles & Fare Rate Controls</h3>
                  <p className={styles.sectionDesc}>Configure weight capacity, cargo dimensions, First 100 KM rates, and Above 100 KM rates</p>
                </div>
                <button onClick={handleOpenAddVehicle} className={styles.actionBtn}>
                  <Plus size={18} /> Add New Vehicle
                </button>
              </div>

              {vehiclesLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  <div className={styles.spinner} style={{ margin: '0 auto 1rem auto' }} />
                  Loading vehicles from MongoDB...
                </div>
              ) : vehicles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(30,41,59,0.4)', borderRadius: '12px', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>No vehicles found in database.</p>
                  <button onClick={handleOpenAddVehicle} className={styles.actionBtn} style={{ margin: '0 auto' }}>
                    <Plus size={16} /> Add First Vehicle
                  </button>
                </div>
              ) : (
                <div className={styles.vehiclesGrid}>
                  {vehicles.map((veh) => (
                    <div key={veh._id} className={styles.vehicleCard}>
                      <div>
                        <div className={styles.vehicleHeader}>
                          <h4 className={styles.vehicleName}>{veh.name}</h4>
                          {veh.tag && <span className={styles.tagBadge}>{veh.tag}</span>}
                        </div>

                        <div className={styles.specBox}>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>
                              <Scale size={13} style={{ display: 'inline', marginRight: '4px' }} /> Weight Capacity:
                            </span>
                            <span className={styles.specValue}>{veh.capacity}</span>
                          </div>
                          <div className={styles.specRow}>
                            <span className={styles.specLabel}>
                              <Box size={13} style={{ display: 'inline', marginRight: '4px' }} /> Cargo Dimensions:
                            </span>
                            <span className={styles.specValue}>{veh.dimensions}</span>
                          </div>
                        </div>

                        {/* FARE CONTROL BREAKDOWN BADGE */}
                        <div style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.6rem 0.8rem', margin: '0.6rem 0', fontSize: '0.8rem' }}>
                          <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calculator size={14} /> Configured Shifting Rates:
                          </div>
                          <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                            <span>First 100 KM:</span>
                            <strong style={{ color: '#ffffff' }}>₹{veh.rateFirst100 ?? 35}/KM</strong>
                          </div>
                          <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Above 100 KM:</span>
                            <strong style={{ color: '#ffffff' }}>₹{veh.rateAfter100 ?? 30}/KM</strong>
                          </div>
                          <div style={{ color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Min Fare Range:</span>
                            <strong style={{ color: '#ffffff' }}>₹{veh.minFareMin ?? 1500} - ₹{veh.minFareMax ?? 1800}</strong>
                          </div>
                        </div>

                        <p className={styles.vehicleDesc}>{veh.description}</p>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.priceTag}>
                          ₹{veh.rateFirst100 ?? 35}<span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>/km (First 100)</span>
                        </div>
                        <div className={styles.cardActions}>
                          <button onClick={() => handleOpenEditVehicle(veh)} className={styles.editBtn}>
                            <Edit2 size={14} /> Edit Rates
                          </button>
                          <button onClick={() => veh._id && handleDeleteVehicle(veh._id)} className={styles.deleteBtn}>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT & BUSINESS SETTINGS */}
          {activeTab === 'contact' && (
            <div style={{ maxWidth: '750px' }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Contact & Business Settings</h3>
                  <p className={styles.sectionDesc}>Update phone numbers, WhatsApp link, and HQ address. Updates live across the entire website!</p>
                </div>
              </div>

              <div className={styles.infoCard} style={{ marginBottom: '1.5rem' }}>
                <h3 className={styles.infoTitle}>
                  <PhoneCall size={18} color="#38bdf8" /> Edit Global Contact Information
                </h3>

                {contactError && (
                  <div className={styles.errorAlert} style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} /> {contactError}
                  </div>
                )}

                {contactSuccess && (
                  <div className={styles.successAlert} style={{ marginBottom: '1rem' }}>
                    <CheckCircle2 size={16} /> {contactSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveContact} className={styles.form}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className={styles.inputGroup}>
                      <label className={styles.label}>Primary Call Phone Number</label>
                      <div className={styles.inputWrapper}>
                        <PhoneCall className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. 7654722708"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Used in Call links, Top Notice Bar & Header buttons</span>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.label}>WhatsApp Number (Country Code)</label>
                      <div className={styles.inputWrapper}>
                        <MessageSquare className={styles.inputIcon} />
                        <input
                          type="text"
                          className={styles.input}
                          placeholder="e.g. 917654722708"
                          value={contactForm.whatsapp}
                          onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                          required
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Used for WhatsApp booking & inquiry links</span>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>HQ Office Address / Location Text</label>
                    <div className={styles.inputWrapper}>
                      <MapPin className={styles.inputIcon} />
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Ranchi, Jharkhand (HQ)"
                        value={contactForm.address}
                        onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                        required
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Displayed in Footer & Location pages</span>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Support Email Address</label>
                    <div className={styles.inputWrapper}>
                      <Mail className={styles.inputIcon} />
                      <input
                        type="email"
                        className={styles.input}
                        placeholder="e.g. support@b2transport.in"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={contactSaving} style={{ marginTop: '0.5rem' }}>
                    {contactSaving ? 'Saving Changes...' : 'Save & Update Everywhere Live'}
                  </button>
                </form>
              </div>

              {/* Live Preview Banner Card */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>
                  <Eye size={18} color="#38bdf8" /> Live Site Banner & CTA Preview
                </h3>
                <div style={{ background: 'rgba(15,23,42,0.8)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.2)' }}>
                  <div style={{ background: 'linear-gradient(90deg, #0284c7, #2563eb)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>
                    Top Bar Preview: Call for Booking: <strong>{contactForm.phone || '7654722708'}</strong>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div><strong>Footer Address:</strong> {contactForm.address || 'Ranchi, Jharkhand (HQ)'}</div>
                    <div><strong>WhatsApp Booking Link:</strong> https://wa.me/{contactForm.whatsapp || '917654722708'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '650px' }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Password & Account Security</h3>
                  <p className={styles.sectionDesc}>Update your super admin password or generate email reset link</p>
                </div>
              </div>

              <div className={styles.infoCard} style={{ marginBottom: '1.5rem' }}>
                <h3 className={styles.infoTitle}>
                  <KeyRound size={18} color="#38bdf8" /> Change Super Admin Password
                </h3>

                {changePassError && (
                  <div className={styles.errorAlert} style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} /> {changePassError}
                  </div>
                )}

                {changePassSuccess && (
                  <div className={styles.successAlert} style={{ marginBottom: '1rem' }}>
                    <CheckCircle2 size={16} /> {changePassSuccess}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className={styles.form}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Current Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className={styles.togglePasswordBtn}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
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
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Confirm New Password</label>
                    <div className={styles.inputWrapper}>
                      <Lock className={styles.inputIcon} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className={styles.togglePasswordBtn}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={changePassLoading}>
                    {changePassLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>

              {/* Reset Email Trigger Card */}
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>
                  <Mail size={18} color="#38bdf8" /> Email Password Reset Link
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
                  Sends an official password reset link via email to <strong>{admin?.email}</strong>.
                </p>

                <button onClick={handleSendResetEmail} disabled={emailResetLoading} className={styles.actionBtn} style={{ width: '100%', justifyContent: 'center' }}>
                  {emailResetLoading ? 'Sending Email...' : `Send Password Reset Link to ${admin?.email}`}
                </button>

                {emailResetMsg && (
                  <div style={{ marginTop: '1rem', padding: '10px', background: 'rgba(34,197,94,0.1)', color: '#86efac', borderRadius: '8px', fontSize: '0.85rem' }}>
                    {emailResetMsg}
                  </div>
                )}
                {devResetUrl && (
                  <div style={{ marginTop: '0.5rem', padding: '10px', background: 'rgba(0,0,0,0.4)', color: '#38bdf8', borderRadius: '8px', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                    <strong>Dev Reset URL:</strong> <a href={devResetUrl} style={{ color: '#7dd3fc', textDecoration: 'underline' }}>{devResetUrl}</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ADD / EDIT VEHICLE MODAL */}
      {showVehicleModal && (
        <div
          className={`${styles.modalOverlay} ${modalAnimateIn ? styles.modalOverlayVisible : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseVehicleModal();
          }}
        >
          <div className={`${styles.modalContent} ${modalAnimateIn ? styles.modalContentVisible : ''}`}>
            <div className={styles.modalHeader}>
              <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                {editingVehicleId ? 'Edit Vehicle & Fare Rate Controls' : 'Add New Vehicle & Set Fare Controls'}
              </h3>
              <button onClick={handleCloseVehicleModal} className={styles.closeBtn} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {modalError && (
              <div className={styles.errorAlert} style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} /> {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className={styles.successAlert} style={{ marginBottom: '1rem' }}>
                <CheckCircle2 size={16} /> {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSaveVehicle} className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Vehicle Name</label>
                <input
                  type="text"
                  className={styles.input}
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Tata Ace / Chota Hathi"
                  value={vehicleForm.name}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Weight Capacity</label>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '1rem' }}
                    placeholder="e.g. 750 kg or 1.3 Tons"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Cargo Dimensions</label>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '1rem' }}
                    placeholder="e.g. 7 ft x 4.8 ft x 4.8 ft"
                    value={vehicleForm.dimensions}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, dimensions: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* FARE RATE CONTROL SECTION */}
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px', padding: '1rem', marginTop: '0.5rem' }}>
                <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calculator size={16} /> Fare Calculation Controls (Per Vehicle)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>First 100 KM Rate (₹/KM)</label>
                    <input
                      type="number"
                      className={styles.input}
                      style={{ paddingLeft: '1rem' }}
                      placeholder="e.g. 38 or 35"
                      value={vehicleForm.rateFirst100}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, rateFirst100: e.target.value === '' ? '' : e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Above 100 KM Rate (₹/KM)</label>
                    <input
                      type="number"
                      className={styles.input}
                      style={{ paddingLeft: '1rem' }}
                      placeholder="e.g. 32 or 30"
                      value={vehicleForm.rateAfter100}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, rateAfter100: e.target.value === '' ? '' : e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Min Fare Min Range (₹)</label>
                    <input
                      type="number"
                      className={styles.input}
                      style={{ paddingLeft: '1rem' }}
                      placeholder="e.g. 1500"
                      value={vehicleForm.minFareMin}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, minFareMin: e.target.value === '' ? '' : e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Min Fare Max Range (₹)</label>
                    <input
                      type="number"
                      className={styles.input}
                      style={{ paddingLeft: '1rem' }}
                      placeholder="e.g. 1800"
                      value={vehicleForm.minFareMax}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, minFareMax: e.target.value === '' ? '' : e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* LIVE PREVIEW SIMULATOR */}
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed rgba(56, 189, 248, 0.3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} color="#38bdf8" /> Live Fare Calculation Preview:
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Test Distance:</span>
                      <input
                        type="number"
                        value={previewKm}
                        onChange={(e) => setPreviewKm(e.target.value === '' ? '' : e.target.value)}
                        placeholder="120"
                        style={{ width: '75px', padding: '4px 6px', background: 'rgba(15,23,42,0.8)', border: '1px solid #38bdf8', borderRadius: '6px', color: '#ffffff', fontSize: '0.85rem', textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>KM</span>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                    {previewResult.distKm <= 100 ? (
                      <div style={{ color: '#cbd5e1' }}>
                        <div>Formula: <strong>{previewResult.distKm} KM</strong> × <strong>₹{vehicleForm.rateFirst100 || 0}/KM</strong> (First 100 KM Rate)</div>
                        <div style={{ marginTop: '2px' }}>Raw Distance Fare = <strong>₹{previewResult.distanceFare.toLocaleString('en-IN')}</strong></div>
                      </div>
                    ) : (
                      <div style={{ color: '#cbd5e1' }}>
                        <div>First 100 KM: 100 KM × ₹{vehicleForm.rateFirst100 || 0}/KM = <strong>₹{previewResult.part1.toLocaleString('en-IN')}</strong></div>
                        <div>Above 100 KM: {previewResult.distKm - 100} KM × ₹{vehicleForm.rateAfter100 || 0}/KM = <strong>₹{previewResult.part2.toLocaleString('en-IN')}</strong></div>
                        <div style={{ marginTop: '2px' }}>Raw Distance Fare = <strong>₹{previewResult.distanceFare.toLocaleString('en-IN')}</strong></div>
                      </div>
                    )}
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>Calculated Shifting Range:</span>
                      <strong style={{ color: '#38bdf8', fontSize: '0.95rem' }}>
                        ₹{previewResult.fareMin.toLocaleString('en-IN')} - ₹{previewResult.fareMax.toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup} style={{ marginTop: '0.5rem' }}>
                <label className={styles.label}>Best For Description</label>
                <textarea
                  className={styles.input}
                  style={{ paddingLeft: '1rem', minHeight: '70px', fontFamily: 'inherit' }}
                  placeholder="Best for narrow streets, local shop deliveries, shifting a single bed, fridge, or wardrobe."
                  value={vehicleForm.description}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, description: e.target.value })}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Tag / Badge</label>
                <input
                  type="text"
                  className={styles.input}
                  style={{ paddingLeft: '1rem' }}
                  placeholder="e.g. Most Popular"
                  value={vehicleForm.tag}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, tag: e.target.value })}
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={modalSaving} style={{ marginTop: '1rem' }}>
                {modalSaving ? 'Saving...' : editingVehicleId ? 'Update Vehicle & Fare Rates' : 'Save New Vehicle & Rates'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
