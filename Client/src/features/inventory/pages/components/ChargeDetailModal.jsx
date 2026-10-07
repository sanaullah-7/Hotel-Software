import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogActions, 
  IconButton, CircularProgress 
} from '@mui/material';
import { Close, Receipt, CheckCircle, Person, MeetingRoom, CalendarToday, Block } from '@mui/icons-material';
import guestChargeService from '../../../../services/guestChargeService';
import { updateGuestCharge } from '../inventoryStore';

export default function ChargeDetailModal({
  open,
  onClose,
  charge,
  onChargeUpdated
}) {
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!charge) return null;

  const handleVoidCharge = async () => {
    setSubmitting(true);
    setActionError('');
    try {
      await guestChargeService.voidGuestCharge(charge.id);
      try {
        updateGuestCharge(charge.id, { status: 'Voided' });
      } catch {}
      if (onChargeUpdated) onChargeUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to void charge:', err);
      setActionError(err?.message || 'Failed to void charge');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (charge) => {
    if (charge.isVoided || charge.status === 'Voided') {
      return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gray-100 text-gray-600 border border-gray-300">Voided</span>;
    }
    switch (charge.status) {
      case 'Added to Folio':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">Added to Folio</span>;
      case 'Pending':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending Approval</span>;
      case 'Paid':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Paid / Settled</span>;
      case 'Invoiced':
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Invoiced</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#e5f4eb] text-[#1b7f43] border border-[#1b7f43]/20">{charge.status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'Consumption':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Consumption</span>;
      case 'Damage':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Damage</span>;
      case 'Minibar':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">Minibar</span>;
      case 'External Order':
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">External Order</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-gray-100 text-gray-700 border border-gray-200">{type}</span>;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
        }
      }}
    >
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Receipt sx={{ fontSize: 20 }} />
            <h2 className="text-base font-bold">Folio Charge Breakdown</h2>
            <span className="bg-white/15 text-white text-[11px] font-mono px-1.5 py-0.5 rounded">
              {charge.id}
            </span>
          </div>
          <p className="text-[11px] text-white/70 mt-0.5">
            Folio Ref: <span className="text-white font-mono font-semibold">{charge.folioId || `FOL-${charge.roomNumber}`}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(charge)}
          <IconButton 
            onClick={onClose} 
            size="small" 
            sx={{ color: 'white', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ p: 2.5, backgroundColor: '#f9fafb' }}>
        <div className="space-y-3">
          
          {actionError && (
            <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
              {actionError}
            </div>
          )}

          {/* Guest & Room Header Card */}
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1b7f43] flex items-center justify-center font-bold text-sm border border-emerald-100">
                {charge.guestName ? charge.guestName.charAt(0) : 'G'}
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">{charge.guestName}</h3>
                <span className="text-[11px] font-semibold text-gray-500">Room {charge.roomNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block font-medium">Charge Type</span>
              {getTypeBadge(charge.chargeType)}
            </div>
          </div>

          {/* Itemized Charge Breakdown */}
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Itemized Folio Entry
            </span>

            <div className="bg-gray-50 p-2.5 rounded border border-gray-100 space-y-1.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-gray-900 block">{charge.itemName}</span>
                  {charge.invoiceNumber && (
                    <span className="text-[10.5px] text-[#1b7f43] font-mono block">
                      Billed on Invoice: {charge.invoiceNumber}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold font-mono ${charge.isVoided ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    Rs. {Number(charge.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                <span>Quantity: {charge.quantity}</span>
                <span>Unit Rate: Rs. {Number(charge.unitPrice || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Notes */}
            {charge.notes && (
              <div className="pt-1">
                <span className="text-[10.5px] font-semibold text-gray-400 block">Folio Notes / Justification</span>
                <p className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-100 italic mt-0.5">
                  "{charge.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Flow Indicator */}
          <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Folio Pipeline Progress
            </span>
            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-600 bg-gray-50 p-2 rounded">
              <span className="text-[#1b7f43] font-bold">1. Charge Created</span>
              <span>→</span>
              <span className={!charge.isVoided ? 'text-[#1b7f43] font-bold' : 'text-gray-400'}>
                2. Posted to Guest Folio
              </span>
              <span>→</span>
              <span className={charge.status === 'Paid' ? 'text-[#1b7f43] font-bold' : 'text-gray-400'}>
                3. Invoice & Payment
              </span>
            </div>
          </div>

          {/* Void / Action Section */}
          {!charge.isVoided && (
            <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-900 block">Void this Charge?</span>
                <span className="text-[11px] text-gray-500">
                  Reverses the charge amount from the guest's folio balance.
                </span>
              </div>
              <button
                type="button"
                onClick={handleVoidCharge}
                disabled={submitting}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {submitting && <CircularProgress size={12} sx={{ color: '#b91c1c' }} />}
                <Block sx={{ fontSize: 14 }} />
                Void Charge
              </button>
            </div>
          )}

        </div>
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
}
