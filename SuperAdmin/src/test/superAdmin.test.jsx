import { describe, it, expect } from 'vitest';
import { HotelService } from '../Services/HotelService.js';
import { ApprovalService } from '../Services/ApprovlService.js';
import { UserService } from '../Services/UserService.js';
import { SubscriptionService } from '../Services/SubscriptionService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/ForamteDate.js';
import { hasPermission, ROLE_PERMISSIONS } from '../utils/Permission.js';

describe('Super Admin Utility Functions', () => {
  it('formats PKR currency with symbol and comma separation', () => {
    expect(formatCurrency(5000)).toMatch(/PKR|Rs/);
    expect(formatCurrency(29999)).toContain('29,999');
  });

  it('formats dates cleanly', () => {
    const formatted = formatDate('2024-09-08T12:00:00Z');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('enforces RBAC permissions for SUPER_ADMIN role', () => {
    expect(hasPermission('SUPER_ADMIN', 'approve_hotel')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'suspend_hotel')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'manage_subscriptions')).toBe(true);
    expect(hasPermission('GUEST', 'approve_hotel')).toBe(false);
  });
});

describe('Super Admin Service Layer', () => {
  it('fetches mock hotels with pagination and filters', async () => {
    const res = await HotelService.getHotels({ page: 1, limit: 5 });
    expect(res).toBeDefined();
    expect(res.data).toBeInstanceOf(Array);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
  });

  it('fetches pending hotel approvals', async () => {
    const res = await ApprovalService.getPendingApprovals();
    expect(res).toBeDefined();
    expect(res.data).toBeInstanceOf(Array);
  });

  it('can approve a hotel application', async () => {
    const result = await ApprovalService.approveRequest('app1');
    expect(result.success).toBe(true);
  });

  it('can reject a hotel application with reasons', async () => {
    const result = await ApprovalService.rejectRequest('app2', 'Missing DTS certification');
    expect(result.success).toBe(true);
    expect(result.rejectionReason).toBe('Missing DTS certification');
  });

  it('fetches system users and filters by role', async () => {
    const res = await UserService.getUsers({ role: 'MANAGER' });
    expect(res.data).toBeInstanceOf(Array);
    res.data.forEach((u) => {
      expect(u.role).toBe('MANAGER');
    });
  });

  it('retrieves subscription plans and stats', async () => {
    const plans = await SubscriptionService.getPlans();
    expect(plans).toBeInstanceOf(Array);
    expect(plans.length).toBeGreaterThanOrEqual(3);
    const enterprise = plans.find((p) => p.tier === 'ENTERPRISE');
    expect(enterprise).toBeDefined();
    expect(enterprise.price).toBeGreaterThan(0);
  });
});
