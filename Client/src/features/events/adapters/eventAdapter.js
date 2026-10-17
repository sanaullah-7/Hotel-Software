/**
 * Adapter between backend Event / BEO models and Frontend UI shapes.
 */

export const toFrontendEvent = (raw) => {
  if (!raw) return null;

  const rawDate = raw.start_date || raw.date;
  let dateStr = '';
  let displayDate = '';

  if (rawDate) {
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
        displayDate = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
      }
    } catch {
      dateStr = String(rawDate);
      displayDate = String(rawDate);
    }
  }

  const totalAmount = Number(raw.total_amount ?? raw.total_budget ?? raw.amount ?? 0);
  const advanceAmount = Number(raw.advance_amount ?? raw.advanceAmount ?? 0);
  const balanceAmount = Number(raw.balance_amount ?? raw.balanceAmount ?? Math.max(0, totalAmount - advanceAmount));

  return {
    id: raw.event_ref || raw._id || raw.id,
    _id: raw._id,
    event_ref: raw.event_ref || raw.id,
    name: raw.name || '',
    type: raw.event_type || raw.type || 'Wedding',
    client: raw.client_name || raw.client || '',
    phone: raw.contact_phone || raw.phone || '',
    email: raw.contact_email || raw.email || '',
    date: dateStr,
    displayDate: displayDate || dateStr,
    startTime: raw.start_time || raw.startTime || '12:00',
    endTime: raw.end_time || raw.endTime || '18:00',
    venue: raw.venue || 'Grand Ballroom',
    guests: Number(raw.expected_attendees ?? raw.guests ?? 100),
    amount: totalAmount,
    advanceAmount,
    balanceAmount,
    catering: raw.catering || 'Buffet',
    status: raw.status || 'Confirmed',
    specialRequests: raw.special_requests || raw.specialRequests || '',
    notes: raw.notes || '',
    raw,
  };
};

export const toFrontendEventList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(toFrontendEvent).filter(Boolean);
};

export const toBackendEventPayload = (uiEvent) => {
  if (!uiEvent) return {};

  const totalAmount = Number(uiEvent.amount ?? uiEvent.totalAmount ?? uiEvent.total_amount ?? 0);
  const advanceAmount = Number(uiEvent.advanceAmount ?? uiEvent.advance_amount ?? 0);
  const balanceAmount = Number(uiEvent.balanceAmount ?? uiEvent.balance_amount ?? Math.max(0, totalAmount - advanceAmount));

  let startDate = uiEvent.date || uiEvent.start_date;
  if (startDate) {
    try {
      startDate = new Date(startDate).toISOString();
    } catch {}
  }

  return {
    event_ref: uiEvent.id || uiEvent.event_ref,
    name: uiEvent.name?.trim(),
    client_name: (uiEvent.client || uiEvent.client_name)?.trim(),
    contact_phone: (uiEvent.phone || uiEvent.contact_phone)?.trim(),
    contact_email: (uiEvent.email || uiEvent.contact_email)?.trim(),
    start_date: startDate,
    start_time: uiEvent.startTime || uiEvent.start_time,
    end_time: uiEvent.endTime || uiEvent.end_time,
    venue: uiEvent.venue,
    expected_attendees: Number(uiEvent.guests ?? uiEvent.expected_attendees ?? 100),
    event_type: uiEvent.type || uiEvent.event_type || 'Wedding',
    catering: uiEvent.catering || 'Buffet',
    status: uiEvent.status || 'Confirmed',
    total_amount: totalAmount,
    total_budget: totalAmount,
    advance_amount: advanceAmount,
    balance_amount: balanceAmount,
    special_requests: uiEvent.specialRequests || uiEvent.special_requests || '',
    notes: uiEvent.notes || '',
  };
};

export const toFrontendBeo = (raw) => {
  if (!raw) return null;

  return {
    id: raw.beo_ref || raw._id || raw.id,
    _id: raw._id,
    beo_ref: raw.beo_ref || raw.id,
    event_id: raw.event_id,
    title: raw.title || '',
    client: raw.client || '',
    venue: raw.venue || 'Grand Crystal Ballroom',
    status: raw.status || 'Confirmed & Deposit Paid',
    statusType: raw.status_type || raw.statusType || (raw.status?.includes('Confirmed') ? 'confirmed' : 'in-prep'),
    schedule: raw.schedule || '',
    attendance: raw.attendance || '',
    catering: raw.catering || '',
    totalPrice: raw.total_price || raw.totalPrice || '$0',
    depositPaid: raw.deposit_paid || raw.depositPaid || '$0',
    avSetup: raw.av_setup || raw.avSetup || 'Standard Stage, Podium Mic & Ambient Lighting',
    coordinator: raw.coordinator || 'Marcella Dubois (Senior Event Director)',
    setupRequirements: raw.setup_requirements || 'Standard banquet layout',
    raw,
  };
};

export const toFrontendBeoList = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(toFrontendBeo).filter(Boolean);
};

export const toBackendBeoPayload = (uiBeo) => {
  if (!uiBeo) return {};

  return {
    beo_ref: uiBeo.id || uiBeo.beo_ref,
    event_id: uiBeo.event_id,
    title: uiBeo.title?.trim(),
    client: uiBeo.client?.trim(),
    venue: uiBeo.venue,
    status: uiBeo.status,
    status_type: uiBeo.statusType || uiBeo.status_type,
    schedule: uiBeo.schedule,
    attendance: uiBeo.attendance,
    catering: uiBeo.catering,
    total_price: uiBeo.totalPrice || uiBeo.total_price,
    deposit_paid: uiBeo.depositPaid || uiBeo.deposit_paid,
    av_setup: uiBeo.avSetup || uiBeo.av_setup,
    coordinator: uiBeo.coordinator,
    setup_requirements: uiBeo.setupRequirements || uiBeo.setup_requirements,
  };
};
