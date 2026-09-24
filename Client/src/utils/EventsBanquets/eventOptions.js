export function generateEventId() {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 8; i += 1) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `EVT${randomStr}`;
}

export const EVENT_TYPES = [
  'Wedding',
  'Corporate Meeting',
  'Conference',
  'Birthday Party',
  'Anniversary',
  'Product Launch',
  'Seminar',
  'Reception',
  'Gala',
  'Workshop',
];

export const VENUES = [
  'Grand Ballroom',
  'Conference Hall A',
  'Conference Hall B',
  'Rooftop Terrace',
  'Garden Area',
  'Poolside',
  'Grand Crystal Ballroom',
  'Royal Executive Boardroom',
];

export const CATERING_TYPES = [
  'Buffet',
  'Plated Service',
  'Cocktail Reception',
  'Family Style',
  'Coffee & Snacks',
  'No Catering',
];

export const STATUS_OPTIONS = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];
