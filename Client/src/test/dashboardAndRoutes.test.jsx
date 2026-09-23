import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PersonAdd } from '@mui/icons-material';
import KPICard from '../components/common/KPICard';
import StatusBadge from '../components/common/StatusBadge';
import Dashboard from '../pages/Dashboard/Dashboard';

describe('Dashboard and Shared UI Components', () => {
  it('renders KPICard with ForwardRef MUI Icon correctly in compact variant', () => {
    const { getByText } = render(
      <KPICard
        title="Reservation Today"
        value={12}
        icon={PersonAdd}
        variant="compact"
      />
    );
    expect(getByText('Reservation Today')).toBeTruthy();
    expect(getByText('12')).toBeTruthy();
  });

  it('renders KPICard with badge and horizontal variants', () => {
    const { getByText } = render(
      <div>
        <KPICard
          title="Total Events"
          value={5}
          subtext="2 today"
          icon={PersonAdd}
          variant="badge"
        />
        <KPICard
          title="Total Guests"
          value={45}
          icon={PersonAdd}
          variant="horizontal"
        />
      </div>
    );
    expect(getByText('Total Events')).toBeTruthy();
    expect(getByText('Total Guests')).toBeTruthy();
  });

  it('renders StatusBadge with icon without runtime errors', () => {
    const { getByText } = render(
      <StatusBadge status="Booked" icon={PersonAdd} />
    );
    expect(getByText('Booked')).toBeTruthy();
  });

  it('renders Dashboard without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
  });
});
