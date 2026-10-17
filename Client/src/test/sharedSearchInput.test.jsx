import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import SearchInput from '../components/common/SearchInput';

describe('shared SearchInput', () => {
  it('passes the controlled string value to onChange', () => {
    const onChange = vi.fn();
    const { getByPlaceholderText } = render(
      <SearchInput value="" onChange={onChange} placeholder="Search guests..." />
    );

    fireEvent.change(getByPlaceholderText('Search guests...'), { target: { value: 'Avery' } });

    expect(onChange).toHaveBeenCalledWith('Avery');
  });
});
