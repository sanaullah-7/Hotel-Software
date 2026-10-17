import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowRight as ChevronRightIcon,
  MeetingRoom as RoomIcon,
  Refresh as RefreshIcon,
  Bed as BedIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import roomService from '../../../services/roomService';
import reservationService from '../../../services/reservationService';
import stayService from '../../../services/stayService';
import guestService from '../../../services/guestService';
import TapeChartHeader from '../components/tapeChart/TapeChartHeader';
import TapeChartRoomRow from '../components/tapeChart/TapeChartRoomRow';
import TapeChartActionModal from '../components/tapeChart/TapeChartActionModal';
import UnassignedBookingsDrawer from '../components/tapeChart/UnassignedBookingsDrawer';
import ReservationFormModal from '../../reservations/components/ReservationFormModal';
import { toBackendReservationPayload, toFrontendReservation } from '../../reservations/adapters/reservationAdapter';
import { syncReservationsFromBackend, getReservations } from '../../reservations/state/reservationStore';
import { addGuest, findGuestByExactIdentity, getGuests } from '../../guests/state/guestStore';
import { getRoomByRoomNo, getRoomById } from '../../rooms/state/roomStore';
import { addAuditLog } from '../../audit/state/auditStore';
import {
  getTodayYMD,
  addDaysYMD,
  diffDaysYMD,
  getVisibleDates,
} from '../utils/tapeChartDates';

