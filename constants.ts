

import { BloodType, Resource, Camp, Donor, Request, Shipment } from './types';

export const BLOOD_TYPES: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// --- Generators for Mock Data ---

const LOCATIONS = [
  'Nerul', 'Vashi', 'Belapur', 'Kharghar', 'Airoli', 
  'Panvel', 'Seawoods', 'Sanpada', 'Ghansoli', 'Juinagar', 
  'Kopar Khairane', 'Ulwe', 'Kamothe', 'Kalamboli'
];

export const HOSPITALS = [
  'Apollo Hospitals', 'MGM Hospital', 'D Y Patil Hospital', 'Terna Speciality Hospital',
  'Fortis Hiranandani', 'Reliance Hospital', 'Sunshine Hospital', 'Medicover Hospitals',
  'NMMC General Hospital', 'Sterling Wockhardt', 'Cloudnine Hospital', 'Sahyadri Hospital',
  'Suraj Hospital', 'Gandhi Hospital', 'Acharya Shri Nanesh', 'MPCT Hospital'
];

// Detailed metadata for hospitals (Coords, Address, Rating)
export const HOSPITAL_DETAILS: Record<string, { lat: number, lng: number, address: string, rating: number }> = {
  'Apollo Hospitals': { lat: 19.0187, lng: 73.0391, address: 'Plot No 13, Parsik Hill Rd, Sector 23, CBD Belapur, Navi Mumbai, Maharashtra 400614', rating: 4.8 },
  'MGM Hospital': { lat: 19.0645, lng: 72.9972, address: 'Plot No. 35, Sector 3, Vashi, Navi Mumbai, Maharashtra 400703', rating: 4.5 },
  'D Y Patil Hospital': { lat: 19.0422, lng: 73.0270, address: 'Sector 5, Nerul, Navi Mumbai, Maharashtra 400706', rating: 4.7 },
  'Terna Speciality Hospital': { lat: 19.0366, lng: 73.0164, address: 'Plot No. 12, Sector 22, Nerul, Navi Mumbai, Maharashtra 400706', rating: 4.4 },
  'Fortis Hiranandani': { lat: 19.0760, lng: 72.9980, address: 'Mini Sea Shore Road, Sector 10A, Vashi, Navi Mumbai, Maharashtra 400703', rating: 4.9 },
  'Reliance Hospital': { lat: 19.1032, lng: 73.0035, address: 'Thane - Belapur Rd, opp. Kopar Khairane Station, Navi Mumbai, Maharashtra 400710', rating: 4.6 },
  'Sunshine Hospital': { lat: 19.0330, lng: 73.0190, address: 'Plot No 18, Sector 19, Nerul, Navi Mumbai, Maharashtra 400706', rating: 4.2 },
  'Medicover Hospitals': { lat: 19.0245, lng: 73.0590, address: 'Plot No 27, Sector 35, Kharghar, Navi Mumbai, Maharashtra 410210', rating: 4.5 },
  'NMMC General Hospital': { lat: 19.0750, lng: 72.9940, address: 'Sector 10, Vashi, Navi Mumbai, Maharashtra 400703', rating: 4.1 },
  'Sterling Wockhardt': { lat: 19.0755, lng: 72.9995, address: 'Sion-Panvel Expressway, Sector 7, Vashi, Navi Mumbai, Maharashtra 400703', rating: 4.7 },
  'Cloudnine Hospital': { lat: 19.0690, lng: 73.0050, address: 'Plot No. 17, Sector 19D, Vashi, Navi Mumbai, Maharashtra 400703', rating: 4.8 },
  'Sahyadri Hospital': { lat: 18.9910, lng: 73.1200, address: 'Plot No 4, Sector 11, Kharghar, Navi Mumbai, Maharashtra 410210', rating: 4.3 },
  'Suraj Hospital': { lat: 19.0630, lng: 73.0130, address: 'Plot No. 1, Sector 15, Sanpada, Navi Mumbai, Maharashtra 400705', rating: 4.0 },
  'Gandhi Hospital': { lat: 18.9890, lng: 73.1130, address: 'Sector 12, Panvel, Navi Mumbai, Maharashtra 410206', rating: 4.2 },
  'Acharya Shri Nanesh': { lat: 19.0150, lng: 73.0350, address: 'Plot No. 34, Sector 8A, CBD Belapur, Navi Mumbai, Maharashtra 400614', rating: 4.4 },
  'MPCT Hospital': { lat: 19.0650, lng: 73.0120, address: 'C-7, Budhyadev Mandir Marg, Sector 4, Sanpada, Navi Mumbai, Maharashtra 400705', rating: 4.6 }
};

