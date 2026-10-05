import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { getRooms as getHousekeepingRooms, saveRooms as saveHousekeepingRooms } from '../features/housekeeping/pages/hkStore';
import { saveRooms as saveInventoryRooms } from '../features/rooms/state/roomStore';
import RoomsAndCleaning from '../features/housekeeping/pages/RoomsAndCleaning';
import CleaningSchedule from '../features/housekeeping/pages/CleaningSchedule';

describe('Housekeeping Canonical State Alignment (Phase 7 Job 1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('active RoomsAndCleaning UI reads canonical records from hkStore', () => {
    saveInventoryRooms([{ id: 'INV-101', roomNo: '101' }]);
    saveHousekeepingRooms([
      {
        id: '101',
        roomId: 'INV-101',
        guest: 'Alice Wonderland',
        status: 'Dirty',
        cleaningType: 'Full Clean',
        priority: 'High',
        assignee: 'Bob Builder'
      }
    ]);

    render(<RoomsAndCleaning />);

    expect(screen.getByText('101')).toBeTruthy();
    expect(screen.getByText('Alice Wonderland')).toBeTruthy();
    expect(screen.getByText('Bob Builder')).toBeTruthy();
  });

  it('updates made in RoomsAndCleaning persist to canonical hk_rooms in localStorage', () => {
    saveHousekeepingRooms([
      {
        id: '101',
        roomNo: '101',
        guest: 'John Doe',
        status: 'Dirty',
        cleaningType: 'Full Clean',
        priority: 'Normal',
        assignee: 'Carol Staff'
      }
    ]);

    render(<RoomsAndCleaning />);

    // Click edit on the record
    const editBtn = screen.getByTitle('Edit');
    fireEvent.click(editBtn);

    // Edit notes
    const notesInput = screen.getByLabelText(/Notes/i);
    fireEvent.change(notesInput, { target: { value: 'Extra towels placed' } });

    // Submit the form
    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    // Verify canonical store state
    const canonicalRooms = getHousekeepingRooms();
    const room101 = canonicalRooms.find((r) => r.id === '101');
    expect(room101).toBeDefined();
    expect(room101.notes).toBe('Extra towels placed');

    // Verify localStorage persistence
    const stored = JSON.parse(localStorage.getItem('hk_rooms'));
    expect(stored.find((r) => r.id === '101').notes).toBe('Extra towels placed');
  });

  it('preserves Room.id -> Housekeeping.roomId relationship on save', () => {
    saveInventoryRooms([{ id: 'R-INV-202', roomNo: '202' }]);

    saveHousekeepingRooms([
      {
        id: '202',
        roomNo: '202',
        status: 'Dirty',
        cleaningType: 'Deep Clean'
      }
    ]);

    const rooms = getHousekeepingRooms();
    expect(rooms.find((r) => r.id === '202').roomId).toBe('R-INV-202');
  });

  it('persists changes across unmount and remount', () => {
    saveHousekeepingRooms([
      {
        id: '101',
        roomNo: '101',
        guest: 'Original Guest',
        status: 'Dirty',
        cleaningType: 'Full Clean',
        priority: 'Normal',
        assignee: 'Original Staff'
      }
    ]);

    const { unmount } = render(<RoomsAndCleaning />);

    // Edit record
    fireEvent.click(screen.getByTitle('Edit'));
    fireEvent.change(screen.getByLabelText(/Guest Name\*/i), { target: { value: 'Updated VIP Guest' } });
    fireEvent.click(screen.getByRole('button', { name: /^Save$/i }));

    unmount();

    // Remount
    render(<RoomsAndCleaning />);
    expect(screen.getByText('Updated VIP Guest')).toBeTruthy();
  });

  it('active CleaningSchedule UI reads canonical housekeeping records and persists task edits', () => {
    saveHousekeepingRooms([
      {
        id: '105',
        roomNo: '105',
        status: 'Cleaning',
        cleaningType: 'Deep Clean',
        priority: 'High',
        assignee: 'Frank Miller',
        started: '10:00',
        completed: '11:30'
      }
    ]);

    render(<CleaningSchedule />);

    expect(screen.getByText(/Room 105/)).toBeTruthy();
    expect(screen.getByText('Frank Miller')).toBeTruthy();

    // Click edit on the task
    const editBtn = screen.getByRole('button', { name: /^Edit$/i });
    fireEvent.click(editBtn);

    // Edit notes
    const notesInput = screen.getByLabelText(/Notes/i);
    fireEvent.change(notesInput, { target: { value: 'Clean windows and balcony' } });

    // Submit the form
    const saveBtn = screen.getByRole('button', { name: /^Save$/i });
    fireEvent.click(saveBtn);

    // Verify persistence in canonical hk_rooms
    const canonicalRooms = getHousekeepingRooms();
    const room105 = canonicalRooms.find((r) => r.id === '105');
    expect(room105).toBeDefined();
    expect(room105.notes).toBe('Clean windows and balcony');
  });

  it('syncs live when an external hk_update event is dispatched', () => {
    saveHousekeepingRooms([
      {
        id: '101',
        roomNo: '101',
        guest: 'Initial Guest',
        status: 'Dirty',
        cleaningType: 'Daily',
        priority: 'Normal',
        assignee: 'Initial Staff'
      }
    ]);

    render(<RoomsAndCleaning />);
    expect(screen.getByText('Initial Guest')).toBeTruthy();

    act(() => {
      saveHousekeepingRooms([
        {
          id: '101',
          roomNo: '101',
          guest: 'Synced New Guest',
          status: 'Clean / Ready',
          cleaningType: 'Daily',
          priority: 'Normal',
          assignee: 'New Staff'
        }
      ]);
    });

    expect(screen.getByText('Synced New Guest')).toBeTruthy();
  });
});
