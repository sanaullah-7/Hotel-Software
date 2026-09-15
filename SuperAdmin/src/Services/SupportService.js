import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants.js';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const USE_MOCK = true;
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const MOCK_TICKETS = [
  {
    id: 'TICK-101',
    subject: 'Issue with Receptionist Login credentials',
    hotelName: 'Pearl Continental Lahore',
    submittedBy: 'Ahmed Khan (Manager)',
    email: 'ahmed.khan@example.com',
    priority: 'HIGH',
    status: 'OPEN',
    category: 'Technical',
    createdAt: '2024-09-08 14:32',
    lastMessage: 'The password reset token for our new night-shift receptionist is expiring immediately upon click.',
    messages: [
      { sender: 'Ahmed Khan', text: 'The password reset token for our new night-shift receptionist is expiring immediately upon click.', time: '2024-09-08 14:32', isStaff: false },
      { sender: 'Support Staff (SuperAdmin)', text: 'We have regenerated the temporary login link and dispatched it to the registered email.', time: '2024-09-08 15:10', isStaff: true },
    ]
  },
  {
    id: 'TICK-102',
    subject: 'Request to upgrade to Enterprise Elite plan',
    hotelName: 'Serena Hotel Islamabad',
    submittedBy: 'Sara Ali (Manager)',
    email: 'sara.ali@example.com',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    category: 'Billing',
    createdAt: '2024-09-07 10:15',
    lastMessage: 'We are adding 40 new luxury suites and need the unlimited room limits of Enterprise.',
    messages: [
      { sender: 'Sara Ali', text: 'We are adding 40 new luxury suites and need the unlimited room limits of Enterprise.', time: '2024-09-07 10:15', isStaff: false },
    ]
  },
  {
    id: 'TICK-103',
    subject: 'Monthly invoice receipt download inquiry',
    hotelName: 'Hotel One Faisalabad',
    submittedBy: 'Naveed Iqbal',
    email: 'naveed.i@example.com',
    priority: 'LOW',
    status: 'RESOLVED',
    category: 'Billing',
    createdAt: '2024-09-02 09:00',
    lastMessage: 'Received the tax invoice. Thank you!',
    messages: [
      { sender: 'Naveed Iqbal', text: 'Where can we download the GST withholding statement for August?', time: '2024-09-02 09:00', isStaff: false },
      { sender: 'Finance Team', text: 'Attached is the official stamped NTN certificate and receipt.', time: '2024-09-02 11:20', isStaff: true },
      { sender: 'Naveed Iqbal', text: 'Received the tax invoice. Thank you!', time: '2024-09-02 11:45', isStaff: false },
    ]
  },
];

export const SupportService = {
  /**
   * Get paginated support tickets
   */
  async getTickets({ status = '', priority = '', search = '', page = 1, limit = 10 } = {}) {
    if (USE_MOCK) {
      await delay(400);
      let data = [...MOCK_TICKETS];
      if (status) data = data.filter((t) => t.status === status);
      if (priority) data = data.filter((t) => t.priority === priority);
      if (search) {
        data = data.filter(
          (t) =>
            t.subject.toLowerCase().includes(search.toLowerCase()) ||
            t.hotelName.toLowerCase().includes(search.toLowerCase()) ||
            t.id.toLowerCase().includes(search.toLowerCase())
        );
      }
      const total = data.length;
      data = data.slice((page - 1) * limit, page * limit);
      return { data, total, page };
    }
    const res = await fetch(`${API_BASE_URL}/support/tickets?status=${status}&priority=${priority}&search=${search}&page=${page}&limit=${limit}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch support tickets');
    return res.json();
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(id) {
    if (USE_MOCK) {
      await delay(300);
      const ticket = MOCK_TICKETS.find((t) => t.id === id);
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }
    const res = await fetch(`${API_BASE_URL}/support/tickets/${id}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch ticket');
    return res.json();
  },

  /**
   * Add reply to ticket
   */
  async replyTicket(id, message) {
    if (USE_MOCK) {
      await delay(350);
      const ticket = MOCK_TICKETS.find((t) => t.id === id);
      if (ticket) {
        ticket.messages.push({
          sender: 'Super Admin',
          text: message,
          time: new Date().toISOString().replace('T', ' ').slice(0, 16),
          isStaff: true,
        });
        ticket.lastMessage = message;
      }
      return { success: true, ticket };
    }
    const res = await fetch(`${API_BASE_URL}/support/tickets/${id}/reply`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Failed to post reply');
    return res.json();
  },

  /**
   * Update status of ticket
   */
  async updateTicketStatus(id, status) {
    if (USE_MOCK) {
      await delay(300);
      const ticket = MOCK_TICKETS.find((t) => t.id === id);
      if (ticket) ticket.status = status;
      return { success: true, ticket };
    }
    const res = await fetch(`${API_BASE_URL}/support/tickets/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update ticket status');
    return res.json();
  }
};
