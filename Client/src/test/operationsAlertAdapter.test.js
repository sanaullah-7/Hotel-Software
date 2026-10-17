import { describe, it, expect } from 'vitest';
import {
  toFrontendOperationsAlert,
  toFrontendOperationsAlertList,
  toBackendOperationsAlertPayload,
  toFrontendDepartment,
  toBackendDepartment,
  toFrontendSeverity,
  toBackendSeverity,
  toFrontendStatus,
  toBackendStatus,
  formatTimeDisplay,
  formatReportedAgo,
  CANONICAL_BACKEND_DEPARTMENTS,
  BACKEND_TO_UI_DEPARTMENT_MAP,
  UI_TO_BACKEND_DEPARTMENT_MAP,
  CANONICAL_BACKEND_SEVERITIES,
  BACKEND_TO_UI_SEVERITY_MAP,
  UI_TO_BACKEND_SEVERITY_MAP,
  CANONICAL_BACKEND_STATUSES,
  BACKEND_TO_UI_STATUS_MAP,
  UI_TO_BACKEND_STATUS_MAP,
} from '../features/front-office/adapters/operationsAlertAdapter.js';

describe('Operations Alert Data Adapter Unit Tests', () => {
  const mockMongoId = '67a3f81023b123456789abcd';
  const mockAlertRef = 'ALT-20261006-8A3F';

  describe('1. Pure Helper Formatters', () => {
    it('formats dates into human-readable UI format', () => {
      const fixedDate = new Date('2026-10-06T18:00:00.000Z');
      const formatted = formatTimeDisplay(fixedDate);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oct');
    });

    it('returns empty string for null, undefined, or invalid dates in formatTimeDisplay', () => {
      expect(formatTimeDisplay(null)).toBe('');
      expect(formatTimeDisplay(undefined)).toBe('');
      expect(formatTimeDisplay('')).toBe('');
      expect(formatTimeDisplay('invalid-date')).toBe('');
    });

    it('formats relative time ago appropriately', () => {
      expect(formatReportedAgo(null)).toBe('Just now');
      expect(formatReportedAgo(new Date())).toBe('Just now');

      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatReportedAgo(fiveMinsAgo)).toBe('5 mins ago');

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatReportedAgo(twoHoursAgo)).toBe('2 hours ago');
    });
  });

  describe('2. Canonical Department Mappings (All 6 Departments)', () => {
    it('maps all 6 backend departments to frontend UI display labels', () => {
      expect(toFrontendDepartment('VIP_ARRIVALS')).toBe('VIP Arrivals');
      expect(toFrontendDepartment('HOUSEKEEPING')).toBe('Housekeeping');
      expect(toFrontendDepartment('MAINTENANCE')).toBe('Maintenance');
      expect(toFrontendDepartment('FOOD_AND_BEVERAGE')).toBe('Dining & F&B');
      expect(toFrontendDepartment('SECURITY_FRONT_DESK')).toBe('Security & Front Desk');
      expect(toFrontendDepartment('GENERAL')).toBe('General');
    });

    it('maps frontend department strings to canonical backend enums', () => {
      expect(toBackendDepartment('VIP Arrivals')).toBe('VIP_ARRIVALS');
      expect(toBackendDepartment('Housekeeping')).toBe('HOUSEKEEPING');
      expect(toBackendDepartment('Maintenance')).toBe('MAINTENANCE');
      expect(toBackendDepartment('Dining & F&B')).toBe('FOOD_AND_BEVERAGE');
      expect(toBackendDepartment('Security & Front Desk')).toBe('SECURITY_FRONT_DESK');
      expect(toBackendDepartment('General')).toBe('GENERAL');
    });

    it('safely handles missing or unknown department', () => {
      expect(toFrontendDepartment(null)).toBe('General');
      expect(toFrontendDepartment(undefined)).toBe('General');
      expect(toFrontendDepartment('UNKNOWN_DEPT')).toBe('General');
      expect(toBackendDepartment(null)).toBe('GENERAL');
      expect(toBackendDepartment(undefined)).toBe('GENERAL');
    });
  });

  describe('3. Canonical Severity Mappings (All 4 Levels)', () => {
    it('maps all 4 backend severities to frontend display strings', () => {
      expect(toFrontendSeverity('LOW')).toBe('Low');
      expect(toFrontendSeverity('MEDIUM')).toBe('Medium');
      expect(toFrontendSeverity('HIGH')).toBe('High');
      expect(toFrontendSeverity('CRITICAL')).toBe('Critical');
    });

    it('maps frontend priority strings to canonical backend enums', () => {
      expect(toBackendSeverity('Low')).toBe('LOW');
      expect(toBackendSeverity('Medium')).toBe('MEDIUM');
      expect(toBackendSeverity('High')).toBe('HIGH');
      expect(toBackendSeverity('Critical')).toBe('CRITICAL');
      expect(toBackendSeverity('Urgent')).toBe('CRITICAL');
    });

    it('safely handles missing or unknown severity', () => {
      expect(toFrontendSeverity(null)).toBe('High');
      expect(toBackendSeverity(null)).toBe('HIGH');
    });
  });

  describe('4. Canonical Status Mappings & Legacy Rejection', () => {
    it('maps all 3 backend statuses to frontend display strings', () => {
      expect(toFrontendStatus('OPEN')).toBe('Open');
      expect(toFrontendStatus('IN_PROGRESS')).toBe('In Progress');
      expect(toFrontendStatus('RESOLVED')).toBe('Resolved');
    });

    it('maps frontend status strings to canonical backend enums', () => {
      expect(toBackendStatus('Open')).toBe('OPEN');
      expect(toBackendStatus('In Progress')).toBe('IN_PROGRESS');
      expect(toBackendStatus('Resolved')).toBe('RESOLVED');
    });

    it('explicitly discards legacy "Assigned" status', () => {
      expect(toBackendStatus('Assigned')).toBeUndefined();
      expect(toBackendStatus('assigned')).toBeUndefined();
    });

    it('safely handles missing or unknown status', () => {
      expect(toFrontendStatus(null)).toBe('Open');
      expect(toBackendStatus(null)).toBeUndefined();
    });
  });

  describe('5. toFrontendOperationsAlert() Document Transformation', () => {
    it('transforms complete backend MongoDB document into frontend model', () => {
      const backendDoc = {
        _id: mockMongoId,
        alert_ref: mockAlertRef,
        title: 'VIP Presidential Arrival',
        message: 'Lady Evelyn Montague landing at private hangar at 5:45 PM.',
        department: 'VIP_ARRIVALS',
        type: 'VIP_ARRIVALS',
        severity: 'CRITICAL',
        status: 'OPEN',
        is_active: true,
        action_required: 'Inspect suite amenities and dispatch luxury deployment kit.',
        location: 'Presidential Suite 501',
        guest_name: 'Lady Evelyn Montague',
        reported_by: 'Concierge Team',
        assigned_to: 'Concierge Team (Sarah)',
        created_at: '2026-10-06T18:00:00.000Z',
        updated_at: '2026-10-06T18:00:00.000Z',
        resolved_at: null,
      };

      const result = toFrontendOperationsAlert(backendDoc);

      expect(result).not.toBeNull();
      expect(result.id).toBe(mockAlertRef);
      expect(result._id).toBe(mockMongoId);
      expect(result.alert_ref).toBe(mockAlertRef);
      expect(result.title).toBe('VIP Presidential Arrival');
      expect(result.department).toBe('VIP Arrivals');
      expect(result.priority).toBe('Critical');
      expect(result.status).toBe('Open');
      expect(result.is_active).toBe(true);
      expect(result.location).toBe('Presidential Suite 501');
      expect(result.guest).toBe('Lady Evelyn Montague');
      expect(result.reportedBy).toBe('Concierge Team');
      expect(result.description).toBe('Lady Evelyn Montague landing at private hangar at 5:45 PM.');
      expect(result.action).toBe('Inspect suite amenities and dispatch luxury deployment kit.');
      expect(result.assignedTo).toBe('Concierge Team (Sarah)');
      expect(result.resolved_at).toBeNull();
    });

    it('handles wrapped response { alert: { ... } }', () => {
      const wrapped = {
        alert: {
          _id: mockMongoId,
          alert_ref: mockAlertRef,
          title: 'AC Failure',
          message: 'Compressor burnt',
          department: 'MAINTENANCE',
          severity: 'HIGH',
          status: 'IN_PROGRESS',
        },
      };

      const result = toFrontendOperationsAlert(wrapped);
      expect(result).not.toBeNull();
      expect(result.id).toBe(mockAlertRef);
      expect(result.department).toBe('Maintenance');
      expect(result.status).toBe('In Progress');
    });

    it('provides sensible defaults for missing optional fields', () => {
      const minimal = {
        _id: mockMongoId,
        alert_ref: mockAlertRef,
        title: 'Minimal Alert',
        message: 'Minimal Message',
      };

      const result = toFrontendOperationsAlert(minimal);
      expect(result.location).toBe('Front Desk Broadcast');
      expect(result.guest).toBe('Multiple/None');
      expect(result.reportedBy).toBe('Front Office');
      expect(result.action).toBe('Acknowledge and proceed as instructed.');
      expect(result.assignedTo).toBe('General Team');
      expect(result.priority).toBe('High');
      expect(result.status).toBe('Open');
    });

    it('returns null for null or non-object input', () => {
      expect(toFrontendOperationsAlert(null)).toBeNull();
      expect(toFrontendOperationsAlert(undefined)).toBeNull();
      expect(toFrontendOperationsAlert('invalid')).toBeNull();
    });
  });

  describe('6. toFrontendOperationsAlertList()', () => {
    it('transforms arrays and response envelopes safely', () => {
      const list = [
        { _id: '1', alert_ref: 'ALT-1', title: 'A1', message: 'M1', department: 'MAINTENANCE' },
        { _id: '2', alert_ref: 'ALT-2', title: 'A2', message: 'M2', department: 'HOUSEKEEPING' },
      ];

      expect(toFrontendOperationsAlertList(list).length).toBe(2);
      expect(toFrontendOperationsAlertList({ data: list }).length).toBe(2);
      expect(toFrontendOperationsAlertList({ alerts: list }).length).toBe(2);
      expect(toFrontendOperationsAlertList(null)).toEqual([]);
      expect(toFrontendOperationsAlertList(undefined)).toEqual([]);
    });
  });

  describe('7. toBackendOperationsAlertPayload() & Immutability Protection', () => {
    it('transforms frontend model to clean backend create payload', () => {
      const frontendForm = {
        title: 'Anniversary Dinner Alert',
        description: 'Special wine setup',
        department: 'Dining & F&B',
        priority: 'Medium',
        action: 'Confirm allergen-free menu',
        location: 'Suite 317',
        guest: 'Mr. & Mrs. Ashford',
        assignedTo: 'F&B Manager (Claire)',
      };

      const payload = toBackendOperationsAlertPayload(frontendForm);

      expect(payload.title).toBe('Anniversary Dinner Alert');
      expect(payload.message).toBe('Special wine setup');
      expect(payload.department).toBe('FOOD_AND_BEVERAGE');
      expect(payload.severity).toBe('MEDIUM');
      expect(payload.status).toBe('OPEN');
      expect(payload.action_required).toBe('Confirm allergen-free menu');
      expect(payload.location).toBe('Suite 317');
      expect(payload.guest_name).toBe('Mr. & Mrs. Ashford');
      expect(payload.assigned_to).toBe('F&B Manager (Claire)');
    });

    it('strictly strips backend-owned and immutable fields from payload', () => {
      const maliciousPayload = {
        _id: '67a3f81023b123456789abcd',
        alert_ref: 'TAMPERED-REF',
        title: 'Legitimate Title',
        description: 'Legitimate Message',
        created_at: '2020-01-01',
        updated_at: '2020-01-01',
        resolved_at: '2020-01-01',
        created_by: '67a3f81023b123456789def0',
        is_active: false,
        hotelId: 'tenant_123',
        tenantId: 'tenant_123',
        __v: 0,
      };

      const payload = toBackendOperationsAlertPayload(maliciousPayload);

      expect(payload._id).toBeUndefined();
      expect(payload.alert_ref).toBeUndefined();
      expect(payload.created_at).toBeUndefined();
      expect(payload.updated_at).toBeUndefined();
      expect(payload.resolved_at).toBeUndefined();
      expect(payload.created_by).toBeUndefined();
      expect(payload.is_active).toBeUndefined();
      expect(payload.hotelId).toBeUndefined();
      expect(payload.tenantId).toBeUndefined();
      expect(payload.__v).toBeUndefined();
      expect(payload.title).toBe('Legitimate Title');
      expect(payload.message).toBe('Legitimate Message');
    });

    it('creates partial payload for update when isUpdate is true', () => {
      const updateData = {
        status: 'In Progress',
        priority: 'Critical',
      };

      const payload = toBackendOperationsAlertPayload(updateData, { isUpdate: true });

      expect(payload.status).toBe('IN_PROGRESS');
      expect(payload.severity).toBe('CRITICAL');
      expect(payload.title).toBeUndefined();
      expect(payload.department).toBeUndefined();
    });

    it('returns empty object for invalid input', () => {
      expect(toBackendOperationsAlertPayload(null)).toEqual({});
      expect(toBackendOperationsAlertPayload(undefined)).toEqual({});
      expect(toBackendOperationsAlertPayload('string')).toEqual({});
    });
  });
});
