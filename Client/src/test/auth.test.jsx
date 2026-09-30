import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from '../pages/Auth/Login';
import DashboardLayout from '../layouts/DashboardLayout/DashboardLayout';
import Dashboard from '../pages/Dashboard/Dashboard';

describe('Frontend Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders login page correctly with demo credentials message', () => {
    const { getByText, getByPlaceholderText } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(getByText('Welcome back')).toBeTruthy();
    expect(getByPlaceholderText('you@example.com')).toBeTruthy();
    expect(getByText('Demo credentials')).toBeTruthy();
  });

  it('authenticates successfully with valid credentials and sets localStorage', async () => {
    let currentPath = '/login';
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
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(localStorage.getItem('isAuthenticated')).toBe('true');
      expect(localStorage.getItem('user')).toContain('admin@hotel.com');
      expect(getByTestId('auth-user').textContent).toBe('admin@hotel.com');
    });
  });

  it('fails authentication with invalid credentials and does not set localStorage', async () => {
    const { getByPlaceholderText, getByText } = render(
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

    expect(localStorage.getItem('isAuthenticated')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('redirects unauthenticated user from protected dashboard to login', () => {
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

    expect(getByText('Login Page Redirected')).toBeTruthy();
    expect(queryByText('Secret Dashboard Content')).toBeNull();
  });

  it('allows authenticated user to view protected dashboard and persists on reload', () => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify({ email: 'admin@hotel.com', role: 'Admin' }));

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

    expect(getByText('Dashboard Content Loaded')).toBeTruthy();
  });
});
