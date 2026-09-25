import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Person } from '@mui/icons-material';

// Store & Data imports
import { getGuestById, updateGuest, GUESTS_UPDATED_EVENT } from '../state/guestStore';
import { getReservations, RESERVATIONS_UPDATED_EVENT } from '../../reservations/state/reservationStore';
import { getInvoices, getPayments, getRefunds } from '../../payment-billing/pages/paymentBillingStore';
import { getGuestCharges } from '../../inventory/pages/inventoryStore';

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

const INITIAL_COMPLAINTS = [
  { id: 1, date: '2026-05-20', guestName: 'John Doe', roomNo: '101', type: 'Plumbing', description: 'Leaking tap in bathroom causing water accumulation on floor', priority: 'Medium', status: 'Open' },
  { id: 2, date: '2026-05-19', guestName: 'Jane Smith', roomNo: '205', type: 'Housekeeping', description: 'Towels not replaced and bathroom amenities missing after cleaning', priority: 'Low', status: 'Resolved' },
  { id: 3, date: '2026-05-18', guestName: 'Robert Brown', roomNo: '302', type: 'Electrical', description: 'Waitlight not functioning properly in master bedroom area', priority: 'High', status: 'In Progress' },
  { id: 4, date: '2026-05-21', guestName: 'Emily Johnson', roomNo: '105', type: 'Noise', description: 'Loud noise from adjacent room late at night interrupting sleep', priority: 'Medium', status: 'Open' },
  { id: 5, date: '2026-05-22', guestName: 'Michael Wilson', roomNo: '210', type: 'Air Conditioning', description: 'AC not cooling properly during daytime hours and makes noise', priority: 'High', status: 'In Progress' },
  { id: 6, date: '2026-05-23', guestName: 'Sarah Miller', roomNo: '315', type: 'Housekeeping', description: 'Room not cleaned during regular morning housekeeping schedule', priority: 'Medium', status: 'Open' },
  { id: 7, date: '2026-05-24', guestName: 'David Anderson', roomNo: '118', type: 'Plumbing', description: 'Shower drain draining very slowly and backing up into tub', priority: 'High', status: 'Resolved' },
  { id: 8, date: '2026-05-20', guestName: 'John Smith', roomNo: '101', type: 'Housekeeping', description: 'Requested extra hypoallergenic pillows and fresh linen set.', priority: 'Low', status: 'Resolved' }
];

const INITIAL_DOCS = [
  { id: 'DOC-1', formNo: 'REG-2026-089', guest: 'Kamran Akmal', idType: 'CNIC', idNumber: '42101-1122334-1', room: '101', date: '2026-05-10', status: 'Signed & Verified' },
  { id: 'DOC-2', formNo: 'REG-2026-088', guest: 'Cara Stevens', idType: 'Passport', idNumber: 'USA-9988221', room: '102', date: '2026-05-01', status: 'Signed & Verified' },
  { id: 'DOC-3', formNo: 'REG-2026-087', guest: 'Airi Satou', idType: 'Passport', idNumber: 'JPN-4455112', room: '105', date: '2026-05-02', status: 'Pending Signature' },
  { id: 'DOC-4', formNo: 'REG-2026-086', guest: 'Mahira Khan', idType: 'CNIC', idNumber: '42201-6655443-2', room: '201', date: '2026-05-09', status: 'Signed & Verified' },
  { id: 'DOC-5', formNo: 'REG-2026-085', guest: 'Jens Brincker', idType: 'Passport', idNumber: 'GER-8833119', room: '302', date: '2026-05-03', status: 'Signed & Verified' },
  { id: 'DOC-6', formNo: 'REG-2026-001', guest: 'John Smith', idType: 'Passport', idNumber: 'USA-4491028', room: '101', date: '2026-05-20', status: 'Signed & Verified' },
  { id: 'DOC-7', formNo: 'REG-2026-002', guest: 'Sarah Johnson', idType: 'Passport', idNumber: 'UK-8891002', room: '205', date: '2026-05-19', status: 'Signed & Verified' }
];