// Generate 64 Resources (8 Blood Types * 8 Hospital/Location combos roughly)
const generateResources = (): Resource[] => {
  const resources: Resource[] = [];
  let idCounter = 1;

  // Create a distribution where most are healthy (>60 units), some are low/critical
  for (let i = 0; i < 64; i++) {
    const hospital = HOSPITALS[i % HOSPITALS.length];
    const location = LOCATIONS[i % LOCATIONS.length];
    const bloodType = BLOOD_TYPES[i % BLOOD_TYPES.length];
    
    // Default fallbacks if hospital not in details map (though all are covered above)
    const details = HOSPITAL_DETAILS[hospital] || { 
        lat: 19.0330, 
        lng: 73.0297, 
        address: `${location}, Navi Mumbai, Maharashtra`, 
        rating: 4.0 
    };
    
    // Randomize units: 
    // 80% chance of being Healthy (20-150 units)
    // 10% chance of being Low (5-19 units)
    // 10% chance of being Critical (0-4 units)
    const rand = Math.random();
    let units = 0;
    
    if (rand > 0.2) {
      units = Math.floor(Math.random() * 130) + 20; // 20 to 150
    } else if (rand > 0.1) {
      units = Math.floor(Math.random() * 15) + 5;   // 5 to 19
    } else {
      units = Math.floor(Math.random() * 5);        // 0 to 4
    }

    resources.push({
      id: `res-${idCounter++}`,
      hospital,
      location,
      bloodType,
      units,
      lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 100000000)).toISOString(),
      lat: details.lat + (Math.random() * 0.001 - 0.0005), // add slight jitter so pins don't perfectly overlap
      lng: details.lng + (Math.random() * 0.001 - 0.0005),
      address: details.address,
      rating: details.rating
    });
  }
  return resources;
};

export const INITIAL_RESOURCES: Resource[] = generateResources();

// --- Generator for 100+ Donors ---
const INDIAN_FIRST_NAMES = ["Aarav", "Vihaan", "Aditya", "Sai", "Arjun", "Reyansh", "Muhammad", "Avyaan", "Vivaan", "Aryan", "Anaya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra", "Pari", "Amaira", "Riya", "Kavya", "Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Pooja", "Suresh", "Neha", "Rohan", "Ishaan", "Kabir", "Meera", "Sanya", "Kunal", "Nisha", "Raj", "Simran", "Varun", "Tanvi"];
const INDIAN_LAST_NAMES = ["Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Mishra", "Reddy", "Nair", "Deshmukh", "Joshi", "Mehta", "Malhotra", "Bhatia", "Iyer", "Khan", "Shah", "Agarwal", "Chopra", "Das", "Kulkarni", "Rao", "Saxena", "Yadav", "Mukherjee", "Banerjee", "Chowdhury", "Pillai", "Menon", "Shetty"];

