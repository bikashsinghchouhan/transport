'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  MessageSquare,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Navigation,
  CalendarCheck,
  Receipt,
  CreditCard,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { useContact } from '@/context/ContactContext';
import FleetManagement, { FleetSubTab } from '@/components/fleet/FleetManagement';
import styles from '@/app/admin/admin.module.css';

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

export type AdminTab = 'overview' | 'vehicles' | 'fleet' | 'contact' | 'security';

export function getPathForTab(tabKey: string, action?: string | null): string {
  let path = '/admin/dashboard';
  switch (tabKey) {
    case 'overview':
      path = '/admin/dashboard';
      break;
    case 'fleet':
      path = '/admin/fleet';
      break;
    case 'trips':
    case 'trip':
      path = '/admin/fleet/trips';
      break;
    case 'attendance':
      path = '/admin/fleet/attendance';
      break;
    case 'expenses':
    case 'expense':
      path = '/admin/fleet/expenses';
      break;
    case 'payments':
    case 'payment':
      path = '/admin/fleet/payments';
      break;
    case 'drivers':
    case 'driver':
      path = '/admin/fleet/drivers';
      break;
    case 'fleet-vehicles':
    case 'vehicles':
      path = '/admin/fleet/vehicles';
      break;
    case 'reports':
      path = '/admin/fleet/reports';
      break;
    case 'rates':
      path = '/admin/rates';
      break;
    case 'contact':
    case 'contactsetting':
      path = '/admin/contactsetting';
      break;
    case 'security':
    case 'password-security':
      path = '/admin/password-security';
      break;
    default:
      path = '/admin/dashboard';
  }

  if (action) {
    return `${path}?action=${encodeURIComponent(action)}`;
  }
  return path;
}

export function parseTabFromPathAndQuery(
  pathname?: string,
  searchParams?: URLSearchParams | null,
  defaultTab?: string
): {
  activeTab: AdminTab;
  fleetSubTab: FleetSubTab;
  tabKey: string;
} {
  const tabQuery = searchParams?.get('tab');
  const path = pathname || (defaultTab ? getPathForTab(defaultTab) : '') || '';

  // 1. If explicit query parameter tab is provided
  if (tabQuery) {
    switch (tabQuery) {
      case 'trips':
      case 'trip':
        return { activeTab: 'fleet', fleetSubTab: 'trips', tabKey: 'trips' };
      case 'attendance':
        return { activeTab: 'fleet', fleetSubTab: 'attendance', tabKey: 'attendance' };
      case 'expenses':
      case 'expense':
        return { activeTab: 'fleet', fleetSubTab: 'expenses', tabKey: 'expenses' };
      case 'payments':
      case 'payment':
        return { activeTab: 'fleet', fleetSubTab: 'payments', tabKey: 'payments' };
      case 'drivers':
      case 'driver':
        return { activeTab: 'fleet', fleetSubTab: 'drivers', tabKey: 'drivers' };
      case 'fleet-vehicles':
      case 'fleet_vehicles':
      case 'vehicles':
        return { activeTab: 'fleet', fleetSubTab: 'vehicles', tabKey: 'fleet-vehicles' };
      case 'reports':
        return { activeTab: 'fleet', fleetSubTab: 'reports', tabKey: 'reports' };
      case 'fleet':
        return { activeTab: 'fleet', fleetSubTab: 'dashboard', tabKey: 'fleet' };
      case 'rates':
        return { activeTab: 'vehicles', fleetSubTab: 'dashboard', tabKey: 'rates' };
      case 'contact':
      case 'contactsetting':
        return { activeTab: 'contact', fleetSubTab: 'dashboard', tabKey: 'contactsetting' };
      case 'security':
      case 'password-security':
        return { activeTab: 'security', fleetSubTab: 'dashboard', tabKey: 'password-security' };
      case 'overview':
      default:
        return { activeTab: 'overview', fleetSubTab: 'dashboard', tabKey: 'overview' };
    }
  }

  // 2. Derive from URL pathname or defaultTab
  if (path.includes('/fleet/trip')) {
    return { activeTab: 'fleet', fleetSubTab: 'trips', tabKey: 'trips' };
  }
  if (path.includes('/fleet/attendance')) {
    return { activeTab: 'fleet', fleetSubTab: 'attendance', tabKey: 'attendance' };
  }
  if (path.includes('/fleet/expense')) {
    return { activeTab: 'fleet', fleetSubTab: 'expenses', tabKey: 'expenses' };
  }
  if (path.includes('/fleet/payment')) {
    return { activeTab: 'fleet', fleetSubTab: 'payments', tabKey: 'payments' };
  }
  if (path.includes('/fleet/driver')) {
    return { activeTab: 'fleet', fleetSubTab: 'drivers', tabKey: 'drivers' };
  }
  if (path.includes('/fleet/vehicle')) {
    return { activeTab: 'fleet', fleetSubTab: 'vehicles', tabKey: 'fleet-vehicles' };
  }
  if (path.includes('/fleet/report')) {
    return { activeTab: 'fleet', fleetSubTab: 'reports', tabKey: 'reports' };
  }
  if (path.endsWith('/fleet') || path === '/admin/fleet') {
    return { activeTab: 'fleet', fleetSubTab: 'dashboard', tabKey: 'fleet' };
  }
  if (path.includes('/rates')) {
    return { activeTab: 'vehicles', fleetSubTab: 'dashboard', tabKey: 'rates' };
  }
  if (path.includes('/contactsetting') || path.includes('/contact')) {
    return { activeTab: 'contact', fleetSubTab: 'dashboard', tabKey: 'contactsetting' };
  }
  if (path.includes('/password-security') || path.includes('/security')) {
    return { activeTab: 'security', fleetSubTab: 'dashboard', tabKey: 'password-security' };
  }

  return { activeTab: 'overview', fleetSubTab: 'dashboard', tabKey: 'overview' };
}

