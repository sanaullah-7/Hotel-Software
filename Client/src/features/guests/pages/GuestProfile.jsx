import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Person } from '@mui/icons-material';

// Adapter & Service
import { guestService } from '../../../services/guestService';
import { toFrontendGuest, toBackendGuestPayload } from '../adapters/guestAdapter';
import { complaintService } from '../../../services/complaintService';
import { toFrontendComplaintList, toBackendComplaintPayload } from '../../front-office/adapters/complaintAdapter';
import { roomService } from '../../../services/roomService';

import { getGuestById, getGuests, syncGuestsFromBackend, updateGuest, GUESTS_UPDATED_EVENT } from '../state/guestStore';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';
import { getInvoices, getPayments, getRefunds } from '../../payment-billing/pages/paymentBillingStore';
import { getGuestCharges } from '../../inventory/pages/inventoryStore';
import billingService from '../../../services/billingService';
import {
  toFrontendInvoiceList,
  toFrontendPaymentList,
  toFrontendRefundList,
  toFrontendGuestChargeList,
} from '../../payment-billing/adapters/billingAdapter';

// Components
import GuestProfileHeader from '../components/GuestProfileHeader';
import GuestProfileTabs from '../components/GuestProfileTabs';
import EditGuestModal from '../components/EditGuestModal';

// Tab Views
import OverviewTab from '../components/tabs/OverviewTab';
import ReservationsTab from '../components/tabs/ReservationsTab';
import ChargesPaymentsTab from '../components/tabs/ChargesPaymentsTab';
import InvoicesTab from '../components/tabs/InvoicesTab';
import RequestsComplaintsTab from '../components/tabs/RequestsComplaintsTab';
import DocumentsTab from '../components/tabs/DocumentsTab';
import ActivityLogTab from '../components/tabs/ActivityLogTab';

