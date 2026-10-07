import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/explore_pakistan';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const hotel = await db.collection('hotels').findOne({});
    if (!hotel) return console.log('No hotel found');
    const hotelId = hotel._id;

    const safeInsert = async (coll, data) => {
      try {
        await db.collection(coll).insertMany(data);
        console.log(`- ${coll} inserted`);
      } catch (e) {
        console.log(`x ${coll} failed: ${e.message.substring(0, 100)}`);
      }
    };

    // Rooms
    await safeInsert('rooms', [
      { hotelId, room_number: '201', roomType: 'Standard Room', floor: '2', acNonAc: 'AC', capacity: 2, status: 'Open', rent: 50, createdAt: new Date() },
      { hotelId, room_number: '202', roomType: 'Deluxe Room', floor: '2', acNonAc: 'AC', capacity: 2, status: 'Open', rent: 80, createdAt: new Date() }
    ]);

    // Guests
    await safeInsert('guests', [
      { hotelId, first_name: 'Alice Testing', last_name: 'Testing', name: 'Alice Testing', email: 'alice@test.com', phone: '090078601', city: 'Islamabad', status: 'Active', totalStays: 2, createdAt: new Date() },
      { hotelId, first_name: 'Bob Testing', last_name: 'Testing', name: 'Bob Testing', email: 'bob@test.com', phone: '090078602', city: 'Lahore', status: 'VIP', totalStays: 5, createdAt: new Date() }
    ]);

    // Reservations (Get guest IDs first to link)
    const guests = await db.collection('guests').find({ hotelId }).toArray();
    const rooms = await db.collection('rooms').find({ hotelId }).toArray();
    if (guests.length > 0 && rooms.length > 0) {
      await safeInsert('reservations', [
        { hotelId, guest_id: guests[0]._id, guestId: guests[0]._id, room_id: rooms[0]._id, roomId: rooms[0]._id, roomNo: rooms[0].room_number, checkInDate: new Date(), checkOutDate: new Date(Date.now() + 86400000 * 2), check_in: new Date(), check_out: new Date(Date.now() + 86400000 * 2), status: 'Confirmed', numAdults: 2, totalAmount: 100, createdAt: new Date() }
      ]);
    }

    // Employees (HR)
    await safeInsert('employees', [
      { hotelId, employeeId: 'EMP001', firstName: 'Ali', lastName: 'Khan', email: 'ali@hotel.com', phone: '111222333', department: 'Front Desk', designation: 'Receptionist', status: 'Active', salary: 30000, createdAt: new Date() }
    ]);

    // Housekeeping Tasks
    await safeInsert('housekeepingtasks', [
      { hotelId, roomNumber: '201', taskType: 'Cleaning', status: 'Pending', assignedTo: 'Sara', priority: 'High', date: new Date(), createdAt: new Date() }
    ]);

    // Rates/Pricing (Rate Plans)
    await safeInsert('rateplans', [
      { hotelId, name: 'Standard Rate', code: 'STD2', basePrice: 100, isRefundable: true, isActive: true, createdAt: new Date() }
    ]);
    
    // Restaurant Menu Items
    await safeInsert('restaurantmenuitems', [
      { hotelId, name: 'Club Sandwich', category: 'Snacks', price: 15, availability: true, isVeg: false, createdAt: new Date() }
    ]);

    // Operations Alerts
    await safeInsert('operationsalerts', [
      { hotelId, title: 'VIP Arrival', message: 'Bob arriving tomorrow', type: 'Arrival', severity: 'High', status: 'Unread', createdAt: new Date() }
    ]);

    console.log('Seeding completed!');
    process.exit(0);

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