const generateDonors = (): Donor[] => {
  const donors: Donor[] = [];
  for (let i = 1; i <= 120; i++) {
    const firstName = INDIAN_FIRST_NAMES[Math.floor(Math.random() * INDIAN_FIRST_NAMES.length)];
    const lastName = INDIAN_LAST_NAMES[Math.floor(Math.random() * INDIAN_LAST_NAMES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const bloodType = BLOOD_TYPES[Math.floor(Math.random() * BLOOD_TYPES.length)];
    
    // Random donation date within last year
    const daysAgo = Math.floor(Math.random() * 365);
    const lastDonation = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    donors.push({
      id: `d-${i}`,
      name: `${firstName} ${lastName}`,
      bloodType,
      location: `${location}, Navi Mumbai`,
      lastDonation,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`,
      phone: `+91 ${Math.floor(Math.random() * 100000) + 90000} ${Math.floor(Math.random() * 10000) + 10000}`
    });
  }
  return donors;
};

export const INITIAL_DONORS: Donor[] = generateDonors();

export const INITIAL_CAMPS: Camp[] = [
  { 
    id: 'c1', 
    name: 'Grand Vashi Blood Drive', 
    organizer: 'Rotary Club of Navi Mumbai', 
    locationName: 'Inorbit Mall, Vashi', 
    lat: 19.0661, 
    lng: 73.0023, 
    date: '2023-11-15', 
    time: '10:00 AM - 06:00 PM' 
  },
  { 
    id: 'c2', 
    name: 'Nerul Community Camp', 
    organizer: 'D Y Patil Medical College', 
    locationName: 'Wonders Park, Nerul', 
    lat: 19.0288, 
    lng: 73.0186, 
    date: '2023-11-20', 
    time: '09:00 AM - 05:00 PM' 
  },
  {
    id: 'c3',
    name: 'Kharghar Youth Drive',
    organizer: 'NMMC Health Dept',
    locationName: 'Central Park, Kharghar',
    lat: 19.0473, 
    lng: 73.0699,
    date: '2023-11-25',
    time: '08:00 AM - 02:00 PM'
  },
  {
    id: 'c4',
    name: 'Seawoods Grand Central Camp',
    organizer: 'Lions Club',
    locationName: 'Seawoods Grand Central',
    lat: 19.0200, 
    lng: 73.0180,
    date: '2023-12-05',
    time: '11:00 AM - 07:00 PM' 
  }
];

export const INITIAL_REQUESTS: Request[] = [
  {
    id: 'r1',
    hospitalName: 'Sterling Wockhardt Hospital',
    location: 'Vashi, Sector 7',
    bloodType: 'O-',
    quantity: 3,
    urgency: 'Critical',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    status: 'Active'
  },
  {
    id: 'r2',
    hospitalName: 'Cloudnine Hospital',
    location: 'Vashi, Sector 17',
    bloodType: 'AB-',
    quantity: 2,
    urgency: 'High',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: 'Active'
  },
  {
    id: 'r3',
    hospitalName: 'Apollo Hospitals',
    location: 'Belapur, CBD',
    bloodType: 'B-',
    quantity: 5,
    urgency: 'Moderate',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    status: 'Active'
  }
];

// --- MOCK HISTORY DATA ---
export const MOCK_HISTORY: Request[] = [
  {
    id: 'hist-1',
    hospitalName: 'MGM Hospital',
    location: 'Vashi, Sector 3',
    bloodType: 'A+',
    quantity: 4,
    urgency: 'Critical',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // 1 day ago
    status: 'Fulfilled',
    fulfilledBy: 'Navi Mumbai Blood Bank'
  },
  {
    id: 'hist-2',
    hospitalName: 'D Y Patil Hospital',
    location: 'Nerul, Sector 5',
    bloodType: 'O-',
    quantity: 2,
    urgency: 'High',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Anjali Verma (Donor)'
  },
  {
    id: 'hist-3',
    hospitalName: 'Terna Speciality Hospital',
    location: 'Nerul, Sector 22',
    bloodType: 'B+',
    quantity: 6,
    urgency: 'Moderate',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Red Cross Reserve'
  },
  {
    id: 'hist-4',
    hospitalName: 'Reliance Hospital',
    location: 'Kopar Khairane',
    bloodType: 'AB+',
    quantity: 1,
    urgency: 'High',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    status: 'Expired'
  },
  {
    id: 'hist-5',
    hospitalName: 'NMMC General Hospital',
    location: 'Vashi, Sector 10',
    bloodType: 'A-',
    quantity: 3,
    urgency: 'Critical',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(), // 8 days ago
    status: 'Fulfilled',
    fulfilledBy: 'City Donor Network'
  },
  {
    id: 'hist-6',
    hospitalName: 'Fortis Hiranandani',
    location: 'Vashi, Sector 10A',
    bloodType: 'O+',
    quantity: 5,
    urgency: 'Moderate',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Sameer Khan (Donor)'
  },
  {
    id: 'hist-7',
    hospitalName: 'Apollo Hospitals',
    location: 'Belapur, CBD',
    bloodType: 'B-',
    quantity: 2,
    urgency: 'High',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(), // 12 days ago
    status: 'Expired'
  },
  {
    id: 'hist-8',
    hospitalName: 'Sunshine Hospital',
    location: 'Nerul, Sector 19',
    bloodType: 'AB-',
    quantity: 1,
    urgency: 'Moderate',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Lions Club Camp'
  },
  {
    id: 'hist-9',
    hospitalName: 'Medicover Hospitals',
    location: 'Kharghar, Sector 35',
    bloodType: 'A+',
    quantity: 8,
    urgency: 'Critical',
    radius: '10km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(), // 20 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Emergency Reserve'
  },
  {
    id: 'hist-10',
    hospitalName: 'Sahyadri Hospital',
    location: 'Kharghar, Sector 11',
    bloodType: 'O+',
    quantity: 3,
    urgency: 'High',
    radius: '5km',
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(), // 25 days ago
    status: 'Fulfilled',
    fulfilledBy: 'Priya Patel (Donor)'
  }
];

// --- LOGISTICS SHIPMENTS ---
export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-101',
    origin: 'MGM Hospital, Vashi',
    destination: 'D Y Patil Hospital, Nerul',
    bloodType: 'O-',
    units: 5,
    status: 'In Transit',
    method: 'Drone',
    eta: '12 mins',
    priority: 'Critical',
    // Roughly somewhere between Vashi and Nerul
    currentLat: 19.0520, 
    currentLng: 73.0100,
    destLat: 19.0422,
    destLng: 73.0270
  },
  {
    id: 'sh-102',
    origin: 'Apollo Hospitals, Belapur',
    destination: 'Sahyadri Hospital, Kharghar',
    bloodType: 'A+',
    units: 20,
    status: 'In Transit',
    method: 'Ambulance',
    eta: '25 mins',
    priority: 'High',
    // On the highway near Belapur
    currentLat: 19.0250,
    currentLng: 73.0450,
    destLat: 18.9910,
    destLng: 73.1200
  },
  {
    id: 'sh-103',
    origin: 'Central Blood Bank',
    destination: 'Fortis Hiranandani',
    bloodType: 'AB+',
    units: 10,
    status: 'Scheduled',
    method: 'Cold Storage Van',
    eta: '14:00 PM',
    priority: 'Normal',
    currentLat: 19.0760,
    currentLng: 72.9980,
    destLat: 19.0760,
    destLng: 72.9980
  },
  {
    id: 'sh-104',
    origin: 'Reliance Hospital',
    destination: 'Terna Speciality',
    bloodType: 'B-',
    units: 2,
    status: 'In Transit',
    method: 'Drone',
    eta: '8 mins',
    priority: 'Critical',
    // Mid-flight
    currentLat: 19.0700,
    currentLng: 73.0100,
    destLat: 19.0366,
    destLng: 73.0164
  }
];
