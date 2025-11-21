import React from 'react';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type Status = 'Available' | 'Low' | 'Critical';

export interface Resource {
  id: string;
  bloodType: BloodType;
  units: number;
  location: string;
  hospital: string;
  lastUpdated: string;
  lat: number;
  lng: number;
  address: string;
  rating: number;
}

export type UrgencyLevel = 'Moderate' | 'High' | 'Critical';

export interface Request {
  id: string;
  hospitalName: string;
  location: string;
  bloodType: BloodType;
  quantity: number;
  urgency: UrgencyLevel;
  radius: '5km' | '10km';
  postedAt: string; // ISO string
  status: 'Active' | 'Fulfilled' | 'Expired';
  fulfilledBy?: string;
}

export interface Camp {
  id: string;
  name: string;
  organizer: string;
  locationName: string;
  lat: number;
  lng: number;
  date: string;
  time: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodType: BloodType;
  location: string;
  lastDonation: string;
  email: string;
  phone: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

// --- Logistics Types ---
export type ShipmentStatus = 'In Transit' | 'Scheduled' | 'Delivered' | 'Delayed';
export type TransportMethod = 'Drone' | 'Ambulance' | 'Cold Storage Van';

export interface Shipment {
  id: string;
  origin: string;
  destination: string;
  bloodType: BloodType;
  units: number;
  status: ShipmentStatus;
  method: TransportMethod;
  eta: string;
  priority: 'Normal' | 'High' | 'Critical';
  currentLat: number;
  currentLng: number;
  destLat: number;
  destLng: number;
}