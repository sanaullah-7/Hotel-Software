import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HotelService } from '../Services/HotelService.js';
import { ApprovalService } from '../Services/ApprovlService.js';
import { UserService } from '../Services/UserService.js';
import { SubscriptionService } from '../Services/SubscriptionService.js';
import { AnalyticsService } from '../Services/RevenueService.js';
import { AuditLogService } from '../Services/AuditLogService.js';
import { ReportService } from '../Services/ReportService.js';
import { NotificationService } from '../Services/NotificationService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/ForamteDate.js';
import { hasPermission } from '../utils/Permission.js';

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
  beforeEach(() => {
    global.fetch = vi.fn().mockImplementation(async (url, opts) => {
      const urlStr = String(url);
      if (urlStr.includes('/hotels') && !urlStr.includes('/reports') && (!opts || opts.method === 'GET' || !opts.method)) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                { id: 'h1', name: 'Pearl Continental', city: 'Lahore', status: 'ACTIVE' },
                { id: 'h2', name: 'Serena Hotel', city: 'Islamabad', status: 'PENDING' },
              ],
              total: 2,
              page: 1,
              limit: 5,
            },
          }),
        };
      }
      if (urlStr.includes('/approve')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Hotel approved' }),
        };
      }
      if (urlStr.includes('/reject')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, rejectionReason: 'Missing DTS certification' }),
        };
      }
      if (urlStr.includes('/suspend')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, suspensionReason: 'Overdue rent' }),
        };
      }
      if (urlStr.includes('/reactivate')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true, message: 'Hotel reactivated' }),
        };
      }
      if (urlStr.includes('/users') && !urlStr.includes('/reports')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                { id: 'u1', name: 'Ahmed Khan', role: 'MANAGER', status: 'ACTIVE' },
                { id: 'u2', name: 'Sara Ali', role: 'MANAGER', status: 'ACTIVE' },
              ],
              total: 2,
              page: 1,
            },
          }),
        };
      }
      if (urlStr.includes('/subscriptions/plans')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              { id: 'p1', tier: 'BASIC', name: 'Basic Starter', price: 4999 },
              { id: 'p2', tier: 'PRO', name: 'Business Pro', price: 12999 },
              { id: 'p3', tier: 'ENTERPRISE', name: 'Enterprise Elite', price: 29999 },
            ],
          }),
        };
      }
      if (urlStr.includes('/subscriptions/stats')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              active: 5,
              trial: 2,
              expired: 1,
              totalRevenueMonthly: 85000,
            },
          }),
        };
      }
      if (urlStr.includes('/subscriptions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                { id: 's1', hotelName: 'Pearl Continental', planTier: 'PRO', status: 'ACTIVE', amount: 12999 },
              ],
              total: 1,
              page: 1,
            },
          }),
        };
      }
      if (urlStr.includes('/analytics/overview')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              monthlyRevenue: 485000,
              prevMonthRevenue: 420000,
              revenueGrowth: 15.5,
              subscriptionRevenue: 350000,
              oneTimeRevenue: 135000,
              totalRevenue: 2400000,
            },
          }),
        };
      }
      if (urlStr.includes('/analytics/revenue')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              { month: 'Jan', revenue: 150000, subscriptions: 120000, oneTime: 30000 },
              { month: 'Feb', revenue: 220000, subscriptions: 180000, oneTime: 40000 },
            ],
          }),
        };
      }
      if (urlStr.includes('/finance/transactions')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'TXN-01',
                  hotelName: 'Pearl Continental',
                  plan: 'Business Pro',
                  amount: 12999,
                  method: 'Meezan Bank',
                  status: 'SUCCESS',
                  date: '2026-10-08',
                },
              ],
              total: 1,
              page: 1,
            },
          }),
        };
      }
      if (urlStr.includes('/audit-logs/stats')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              totalEvents: 42,
              criticalEvents: 3,
              warningEvents: 8,
            },
          }),
        };
      }
      if (urlStr.includes('/audit-logs')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'log-1',
                  action: 'HOTEL_APPROVED',
                  entity: 'Pearl Continental Lahore',
                  entityType: 'hotel',
                  performedBy: 'Super Admin',
                  ip: '192.168.1.1',
                  severity: 'INFO',
                  createdAt: '2026-10-08T12:00:00Z',
                },
              ],
              total: 1,
              page: 1,
            },
          }),
        };
      }
      if (urlStr.includes('/reports/hotels')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              totalHotels: 48,
              activeHotels: 41,
              pendingApproval: 5,
              suspendedHotels: 2,
              byCity: [
                { city: 'Lahore', count: 16, percentage: 33 },
                { city: 'Islamabad', count: 12, percentage: 25 },
              ],
              monthlyGrowth: [
                { month: 'Jan', registrations: 4, active: 4 },
              ],
            },
          }),
        };
      }
      if (urlStr.includes('/reports/revenue')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              mrr: 245000,
              arr: 2940000,
              avgRevenuePerHotel: 5975,
              churnRate: '1.2%',
              topEarningCities: [
                { city: 'Lahore', revenue: 98000 },
              ],
            },
          }),
        };
      }
      if (urlStr.includes('/reports/users')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              totalUsers: 142,
              activeManagers: 48,
              activeReceptionists: 86,
              superAdmins: 8,
              activeRate: '94.2%',
              recentSignupsMonth: 19,
            },
          }),
        };
      }
      if (urlStr.includes('/notifications/unread-count')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { count: 3 },
          }),
        };
      }
      if (urlStr.includes('/notifications/read-all')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { success: true, message: 'All notifications marked as read', unreadCount: 0 },
          }),
        };
      }
      if (urlStr.includes('/notifications') && urlStr.includes('/read')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: { success: true, message: 'Notification marked as read' },
          }),
        };
      }
      if (urlStr.includes('/notifications')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              data: [
                {
                  id: 'notif-1',
                  title: 'New Hotel Registration Awaiting Review',
                  message: 'Pearl Continental submitted documents',
                  type: 'warning',
                  category: 'hotel',
                  read: false,
                  createdAt: '2026-10-08T10:00:00Z',
                },
                {
                  id: 'notif-2',
                  title: 'Platform Revenue Payment Collected',
                  message: 'Received PKR 12,999 from Serena Hotel',
                  type: 'info',
                  category: 'finance',
                  read: true,
                  createdAt: '2026-10-08T09:00:00Z',
                },
              ],
              total: 2,
              page: 1,
              unreadCount: 1,
            },
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: {} }),
      };
    });
  });

  it('fetches hotels with pagination and filters', async () => {
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

  it('can suspend a hotel for rent default and reactivate', async () => {
    const suspendRes = await HotelService.suspendHotel('h1', 'Overdue rent');
    expect(suspendRes.success).toBe(true);
    expect(suspendRes.suspensionReason).toBe('Overdue rent');

    const reactivateRes = await HotelService.reactivateHotel('h1');
    expect(reactivateRes.success).toBe(true);
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

    const stats = await SubscriptionService.getSubscriptionStats();
    expect(stats.active).toBe(5);
    expect(stats.totalRevenueMonthly).toBe(85000);
  });

  it('retrieves subscription agreements with live data structure', async () => {
    const res = await SubscriptionService.getSubscriptions({ status: 'ACTIVE' });
    expect(res.data).toBeInstanceOf(Array);
    expect(res.data[0].hotelName).toBe('Pearl Continental');
    expect(res.data[0].planTier).toBe('PRO');
  });

  it('updates subscription agreements and plan configuration', async () => {
    const updateSubRes = await SubscriptionService.updateSubscription('s1', { status: 'SUSPENDED' });
    expect(updateSubRes).toBeDefined();

    const updatePlanRes = await SubscriptionService.updatePlan('p2', { price: 14999 });
    expect(updatePlanRes).toBeDefined();
  });

  it('retrieves live revenue telemetry and overview metrics', async () => {
    const overview = await AnalyticsService.getRevenueOverview();
    expect(overview.monthlyRevenue).toBe(485000);
    expect(overview.revenueGrowth).toBe(15.5);
    expect(overview.subscriptionRevenue).toBe(350000);

    const trend = await AnalyticsService.getRevenueData();
    expect(trend).toBeInstanceOf(Array);
    expect(trend.length).toBeGreaterThan(0);
    expect(trend[0].month).toBe('Jan');
  });

  it('retrieves platform transaction ledger with pagination and filters', async () => {
    const res = await AnalyticsService.getTransactions({ page: 1, limit: 10, status: 'SUCCESS' });
    expect(res.data).toBeInstanceOf(Array);
    expect(res.data[0].id).toBe('TXN-01');
    expect(res.data[0].hotelName).toBe('Pearl Continental');
    expect(res.data[0].amount).toBe(12999);
  });

  it('retrieves platform audit logs and security stats', async () => {
    const res = await AuditLogService.getLogs({ page: 1, limit: 10 });
    expect(res.data).toBeInstanceOf(Array);
    expect(res.data[0].action).toBe('HOTEL_APPROVED');
    expect(res.data[0].entity).toBe('Pearl Continental Lahore');

    const stats = await AuditLogService.getAuditStats();
    expect(stats.totalEvents).toBe(42);
    expect(stats.criticalEvents).toBe(3);
  });

  it('retrieves live report suites for hotels, revenue, and users', async () => {
    const hotelRep = await ReportService.getHotelReport();
    expect(hotelRep.totalHotels).toBe(48);
    expect(hotelRep.byCity).toBeInstanceOf(Array);
    expect(hotelRep.byCity[0].city).toBe('Lahore');

    const revRep = await ReportService.getRevenueReport();
    expect(revRep.mrr).toBe(245000);
    expect(revRep.topEarningCities).toBeInstanceOf(Array);

    const userRep = await ReportService.getUserReport();
    expect(userRep.totalUsers).toBe(142);
    expect(userRep.activeManagers).toBe(48);
  });

  it('retrieves platform alerts, marks as read, and checks unread counts', async () => {
    const alerts = await NotificationService.getNotifications();
    expect(alerts.data).toBeInstanceOf(Array);
    expect(alerts.data.length).toBe(2);
    expect(alerts.data[0].id).toBe('notif-1');
    expect(alerts.data[0].type).toBe('warning');

    const unread = await NotificationService.getUnreadCount();
    expect(unread.count).toBe(3);

    const markReadRes = await NotificationService.markAsRead('notif-1');
    expect(markReadRes.success).toBe(true);

    const markAllRes = await NotificationService.markAllAsRead();
    expect(markAllRes.success).toBe(true);
    expect(markAllRes.unreadCount).toBe(0);
  });
});
