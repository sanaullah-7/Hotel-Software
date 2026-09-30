import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Dropdown from '../components/ui/Dropdown';

describe('shared Dropdown', () => {
  it('renders supplied filter options and forwards the selected value through the change event', async () => {
    const onChange = vi.fn();
    render(
      <Dropdown
        label="Status"
        options={['All', 'Booked']}
        value="All"
        onChange={onChange}
        fullWidth={false}
        formControlSx={{ minWidth: 100 }}
        optionSx={{ fontSize: 12 }}
      />
    );

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Booked' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target.value).toBe('Booked');
  });
});
