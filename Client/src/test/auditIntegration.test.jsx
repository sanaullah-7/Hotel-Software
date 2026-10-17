import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import AuditLog from '../features/audit/pages/AuditLog';
import { auditService } from '../services/auditService';
import { addAuditLog, getAuditLogs, clearAuditLogs, AUDIT_UPDATED_EVENT } from '../features/audit/state/auditStore';

vi.mock('../services/auditService', () => ({
  auditService: {
    getAuditLogs: vi.fn(),
    getAuditMetrics: vi.fn(),
    getAuditLogById: vi.fn(),
    createAuditLog: vi.fn(),
  },
}));

const mockAuditLogs = [
  {
    id: 'aud-001',
    _id: 'aud-001',
    dateTime: '2026-03-20T10:30:00.000Z',
    userName: 'Sarah Jenkins',
    module: 'Reservation',
    action: 'Created Booking',
    recordId: 'RES-4011',
    description: 'Booking RES-4011 created for Sarah Jenkins.',
    importance: 'Important',
    status: 'Completed',
  },
  {
    id: 'aud-002',
    _id: 'aud-002',
    dateTime: '2026-03-20T11:15:00.000Z',
    userName: 'Manager Alex',
    module: 'Rooms',
    action: 'Deleted Room',
    recordId: '104',
    description: 'Room 104 decommissioned.',
    importance: 'Critical',
    status: 'Completed',
  },
  {
    id: 'aud-003',
    _id: 'aud-003',
    dateTime: '2026-03-20T12:00:00.000Z',
    userName: 'Admin',
    module: 'Inventory',
    action: 'Updated Stock',
    recordId: 'INV-LINEN',
    description: 'Linen stock adjusted by +50 units.',
    importance: 'Normal',
    status: 'Completed',
  },
];

describe('Audit Log Frontend Integration Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuditLogs();
    localStorage.clear();

    auditService.getAuditLogs.mockResolvedValue({
      success: true,
      data: {
        logs: mockAuditLogs,
        totalCount: 3,
        totalPages: 1,
        currentPage: 1,
      },
    });

    auditService.createAuditLog.mockImplementation(async (payload) => ({
      success: true,
      data: {
        id: `aud-${Date.now()}`,
        _id: `aud-${Date.now()}`,
        dateTime: new Date().toISOString(),
        userName: payload.userName || 'Admin',
        module: payload.module,
        action: payload.action,
        recordId: payload.recordId,
        description: payload.description,
        importance: payload.importance || 'Normal',
        status: payload.status || 'Completed',
      },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. auditStore & Data Layer (No localStorage reliance)', () => {
    it('should create audit log asynchronously without using localStorage hms_audit_log', async () => {
      expect(localStorage.getItem('hms_audit_log')).toBeNull();

      const log = addAuditLog({
        module: 'Restaurant',
        action: 'Created Order',
        recordId: 'ORD-77',
        description: 'Order ORD-77 submitted to kitchen.',
        importance: 'Normal',
      });

      expect(log.module).toBe('Restaurant');
      expect(log.recordId).toBe('ORD-77');
      expect(auditService.createAuditLog).toHaveBeenCalledTimes(1);

      // Verify hms_audit_log was never set in localStorage
      expect(localStorage.getItem('hms_audit_log')).toBeNull();
    });

    it('should fire AUDIT_UPDATED_EVENT when log is added', async () => {
      let eventFired = false;
      const listener = () => {
        eventFired = true;
      };
      window.addEventListener(AUDIT_UPDATED_EVENT, listener);

      addAuditLog({
        module: 'Front Office',
        action: 'Check In',
        recordId: 'RES-101',
        description: 'Guest checked into room 202',
      });

      expect(eventFired).toBe(true);
      window.removeEventListener(AUDIT_UPDATED_EVENT, listener);
    });
  });

  describe('2. AuditLog Page Rendering & Real Database Integration', () => {
    it('should fetch and display live audit logs from backend service', async () => {
      render(
        <BrowserRouter>
          <AuditLog />
        </BrowserRouter>
      );

      // Verify loading call
      expect(auditService.getAuditLogs).toHaveBeenCalled();

      // Check table rows rendered
      await waitFor(() => {
        expect(screen.getByText('Booking RES-4011 created for Sarah Jenkins.')).toBeInTheDocument();
        expect(screen.getByText('Room 104 decommissioned.')).toBeInTheDocument();
        expect(screen.getByText('Linen stock adjusted by +50 units.')).toBeInTheDocument();
      });

      // Verify importance badges
      expect(screen.getByText(/Critical/i)).toBeInTheDocument();
      expect(screen.getByText(/Important/i)).toBeInTheDocument();
      expect(screen.getByText(/Normal/i)).toBeInTheDocument();

      // Verify count in footer
      expect(screen.getByText(/Showing 3 of 3 logs/i)).toBeInTheDocument();
    });

    it('should search logs and trigger service call with query param', async () => {
      render(
        <BrowserRouter>
          <AuditLog />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search logs...');
      fireEvent.change(searchInput, { target: { value: 'RES-4011' } });

      await waitFor(() => {
        expect(auditService.getAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            search: 'RES-4011',
          })
        );
      });
    });

    it('should clear filters when clear button is clicked', async () => {
      render(
        <BrowserRouter>
          <AuditLog />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search logs...')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search logs...');
      fireEvent.change(searchInput, { target: { value: 'RES-4011' } });

      const clearBtn = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearBtn);

      expect(searchInput.value).toBe('');
      await waitFor(() => {
        expect(auditService.getAuditLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            search: '',
          })
        );
      });
    });

    it('should display empty message when no records are returned', async () => {
      auditService.getAuditLogs.mockResolvedValueOnce({
        success: true,
        data: {
          logs: [],
          totalCount: 0,
          totalPages: 1,
          currentPage: 1,
        },
      });

      render(
        <BrowserRouter>
          <AuditLog />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No audit logs found/i)).toBeInTheDocument();
      });
    });
  });
});
