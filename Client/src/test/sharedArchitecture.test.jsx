import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PersonAdd } from '@mui/icons-material';
import EventSummaryCards from '../features/events/components/EventSummaryCards';
import PaginationControls from '../components/common/PaginationControls';

describe('shared KPI and pagination UI', () => {
  it('renders event summary cards through the shared KPI badge variant', () => {
    render(
      <EventSummaryCards
        cards={[
          {
            id: 'total-events',
            title: 'Total Events',
            value: 8,
            subtext: '2 today',
            icon: PersonAdd,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600'
          }
        ]}
      />
    );

    expect(screen.getByText('Total Events')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
    expect(screen.getByText('2 today')).toBeTruthy();
  });

  it('renders numbered pagination and forwards page selection while preserving record labels', () => {
    const onPageChange = vi.fn();
    const { container } = render(
      <PaginationControls
        currentPage={1}
        totalPages={3}
        totalRecords={25}
        rowsPerPage={10}
        onPageChange={onPageChange}
        recordLabel="charges"
        variant="numbered"
      />
    );

    expect(container.textContent.replace(/\s+/g, ' ')).toContain('Showing 1 to 10 of 25 charges');
    const buttons = container.querySelectorAll('button');
    expect(buttons).toHaveLength(5);
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[4].disabled).toBe(false);

    fireEvent.click(buttons[2]);
    expect(onPageChange).toHaveBeenCalledWith(2);
    fireEvent.click(buttons[4]);
    expect(onPageChange).toHaveBeenLastCalledWith(2);
  });
});