export interface AdminDashboardProps {
  defaultTab?: string;
}

function AdminDashboardContent({ defaultTab = 'overview' }: AdminDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { contact, refetchContact } = useContact();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize active tab from defaultTab or URL
  const initialParsed = parseTabFromPathAndQuery(
    typeof window !== 'undefined' ? window.location.pathname : undefined,
    searchParams,
    defaultTab
  );

  const [activeTab, setActiveTab] = useState<AdminTab>(initialParsed.activeTab);
  const [fleetSubTab, setFleetSubTab] = useState<FleetSubTab>(initialParsed.fleetSubTab);
  const [fleetMenuExpanded, setFleetMenuExpanded] = useState<boolean>(true);
  const [currentAction, setCurrentAction] = useState<string | null>(searchParams.get('action'));
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

  const activeMenuKey = (() => {
    if (activeTab === 'fleet') {
      if (fleetSubTab === 'trips') return 'trips';
      if (fleetSubTab === 'attendance') return 'attendance';
      if (fleetSubTab === 'expenses') return 'expenses';
      if (fleetSubTab === 'payments') return 'payments';
      if (fleetSubTab === 'drivers') return 'drivers';
      if (fleetSubTab === 'vehicles') return 'fleet-vehicles';
      if (fleetSubTab === 'reports') return 'reports';
      return 'fleet';
    }
    if (activeTab === 'vehicles') return 'rates';
    if (activeTab === 'contact') return 'contactsetting';
    if (activeTab === 'security') return 'password-security';
    return activeTab;
  })();

  const navigateTo = (tabKey: string, action?: string | null) => {
    const targetUrl = getPathForTab(tabKey, action);
    const parsed = parseTabFromPathAndQuery(targetUrl);
    setActiveTab(parsed.activeTab);
    setFleetSubTab(parsed.fleetSubTab);
    if (parsed.activeTab === 'fleet') {
      setFleetMenuExpanded(true);
    }
    setCurrentAction(action || null);
    setMobileSidebarOpen(false);

    if (typeof window !== 'undefined') {
      window.history.pushState({ tabKey, action }, '', targetUrl);
    }
  };

  const handleActionChange = (newAction: string | null) => {
    setCurrentAction(newAction);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newAction) {
        url.searchParams.set('action', newAction);
      } else {
        url.searchParams.delete('action');
      }
      window.history.pushState(null, '', url.pathname + (url.search ? url.search : ''));
    }
  };

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

  useEffect(() => {
    fetchAdminInfo();
    fetchVehicles();
  }, []);

  // Synchronize on searchParams change (or initial load)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    const actionParam = searchParams.get('action');
    const parsed = parseTabFromPathAndQuery(currentPath, searchParams, defaultTab);

    setActiveTab(parsed.activeTab);
    setFleetSubTab(parsed.fleetSubTab);
    if (parsed.activeTab === 'fleet') {
      setFleetMenuExpanded(true);
    }
    setCurrentAction(actionParam || null);

    if (parsed.activeTab === 'vehicles' && actionParam === 'add') {
      openAddVehicleModalInternal();
    }
  }, [searchParams, defaultTab]);

  // Synchronize on browser Back / Forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const actionParam = params.get('action');
      const parsed = parseTabFromPathAndQuery(path, params, defaultTab);

      setActiveTab(parsed.activeTab);
      setFleetSubTab(parsed.fleetSubTab);
      if (parsed.activeTab === 'fleet') {
        setFleetMenuExpanded(true);
      }
      setCurrentAction(actionParam || null);

      if (parsed.activeTab === 'vehicles') {
        if (actionParam === 'add') {
          openAddVehicleModalInternal();
        } else {
          closeVehicleModalInternal();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [defaultTab]);

  const handleFleetMenuClick = () => {
    if (activeTab !== 'fleet') {
      navigateTo('fleet');
    } else {
      if (fleetSubTab !== 'dashboard') {
        navigateTo('fleet');
      } else {
        setFleetMenuExpanded((prev) => !prev);
      }
    }
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaving(true);
    setContactError('');
    setContactSuccess('');

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
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
  const closeVehicleModalInternal = () => {
    setModalAnimateIn(false);
    setTimeout(() => {
      setShowVehicleModal(false);
    }, 350);
  };

  const handleCloseVehicleModal = () => {
    closeVehicleModalInternal();
    handleActionChange(null);
  };

  // Open Vehicle Modal for Add
  const openAddVehicleModalInternal = () => {
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

  const handleOpenAddVehicle = () => {
    openAddVehicleModalInternal();
    handleActionChange('add');
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
            <Link
              href="/admin/dashboard"
              className={`${styles.navItem} ${activeMenuKey === 'overview' ? styles.navItemActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('overview');
              }}
            >
              <Layers size={18} style={{ flexShrink: 0 }} /> Overview
            </Link>

            {/* Fleet & Income Menu with Expandable Submenu */}
            <div>
              <Link
                href="/admin/fleet"
                className={`${styles.navItem} ${activeMenuKey === 'fleet' ? styles.navItemActive : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleFleetMenuClick();
                }}
              >
                <TrendingUp size={18} style={{ flexShrink: 0 }} />
                <span>Fleet & Income</span>
                <span
                  style={{
                    marginLeft: 'auto',
                    fontSize: '0.65rem',
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '999px',
                    fontWeight: 700,
                  }}
                >
                  PRO
                </span>
                <span
                  style={{ marginLeft: '0.35rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setFleetMenuExpanded((prev) => !prev);
                  }}
                >
                  {fleetMenuExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </Link>

              {/* Expandable Submenu Items (Trips, Attendance, Expenses, Payments, Drivers, Vehicles, Reports) */}
              {fleetMenuExpanded && (
                <div className={styles.sidebarSubmenu}>
                  <Link
                    href="/admin/fleet/trips"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'trips' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('trips');
                    }}
                  >
                    <Navigation size={14} /> Trips
                  </Link>
                  <Link
                    href="/admin/fleet/attendance"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'attendance' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('attendance');
                    }}
                  >
                    <CalendarCheck size={14} /> Attendance
                  </Link>
                  <Link
                    href="/admin/fleet/expenses"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'expenses' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('expenses');
                    }}
                  >
                    <Receipt size={14} /> Expenses
                  </Link>
                  <Link
                    href="/admin/fleet/payments"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'payments' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('payments');
                    }}
                  >
                    <CreditCard size={14} /> Payments
                  </Link>
                  <Link
                    href="/admin/fleet/drivers"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'drivers' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('drivers');
                    }}
                  >
                    <Users size={14} /> Drivers
                  </Link>
                  <Link
                    href="/admin/fleet/vehicles"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'fleet-vehicles' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('fleet-vehicles');
                    }}
                  >
                    <Truck size={14} /> Vehicles
                  </Link>
                  <Link
                    href="/admin/fleet/reports"
                    className={`${styles.sidebarSubmenuItem} ${activeMenuKey === 'reports' ? styles.sidebarSubmenuItemActive : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigateTo('reports');
                    }}
                  >
                    <FileSpreadsheet size={14} /> Reports
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/admin/rates"
              className={`${styles.navItem} ${activeMenuKey === 'rates' ? styles.navItemActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('rates');
              }}
            >
              <Truck size={18} style={{ flexShrink: 0 }} /> Manage Vehicles & Rates
            </Link>

            <Link
              href="/admin/contactsetting"
              className={`${styles.navItem} ${activeMenuKey === 'contactsetting' ? styles.navItemActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('contactsetting');
              }}
            >
              <PhoneCall size={18} style={{ flexShrink: 0 }} /> Contact & Business Settings
            </Link>

            <Link
              href="/admin/password-security"
              className={`${styles.navItem} ${activeMenuKey === 'password-security' ? styles.navItemActive : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigateTo('password-security');
              }}
            >
              <KeyRound size={18} style={{ flexShrink: 0 }} /> Password & Security
            </Link>
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
              {activeTab === 'fleet' && (
                fleetSubTab === 'trips' ? 'Fleet Daily Trips & Operations' :
                fleetSubTab === 'attendance' ? 'Driver Daily Attendance & Shifts' :
                fleetSubTab === 'expenses' ? 'Fleet & Fuel Expense Management' :
                fleetSubTab === 'payments' ? 'Customer Payment Collections & Due Receivables' :
                fleetSubTab === 'drivers' ? 'Fleet Driver Directory & Verification' :
                fleetSubTab === 'vehicles' ? 'Fleet Vehicles & Maintenance Records' :
                fleetSubTab === 'reports' ? 'Fleet Financial & Operational Reports' :
                'Fleet & Vehicle Income Management'
              )}
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
                    onClick={() => navigateTo('rates')}
                    className={styles.actionBtn}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                  >
                    Manage Vehicles & Fare Control →
                  </button>
                </div>

                {/* Fleet Operations Card */}
                <div className={styles.infoCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h3 className={styles.infoTitle} style={{ margin: 0 }}>
                      <TrendingUp size={18} color="#38bdf8" /> Fleet & Vehicle Income
                    </h3>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#34d399',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '999px',
                        fontWeight: 600,
                      }}
                    >
                      PRO
                    </span>
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.5rem 0 1rem 0' }}>
                    Track daily vehicle trips, driver duty roster, fuel & toll expenses, pending customer receivables, and net profit.
                  </p>
                  <button
                    onClick={() => navigateTo('fleet')}
                    className={styles.actionBtn}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Open Fleet Management →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FLEET & VEHICLE INCOME MANAGEMENT */}
          {activeTab === 'fleet' && (
            <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
              <div className={styles.sectionHeader} style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 className={styles.sectionTitle}>Fleet & Vehicle Income Management</h3>
                  <p className={styles.sectionDesc}>
                    Complete operational control: Vehicles, Drivers, Daily Trips, Attendance, Expenses, Collections & Reports
                  </p>
                </div>
              </div>
              <FleetManagement
                activeSubTab={fleetSubTab}
                onSubTabChange={(tab) => {
                  setFleetSubTab(tab);
                  navigateTo(tab === 'vehicles' ? 'fleet-vehicles' : tab === 'dashboard' ? 'fleet' : tab);
                }}
                action={currentAction}
                onActionChange={handleActionChange}
                onNavigateTabAndAction={(tab, act) => {
                  navigateTo(tab === 'vehicles' ? 'fleet-vehicles' : tab === 'dashboard' ? 'fleet' : tab, act);
                }}
              />
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
                <div className={styles.vehicleGrid}>
                  {vehicles.map((veh) => (
                    <div key={veh._id} className={styles.vehicleCard}>
                      <div className={styles.vehicleHeader}>
                        <div>
                          <div className={styles.vehicleNameRow}>
                            <h4 className={styles.vehicleName}>{veh.name}</h4>
                            {veh.tag && <span className={styles.vehicleTag}>{veh.tag}</span>}
                          </div>
                          <div className={styles.badgeGroup}>
                            <span className={styles.badgeCapacity}>
                              <Scale size={12} /> {veh.capacity}
                            </span>
                            <span className={styles.badgeDim}>
                              <Box size={12} /> {veh.dimensions}
                            </span>
                          </div>
                        </div>
                        <div className={styles.cardActions}>
                          <button
                            onClick={() => handleOpenEditVehicle(veh)}
                            className={styles.iconBtn}
                            title="Edit Vehicle & Rates"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => veh._id && handleDeleteVehicle(veh._id)}
                            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                            title="Delete Vehicle"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className={styles.vehicleDesc}>{veh.description}</p>

                      <div className={styles.rateHighlightGrid}>
                        <div className={styles.rateBlock}>
                          <span className={styles.rateLabel}>First 100 KM</span>
                          <span className={styles.rateValue}>₹{veh.rateFirst100} / km</span>
                        </div>
                        <div className={styles.rateBlock}>
                          <span className={styles.rateLabel}>Above 100 KM</span>
                          <span className={styles.rateValue} style={{ color: '#38bdf8' }}>
                            ₹{veh.rateAfter100} / km
                          </span>
                        </div>
                        <div className={styles.rateBlock} style={{ gridColumn: 'span 2' }}>
                          <span className={styles.rateLabel}>Base / Min Distance Fare Range</span>
                          <span className={styles.rateValue} style={{ fontSize: '1rem', color: '#fbbf24' }}>
                            ₹{veh.minFareMin} - ₹{veh.minFareMax}
                          </span>
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
                  <p className={styles.sectionDesc}>
                    Update company phone numbers, WhatsApp dispatch, office headquarters, and customer support emails.
                  </p>
                </div>
              </div>

              {contactError && (
                <div className={styles.errorAlert} style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} /> {contactError}
                </div>
              )}

              {contactSuccess && (
                <div className={styles.successAlert} style={{ marginBottom: '1.25rem' }}>
                  <CheckCircle2 size={18} /> {contactSuccess}
                </div>
              )}

              <form onSubmit={handleSaveContact} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Direct Calling Phone Number</label>
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Used on "Call Now", floating phone button, and top navigation bar.
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>WhatsApp Direct Order Dispatch Number</label>
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
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Include country code without + sign (e.g. 91 for India).
                  </span>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Office Headquarters Address</label>
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
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Support & Billing Email</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} />
                    <input
                      type="email"
                      className={styles.input}
                      placeholder="e.g. support@b2transport.in"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={contactSaving}
                  style={{ marginTop: '0.5rem', width: 'auto', padding: '0.85rem 2rem' }}
                >
                  {contactSaving ? 'Saving Changes...' : 'Save Business Settings'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: PASSWORD & SECURITY */}
          {activeTab === 'security' && (
            <div style={{ maxWidth: '650px' }}>
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Password & Security Settings</h3>
                  <p className={styles.sectionDesc}>Update your administrator password or send a password reset link to your email</p>
                </div>
              </div>

              {changePassError && (
                <div className={styles.errorAlert} style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} /> {changePassError}
                </div>
              )}

              {changePassSuccess && (
                <div className={styles.successAlert} style={{ marginBottom: '1.25rem' }}>
                  <CheckCircle2 size={18} /> {changePassSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className={styles.form}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>Current Master Password</label>
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
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>New Admin Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.togglePasswordBtn}
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.label}>Confirm New Admin Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={styles.input}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.togglePasswordBtn}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={changePassLoading}
                  style={{ marginTop: '0.5rem', width: 'auto', padding: '0.85rem 2rem' }}
                >
                  {changePassLoading ? 'Updating Password...' : 'Change Password'}
                </button>
              </form>

              {/* Dev/Production Email Recovery Section */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(51, 65, 85, 0.6)' }}>
                <h4 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Alternative: Reset Link via Registered Email
                </h4>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  A one-time secure password recovery link will be generated for <strong>{admin?.email}</strong>.
                </p>

                {emailResetMsg && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {emailResetMsg}
                  </div>
                )}

                {devResetUrl && (
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.85rem', marginBottom: '1rem', wordBreak: 'break-all' }}>
                    <strong>Direct Local Reset Link:</strong><br />
                    <a href={devResetUrl} style={{ color: '#38bdf8', textDecoration: 'underline' }}>{devResetUrl}</a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={emailResetLoading}
                  className={styles.secondaryActionBtn}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem' }}
                >
                  {emailResetLoading ? 'Sending...' : 'Generate Password Reset Link'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Dynamic Vehicle Modal (Create or Edit) */}
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
                  <label className={styles.label}>Payload Capacity</label>
                  <input
                    type="text"
                    className={styles.input}
                    style={{ paddingLeft: '1rem' }}
                    placeholder="e.g. 750 kg"
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

              {/* Fare Rate Controls */}
              <div className={styles.rateControlsBox}>
                <div className={styles.rateControlsTitle}>
                  <Calculator size={18} color="#38bdf8" /> Dual-Slab Dynamic Fare Configuration
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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

                {/* Instant Calculation Simulator */}
                <div className={styles.simulatorBox}>
                  <div className={styles.simulatorHeader}>
                    <span>Live Pricing Simulator Test:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        className={styles.simInput}
                        value={previewKm}
                        onChange={(e) => setPreviewKm(e.target.value)}
                      />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>KM</span>
                    </div>
                  </div>

                  <div className={styles.simResult}>
                    <div>
                      {Number(previewResult.distKm) <= 25 ? (
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          Local minimum fare bracket applies (&le; 25 KM)
                        </div>
                      ) : Number(previewResult.distKm) <= 100 ? (
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          {previewResult.distKm} km &times; ₹{vehicleForm.rateFirst100} = ₹{previewResult.part1}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                          (100 km &times; ₹{vehicleForm.rateFirst100}) + ({Number(previewResult.distKm) - 100} km &times; ₹{vehicleForm.rateAfter100}) = ₹{previewResult.distanceFare}
                        </div>
                      )}
                    </div>
                    <div className={styles.simFareRange}>
                      ₹{previewResult.fareMin} - ₹{previewResult.fareMax}
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

export default function AdminDashboard(props: AdminDashboardProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.adminShell} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className={styles.spinner} style={{ width: '40px', height: '40px' }} />
          <p style={{ marginLeft: '1rem', color: '#94a3b8' }}>Loading Admin Console...</p>
        </div>
      }
    >
      <AdminDashboardContent {...props} />
    </Suspense>
  );
}
