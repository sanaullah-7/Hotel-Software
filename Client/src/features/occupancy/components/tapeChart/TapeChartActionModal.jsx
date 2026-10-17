import React, { useState, useEffect } from 'react';
import {
  Close as CloseIcon,
  SwapHoriz as SwapIcon,
  MeetingRoom as RoomIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import { toYMD } from '../../utils/tapeChartDates';

export default function TapeChartActionModal({
  isOpen,
  onClose,
  item,
  allRooms = [],
  onConfirmReassignment,
  onConfirmTransfer,
}) {
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStay = item?.type === 'STAY' || item?.item_type === 'STAY' || item?.status === 'IN_HOUSE';

  // Candidate destination rooms: exclude the currently assigned room and OUT_OF_ORDER rooms
  const candidateRooms = allRooms.filter((r) => {
    const rId = String(r.id || r._id);
    const itemRoomId = String(item?.room_id);
    const isSameRoom = rId === itemRoomId;
    const isOutOfOrder = r.status === 'OUT_OF_ORDER' || r.status === 'OUT OF ORDER';
    return !isSameRoom && !isOutOfOrder;
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedRoomId('');
      setTransferReason('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const currentRoom = allRooms.find(
    (r) => String(r.id || r._id) === String(item.room_id)
  );

  const startYMD = toYMD(item.start_date);
  const endYMD = toYMD(item.end_date);
  const guestName = item.guest?.name || 'Guest';
  const refCode = isStay ? (item.stay_ref || item.booking_ref || 'STAY') : (item.booking_ref || item.stay_ref || 'BOOKING');


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setError('Please select a destination room.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (isStay) {
        await onConfirmTransfer({
          stay_id: item.stay_id,
          room_id: selectedRoomId,
          source_room_id: item.room_id,
          reason: transferReason.trim() || undefined,
        });
      } else {
        await onConfirmReassignment({
          reservation_id: item.reservation_id,
          room_id: selectedRoomId,
        });
      }
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error?.message ||
          err?.message ||
          'Operation failed. Please verify room availability and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tapechart-action-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !isSubmitting) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isStay ? 'bg-gradient-to-r from-emerald-700 to-teal-800' : 'bg-gradient-to-r from-blue-700 to-indigo-800'
        }`}>
          <div className="flex items-center gap-2">
            <SwapIcon sx={{ fontSize: 22 }} />
            <div>
              <h2 id="tapechart-action-title" className="text-base font-bold leading-tight">
                {isStay ? 'Transfer Active Stay' : 'Reassign Reservation Room'}
              </h2>
              <p className="text-xs text-white/80">
                {isStay ? 'Move currently checked-in guest' : 'Assign to a different physical room'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Close dialog"
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700 font-medium animate-fade-in"
            >
              <WarningIcon sx={{ fontSize: 18 }} className="text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Booking Context Card */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                <PersonIcon sx={{ fontSize: 15 }} className="text-gray-500" />
                {guestName}
              </span>
              <span className="font-mono text-gray-500 text-[11px]">{refCode}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5">
                <CalendarIcon sx={{ fontSize: 14 }} className="text-gray-400" />
                Dates:
              </span>
              <span className="font-medium text-gray-900">
                {startYMD} &rarr; {endYMD}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1.5">
                <RoomIcon sx={{ fontSize: 14 }} className="text-gray-400" />
                Current Room:
              </span>
              <span className="font-bold text-gray-900 font-mono">
                {currentRoom?.room_number || item.room_id}
                {currentRoom?.room_type_name ? ` (${currentRoom.room_type_name})` : ''}
              </span>
            </div>
          </div>

          {/* Destination Room Selection */}
          <div className="space-y-1.5">
            <label
              htmlFor="destination-room-select"
              className="block text-xs font-semibold text-gray-700"
            >
              Destination Room <span className="text-red-500">*</span>
            </label>
            <select
              id="destination-room-select"
              data-testid="destination-room-select"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              required
            >
              <option value="">-- Select Destination Room --</option>
              {candidateRooms.map((r) => (
                <option key={r.id || r._id} value={r.id || r._id}>
                  Room {r.room_number} &mdash; {r.room_type_name || r.room_type_code || 'Standard'} (Floor {r.floor || '1'}, {r.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-gray-500">
              Only candidate operational rooms are listed. Overlaps are authoritatively verified by the server.
            </p>
          </div>

          {/* Active Stay Transfer Reason / Notes */}
          {isStay && (
            <div className="space-y-1.5">
              <label
                htmlFor="transfer-reason-input"
                className="block text-xs font-semibold text-gray-700"
              >
                Transfer Reason / Front Desk Notes (Optional)
              </label>
              <textarea
                id="transfer-reason-input"
                data-testid="transfer-reason-input"
                rows={2}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Guest requested quiet room, maintenance required in previous room"
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Confirmation Notice */}
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800">
            {isStay ? (
              <p>
                <strong>Active Stay Policy:</strong> Transferring will vacate the current room, mark it as DIRTY for housekeeping, and check the guest into the new room immediately.
              </p>
            ) : (
              <p>
                <strong>Reservation Policy:</strong> Reassigning updates the physical room lock without altering reservation rates, guest details, or dates.
              </p>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="confirm-transfer-button"
              disabled={isSubmitting || !selectedRoomId}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors focus:outline-none flex items-center gap-1.5 ${
                isSubmitting || !selectedRoomId
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isStay
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isStay ? (
                <span>Confirm Room Transfer</span>
              ) : (
                <span>Confirm Reassignment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
