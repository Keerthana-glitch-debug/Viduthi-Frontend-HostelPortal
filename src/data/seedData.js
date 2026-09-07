// Seed data for Vidudhi — Hostel Management System
// Shape kept intentionally simple so it can be swapped for a real API later.

export const blocks = ['A Block', 'B Block', 'C Block']

export const rooms = [
  { roomId: 1, roomNumber: 'A-101', block: 'A Block', floor: 1, capacity: 3, occupied: 3, roomType: 'Triple', status: 'Full', roommates: ['Aarthi S.', 'Divya R.', 'Keerthana G.'] },
  { roomId: 2, roomNumber: 'A-102', block: 'A Block', floor: 1, capacity: 3, occupied: 2, roomType: 'Triple', status: 'Available', roommates: ['Priya M.', 'Lakshmi V.'] },
  { roomId: 3, roomNumber: 'A-103', block: 'A Block', floor: 1, capacity: 2, occupied: 2, roomType: 'Double', status: 'Full', roommates: ['Nandhini K.', 'Swetha T.'] },
  { roomId: 4, roomNumber: 'A-201', block: 'A Block', floor: 2, capacity: 3, occupied: 0, roomType: 'Triple', status: 'Maintenance', roommates: [] },
  { roomId: 5, roomNumber: 'A-202', block: 'A Block', floor: 2, capacity: 2, occupied: 1, roomType: 'Double', status: 'Available', roommates: ['Harini B.'] },
  { roomId: 6, roomNumber: 'B-101', block: 'B Block', floor: 1, capacity: 4, occupied: 4, roomType: 'Quad', status: 'Full', roommates: ['Meena S.', 'Revathi P.', 'Anjali D.', 'Sowmiya R.'] },
  { roomId: 7, roomNumber: 'B-102', block: 'B Block', floor: 1, capacity: 2, occupied: 2, roomType: 'Double', status: 'Full', roommates: ['Kavya N.', 'Preethi J.'] },
  { roomId: 8, roomNumber: 'B-201', block: 'B Block', floor: 2, capacity: 3, occupied: 1, roomType: 'Triple', status: 'Available', roommates: ['Gowri S.'] },
  { roomId: 9, roomNumber: 'B-202', block: 'B Block', floor: 2, capacity: 3, occupied: 3, roomType: 'Triple', status: 'Full', roommates: ['Vidhya K.', 'Sneha M.', 'Bhavani L.'] },
  { roomId: 10, roomNumber: 'C-101', block: 'C Block', floor: 1, capacity: 2, occupied: 0, roomType: 'Double', status: 'Available', roommates: [] },
  { roomId: 11, roomNumber: 'C-102', block: 'C Block', floor: 1, capacity: 2, occupied: 2, roomType: 'Double', status: 'Full', roommates: ['Deepika A.', 'Ramya S.'] },
  { roomId: 12, roomNumber: 'C-201', block: 'C Block', floor: 2, capacity: 3, occupied: 2, roomType: 'Triple', status: 'Available', roommates: ['Yamuna P.', 'Sathya K.'] },
]

// The signed-in resident's own room
export const initialRoom = rooms[0]

export const initialComplaints = [
  { id: 'CMP-2041', title: 'Leaking bathroom tap', category: 'Plumbing', description: 'The wash-area tap on the 1st floor has been leaking since Monday morning.', priority: 'High', status: 'In Progress', roomNumber: 'A-101', raisedBy: 'Keerthana G.', date: '2026-08-02' },
  { id: 'CMP-2040', title: 'Corridor light flickering', category: 'Electrical', description: 'The tube light outside room A-103 flickers at night.', priority: 'Medium', status: 'Open', roomNumber: 'A-103', raisedBy: 'Nandhini K.', date: '2026-08-03' },
  { id: 'CMP-2039', title: 'Wi-Fi router down in B Block', category: 'Internet', description: 'No connectivity on 2nd floor B Block since yesterday evening.', priority: 'High', status: 'Open', roomNumber: 'B-202', raisedBy: 'Vidhya K.', date: '2026-08-04' },
  { id: 'CMP-2038', title: 'Broken cupboard hinge', category: 'Furniture', description: 'Left cupboard door hinge snapped.', priority: 'Low', status: 'Resolved', roomNumber: 'C-102', raisedBy: 'Deepika A.', date: '2026-07-29' },
  { id: 'CMP-2037', title: 'Mess food quality feedback', category: 'Mess', description: 'Requesting more variety in the weekly dinner menu.', priority: 'Low', status: 'Resolved', roomNumber: 'B-101', raisedBy: 'Meena S.', date: '2026-07-27' },
]

