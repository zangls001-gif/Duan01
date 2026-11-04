export interface Plan {
  id: string;
  name: string;
  type: string;
  pricePerMonth: number;
  storage: string;
  bandwidth: string;
  recommendedVisits: number;
  freeDomain: boolean;
  features: string[];
  limitations?: string;
  bestFor: string;
}

export interface DomainPricing {
  extension: string;
  price: number;
  description: string;
  badge?: string;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  billingType: 'monthly' | 'yearly';
  description: string;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  description: string;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'staff' | 'customer';
  fullName: string;
  phone?: string;
  email?: string;
}

export interface OrderItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface OrderTimeline {
  action: string;
  by: string;
  time: string;
}

export interface ServiceDetails {
  hostingIp: string;
  nameServers: string[];
  expireDate: string;
}

export interface Needs {
  siteType: string;
  traffic: string;
  budget: number;
  needDomain: boolean;
  desiredDomain: string;
  brandName?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  email: string;
  planChosen: string;
  planName: string;
  planPrice: number;
  domainName: string;
  domainExtension: string;
  domainPrice: number;
  isDomainFree: boolean;
  billingCycleMonths: number;
  addons: OrderItemAddon[];
  couponApplied: string | null;
  discountAmount: number;
  subTotal: number;
  totalAmount: number;
  qrUrl: string;
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'paid_processing';
  status: 'pending_payment' | 'paid_processing' | 'completed' | 'cancelled';
  assignedTo: string | null;
  assignedToName: string;
  serviceDetails: ServiceDetails | null;
  needs?: Needs | null;
  aiReason?: string;
  aiDomainAdvice?: string;
  notes: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface AIAdvicePlan {
  planId: string;
  category: string;
  reason: string;
}

export interface AIAdviceData {
  best: AIAdvicePlan;
  alternatives: AIAdvicePlan[];
  domainAdvice: string;
}

export interface SupabaseConfig {
  url: string;
  restEndpoint: string;
  anonKey: string;
  status: 'connected' | 'pending_key' | 'error';
  lastTestedAt: string | null;
  syncEnabled: boolean;
}

export interface SupabaseStatus {
  ok: boolean;
  connected: boolean;
  url: string;
  restEndpoint: string;
  hasKey: boolean;
  status: string;
  message: string;
  hint?: string;
  tables?: string[];
  lastTestedAt?: string;
}
