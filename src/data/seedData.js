// Seed data for Vidudhi — Smart Hostel Management & Campus Living Platform
// Authentic datasets with realistic university student records, facilities, and campus operations.

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

// The signed-in student's own room
export const initialRoom = rooms[0]

export const initialComplaints = [
  { id: 'CMP-2041', title: 'Leaking bathroom tap', category: 'Plumbing', description: 'The wash-area tap on the 1st floor has been leaking since Monday morning.', priority: 'High', status: 'In Progress', roomNumber: 'A-101', raisedBy: 'Keerthana G.', date: '2026-08-02', assignedTo: 'M. Selvam (Plumbing Tech)' },
  { id: 'CMP-2040', title: 'Corridor light flickering', category: 'Electrical', description: 'The tube light outside room A-103 flickers at night.', priority: 'Medium', status: 'Open', roomNumber: 'A-103', raisedBy: 'Nandhini K.', date: '2026-08-03', assignedTo: 'P. Kumar (Electrician)' },
  { id: 'CMP-2039', title: 'Wi-Fi router down in B Block', category: 'Internet', description: 'No connectivity on 2nd floor B Block since yesterday evening.', priority: 'High', status: 'Open', roomNumber: 'B-202', raisedBy: 'Vidhya K.', date: '2026-08-04', assignedTo: 'Network Admin Desk' },
  { id: 'CMP-2038', title: 'Broken cupboard hinge', category: 'Furniture', description: 'Left cupboard door hinge snapped.', priority: 'Low', status: 'Resolved', roomNumber: 'C-102', raisedBy: 'Deepika A.', date: '2026-07-29', assignedTo: 'Carpentry Cell' },
  { id: 'CMP-2037', title: 'Mess food quality feedback', category: 'Mess', description: 'Requesting more variety in the weekly dinner menu.', priority: 'Low', status: 'Resolved', roomNumber: 'B-101', raisedBy: 'Meena S.', date: '2026-07-27', assignedTo: 'Mess Committee' },
]