export default function GuestProfile() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Tab State
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Profile data states
  const [guest, setGuest] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [charges, setCharges] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [documents, setDocuments] = useState([]);
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Sync tab state with URL query parameter
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const loadData = () => {
    const g = getGuestById(id);
    setGuest(g);

    if (!g) return;

    // 1. Reservations
    const allRes = getReservations();
    const guestRes = allRes.filter((r) =>
      (g.email && r.email && r.email.toLowerCase() === g.email.toLowerCase()) ||
      (g.name && r.name && r.name.toLowerCase() === g.name.toLowerCase()) ||
      `GST-${r.id}`.toLowerCase() === String(g.id).toLowerCase() ||
      String(r.id) === String(g.id)
    );
    setReservations(guestRes);

    const guestBookingIds = new Set(
      guestRes.map((r) => String(r.id)).concat(guestRes.map((r) => String(r.bookingId || '')))
    );
    const guestRooms = new Set(
      guestRes.map((r) => String(r.roomNumber || r.room || ''))
    );

    // 2. Invoices
    const allInv = getInvoices();
    const guestInv = allInv.filter((inv) =>
      (g.name && inv.guestName && inv.guestName.toLowerCase() === g.name.toLowerCase()) ||
      (g.email && inv.guestEmail && inv.guestEmail.toLowerCase() === g.email.toLowerCase()) ||
      (inv.bookingId && guestBookingIds.has(String(inv.bookingId).replace('BK-', '')))
    );
    setInvoices(guestInv);

    // 3. Folio Charges
    const allCharges = getGuestCharges();
    const guestChargesList = allCharges.filter((c) =>
      (g.name && c.guestName && c.guestName.toLowerCase() === g.name.toLowerCase()) ||
      (c.roomNumber && guestRooms.has(String(c.roomNumber)))
    );
    setCharges(guestChargesList);

    // 4. Payments
    const allPayments = getPayments();
    const guestPaymentsList = allPayments.filter((p) =>
      (g.name && p.guestName && p.guestName.toLowerCase() === g.name.toLowerCase()) ||
      (g.email && p.guestEmail && p.guestEmail.toLowerCase() === g.email.toLowerCase()) ||
      (p.bookingId && guestBookingIds.has(String(p.bookingId).replace('BK-', '')))
    );
    setPayments(guestPaymentsList);

    // 5. Refunds
    const allRefunds = getRefunds();
    const guestRefundsList = allRefunds.filter((r) =>
      (g.name && r.guestName && r.guestName.toLowerCase() === g.name.toLowerCase()) ||
      (r.bookingId && guestBookingIds.has(String(r.bookingId).replace('BK-', '')))
    );
    setRefunds(guestRefundsList);

    // 6. Complaints
    let storedComplaints = [];
    try {
      const rawComp = localStorage.getItem('hotel_complaints');
      storedComplaints = rawComp ? JSON.parse(rawComp) : INITIAL_COMPLAINTS;
    } catch {
      storedComplaints = INITIAL_COMPLAINTS;
    }
    const guestComplaintsList = storedComplaints.filter((c) =>
      (g.name && c.guestName && c.guestName.toLowerCase() === g.name.toLowerCase()) ||
      (c.roomNo && guestRooms.has(String(c.roomNo)))
    );
    setComplaints(guestComplaintsList);

    // 7. Documents & Registration Forms
    let storedDocs = [];
    try {
      const rawDocs = localStorage.getItem('hotel_registration_forms');
      storedDocs = rawDocs ? JSON.parse(rawDocs) : INITIAL_DOCS;
    } catch {
      storedDocs = INITIAL_DOCS;
    }
    const guestDocsList = storedDocs.filter((d) =>
      (g.name && d.guest && d.guest.toLowerCase() === g.name.toLowerCase()) ||
      (d.room && guestRooms.has(String(d.room)))
    );
    setDocuments(guestDocsList);
  };

  useEffect(() => {
    loadData();

    window.addEventListener(GUESTS_UPDATED_EVENT, loadData);
    window.addEventListener(RESERVATIONS_UPDATED_EVENT, loadData);
    window.addEventListener('guest_charges_update', loadData);
    window.addEventListener('storage', loadData);

    return () => {
      window.removeEventListener(GUESTS_UPDATED_EVENT, loadData);
      window.removeEventListener(RESERVATIONS_UPDATED_EVENT, loadData);
      window.removeEventListener('guest_charges_update', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [id]);

  // Handle Edit Guest
  const handleSaveGuest = (updatedFields) => {
    if (!guest) return;
    updateGuest(guest.id, updatedFields);
    setGuest(updatedFields);
    setIsEditModalOpen(false);
    loadData();
  };

  // Handle Complaint additions/updates
  const handleAddComplaint = (newComplaint) => {
    let allComplaints = [];
    try {
      const raw = localStorage.getItem('hotel_complaints');
      allComplaints = raw ? JSON.parse(raw) : INITIAL_COMPLAINTS;
    } catch {
      allComplaints = INITIAL_COMPLAINTS;
    }
    const updated = [newComplaint, ...allComplaints];
    localStorage.setItem('hotel_complaints', JSON.stringify(updated));
    loadData();
  };

  const handleUpdateComplaintStatus = (complaintId, newStatus) => {
    let allComplaints = [];
    try {
      const raw = localStorage.getItem('hotel_complaints');
      allComplaints = raw ? JSON.parse(raw) : INITIAL_COMPLAINTS;
    } catch {
      allComplaints = INITIAL_COMPLAINTS;
    }
    const updated = allComplaints.map((c) =>
      c.id === complaintId ? { ...c, status: newStatus } : c
    );
    localStorage.setItem('hotel_complaints', JSON.stringify(updated));
    loadData();
  };

  // Handle Document additions/deletions
  const handleAddDocument = (newDoc) => {
    let allDocs = [];
    try {
      const raw = localStorage.getItem('hotel_registration_forms');
      allDocs = raw ? JSON.parse(raw) : INITIAL_DOCS;
    } catch {
      allDocs = INITIAL_DOCS;
    }
    const updated = [newDoc, ...allDocs];
    localStorage.setItem('hotel_registration_forms', JSON.stringify(updated));
    loadData();
  };

  const handleDeleteDocument = (docId) => {
    let allDocs = [];
    try {
      const raw = localStorage.getItem('hotel_registration_forms');
      allDocs = raw ? JSON.parse(raw) : INITIAL_DOCS;
    } catch {
      allDocs = INITIAL_DOCS;
    }
    const updated = allDocs.filter((d) => d.id !== docId && d.formNo !== docId);
    localStorage.setItem('hotel_registration_forms', JSON.stringify(updated));
    loadData();
  };

  // Financial totals
  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0),
    [invoices]
  );
  const totalPaid = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.paidAmount) || 0), 0),
    [invoices]
  );
  const totalDues = useMemo(
    () => invoices.reduce((sum, inv) => sum + (Number(inv.balanceDue) || 0), 0),
    [invoices]
  );

  const currentStay = reservations[0] || null;
  const currentRoom = currentStay?.roomNumber || currentStay?.room || '101';

  // Real audit activities derived from guest lifecycle
  const activities = useMemo(() => {
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
  }, [guest, reservations, invoices, payments, charges, complaints, documents]);

  // Tab Badge counts
  const tabCounts = {
    reservations: reservations.length,
    charges: charges.length,
    invoices: invoices.length,
    complaints: complaints.length,
    documents: documents.length,
    activities: activities.length
  };

  if (!guest) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-2xs mt-4 animate-fade-in">
        <Person sx={{ fontSize: 48 }} className="text-gray-300 mb-2" />
        <h2 className="text-lg font-bold text-gray-800">Guest Record Not Located</h2>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          The requested guest profile identifier ({id}) was not found in the system registry.
        </p>
        <button
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
      <div className="pt-1">
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
            onChargeAdded={loadData}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesTab
            guest={guest}
            invoices={invoices}
            totalInvoiced={totalInvoiced}
            totalPaid={totalPaid}
            totalDues={totalDues}
            onInvoicesUpdated={loadData}
          />
        )}

        {activeTab === 'requests-complaints' && (
          <RequestsComplaintsTab
            guest={guest}
            complaints={complaints}
            currentRoom={currentRoom}
            onComplaintAdded={handleAddComplaint}
            onComplaintStatusUpdate={handleUpdateComplaintStatus}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            guest={guest}
            documents={documents}
            currentRoom={currentRoom}
            onDocumentAdded={handleAddDocument}
            onDocumentDeleted={handleDeleteDocument}
          />
        )}

        {activeTab === 'activity-log' && (
          <ActivityLogTab
            activities={activities}
            guest={guest}
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
