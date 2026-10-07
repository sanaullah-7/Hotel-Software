import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';

describe('Frontend Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders login page correctly', () => {
    // Mock /auth/me to return 401 unauthenticated
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, message: 'No token provided' }),
      text: async () => 'No token provided',
    });

    const { getByText, getByPlaceholderText } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
  });

  it('authenticates successfully with valid credentials and receives backend session', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.includes('/auth/login')) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: async () => ({
            success: true,
            message: 'Login successful',
            data: {
              account: {
                _id: '6ac379208ccaa4a7bf182701',
                email: 'admin@hotel.com',
                fullName: 'Hotel Admin',
                role: 'HOTEL_ADMIN',
                hotelId: '6ac379208ccaa4a7bf182702',
              },
              accessToken: 'mock-jwt-access-token',
            },
          }),
        };
      }
      return {
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: false, message: 'Unauthorized' }),
      };
    });

    const LocationTracker = () => {
      const { user } = useAuth();
      return <div data-testid="auth-user">{user?.email || 'none'}</div>;
    };

    const { getByPlaceholderText, getByText, getByTestId } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<LocationTracker />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const submitBtn = getByText('Sign In', { selector: 'button' });

    fireEvent.change(emailInput, { target: { value: 'admin@hotel.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem('accessToken')).toBe('mock-jwt-access-token');
      expect(getByTestId('auth-user').textContent).toBe('admin@hotel.com');
    });
  });

  it('fails authentication with invalid credentials and displays error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, message: 'Invalid email or password' }),
      text: async () => 'Invalid email or password',
    });

    const { getByPlaceholderText, getByText, getAllByText } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    const emailInput = getByPlaceholderText('you@example.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const submitBtn = getByText('Sign In', { selector: 'button' });

    fireEvent.change(emailInput, { target: { value: 'wrong@hotel.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(getAllByText('Invalid email or password').length).toBeGreaterThan(0);
      expect(localStorage.getItem('accessToken')).toBeNull();
    });
  });

  it('redirects unauthenticated user from protected dashboard to login', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ success: false, message: 'Unauthorized' }),
    });

    const { getByText, queryByText } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page Redirected</div>} />
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <div>Secret Dashboard Content</div>
                </DashboardLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Login Page Redirected')).toBeTruthy();
      expect(queryByText('Secret Dashboard Content')).toBeNull();
    });
  });

  it('verifies session with /auth/me on startup and allows access to protected dashboard', async () => {
    localStorage.setItem('accessToken', 'valid-test-token');

    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (url.includes('/auth/me')) {
        return {
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          json: async () => ({
            success: true,
            data: {
              id: '6ac379208ccaa4a7bf182701',
              email: 'verified@hotel.com',
              fullName: 'Verified Manager',
              role: 'HOTEL_ADMIN',
              hotelId: '6ac379208ccaa4a7bf182702',
            },
          }),
        };
      }
      return {
        ok: false,
        status: 401,
        headers: { get: () => 'application/json' },
        json: async () => ({ success: false }),
      };
    });

    const { getByText } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/dashboard"
              element={
                <DashboardLayout>
                  <div>Dashboard Content Loaded</div>
                </DashboardLayout>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByText('Dashboard Content Loaded')).toBeTruthy();
    });
  });
});