export const initialLeaveRequests = [
  { id: '24104031', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', reason: 'Home visit for a family function', fromDate: '2026-08-10', toDate: '2026-08-13', status: 'Pending', appliedOn: '2026-08-05' },
  { id: '23104560', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', reason: 'Medical appointment in hometown', fromDate: '2026-08-07', toDate: '2026-08-08', status: 'Approved', appliedOn: '2026-08-03' },
  { id: '24104088', studentRoll: '24104088', studentName: 'Kavya N.', roomNumber: 'B-102', reason: 'Sister’s wedding', fromDate: '2026-08-15', toDate: '2026-08-19', status: 'Approved', appliedOn: '2026-08-01' },
  { id: '23104092', studentRoll: '23104092', studentName: 'Gowri S.', roomNumber: 'B-201', reason: 'Semester project review at home', fromDate: '2026-08-06', toDate: '2026-08-06', status: 'Rejected', appliedOn: '2026-07-30' },
]

export const initialVisitors = [
  { id: 'VS-5510', visitorName: 'Mr. Ganesan G.', relation: 'Father', residentName: 'Keerthana G.', roomNumber: 'A-101', purpose: 'Delivering documents', checkIn: '2026-08-05 10:20', checkOut: '2026-08-05 11:05', status: 'Checked Out' },
  { id: 'VS-5511', visitorName: 'Mrs. Radha M.', relation: 'Mother', residentName: 'Priya M.', roomNumber: 'A-102', purpose: 'Weekend visit', checkIn: '2026-08-05 14:00', checkOut: null, status: 'Checked In' },
  { id: 'VS-5512', visitorName: 'Arjun K.', relation: 'Brother', residentName: 'Vidhya K.', roomNumber: 'B-202', purpose: 'Dropping off luggage', checkIn: '2026-08-04 09:15', checkOut: '2026-08-04 09:40', status: 'Checked Out' },
  { id: 'VS-5513', visitorName: 'Mrs. Latha S.', relation: 'Mother', residentName: 'Gowri S.', roomNumber: 'B-201', purpose: 'Regular visit', checkIn: '2026-08-06 08:30', checkOut: null, status: 'Checked In' },
]

export const initialLaundryRequests = [
  { id: 'LD-7001', studentName: 'Keerthana G.', roomNumber: 'A-101', serviceType: 'Wash & Fold', itemCount: 6, notes: 'One is a delicate dupatta, please handle gently', status: 'Washing', requestedOn: '2026-08-04', pickupDate: '2026-08-05' },
  { id: 'LD-7002', studentName: 'Priya M.', roomNumber: 'A-102', serviceType: 'Dry Clean', itemCount: 2, notes: 'Blazer for a seminar', status: 'Ready for Pickup', requestedOn: '2026-08-03', pickupDate: '2026-08-04' },
  { id: 'LD-7003', studentName: 'Vidhya K.', roomNumber: 'B-202', serviceType: 'Ironing', itemCount: 8, notes: '', status: 'Requested', requestedOn: '2026-08-06', pickupDate: '2026-08-07' },
  { id: 'LD-7004', studentName: 'Gowri S.', roomNumber: 'B-201', serviceType: 'Wash & Fold', itemCount: 5, notes: '', status: 'Delivered', requestedOn: '2026-08-01', pickupDate: '2026-08-02' },
]

export const weeklyMessMenu = [
  {
    day: 'Monday',
    breakfast: 'Idli, hot sambar, coconut chutney, medu vada, tea/coffee',
    lunch: 'Steamed ponni rice, drumstick sambar, carrot-beans poriyal, rasam, fresh curd, appalam',
    snacks: 'Filter Coffee / Tea with Onion Pakoda & Mint Chutney',
    dinner: 'Phulka chapati, paneer butter masala, steamed rice, rasam, fresh salad',
    lunchSpecial: 'Drumstick Sambar & Carrot-Beans Poriyal',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Tuesday',
    breakfast: 'Ven pongal, medu vada, coconut chutney, tomato chutney, filter coffee',
    lunch: 'Steamed rice, tomato rasam, cabbage kootu, potato roast, curd, crisp appalam, lemon pickle',
    snacks: 'Masala Chai / Coffee with Vegetable Samosa & Sweet Chutney',
    dinner: 'Veg fried rice, gobi manchurian gravy, sweet corn soup, sliced cucumber',
    lunchSpecial: 'Crispy Potato Roast & Homestyle Tomato Rasam',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Wednesday',
    breakfast: 'Crispy ghee roast dosa, sambar, onion-tomato chutney, boiled eggs/banana',
    lunch: 'Steamed rice, ennai kathirikai kuzhambu, beetroot poriyal, jeera rasam, curd, appalam',
    snacks: 'Filter Coffee / Tea with Spiced Sundal (Chickpeas) & Kara Boondi',
    dinner: 'Tandoori chapati, chana masala, jeera pulao, mixed salad, gulab jamun',
    lunchSpecial: 'Ennai Kathirikai Kuzhambu & Beetroot Poriyal',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Thursday',
    breakfast: 'Rava upma with coconut chutney, banana, filter coffee/tea',
    lunch: 'Steamed rice, mor kuzhambu (buttermilk curry), bhindi jaipuri, rasam, curd, appalam',
    snacks: 'Elaichi Tea / Coffee with Medu Vada & Coconut Chutney',
    dinner: 'Lemon rice, crunchy potato fry, curd rice, pomegranate seeds, pickle',
    lunchSpecial: 'Traditional Mor Kuzhambu & Bhindi Jaipuri',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Friday',
    breakfast: 'Hot pooris, spiced potato masala, suji halwa, tea/coffee',
    lunch: 'Hyderabadi veg biryani / egg biryani, onion-cucumber raita, brinjal gravy, appalam, sweet kesari',
    snacks: 'Filter Coffee / Badam Milk with Crispy Banana Bajji & Chutney',
    dinner: 'Wheat chapati, dal tadka, steamed rice, pepper rasam, fresh fruit bowl',
    lunchSpecial: 'Friday Biryani Feast & Brinjal Gravy with Sweet Kesari',
    dietType: 'Special Lunch (Veg / Egg)',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Saturday',
    breakfast: 'Rava kesari, soft idlis, spicy kara chutney, sambar, filter coffee',
    lunch: 'Steamed rice, mysore rasam, vazhakkai (raw banana) varuval, kootu, curd, vadam',
    snacks: 'Masala Chai / Tea with Veg Cutlet & Tomato Dip',
    dinner: 'Hakka noodles, veg manchurian, chilli paneer gravy, spring roll',
    lunchSpecial: 'Vazhakkai Varuval & Authentic Mysore Rasam',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
  {
    day: 'Sunday',
    breakfast: 'Bread toast with butter/jam, masala omelette / vegetable sandwich, tea/coffee',
    lunch: 'Jeera rice / Steamed rice, chicken curry / paneer butter masala, onion raita, curd, ice cream',
    snacks: 'Filter Coffee / Cold Rose Milk with Sweet Boli & Cookies',
    dinner: 'Soft chapatis, mixed vegetable salna, curd rice, mango pickle',
    lunchSpecial: 'Sunday Grand Lunch (Chicken / Paneer Butter Masala) & Ice Cream',
    dietType: 'Weekend Special (Non-Veg / Paneer)',
    lunchTiming: '12:30 PM – 02:30 PM',
  },
]

export const initialMessFeedback = [
  { id: 'MS-8001', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', mealType: 'Lunch', day: 'Monday', rating: 5, hygieneRating: 5, comment: 'Sambar and poriyal were fresh and hot today. Appalam was crisp!', date: '2026-08-04', committeeReviewed: true },
  { id: 'MS-8002', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', mealType: 'Lunch', day: 'Friday', rating: 4, hygieneRating: 4, comment: 'Biryani was delicious. Please add extra raita counter next Friday.', date: '2026-08-03', committeeReviewed: true },
  { id: 'MS-8003', studentRoll: '24104088', studentName: 'Vidhya K.', roomNumber: 'B-202', mealType: 'Breakfast', day: 'Friday', rating: 5, hygieneRating: 5, comment: 'Poori and potato masala combination was top tier.', date: '2026-08-02', committeeReviewed: true },
  { id: 'MS-8004', studentRoll: '23104092', studentName: 'Deepika A.', roomNumber: 'C-102', mealType: 'Lunch', day: 'Tuesday', rating: 4, hygieneRating: 4, comment: 'Rasam was homestyle and potato roast was super crunchy.', date: '2026-08-01', committeeReviewed: true },
]

export const initialBills = [
  { id: 'BL-1001', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee (Room Rent & Establishment) — Aug to Dec 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 45000, dueDate: '2026-08-15', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1002', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges (Diet & Catering) — July 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3200, dueDate: '2026-08-10', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1003', type: 'Hostel Fee', category: 'Hostel', description: 'Room Maintenance & Electrical Amenities Fund — Monsoon 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3500, dueDate: '2026-08-20', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1004', type: 'Mess Bill', category: 'Mess', description: 'Special Diet Coupons & Snack Advance — Aug 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 1500, dueDate: '2026-08-12', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1005', type: 'Laundry', category: 'Other', description: 'Monthly Laundry Charges — July 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 450, dueDate: '2026-08-10', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1006', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges — June 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3050, dueDate: '2026-07-10', status: 'Paid', paidOn: '2026-07-08', paymentMethod: 'upi', transactionId: 'TXN-98412039' },
  { id: 'BL-1007', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee — Jan to May 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 45000, dueDate: '2026-01-15', status: 'Paid', paidOn: '2026-01-12', paymentMethod: 'netbanking', transactionId: 'TXN-71249581' },
  { id: 'BL-1008', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges — July 2026', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', amount: 3100, dueDate: '2026-08-10', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1009', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee — Aug to Dec 2026', studentRoll: '24104088', studentName: 'Vidhya K.', roomNumber: 'B-202', amount: 45000, dueDate: '2026-08-15', status: 'Paid', paidOn: '2026-08-01', paymentMethod: 'card', transactionId: 'TXN-83749120' },
]

export const initialNotifications = [
  { id: 'NT-9001', title: 'Leave request approved', message: 'Leave request for Roll No. 24104031 has been approved by the warden.', type: 'success', date: '2026-08-05 09:12', read: false },
  { id: 'NT-9002', title: 'Complaint update', message: 'Your complaint CMP-2041 is now In Progress. A technician is assigned.', type: 'info', date: '2026-08-05 08:40', read: false },
  { id: 'NT-9003', title: 'Hostel maintenance notice', message: 'Water supply will be interrupted in A Block on 8 Aug, 10 AM – 1 PM.', type: 'warning', date: '2026-08-04 18:00', read: true },
  { id: 'NT-9004', title: 'Visitor checked in', message: 'Mrs. Radha M. checked in for Priya M. (A-102).', type: 'info', date: '2026-08-05 14:00', read: true },
  { id: 'NT-9005', title: 'Fee payment reminder', message: 'Hostel fee for August is due on 10 Aug 2026.', type: 'warning', date: '2026-08-03 09:00', read: true },
]

export const currentUser = {
  name: 'Keerthana G.',
  role: 'resident', // 'resident' | 'admin'
  roomNumber: 'A-101',
  rollNo: '24104031',
  regNo: '24104031',
  phone: '+91 98401 23456',
  email: 'keerthana.g@campus.edu',
  avatarInitials: 'KG',
  avatarUrl: '',
}

export const adminUser = {
  name: 'R. Sundaram',
  role: 'admin',
  designation: 'Chief Warden',
  rollNo: 'STAFF-1001',
  regNo: 'STAFF-1001',
  roomNumber: 'Warden Office, Block A',
  phone: '+91 94440 01101',
  email: 'warden.office@campus.edu',
  avatarInitials: 'RS',
  avatarUrl: '',
}