export const initialLeaveRequests = [
  { id: 'LV-1001', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', reason: 'Home visit for a family function', fromDate: '2026-08-10', toDate: '2026-08-13', status: 'Pending', appliedOn: '2026-08-05' },
  { id: 'LV-1002', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', reason: 'Medical appointment in hometown', fromDate: '2026-08-07', toDate: '2026-08-08', status: 'Approved', appliedOn: '2026-08-03' },
  { id: 'LV-1003', studentRoll: '24104088', studentName: 'Kavya N.', roomNumber: 'B-102', reason: 'Sister’s wedding', fromDate: '2026-08-15', toDate: '2026-08-19', status: 'Approved', appliedOn: '2026-08-01' },
  { id: 'LV-1004', studentRoll: '23104092', studentName: 'Gowri S.', roomNumber: 'B-201', reason: 'Semester project review at home', fromDate: '2026-08-06', toDate: '2026-08-06', status: 'Rejected', appliedOn: '2026-07-30' },
]

export const initialVisitors = [
  { id: 'VS-5510', visitorName: 'Mr. Ganesan G.', relation: 'Father', residentName: 'Keerthana G.', roomNumber: 'A-101', purpose: 'Delivering documents', checkIn: '2026-08-05 10:20', checkOut: '2026-08-05 11:05', status: 'Checked Out', approvedBy: 'Dr. R. Sundaram' },
  { id: 'VS-5511', visitorName: 'Mrs. Radha M.', relation: 'Mother', residentName: 'Priya M.', roomNumber: 'A-102', purpose: 'Weekend visit', checkIn: '2026-08-05 14:00', checkOut: null, status: 'Checked In', approvedBy: 'Dr. R. Sundaram' },
  { id: 'VS-5512', visitorName: 'Arjun K.', relation: 'Brother', residentName: 'Vidhya K.', roomNumber: 'B-202', purpose: 'Dropping off luggage', checkIn: '2026-08-04 09:15', checkOut: '2026-08-04 09:40', status: 'Checked Out', approvedBy: 'Dr. R. Sundaram' },
  { id: 'VS-5513', visitorName: 'Mrs. Latha S.', relation: 'Mother', residentName: 'Gowri S.', roomNumber: 'B-201', purpose: 'Regular visit', checkIn: null, checkOut: null, status: 'Pending Approval', approvedBy: null },
  { id: 'VS-5514', visitorName: 'Karthik N.', relation: 'Relative', residentName: 'Keerthana G.', roomNumber: 'A-101', purpose: 'Campus book drop', checkIn: null, checkOut: null, status: 'Pending Approval', approvedBy: null },
]

export const initialLaundryRequests = [
  { id: 'LD-7001', studentName: 'Keerthana G.', roomNumber: 'A-101', serviceType: 'Wash & Fold', itemCount: 6, notes: 'One delicate cotton kurta, please handle gently', status: 'Washing', requestedOn: '2026-08-04', pickupDate: '2026-08-05', machineAssigned: 'Washer-03' },
  { id: 'LD-7002', studentName: 'Priya M.', roomNumber: 'A-102', serviceType: 'Dry Clean', itemCount: 2, notes: 'Blazer for formal symposium', status: 'Ready for Pickup', requestedOn: '2026-08-03', pickupDate: '2026-08-04', machineAssigned: 'Commercial Dry Clean Unit' },
  { id: 'LD-7003', studentName: 'Vidhya K.', roomNumber: 'B-202', serviceType: 'Ironing', itemCount: 8, notes: '', status: 'Requested', requestedOn: '2026-08-06', pickupDate: '2026-08-07', machineAssigned: 'Steam Station 01' },
  { id: 'LD-7004', studentName: 'Gowri S.', roomNumber: 'B-201', serviceType: 'Wash & Fold', itemCount: 5, notes: '', status: 'Delivered', requestedOn: '2026-08-01', pickupDate: '2026-08-02', machineAssigned: 'Washer-01' },
]

export const weeklyMessMenu = [
  {
    day: 'Monday',
    breakfast: 'Idli, hot sambar, coconut chutney, medu vada, filter coffee / tea',
    lunch: 'Steamed ponni rice, drumstick sambar, carrot-beans poriyal, rasam, fresh curd, appalam',
    snacks: 'Filter Coffee / Tea with Onion Pakoda & Mint Chutney',
    dinner: 'Phulka chapati, paneer butter masala, steamed rice, rasam, fresh cucumber salad',
    lunchSpecial: 'Drumstick Sambar & Carrot-Beans Poriyal',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2150 kcal · Protein: 68g · Carbs: 320g',
  },
  {
    day: 'Tuesday',
    breakfast: 'Ven pongal, medu vada, coconut chutney, tomato chutney, filter coffee',
    lunch: 'Steamed rice, homestyle tomato rasam, cabbage kootu, crispy potato roast, curd, appalam, lemon pickle',
    snacks: 'Masala Chai / Coffee with Vegetable Samosa & Sweet Chutney',
    dinner: 'Veg fried rice, gobi manchurian gravy, sweet corn soup, sliced cucumber',
    lunchSpecial: 'Crispy Potato Roast & Homestyle Tomato Rasam',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2200 kcal · Protein: 62g · Carbs: 340g',
  },
  {
    day: 'Wednesday',
    breakfast: 'Crispy ghee roast dosa, sambar, onion-tomato chutney, boiled eggs / banana',
    lunch: 'Steamed rice, ennai kathirikai kuzhambu, beetroot poriyal, jeera rasam, curd, appalam',
    snacks: 'Filter Coffee / Tea with Spiced Sundal (Chickpeas) & Kara Boondi',
    dinner: 'Tandoori chapati, chana masala, jeera pulao, mixed salad, warm gulab jamun',
    lunchSpecial: 'Ennai Kathirikai Kuzhambu & Beetroot Poriyal',
    dietType: 'Special Veg / Egg',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2350 kcal · Protein: 74g · Carbs: 330g',
  },
  {
    day: 'Thursday',
    breakfast: 'Rava upma with coconut chutney, banana, filter coffee / tea',
    lunch: 'Steamed rice, traditional mor kuzhambu (buttermilk curry), bhindi jaipuri, rasam, curd, appalam',
    snacks: 'Elaichi Tea / Coffee with Medu Vada & Coconut Chutney',
    dinner: 'Lemon rice, crunchy potato fry, curd rice, pomegranate seeds, mango pickle',
    lunchSpecial: 'Traditional Mor Kuzhambu & Bhindi Jaipuri',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2100 kcal · Protein: 58g · Carbs: 310g',
  },
  {
    day: 'Friday',
    breakfast: 'Hot pooris, spiced potato masala, suji halwa, tea/coffee',
    lunch: 'Hyderabadi veg dum biryani / egg biryani, onion-cucumber raita, brinjal salan gravy, crisp appalam, sweet kesari',
    snacks: 'Filter Coffee / Badam Milk with Crispy Banana Bajji & Chutney',
    dinner: 'Wheat chapati, dal tadka, steamed rice, pepper rasam, fresh fruit bowl',
    lunchSpecial: 'Friday Biryani Feast & Brinjal Gravy with Sweet Kesari',
    dietType: 'Special Lunch (Veg / Egg)',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2480 kcal · Protein: 78g · Carbs: 360g',
  },
  {
    day: 'Saturday',
    breakfast: 'Rava kesari, soft idlis, spicy kara chutney, sambar, filter coffee',
    lunch: 'Steamed rice, mysore rasam, vazhakkai (raw banana) varuval, mixed veg kootu, curd, vadam',
    snacks: 'Masala Chai / Tea with Veg Cutlet & Tomato Dip',
    dinner: 'Hakka noodles, veg manchurian, chilli paneer gravy, spring roll',
    lunchSpecial: 'Vazhakkai Varuval & Authentic Mysore Rasam',
    dietType: 'Pure Veg',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2280 kcal · Protein: 65g · Carbs: 335g',
  },
  {
    day: 'Sunday',
    breakfast: 'Bread toast with butter/jam, masala omelette / vegetable sandwich, tea/coffee',
    lunch: 'Jeera rice / Steamed rice, chettinad chicken curry / paneer butter masala, onion raita, curd, vanilla ice cream',
    snacks: 'Filter Coffee / Cold Rose Milk with Sweet Boli & Cookies',
    dinner: 'Soft chapatis, mixed vegetable kurma, creamy curd rice, spicy pickle',
    lunchSpecial: 'Sunday Grand Lunch (Chicken / Paneer Butter Masala) & Ice Cream',
    dietType: 'Weekend Grand Feast (Non-Veg / Paneer)',
    lunchTiming: '12:30 PM – 02:30 PM',
    nutrition: 'Calories: 2600 kcal · Protein: 88g · Carbs: 345g',
  },
]

export const initialMessFeedback = [
  { id: 'MS-8001', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', mealType: 'Lunch', day: 'Monday', rating: 5, hygieneRating: 5, comment: 'Sambar and poriyal were fresh and hot today. Appalam was crisp!', date: '2026-08-04', committeeReviewed: true },
  { id: 'MS-8002', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', mealType: 'Lunch', day: 'Friday', rating: 4, hygieneRating: 4, comment: 'Biryani was delicious. Please add an extra raita counter next Friday.', date: '2026-08-03', committeeReviewed: true },
  { id: 'MS-8003', studentRoll: '24104088', studentName: 'Vidhya K.', roomNumber: 'B-202', mealType: 'Breakfast', day: 'Friday', rating: 5, hygieneRating: 5, comment: 'Poori and potato masala combination was top tier.', date: '2026-08-02', committeeReviewed: true },
  { id: 'MS-8004', studentRoll: '23104092', studentName: 'Deepika A.', roomNumber: 'C-102', mealType: 'Lunch', day: 'Tuesday', rating: 4, hygieneRating: 4, comment: 'Rasam was homestyle and potato roast was super crunchy.', date: '2026-08-01', committeeReviewed: true },
]

// Zero laundry bills — laundry service is completely covered in the annual hostel fee!
export const initialBills = [
  { id: 'BL-1001', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee (Room Rent, Establishment & Laundry Services) — Monsoon 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 45000, dueDate: '2026-08-15', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1002', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges (Diet & Dining Operations) — July 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3200, dueDate: '2026-08-10', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1003', type: 'Hostel Fee', category: 'Hostel', description: 'Room Maintenance & High-Speed Amenities Fund — Monsoon 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3500, dueDate: '2026-08-20', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1004', type: 'Mess Bill', category: 'Mess', description: 'Special Diet Coupons & Evening Snack Advance — Aug 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 1500, dueDate: '2026-08-12', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1006', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges — June 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 3050, dueDate: '2026-07-10', status: 'Paid', paidOn: '2026-07-08', paymentMethod: 'upi', transactionId: 'TXN-98412039' },
  { id: 'BL-1007', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee — Winter Session Jan to May 2026', studentRoll: '24104031', studentName: 'Keerthana G.', roomNumber: 'A-101', amount: 45000, dueDate: '2026-01-15', status: 'Paid', paidOn: '2026-01-12', paymentMethod: 'netbanking', transactionId: 'TXN-71249581' },
  { id: 'BL-1008', type: 'Mess Bill', category: 'Mess', description: 'Monthly Mess Charges — July 2026', studentRoll: '23104560', studentName: 'Priya M.', roomNumber: 'A-102', amount: 3100, dueDate: '2026-08-10', status: 'Unpaid', paidOn: null, transactionId: null },
  { id: 'BL-1009', type: 'Hostel Fee', category: 'Hostel', description: 'Semester Hostel Fee — Monsoon 2026', studentRoll: '24104088', studentName: 'Vidhya K.', roomNumber: 'B-202', amount: 45000, dueDate: '2026-08-15', status: 'Paid', paidOn: '2026-08-01', paymentMethod: 'card', transactionId: 'TXN-83749120' },
]

export const initialNotifications = [
  { id: 'NT-9001', title: 'Leave request approved', message: 'Leave outpass for Roll No. 24104031 approved by Chief Warden. Digital gate pass is ready.', type: 'success', date: '2026-08-05 09:12', read: false, audience: 'All' },
  { id: 'NT-9002', title: 'Complaint in progress', message: 'Plumbing complaint CMP-2041 assigned to technician M. Selvam. Scheduled inspection at 3:00 PM.', type: 'info', date: '2026-08-05 08:40', read: false, audience: 'Room A-101' },
  { id: 'NT-9003', title: 'Water storage maintenance', message: 'Overhead tank cleaning scheduled for A Block on 8 Aug from 10:00 AM to 1:00 PM.', type: 'warning', date: '2026-08-04 18:00', read: true, audience: 'A Block' },
  { id: 'NT-9004', title: 'Hostel Dining Special', message: 'Friday Grand Feast lunch features Hyderabadi Dum Biryani and Sweet Kesari.', type: 'info', date: '2026-08-04 12:00', read: true, audience: 'All' },
  { id: 'NT-9005', title: 'Fee payment reminder', message: 'Hostel semester establishment fee due date is 15 August 2026. Avoid late processing fee.', type: 'warning', date: '2026-08-03 09:00', read: true, audience: 'All' },
]

// 3 Pre-configured User Profiles
export const studentUser = {
  name: 'Keerthana G.',
  role: 'student',
  department: 'Computer Science & Engineering',
  year: '3rd Year (B.Tech)',
  roomNumber: 'A-101',
  block: 'A Block',
  rollNo: '24104031',
  regNo: '24104031',
  phone: '+91 98401 23456',
  email: 'keerthana.g@campus.edu',
  emergencyContact: '+91 94441 55678 (Father)',
  avatarInitials: 'KG',
  avatarUrl: '',
}

export const wardenUser = {
  name: 'Dr. R. Sundaram',
  role: 'warden',
  designation: 'Chief Hostel Warden & Faculty Mentor',
  department: 'Office of Student Affairs & Residences',
  roomNumber: 'Warden Office, Block A Ground Floor',
  rollNo: 'WRD-1001',
  regNo: 'WRD-1001',
  phone: '+91 94440 01101',
  email: 'chief.warden@campus.edu',
  avatarInitials: 'RS',
  avatarUrl: '',
}

export const adminUser = {
  name: 'Prof. K. Venkatesh',
  role: 'admin',
  designation: 'Director of Campus IT & Administration',
  department: 'Hostel Central Oversight & Systems Cell',
  roomNumber: 'Admin Central Tower, Suite 204',
  rollNo: 'ADM-0001',
  regNo: 'ADM-0001',
  phone: '+91 94440 00010',
  email: 'admin.hostels@campus.edu',
  avatarInitials: 'KV',
  avatarUrl: '',
}

export const currentUser = studentUser

// ==========================================
// NEW REALISTIC DATASETS FOR ADVANCED MODULES
// ==========================================

// Sports Equipment Management
export const initialSportsEquipments = [
  { id: 'EQ-01', name: 'Yonex Carbon Badminton Racket Set (2 Rackets + Shuttlecock)', category: 'Badminton', totalStock: 12, availableStock: 7, location: 'Sports Room A', maxBorrowHours: 3 },
  { id: 'EQ-02', name: 'Stag Official Table Tennis Bat & 3-Star Balls', category: 'Table Tennis', totalStock: 10, availableStock: 6, location: 'Indoor Arena', maxBorrowHours: 2 },
  { id: 'EQ-03', name: 'Spalding Pro Grip Basketball (Size 7)', category: 'Basketball', totalStock: 6, availableStock: 3, location: 'Court Storage', maxBorrowHours: 4 },
  { id: 'EQ-04', name: 'SS English Willow Cricket Bat & Match Leather Ball', category: 'Cricket', totalStock: 5, availableStock: 2, location: 'Ground Locker', maxBorrowHours: 5 },
  { id: 'EQ-05', name: 'Nivia Storm Football (Size 5)', category: 'Football', totalStock: 8, availableStock: 4, location: 'Ground Locker', maxBorrowHours: 4 },
  { id: 'EQ-06', name: 'Cosco Super Volleyball & Net Kit', category: 'Volleyball', totalStock: 4, availableStock: 3, location: 'Sports Room A', maxBorrowHours: 3 },
  { id: 'EQ-07', name: 'Champion Tournament Carrom Board & Wooden Coins', category: 'Carrom', totalStock: 6, availableStock: 4, location: 'Common Recreation Hall', maxBorrowHours: 3 },
]

export const initialSportsBorrowings = [
  { id: 'BR-301', equipmentId: 'EQ-01', equipmentName: 'Yonex Badminton Racket Set', studentName: 'Keerthana G.', studentRoll: '24104031', roomNumber: 'A-101', borrowedAt: '2026-08-05 16:30', dueAt: '2026-08-05 19:30', status: 'Active' },
  { id: 'BR-302', equipmentId: 'EQ-03', equipmentName: 'Spalding Basketball', studentName: 'Priya M.', studentRoll: '23104560', roomNumber: 'A-102', borrowedAt: '2026-08-05 15:00', dueAt: '2026-08-05 18:00', status: 'Returned', returnedAt: '2026-08-05 17:45' },
  { id: 'BR-303', equipmentId: 'EQ-02', equipmentName: 'Stag Table Tennis Bat', studentName: 'Vidhya K.', studentRoll: '24104088', roomNumber: 'B-202', borrowedAt: '2026-08-05 17:00', dueAt: '2026-08-05 19:00', status: 'Active' },
]

// Gym Facility & Live Availability
export const initialGymData = {
  name: 'Vidudhi Campus Fitness & Wellness Center',
  location: 'Ground Floor, North Pavilion (Adjacent to Block A)',
  maxCapacity: 25,
  currentOccupancy: 14,
  isOpen: true,
  timings: 'Morning: 06:00 AM – 09:30 AM | Evening: 04:30 PM – 09:30 PM',
  supervisor: 'Trainer R. Manikandan (Certified Sports Physiotherapist)',
  equipment: [
    { name: 'Commercial Treadmills (Aerofit Pro)', count: 4, available: 3, status: 'Optimal' },
    { name: 'Elliptical Cross Trainers', count: 3, available: 2, status: 'Optimal' },
    { name: 'Multi-Station Cable Crossover', count: 2, available: 1, status: 'In Use' },
    { name: 'Olympic Flat & Incline Bench Press', count: 3, available: 2, status: 'Optimal' },
    { name: 'Hex Dumbbell Rack (2.5kg to 30kg)', count: 24, available: 18, status: 'Optimal' },
    { name: 'Leg Press & Squat Rack Station', count: 2, available: 1, status: 'Optimal' },
  ],
  bookedSlots: [
    { slot: '06:00 AM – 07:00 AM', bookedCount: 18, capacity: 25 },
    { slot: '07:00 AM – 08:00 AM', bookedCount: 22, capacity: 25 },
    { slot: '08:00 AM – 09:00 AM', bookedCount: 12, capacity: 25 },
    { slot: '05:00 PM – 06:00 PM', bookedCount: 20, capacity: 25 },
    { slot: '06:00 PM – 07:00 PM', bookedCount: 24, capacity: 25 },
    { slot: '07:00 PM – 08:00 PM', bookedCount: 19, capacity: 25 },
  ],
}

// Room Cleaning & Housekeeping
export const initialRoomCleaningRequests = [
  { id: 'CLN-401', roomNumber: 'A-101', studentName: 'Keerthana G.', rollNo: '24104031', preferredSlot: 'Morning (10:00 AM – 12:00 PM)', requestType: 'Deep Floor Clean & Dusting', notes: 'Please wipe window panes and sanitize study desk.', requestedOn: '2026-08-04', status: 'Completed', assignedMaid: 'S. Lakshmi', completedAt: '2026-08-05 11:20', rating: 5 },
  { id: 'CLN-402', roomNumber: 'A-102', studentName: 'Priya M.', rollNo: '23104560', preferredSlot: 'Afternoon (02:00 PM – 04:00 PM)', requestType: 'Linen & Bedcover Replacement', notes: '', requestedOn: '2026-08-05', status: 'In Progress', assignedMaid: 'M. Vasantha', completedAt: null, rating: null },
  { id: 'CLN-403', roomNumber: 'B-202', studentName: 'Vidhya K.', rollNo: '24104088', preferredSlot: 'Morning (09:00 AM – 11:00 AM)', requestType: 'Balcony Wash & Bathroom Scrubbing', notes: 'Drain filter cleaning requested.', requestedOn: '2026-08-05', status: 'Scheduled', assignedMaid: 'K. Mariammal', completedAt: null, rating: null },
]

// Lost & Found Items
export const initialLostFoundItems = [
  { id: 'LF-901', type: 'Found', title: 'Casio fx-991CW Scientific Calculator', category: 'Electronics', description: 'Black scientific calculator with stickers on the protective casing. Found on Table #8 in Central Dining Hall.', location: 'Central Dining Hall', date: '2026-08-04', reportedBy: 'Mess Staff (Ramesh)', contact: 'Warden Office Counter', status: 'Open', imageUrl: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400&q=80', claimVerified: false },
  { id: 'LF-902', type: 'Found', title: 'Titan Fastrack Smartwatch (Dark Blue Strap)', category: 'Wearables', description: 'Left behind on the bench near Treadmill 2 in the fitness center after morning workout.', location: 'Hostel Fitness Gym', date: '2026-08-03', reportedBy: 'Trainer Manikandan', contact: 'Gym Reception Desk', status: 'Claimed', reportedDate: '2026-08-03', claimVerified: true, claimedBy: 'Sowmiya R. (B-101)' },
  { id: 'LF-903', type: 'Lost', title: 'Set of 3 Keys on Blue Campus Lanyard', category: 'Keys', description: 'Room key, cupboard key, and cycle padlock key on a dark blue lanyard with Anna University logo.', location: 'Between Block A and Library Path', date: '2026-08-05', reportedBy: 'Keerthana G.', contact: '+91 98401 23456', status: 'Open', imageUrl: '', claimVerified: false },
  { id: 'LF-904', type: 'Found', title: 'Hardbound Engineering Mathematics Volume II (B.S. Grewal)', category: 'Books', description: 'Textbook with pencil annotations on Fourier Transforms inside. Left in 1st Floor Study Room.', location: 'Block B Study Lounge', date: '2026-08-02', reportedBy: 'Anjali D.', contact: 'Warden Desk', status: 'Open', imageUrl: '', claimVerified: false },
  { id: 'LF-905', type: 'Found', title: 'Campus Smart ID Card — Deepa K. (23CS108)', category: 'ID Cards', description: 'Barcoded college ID card found near the water dispenser.', location: 'Block C Corridor', date: '2026-08-05', reportedBy: 'Security Guard Natarajan', contact: 'Campus Main Gate Desk', status: 'Open', imageUrl: '', claimVerified: false },
]

// Digital Campus Map Nodes
export const initialCampusMapNodes = [
  { id: 'blk-a', name: 'Block A (Saraswathi Wing)', type: 'Residential', code: 'A-BLK', floors: 3, roomsCount: 60, occupancy: '94%', capacity: 150, supervisor: 'Dr. R. Sundaram', status: 'Active', coords: { x: 18, y: 22 }, description: 'Primary residence block featuring modern triple and double occupancy rooms, laundry collection chute, and 1st floor study lounge.' },
  { id: 'blk-b', name: 'Block B (Kaveri Wing)', type: 'Residential', code: 'B-BLK', floors: 3, roomsCount: 60, occupancy: '90%', capacity: 180, supervisor: 'Asst. Warden Malathi S.', status: 'Active', coords: { x: 50, y: 20 }, description: 'Quad and triple rooms with attached reading balconies and central Wi-Fi repeater stations.' },
  { id: 'blk-c', name: 'Block C (Vaigai Wing)', type: 'Residential', code: 'C-BLK', floors: 2, roomsCount: 40, occupancy: '85%', capacity: 100, supervisor: 'Asst. Warden Elango P.', status: 'Active', coords: { x: 80, y: 24 }, description: 'Double occupancy senior rooms with quiet study ambiance.' },
  { id: 'mess-hub', name: 'Annapoorna Dining Hall & Mess Pavilion', type: 'Dining', code: 'MESS', capacity: 350, timings: '07:30 AM – 09:30 PM', supervisor: 'Mess Chef Murugan V.', status: 'Live Serving', coords: { x: 42, y: 55 }, description: 'Central dining complex with automated steam kitchen, RO water filtration plant, and separate diet sections.' },
  { id: 'laundry-hub', name: 'EcoWash Steam Laundry Facility', type: 'Utility', code: 'LNDRY', capacity: 8, timings: '08:00 AM – 08:00 PM', supervisor: 'In-charge S. Shanmugam', status: 'Operating', coords: { x: 22, y: 72 }, description: 'Commercial heavy-duty washing units, steam ironing press station, and laundry bag token dispensary.' },
  { id: 'gym-sports', name: 'Fitness Gym & Indoor Sports Arena', type: 'Recreation', code: 'GYM-SPT', capacity: 60, timings: '06:00 AM – 09:30 PM', supervisor: 'Trainer Manikandan', status: 'Open', coords: { x: 74, y: 65 }, description: 'Fully equipped modern gymnasium, 3 badminton courts, 2 table tennis arenas, and sports gear counter.' },
  { id: 'warden-office', name: 'Chief Warden Office & Front Desk', type: 'Administration', code: 'ADM-WRD', capacity: 20, timings: '08:30 AM – 08:00 PM', supervisor: 'Dr. R. Sundaram (Chief Warden)', status: 'Office Open', coords: { x: 28, y: 38 }, description: 'Administrative hub for leave verification, visitor security clearance, outpass counter, and grievance desk.' },
  { id: 'infirmary', name: 'Campus Health Center & Emergency Clinic', type: 'Medical', code: 'CLINIC', capacity: 10, timings: 'Emergency Medical SOS Active', supervisor: 'Dr. Anitha Mohan (MD)', status: 'Doctor on Duty', coords: { x: 62, y: 44 }, description: 'Emergency trauma care, paramedic triage, nebulizers, hydration center, and immediate ambulance bay.' },
  { id: 'exit-gate1', name: 'Main Campus Security Gate & Biometric Turnstile', type: 'Security', code: 'GATE-01', supervisor: 'Chief Security Officer Natarajan', status: 'Guarded', coords: { x: 48, y: 88 }, description: '24/7 security watch tower, visitor check-in kiosk, RFID biometric turnstile, and automated boom barrier.' },
  { id: 'exit-north', name: 'North Fire Evacuation Point (Block A Lawn)', type: 'Emergency Exit', code: 'EVAC-N', status: 'Clear Exit', coords: { x: 12, y: 12 }, description: 'Designated safe assembly gathering area with fire hydrants and emergency siren beacon.' },
  { id: 'exit-south', name: 'South Fire Evacuation Point (Sports Ground)', type: 'Emergency Exit', code: 'EVAC-S', status: 'Clear Exit', coords: { x: 88, y: 82 }, description: 'Wide sports ground assembly clearing point for Block C and Indoor Sports complex.' },
]

// Emergency SOS Log for Warden Dispatch Center
export const initialSosAlerts = [
  { id: 'SOS-8091', studentName: 'Deepika A.', studentRoll: '23104092', roomNumber: 'C-102', block: 'C Block', timestamp: '2026-08-05 21:14', alertType: 'Medical Distress', status: 'Resolved', notes: 'Severe asthma breathing discomfort. Paramedic dispatched with nebulizer. Stabilized in Clinic.', dispatchedTo: 'Dr. Anitha Mohan (Clinic)' },
  { id: 'SOS-8092', studentName: 'Vidhya K.', studentRoll: '24104088', roomNumber: 'B-202', block: 'B Block', timestamp: '2026-08-04 23:45', alertType: 'Electrical Spark / Power Smoke', status: 'Resolved', notes: 'Switchboard sparking behind cooler. Main breaker tripped by patrol. Replaced socket.', dispatchedTo: 'P. Kumar (Electrician)' },
]

// Admin User Directory
export const initialAdminUsersDirectory = [
  { id: 'USR-01', name: 'Keerthana G.', role: 'student', rollNo: '24104031', department: 'Computer Science', block: 'A Block', roomNumber: 'A-101', email: 'keerthana.g@campus.edu', phone: '+91 98401 23456', status: 'Active' },
  { id: 'USR-02', name: 'Priya M.', role: 'student', rollNo: '23104560', department: 'Information Tech', block: 'A Block', roomNumber: 'A-102', email: 'priya.m@campus.edu', phone: '+91 98401 54321', status: 'Active' },
  { id: 'USR-03', name: 'Vidhya K.', role: 'student', rollNo: '24104088', department: 'Electronics & Comm', block: 'B Block', roomNumber: 'B-202', email: 'vidhya.k@campus.edu', phone: '+91 98401 99887', status: 'Active' },
  { id: 'USR-04', name: 'Gowri S.', role: 'student', rollNo: '23104092', department: 'Mechanical Engg', block: 'B Block', roomNumber: 'B-201', email: 'gowri.s@campus.edu', phone: '+91 98401 11223', status: 'Active' },
  { id: 'USR-05', name: 'Deepika A.', role: 'student', rollNo: '23104095', department: 'Civil Engg', block: 'C Block', roomNumber: 'C-102', email: 'deepika.a@campus.edu', phone: '+91 98401 66778', status: 'Active' },
  { id: 'USR-06', name: 'Dr. R. Sundaram', role: 'warden', rollNo: 'WRD-1001', department: 'Chief Warden Office', block: 'A Block (Warden Suite)', roomNumber: 'Office-A', email: 'chief.warden@campus.edu', phone: '+91 94440 01101', status: 'Active' },
  { id: 'USR-07', name: 'Malathi S.', role: 'warden', rollNo: 'WRD-1002', department: 'Asst. Warden (Block B)', block: 'B Block', roomNumber: 'Office-B', email: 'warden.blockb@campus.edu', phone: '+91 94440 01104', status: 'Active' },
  { id: 'USR-08', name: 'Prof. K. Venkatesh', role: 'admin', rollNo: 'ADM-0001', department: 'Central Campus Administration', block: 'Admin Tower', roomNumber: 'Ste-204', email: 'admin.hostels@campus.edu', phone: '+91 94440 00010', status: 'Active' },
]

// What-If Simulation Presets (Warden Only)
export const simulationPresets = [
  {
    id: 'exam_surge',
    name: 'End-Semester Exam Crunch Surge',
    description: 'Models extended study night hours with 98% room occupancy, increased night snacking, and high internet bandwidth demand.',
    occupancyRate: 98,
    messDemandIndex: 115,
    laundryWeeklyCycles: 3,
    utilityInflationPercent: 12,
    contingencyFund: 150000,
  },
  {
    id: 'monsoon_spike',
    name: 'Monsoon Flooding & Heavy Load',
    description: 'Simulates monsoon season: 100% occupancy with drying racks, power generator diesel costs, and hot water water-heater demand.',
    occupancyRate: 100,
    messDemandIndex: 105,
    laundryWeeklyCycles: 5,
    utilityInflationPercent: 25,
    contingencyFund: 300000,
  },
  {
    id: 'festival_feast',
    name: 'Pongal / Diwali Festival Week',
    description: 'Lower residential occupancy (65%) with high special feast banquet costs and kitchen overtime operations.',
    occupancyRate: 65,
    messDemandIndex: 130,
    laundryWeeklyCycles: 2,
    utilityInflationPercent: 8,
    contingencyFund: 80000,
  },
  {
    id: 'eco_green',
    name: 'Eco-Friendly Zero Waste Campus Target',
    description: 'Models solar-powered energy cap, optimized batch laundry runs, and balanced nutrition waste control.',
    occupancyRate: 92,
    messDemandIndex: 95,
    laundryWeeklyCycles: 2,
    utilityInflationPercent: -5,
    contingencyFund: 50000,
  },
]

// Student Predictive AI Insights
export const initialPredictiveInsights = [
  {
    id: 'INS-01',
    category: 'Laundry Hub Optimization',
    title: 'Optimum Laundry Turnaround Forecast',
    prediction: 'High washer queue predicted today between 4:30 PM and 6:30 PM (wait ~24 mins). Best slot for immediate machine availability is 8:30 AM or 9:15 PM (0 mins wait).',
    badge: 'Smart Timing',
    confidence: '96%',
    actionLink: '/app/laundry',
    actionText: 'View Laundry Slots',
  },
  {
    id: 'INS-02',
    category: 'Dining Hall Congestion',
    title: 'Mess Lunch Rush Forecaster',
    prediction: 'Peak crowd anticipated at 1:15 PM today due to 3rd-year lab batch release. Arriving before 12:45 PM ensures fresh hot Drumstick Sambar with zero queueing.',
    badge: 'Crowd Forecast',
    confidence: '92%',
    actionLink: '/app/mess',
    actionText: 'Check Live Menu',
  },
  {
    id: 'INS-03',
    category: 'Gate Pass & Attendance',
    title: 'Weekend Outpass Verification Ready',
    prediction: 'Your outpass request LV-1001 is queued for Chief Warden batch review at 5:00 PM today. Estimated approval time: Under 45 minutes.',
    badge: 'Attendance Alert',
    confidence: '98%',
    actionLink: '/app/leave',
    actionText: 'Track Gate Pass',
  },
  {
    id: 'INS-04',
    category: 'Energy Conservation',
    title: 'Block A Energy Efficiency Star',
    prediction: 'Your floor achieved 12% lower electrical wastage this week by switching off corridor ceiling fans during daytime classes. You rank in the top 5% eco-friendly residents.',
    badge: 'Eco Insight',
    confidence: '100%',
    actionLink: '/app/facilities',
    actionText: 'Explore Facilities',
  },
  {
    id: 'INS-05',
    category: 'Student Motivation & Wellness',
    title: 'Daily Motivational Spark for Keerthana',
    prediction: '“Continuous effort — not strength nor intelligence — is the key to unlocking our potential.” Balance your CSE projects with an evening 20-minute badminton rally at the sports arena!',
    badge: 'Daily Motivation',
    confidence: 'Self-Care Tip',
    actionLink: '/app/copilot',
    actionText: 'Ask Copilot',
  },
]