export default function GuestProfile() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab State
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile data states
  const [guest, setGuest] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [isComplaintsLoading, setIsComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isDocumentsLoading, setIsDocumentsLoading] = useState(false);
  const [backendActivities, setBackendActivities] = useState([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Authoritative Complaints Fetcher
  const fetchGuestComplaints = useCallback(async (guestId) => {
    if (!guestId) {
      setComplaints([]);
      setIsComplaintsLoading(false);
      return;
    }

    setIsComplaintsLoading(true);
    setComplaintsError(null);

    try {
      const res = await complaintService.getComplaints({ guest_id: guestId });
      const adapted = toFrontendComplaintList(res);
      setComplaints(adapted);
      setComplaintsError(null);
    } catch (err) {
      console.error('Backend getComplaints failed in profile:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Failed to load guest complaints.';
      setComplaintsError(errMsg);
      setComplaints([]);
    } finally {
      setIsComplaintsLoading(false);
    }
  }, []);

  // Fetch available rooms for safe room lookup in complaints
  useEffect(() => {
    let isMounted = true;
    roomService.getRooms()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.rooms || []);
        if (list.length > 0) setAvailableRooms(list);
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Sync tab state with URL query parameter
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const fetchBackendBillingData = useCallback(async (g) => {
    if (!g) return;
    const gId = String(g._id || g.id || '').trim();
    if (!gId) {
      setInvoices([]);
      setPayments([]);
      setCharges([]);
      setRefunds([]);
      return;
    }

    try {
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(gId);
      const guestParam = isMongoId ? { guest_id: gId } : undefined;

      const [invRes, payRes, chgRes, refRes] = await Promise.all([
        billingService.getInvoices(guestParam).catch(() => null),
        billingService.getPayments(guestParam).catch(() => null),
        billingService.getGuestCharges(guestParam).catch(() => null),
        billingService.getRefunds().catch(() => null),
      ]);

      let adaptedInvoices = [];
      if (invRes !== null) {
        const rawInvoices = invRes?.data?.invoices || invRes?.data || invRes?.invoices || (Array.isArray(invRes) ? invRes : []);
        adaptedInvoices = toFrontendInvoiceList(Array.isArray(rawInvoices) ? rawInvoices : []);
      } else {
        adaptedInvoices = getInvoices();
      }

      let adaptedPayments = [];
      if (payRes !== null) {
        const rawPayments = payRes?.data?.payments || payRes?.data || payRes?.payments || (Array.isArray(payRes) ? payRes : []);
        adaptedPayments = toFrontendPaymentList(Array.isArray(rawPayments) ? rawPayments : []);
      } else {
        adaptedPayments = getPayments();
      }

      let adaptedCharges = [];
      if (chgRes !== null) {
        const rawCharges = chgRes?.data?.charges || chgRes?.data || chgRes?.charges || (Array.isArray(chgRes) ? chgRes : []);
        adaptedCharges = toFrontendGuestChargeList(Array.isArray(rawCharges) ? rawCharges : []);
      } else {
        adaptedCharges = getGuestCharges();
      }

      let adaptedRefunds = [];
      if (refRes !== null) {
        const rawRefunds = refRes?.data?.refunds || refRes?.data || refRes?.refunds || (Array.isArray(refRes) ? refRes : []);
        adaptedRefunds = toFrontendRefundList(Array.isArray(rawRefunds) ? rawRefunds : []);
      } else {
        adaptedRefunds = getRefunds();
      }

      const guestEmail = String(g.email || '').trim().toLowerCase();
      const guestName = String(g.name || '').trim().toLowerCase();

      const filteredInvoices = adaptedInvoices.filter((inv) => {
        if (inv.guestId && (String(inv.guestId) === gId || String(inv.guest_id) === gId)) return true;
        if (inv.guestId && String(inv.guestId) !== gId) return false;
        const iEmail = String(inv.guestEmail || '').trim().toLowerCase();
        const iName = String(inv.guestName || '').trim().toLowerCase();
        if (guestEmail && iEmail && guestEmail === iEmail) return true;
        if (guestName && iName && guestName === iName) return true;
        return false;
      });

      const filteredPayments = adaptedPayments.filter((p) => {
        if (p.guestId && (String(p.guestId) === gId || String(p.guest_id) === gId)) return true;
        if (p.guestId && String(p.guestId) !== gId) return false;
        const pEmail = String(p.guestEmail || '').trim().toLowerCase();
        const pName = String(p.guestName || '').trim().toLowerCase();
        if (guestEmail && pEmail && guestEmail === pEmail) return true;
        if (guestName && pName && guestName === pName) return true;
        return false;
      });

      const filteredCharges = adaptedCharges.filter((c) => {
        if (c.guestId && (String(c.guestId) === gId || String(c.guest_id) === gId)) return true;
        if (c.guestId && String(c.guestId) !== gId) return false;
        const cName = String(c.guestName || '').trim().toLowerCase();
        if (guestName && cName && guestName === cName) return true;
        return false;
      });

      const paymentIds = new Set(filteredPayments.flatMap((p) => [String(p.id || ''), String(p.paymentId || '')].filter(Boolean)));
      const filteredRefunds = adaptedRefunds.filter((r) => r.paymentId && paymentIds.has(String(r.paymentId)));

      setInvoices(filteredInvoices);
      setPayments(filteredPayments);
      setCharges(filteredCharges);
      setRefunds(filteredRefunds);
    } catch (err) {
      console.error('Backend billing fetch failed for guest profile:', err);
      const guestEmail = String(g.email || '').trim().toLowerCase();
      const guestName = String(g.name || '').trim().toLowerCase();
      const filteredInvoices = getInvoices().filter((inv) => {
        if (inv.guestId && (String(inv.guestId) === gId || String(inv.guest_id) === gId)) return true;
        if (inv.guestId && String(inv.guestId) !== gId) return false;
        const iEmail = String(inv.guestEmail || '').trim().toLowerCase();
        const iName = String(inv.guestName || '').trim().toLowerCase();
        if (guestEmail && iEmail && guestEmail === iEmail) return true;
        if (guestName && iName && guestName === iName) return true;
        return false;
      });
      setInvoices(filteredInvoices);
      setPayments([]);
      setCharges([]);
      setRefunds([]);
    }
  }, []);

  const fetchGuestDocuments = useCallback(async (guestId) => {
    if (!guestId) {
      setDocuments([]);
      return;
    }
    setIsDocumentsLoading(true);
    try {
      const res = await guestService.getGuestDocuments(guestId);
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      const mapped = rawList.map((d) => ({
        id: d._id,
        _id: d._id,
        formNo: d.form_no || `DOC-${String(d._id).slice(-4)}`,
        name: d.name || d.document_type || 'Identity Proof',
        idType: d.document_type || 'Passport',
        idNumber: d.document_number || 'N/A',
        room: d.room_number || '101',
        status: d.status || 'Signed & Verified',
        date: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: d.notes || '',
        raw: d,
      }));
      setDocuments(mapped);
    } catch (err) {
      console.error('Failed to fetch guest documents:', err);
      setDocuments([]);
    } finally {
      setIsDocumentsLoading(false);
    }
  }, []);

  const fetchGuestActivities = useCallback(async (guestId) => {
    if (!guestId) {
      setBackendActivities([]);
      return;
    }
    setIsActivitiesLoading(true);
    try {
      const res = await guestService.getGuestActivities(guestId);
      const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setBackendActivities(rawList);
    } catch (err) {
      console.error('Failed to fetch guest activities:', err);
      setBackendActivities([]);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, []);

  const loadRelatedData = useCallback((g) => {
    if (!g) return;

    fetchBackendBillingData(g);

    const guestName = String(g.name || '').trim().toLowerCase();
    const guestEmail = String(g.email || '').trim().toLowerCase();
    const guestId = String(g.id || g._id || '').trim();

    // 1. Reservations
    const allRes = getReservations();
    const guestRes = allRes.filter((r) => {
      if (r.guestId && String(r.guestId).trim() === guestId) return true;
      if (r.guestId && String(r.guestId).trim() !== guestId) return false;
      const rEmail = String(r.email || r.guestEmail || '').trim().toLowerCase();
      const rName = String(r.name || r.guestName || '').trim().toLowerCase();
      if (guestEmail && rEmail && guestEmail === rEmail) return true;
      if (guestName && rName && guestName === rName) return true;
      return false;
    });
    setReservations(guestRes);

    // 2. Complaints (Authoritative Backend)
    fetchGuestComplaints(guestId);

    // 3. Documents (Authoritative Backend)
    fetchGuestDocuments(guestId);

    // 4. Activities (Authoritative Backend)
    fetchGuestActivities(guestId);
  }, [fetchBackendBillingData, fetchGuestComplaints, fetchGuestDocuments, fetchGuestActivities]);

  const fetchGuestProfile = useCallback(async () => {
    if (!id) {
      setGuest(null);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await guestService.getGuestById(String(id).trim());
      const backendGuest = res?.data?.data || res?.data || res;
      if (backendGuest) {
        const adapted = toFrontendGuest(backendGuest);
        setGuest(adapted);
        setNotFound(false);
        setError(null);

        // Authoritative synchronization to compatibility store
        const currentStore = getGuests();
        const exists = currentStore.some(g => g.id === adapted.id || g._id === adapted._id);
        const nextStore = exists
          ? currentStore.map(g => (g.id === adapted.id || g._id === adapted._id) ? adapted : g)
          : [adapted, ...currentStore];
        syncGuestsFromBackend(nextStore);

        loadRelatedData(adapted);
        setIsLoading(false);
        return;
      } else {
        setGuest(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }
    } catch (err) {
      const status = err?.response?.status || err?.status;
      if (status === 404) {
        setGuest(null);
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      // Authoritative error from backend
      const errMsg = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to load guest profile.';
      setError(errMsg);
      setGuest(null);
      setIsLoading(false);
    }
  }, [id, loadRelatedData]);

  useEffect(() => {
    fetchGuestProfile();
  }, [id, fetchGuestProfile]);

  useEffect(() => {
    if (!guest) return;

    const handleRelatedDataReload = () => {
      loadRelatedData(guest);
    };

    window.addEventListener(RESERVATIONS_UPDATED_EVENT, handleRelatedDataReload);
    window.addEventListener('guest_charges_update', handleRelatedDataReload);
    window.addEventListener('invoices_update', handleRelatedDataReload);
    window.addEventListener('payments_update', handleRelatedDataReload);
    window.addEventListener('refunds_update', handleRelatedDataReload);
    window.addEventListener('storage', handleRelatedDataReload);

    return () => {
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, handleRelatedDataReload);
      window.removeEventListener('guest_charges_update', handleRelatedDataReload);
      window.removeEventListener('invoices_update', handleRelatedDataReload);
      window.removeEventListener('payments_update', handleRelatedDataReload);
      window.removeEventListener('refunds_update', handleRelatedDataReload);
      window.removeEventListener('storage', handleRelatedDataReload);
    };
  }, [guest, loadRelatedData]);

  // Handle Edit Guest
  const handleSaveGuest = async (updatedFields) => {
    if (!guest) return;
    const canonicalId = guest._id || guest.id || guest.guestId;
    try {
      const fieldsToSend = { ...updatedFields };
      if (fieldsToSend.name) {
        const parts = fieldsToSend.name.trim().split(/\s+/);
        fieldsToSend.first_name = parts[0] || '';
        fieldsToSend.last_name = parts.slice(1).join(' ') || '';
      }
      const payload = toBackendGuestPayload(fieldsToSend, { isUpdate: true });
      const res = await guestService.updateGuest(canonicalId, payload);
      const backendGuest = res?.data?.data || res?.data || res;
      const adapted = toFrontendGuest(backendGuest);
      setGuest(adapted);
      
      const currentStore = getGuests();
      const nextStore = currentStore.map(g => (g.id === adapted.id || g._id === canonicalId) ? adapted : g);
      syncGuestsFromBackend(nextStore);
      setIsEditModalOpen(false);
      loadRelatedData(adapted);
    } catch (err) {
      console.error('Backend updateGuest failed in profile:', err);
      const errMsg = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to update guest profile.';
      setError(errMsg);
    }
  };

  // Handle Complaint additions/updates via Backend
  const handleAddComplaint = async (newComplaint) => {
    const canonicalGuestId = String(guest?._id || guest?.id || guest?.guestId || id || '').trim();
    if (newComplaint && (newComplaint.description || newComplaint.type || newComplaint.category)) {
      if (!newComplaint._id && !newComplaint.complaint_ref) {
        let resolvedRoomId = null;
        if (newComplaint.roomNo && availableRooms.length > 0) {
          const matchRoom = availableRooms.find((r) => {
            const rNum = String(r.room_number || r.roomNo || r.number || '').trim().toLowerCase();
            const target = String(newComplaint.roomNo).trim().toLowerCase();
            return rNum === target || r._id === newComplaint.roomNo;
          });
          if (matchRoom && /^[0-9a-fA-F]{24}$/.test(String(matchRoom._id))) {
            resolvedRoomId = matchRoom._id;
          }
        }
        const payload = toBackendComplaintPayload({
          guestId: canonicalGuestId,
          roomId: resolvedRoomId,
          category: newComplaint.type || newComplaint.category,
          severity: newComplaint.priority || newComplaint.severity,
          description: newComplaint.description,
        });
        await complaintService.createComplaint(payload);
      }
    }
    await fetchGuestComplaints(canonicalGuestId);
  };

  const handleUpdateComplaintStatus = async (complaintId, newStatus) => {
    const canonicalGuestId = String(guest?._id || guest?.id || guest?.guestId || id || '').trim();
    try {
      const updatePayload = toBackendComplaintPayload({
        status: newStatus
      }, { isUpdate: true });
      await complaintService.updateComplaint(complaintId, updatePayload);
      await fetchGuestComplaints(canonicalGuestId);
    } catch (err) {
      console.error('Backend updateComplaint failed in profile:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        'Failed to update complaint status.';
      setComplaintsError(errMsg);
    }
  };

  // Handle Document additions/deletions (Authoritative Backend)
  const handleAddDocument = async (newDoc) => {
    const canonicalGuestId = String(guest?._id || guest?.id || id || '').trim();
    if (!canonicalGuestId) return;
    try {
      await guestService.createGuestDocument(canonicalGuestId, newDoc);
      await Promise.all([
        fetchGuestDocuments(canonicalGuestId),
        fetchGuestActivities(canonicalGuestId),
      ]);
    } catch (err) {
      console.error('Backend add document failed:', err);
      alert(err.message || 'Failed to add document to database.');
    }
  };

  const handleDeleteDocument = async (docId) => {
    const canonicalGuestId = String(guest?._id || guest?.id || id || '').trim();
    if (!canonicalGuestId || !docId) return;
    if (!window.confirm('Are you sure you want to delete this document from the database?')) return;
    try {
      await guestService.deleteGuestDocument(canonicalGuestId, docId);
      await Promise.all([
        fetchGuestDocuments(canonicalGuestId),
        fetchGuestActivities(canonicalGuestId),
      ]);
    } catch (err) {
      console.error('Backend delete document failed:', err);
      alert(err.message || 'Failed to delete document from database.');
    }
  };

  // Financial totals (authoritative from backend invoice balances)
  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
    [invoices]
  );
  const totalPaid = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.amountPaid ?? inv.effectivePaid ?? 0)), 0),
    [invoices]
  );
  const totalDues = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue ?? inv.effectiveDue ?? 0)), 0),
    [invoices]
  );

  const currentStay = reservations[0] || null;
  const currentRoom = currentStay?.roomNumber || currentStay?.room || '101';

  // Real audit activities from database with derived fallback
  const activities = useMemo(() => {
    if (backendActivities && backendActivities.length > 0) {
      return backendActivities;
    }
    if (!guest) return [];
    const list = [];

    // Guest registration
    list.push({
      date: guest.createdAt || '2026-05-18',
      title: 'Guest Profile Registered',
      description: `Guest profile created for ${guest.name} (${guest.id}) with initial status: ${guest.status || 'Active'}.`,
      category: 'Profile',
      performedBy: 'Front Desk System'
    });

    // Reservations
    reservations.forEach((res) => {
      list.push({
        date: res.checkIn || '2026-05-20',
        title: `Reservation ${res.status || 'Created'}`,
        description: `Booking ref ${res.bookingId || `BK-${res.id}`} reserved for Room ${res.roomNumber || res.room || '101'} (${res.roomType || 'Standard'}).`,
        category: 'Reservation',
        performedBy: 'Reservation Desk'
      });
    });

    // Invoices
    invoices.forEach((inv) => {
      list.push({
        date: inv.issueDate || '2026-05-20',
        title: `Invoice Generated (${inv.invoiceNumber})`,
        description: `Formal invoice generated for $${Number(inv.totalAmount).toFixed(2)} with status: ${inv.status}.`,
        category: 'Invoice',
        performedBy: 'Billing Engine'
      });
    });

    // Payments
    payments.forEach((pay) => {
      list.push({
        date: pay.paymentDate?.split(' ')[0] || '2026-05-20',
        title: `Payment Recorded ($${Number(pay.amount).toFixed(2)})`,
        description: `Received payment of $${Number(pay.amount).toFixed(2)} via ${pay.paymentMethod} (Ref: ${pay.transactionRef}).`,
        category: 'Payment',
        performedBy: pay.recordedBy || 'Front Desk Staff'
      });
    });

    // Charges
    charges.forEach((ch) => {
      list.push({
        date: ch.reportedDate || ch.date || '2026-05-20',
        title: `Folio Charge: ${ch.itemName}`,
        description: `Charge of $${Number(ch.amount).toFixed(2)} posted to Room ${ch.roomNumber || '101'} folio (${ch.chargeType}).`,
        category: 'Service',
        performedBy: 'Point of Sale'
      });
    });

    // Complaints
    complaints.forEach((comp) => {
      list.push({
        date: comp.date || '2026-05-20',
        title: `Service Request Filed: ${comp.type}`,
        description: `${comp.description} (Status: ${comp.status}).`,
        category: 'Complaint',
        performedBy: 'Guest Concierge'
      });
    });

    // Documents
    documents.forEach((doc) => {
      list.push({
        date: doc.date || '2026-05-20',
        title: `Document Verified: ${doc.idType || 'ID Proof'}`,
        description: `${doc.name || doc.idType} (${doc.idNumber}) registered for Room ${doc.room}.`,
        category: 'Document',
        performedBy: 'Identity Verification'
      });
    });

    // Sort newest first
    return list.sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [backendActivities, guest, reservations, invoices, payments, charges, complaints, documents]);

  // Tab Badge counts
  const tabCounts = {
    reservations: reservations.length,
    charges: charges.length,
    invoices: invoices.length,
    complaints: complaints.length,
    documents: documents.length,
    activities: activities.length
  };

  if (isLoading && !guest) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs mt-4 flex flex-col items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[var(--primary-main)] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-gray-500 font-medium">Loading guest...</span>
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-100 shadow-2xs mt-4 animate-fade-in">
        <Person sx={{ fontSize: 48 }} className="text-rose-300 mb-2" />
        <h2 className="text-lg font-bold text-rose-700">Error Loading Guest Profile</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">{error}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={fetchGuestProfile}
            className="px-4 py-2 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition cursor-pointer"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => navigate('/guests')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
          >
            View All Guests
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !guest) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs mt-4 animate-fade-in">
        <Person sx={{ fontSize: 48 }} className="text-gray-300 mb-2" />
        <h2 className="text-lg font-bold text-gray-800">Guest Record Not Located</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          Guest not found. The requested guest profile identifier ({id}) was not found in the system registry.
        </p>
        <button
          type="button"
          onClick={() => navigate('/guests')}
          className="px-4 py-2 bg-[#1b7f43] text-white rounded-lg text-xs font-semibold hover:brightness-105 transition cursor-pointer"
        >
          View All Guests
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-12 space-y-5">
      {/* 1. Persistent Guest Header */}
      <GuestProfileHeader
        guest={guest}
        currentStay={currentStay}
        totalDues={totalDues}
        totalStays={guest.totalStays || reservations.length || 0}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      {/* 2. Horizontal Tabs Navigation */}
      <GuestProfileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />

      {/* 3. Focused Tab Content Area */}
      <div
        id={`guest-profile-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`guest-profile-tab-${activeTab}`}
        tabIndex={0}
        className="pt-1"
      >
        {activeTab === 'overview' && (
          <OverviewTab
            guest={guest}
            reservations={reservations}
            invoices={invoices}
            charges={charges}
            complaints={complaints}
            documents={documents}
            activities={activities}
            totalInvoiced={totalInvoiced}
            totalPaid={totalPaid}
            totalDues={totalDues}
            onSwitchTab={handleTabChange}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsTab
            reservations={reservations}
            guest={guest}
          />
        )}

        {activeTab === 'charges-payments' && (
          <ChargesPaymentsTab
            guest={guest}
            charges={charges}
            payments={payments}
            refunds={refunds}
            totalInvoiced={totalInvoiced}
            totalPaid={totalPaid}
            totalDues={totalDues}
            onChargeAdded={fetchGuestProfile}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTab
            guest={guest}
            invoices={invoices}
            totalInvoiced={totalInvoiced}
            totalPaid={totalPaid}
            totalDues={totalDues}
            onInvoicesUpdated={fetchGuestProfile}
          />
        )}

        {activeTab === 'requests-complaints' && (
          <RequestsComplaintsTab
            guest={guest}
            complaints={complaints}
            currentRoom={currentRoom}
            isLoading={isComplaintsLoading}
            error={complaintsError}
            onRetry={() => {
              const canonicalGuestId = String(guest?._id || guest?.id || guest?.guestId || id || '').trim();
              fetchGuestComplaints(canonicalGuestId);
            }}
            availableRooms={availableRooms}
            onComplaintAdded={handleAddComplaint}
            onComplaintStatusUpdate={handleUpdateComplaintStatus}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            guest={guest}
            documents={documents}
            currentRoom={currentRoom}
            isLoading={isDocumentsLoading}
            onDocumentAdded={handleAddDocument}
            onDocumentDeleted={handleDeleteDocument}
          />
        )}

        {activeTab === 'activity-log' && (
          <ActivityLogTab
            activities={activities}
            guest={guest}
            isLoading={isActivitiesLoading}
          />
        )}
      </div>

      {/* Edit Guest Modal */}
      {isEditModalOpen && (
        <EditGuestModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          guest={guest}
          onSave={handleSaveGuest}
        />
      )}
    </div>
  );
}