export default function TapeChart({ initialStartDate, initialViewDays }) {
  const [searchParams] = useSearchParams();
  const queryStart = searchParams ? searchParams.get('startDate') : null;
  const queryDays = searchParams ? parseInt(searchParams.get('days'), 10) : null;

  const [startDate, setStartDate] = useState(() => queryStart || initialStartDate || getTodayYMD());
  const [viewDays, setViewDays] = useState(() => (queryDays && [7, 14, 30].includes(queryDays) ? queryDays : (initialViewDays || 7)));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showUnassigned, setShowUnassigned] = useState(false);

  // Reassignment & Stay Transfer Modal state
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedBlockItem, setSelectedBlockItem] = useState(null);

  // Reservation creation modal state initiated from empty cells
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCellRoom, setSelectedCellRoom] = useState(null);
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    mobile: '',
    city: '',
    passport: '',
    nationality: '',
    checkIn: '',
    checkOut: '',
    package: 'Standard (Room Only)',
    totalPerson: '1',
    numRooms: '1',
    roomType: '',
    roomNo: '',
    room: '',
    arrivalTime: 'Morning',
    purpose: 'Leisure',
    paymentMethod: 'Cash',
    paymentStatus: 'Pending',
    discountCode: '',
    specialRequests: '',
    note: '',
  });
  const [createError, setCreateError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestIdRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Column width tailored for 7-day, 14-day, and 30-day views
  const colWidth = useMemo(() => {
    if (viewDays === 7) return 120;
    if (viewDays === 14) return 80;
    return 48; // 30-day view
  }, [viewDays]);

  const visibleDates = useMemo(
    () => getVisibleDates(startDate, viewDays),
    [startDate, viewDays]
  );

  // Data retrieval with stale-request protection
  const fetchTapeChart = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    const endDate = addDaysYMD(startDate, viewDays);

    try {
      const res = await roomService.getTapeChart(
        { startDate, endDate },
        { signal: controller.signal }
      );

      // Verify that this is still the active request
      if (currentRequestId === requestIdRef.current) {
        const payload = res?.data || res;
        setData(payload);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err?.message?.includes('aborted')) {
        return; // Stale request cancelled; ignore
      }
      if (currentRequestId === requestIdRef.current) {
        setError(err?.message || 'Failed to retrieve tape chart from server.');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [startDate, viewDays]);

  useEffect(() => {
    fetchTapeChart();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTapeChart]);

  // Navigation Handlers
  const handleNavigatePrev = () => {
    setStartDate((prev) => addDaysYMD(prev, -viewDays));
  };

  const handleNavigateNext = () => {
    setStartDate((prev) => addDaysYMD(prev, viewDays));
  };

  const handleNavigateToday = () => {
    setStartDate(getTodayYMD());
  };

  const handleViewChange = (days) => {
    setViewDays(days);
  };

  // Block Click & Reassignment / Stay Transfer Handlers
  const handleBlockClick = useCallback((item) => {
    setSelectedBlockItem(item);
    setIsActionModalOpen(true);
  }, []);

  const handleConfirmReassignment = useCallback(
    async ({ reservation_id, room_id }) => {
      await reservationService.reassignRoom(reservation_id, { room_id });
      await fetchTapeChart();
    },
    [fetchTapeChart]
  );

  const handleConfirmTransfer = useCallback(
    async ({ stay_id, room_id, reason, source_room_id }) => {
      await stayService.transferRoom(stay_id, { room_id, reason, source_room_id });
      await fetchTapeChart();
    },
    [fetchTapeChart]
  );

  // Reservation Creation Handlers (Initiated from Empty Tape Chart Cells)
  const handleCellClick = useCallback(({ room, dateStr }) => {
    setSelectedCellRoom(room);
    setCreateError(null);
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      gender: '',
      mobile: '',
      city: '',
      passport: '',
      nationality: '',
      checkIn: dateStr,
      checkOut: addDaysYMD(dateStr, 1),
      package: 'Standard (Room Only)',
      totalPerson: '1',
      numRooms: '1',
      roomType: room.room_type_name || room.room_type_code || '',
      roomNo: room.room_number || '',
      room: room.room_number || '',
      arrivalTime: 'Morning',
      purpose: 'Leisure',
      paymentMethod: 'Cash',
      paymentStatus: 'Pending',
      discountCode: '',
      specialRequests: '',
      note: '',
    });
    setIsCreateModalOpen(true);
  }, []);

  const handleFormChange = useCallback((field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateError(null);
  }, []);

  const isObjectId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val.trim());

  const handleSaveBooking = async () => {
    setCreateError(null);
    setIsSubmitting(true);

    try {
      // 1. Mandatory Form Validations
      if (!createForm.firstName?.trim()) {
        throw new Error('Guest First Name is required.');
      }
      if (!createForm.checkIn) {
        throw new Error('Check In Date is required.');
      }
      if (!createForm.checkOut) {
        throw new Error('Check Out Date is required.');
      }
      const checkInObj = new Date(createForm.checkIn);
      const checkOutObj = new Date(createForm.checkOut);
      if (isNaN(checkInObj.getTime()) || isNaN(checkOutObj.getTime())) {
        throw new Error('Please enter valid Check In and Check Out dates.');
      }
      if (checkOutObj <= checkInObj) {
        throw new Error('Check Out Date must be strictly after Check In Date.');
      }
      if (!createForm.roomNo && !createForm.room) {
        throw new Error('Please select an available Room Number.');
      }

      // 2. Resolve room & roomType
      const selectedRoomNo = String(createForm.roomNo || createForm.room || '').trim();
      let matchedRoom = null;
      if (data?.rooms) {
        matchedRoom = data.rooms.find(
          (r) => String(r.room_number) === selectedRoomNo || String(r.id || r._id) === selectedRoomNo
        );
      }
      if (!matchedRoom && selectedCellRoom && String(selectedCellRoom.room_number) === selectedRoomNo) {
        matchedRoom = selectedCellRoom;
      }
      if (!matchedRoom) {
        matchedRoom = getRoomByRoomNo(selectedRoomNo) || getRoomById(selectedRoomNo);
      }

      const targetRoomId = matchedRoom?._id || matchedRoom?.id || (isObjectId(selectedRoomNo) ? selectedRoomNo : null);
      const targetRoomTypeId = matchedRoom?.room_type_id || matchedRoom?.roomTypeId || null;

      // 3. Resolve or Create guest reference
      let primaryGuestId = null;
      const fullName = `${createForm.firstName || ''} ${createForm.lastName || ''}`.trim() || 'Guest';

      // Check registered / cached guests first
      const cachedGuests = getGuests();
      const existingMatch = findGuestByExactIdentity(fullName, createForm.email, cachedGuests);
      if (existingMatch && isObjectId(existingMatch._id || existingMatch.id)) {
        primaryGuestId = String(existingMatch._id || existingMatch.id);
      } else {
        // Create guest in backend or search
        try {
          const guestPayload = {
            first_name: createForm.firstName.trim(),
            last_name: (createForm.lastName || '').trim() || 'Guest',
            email: createForm.email?.trim() || `${createForm.firstName.toLowerCase()}.${Date.now()}@hotel.local`,
            phone: createForm.mobile?.trim() || 'N/A',
            city: createForm.city?.trim() || null,
            nationality: createForm.nationality?.trim() || null,
            national_id: createForm.passport?.trim() || null,
            avatar: createForm.avatar || null,
          };
          const guestRes = await guestService.createGuest(guestPayload);
          const createdGuest = guestRes?.data;
          if (createdGuest && isObjectId(createdGuest._id)) {
            primaryGuestId = createdGuest._id;
            addGuest({ ...createdGuest, id: createdGuest._id, name: fullName });
          }
        } catch (guestErr) {
          if (guestErr.status === 409 || guestErr.message?.includes('already exists')) {
            const searchRes = await guestService.getGuests({ search: createForm.email || createForm.firstName });
            const list = Array.isArray(searchRes?.data) ? searchRes.data : (Array.isArray(searchRes?.data?.guests) ? searchRes.data.guests : []);
            const found = list[0];
            if (found && isObjectId(found._id)) {
              primaryGuestId = found._id;
            }
          }
          if (!primaryGuestId) {
            const localGuest = addGuest({ name: fullName, email: createForm.email || '', phone: createForm.mobile || '', city: createForm.city || '' });
            primaryGuestId = localGuest._id || localGuest.id;
          }
        }
      }

      // 4. Build canonical backend payload
      const formToAdapt = {
        ...createForm,
        primary_guest_id: primaryGuestId,
        roomId: targetRoomId,
        room_id: targetRoomId,
        roomTypeId: targetRoomTypeId,
        room_type_id: targetRoomTypeId,
        adults: Number(createForm.totalPerson || 1),
        children: 0,
        special_requests: createForm.specialRequests || createForm.note || '',
      };

      const backendPayload = toBackendReservationPayload(formToAdapt, { isCreate: true });

      // 5. Call canonical backend reservation API
      const res = await reservationService.createReservation(backendPayload);
      const createdReservation = res?.data?.reservation || res?.data || res;

      // 6. Synchronize compatibility stores
      if (createdReservation) {
        const adapted = toFrontendReservation(createdReservation);
        const currentStored = getReservations();
        syncReservationsFromBackend([createdReservation, ...currentStored]);
        try {
          addAuditLog({
            module: 'Reservation',
            action: 'Created Reservation',
            recordId: adapted?.bookingId || adapted?.id,
            description: `Reservation created for ${adapted?.name || fullName} from Tape Chart.`,
            importance: 'Important'
          });
        } catch {}
      }

      // 7. Close modal and refresh Tape Chart authoritatively from backend
      setIsCreateModalOpen(false);
      setCreateError(null);
      await fetchTapeChart();
    } catch (err) {
      setCreateError(err?.message || 'Failed to create reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group Collapsing
  const toggleGroupCollapse = (groupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Organize rooms by room_type_id and map timeline items to rooms
  const { groupedRooms, itemsByRoomId, unassignedItems } = useMemo(() => {
    if (!data) return { groupedRooms: [], itemsByRoomId: new Map(), unassignedItems: [] };

    const rooms = data.rooms || [];
    const roomTypes = data.room_types || [];
    const timelineItems = data.timeline_items || [];

    // Map timeline items to rooms
    const itemMap = new Map();
    const unassigned = [];

    timelineItems.forEach((item) => {
      if (!item.room_id) {
        unassigned.push(item);
      } else {
        const rId = String(item.room_id);
        if (!itemMap.has(rId)) {
          itemMap.set(rId, []);
        }
        itemMap.get(rId).push(item);
      }
    });

    // Group rooms by room type
    const roomTypeMetaMap = new Map();
    roomTypes.forEach((rt) => {
      roomTypeMetaMap.set(String(rt.id || rt._id), rt);
    });

    const groupsMap = new Map();
    rooms.forEach((room) => {
      const rtId = room.room_type_id ? String(room.room_type_id) : 'unassigned_type';
      if (!groupsMap.has(rtId)) {
        const meta = roomTypeMetaMap.get(rtId);
        groupsMap.set(rtId, {
          id: rtId,
          name: meta?.name || room.room_type_name || 'General Inventory',
          code: meta?.code || room.room_type_code || 'GEN',
          basePrice: meta?.base_price ?? null,
          rooms: [],
        });
      }
      groupsMap.get(rtId).rooms.push(room);
    });

    return {
      groupedRooms: Array.from(groupsMap.values()),
      itemsByRoomId: itemMap,
      unassignedItems: unassigned,
    };
  }, [data]);

  return (
    <div className="animate-fade-in space-y-2.5 pb-6">
      {/* Tape Chart Header & Navigation Toolbar */}
      <TapeChartHeader
        startDate={startDate}
        viewDays={viewDays}
        onViewChange={handleViewChange}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        onNavigateToday={handleNavigateToday}
        onRefresh={fetchTapeChart}
        loading={loading}
        unassignedCount={unassignedItems.length}
        showUnassigned={showUnassigned}
        onToggleUnassigned={() => setShowUnassigned((v) => !v)}
      />

      {/* Error Alert with Retry */}
      {error && (
        <div
          role="alert"
          className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <InfoIcon sx={{ fontSize: 16 }} className="text-red-500 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchTapeChart}
            className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors cursor-pointer text-[11px]"
          >
            <RefreshIcon sx={{ fontSize: 13 }} /> Retry
          </button>
        </div>
      )}

      {/* Main Gantt Timeline Container */}
      <div className="bg-white rounded-[6px] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        {/* Scrollable Container with sticky room column */}
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
          <div
            className="inline-block min-w-full align-middle"
            style={{ minWidth: `${56 * 4 + viewDays * colWidth}px` }}
          >
            {/* Sticky Date Timeline Header */}
            <div className="sticky top-0 z-30 flex bg-gray-50 border-b border-gray-200 shadow-2xs">
              {/* Top-Left Corner Box: Sticky Room Info Header */}
              <div className="sticky left-0 z-40 w-48 sm:w-56 shrink-0 bg-gray-100 border-r border-gray-200 p-2.5 flex items-center justify-between text-xs font-bold text-gray-700 tracking-wider uppercase shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                <span className="flex items-center gap-1.5">
                  <BedIcon sx={{ fontSize: 15 }} className="text-gray-500" />
                  <span>Rooms</span>
                </span>
                <span className="text-[10px] text-gray-400 font-semibold normal-case">
                  {data?.rooms?.length || 0} Total
                </span>
              </div>

              {/* Date Header Grid */}
              <div
                className="shrink-0 grid"
                style={{
                  gridTemplateColumns: `repeat(${viewDays}, minmax(${colWidth}px, 1fr))`,
                  width: `${viewDays * colWidth}px`,
                }}
              >
                {visibleDates.map((d) => (
                  <div
                    key={d.dateStr}
                    className={`border-r border-gray-200/80 py-1.5 px-1 flex flex-col items-center justify-center text-center select-none ${
                      d.isToday ? 'bg-emerald-100/60 font-bold' : ''
                    }`}
                  >
                    <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                      {d.dayOfWeek}
                    </span>
                    <span
                      className={`text-xs font-bold leading-tight ${
                        d.isToday
                          ? 'text-[#1b7f43] bg-emerald-100 px-1.5 py-0.2 rounded-full'
                          : 'text-gray-800'
                      }`}
                    >
                      {d.dayNumber}
                    </span>
                    <span className="text-[9px] text-gray-400 font-medium">
                      {d.monthName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Rows Content */}
            {loading && !data ? (
              /* Initial Loading Skeleton */
              <div className="p-12 text-center text-gray-400 space-y-3">
                <div className="inline-block animate-spin text-[#1b7f43]">
                  <RefreshIcon sx={{ fontSize: 28 }} />
                </div>
                <p className="text-xs font-medium text-gray-500">
                  Retrieving room inventory and timeline schedule...
                </p>
              </div>
            ) : groupedRooms.length === 0 ? (
              /* Empty Rooms State */
              <div className="p-16 text-center text-gray-400 space-y-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center">
                  <RoomIcon sx={{ fontSize: 24 }} />
                </div>
                <h3 className="text-sm font-bold text-gray-700">
                  No Rooms Found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  No rooms are currently configured for this hotel property. Add rooms in the Rooms module to view the chart.
                </p>
              </div>
            ) : (
              /* Grouped Physical Rooms */
              groupedRooms.map((group) => {
                const isCollapsed = collapsedGroups.has(group.id);

                return (
                  <div key={group.id} className="border-b border-gray-200">
                    {/* Room Type Group Header Bar */}
                    <div
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="sticky left-0 z-20 w-full bg-gray-100/90 hover:bg-gray-100 border-y border-gray-200/80 px-3 py-1.5 flex items-center justify-between text-xs font-semibold text-gray-800 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? (
                          <ChevronRightIcon sx={{ fontSize: 16 }} className="text-gray-500" />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 16 }} className="text-gray-500" />
                        )}
                        <span className="font-bold text-gray-900">{group.name}</span>
                        <span className="text-[10px] font-mono text-gray-500 bg-white px-1.5 py-0.2 rounded border border-gray-200">
                          {group.code}
                        </span>
                        <span className="text-[11px] text-gray-500 font-normal">
                          ({group.rooms.length} room{group.rooms.length !== 1 ? 's' : ''})
                        </span>
                      </div>

                      {group.basePrice !== null && (
                        <span className="text-[11px] text-emerald-800 font-medium">
                          From ${group.basePrice}/night
                        </span>
                      )}
                    </div>

                    {/* Room Rows in this group */}
                    {!isCollapsed &&
                      group.rooms.map((room) => {
                        const roomIdStr = String(room.id || room._id);
                        const roomTimelineItems = itemsByRoomId.get(roomIdStr) || [];

                        return (
                          <TapeChartRoomRow
                            key={roomIdStr}
                            room={room}
                            timelineItems={roomTimelineItems}
                            visibleDates={visibleDates}
                            rangeStartDate={startDate}
                            totalDays={viewDays}
                            colWidth={colWidth}
                            onCellClick={handleCellClick}
                            onBlockClick={handleBlockClick}
                          />
                        );
                      })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Unassigned Bookings Drawer */}
      <UnassignedBookingsDrawer
        unassignedItems={unassignedItems}
        isOpen={showUnassigned}
        onClose={() => setShowUnassigned(false)}
      />

      {/* Reservation Form Modal Initiated from Empty Tape Chart Cells */}
      <ReservationFormModal
        open={isCreateModalOpen}
        form={createForm}
        onFormChange={handleFormChange}
        onClose={handleCloseModal}
        onSave={handleSaveBooking}
        error={createError}
        isSubmitting={isSubmitting}
      />

      {/* Reassign Room or Transfer Active Stay Modal */}
      <TapeChartActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        item={selectedBlockItem}
        allRooms={data?.rooms || []}
        onConfirmReassignment={handleConfirmReassignment}
        onConfirmTransfer={handleConfirmTransfer}
      />
    </div>
  );
}
