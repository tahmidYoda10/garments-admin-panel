// src/types/api.ts

// ====== Generic API Wrapper ======
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// ====== Auth ======
export interface AuthUserInfo {
  id: number;
  name: string;
  email: string;
  userType: string;
  roleName?: string;
}

export interface AuthTenantInfo {
  id: number;
  shopName: string;
  shopSlug: string;
  logoPath?: string | null;
  subscriptionStatus?: string | null;
  planName?: string | null;
}

export interface AuthResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUserInfo;
  tenant?: AuthTenantInfo | null;
}

// ====== Tenant ======
export interface Tenant {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
  shopName: string;
  shopSlug: string;
  ownerName: string;
  email: string;
  phone: string;
  address?: string | null;
  businessType?: string | null;
  logoPath?: string | null;
  currency?: string;
  isActive: boolean;
  // TenantResponse fields
  currentSubscriptionId?: number | null;
  currentSubscriptionStatus?: string | null;
  currentSubscriptionPlanName?: string | null;
  currentSubscriptionEndDate?: string | null;
  // Alternative nested format
  currentSubscription?: {
    id: number;
    planName?: string;
    status: string;
    startDate: string;
    endDate: string;
  } | null;
}

// ====== Plan ======
export interface SubscriptionPlan {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  durationDays: number;
  maxProducts?: number | null;
  maxStaff?: number | null;
  maxBranches?: number | null;
  maxStorageMb?: number | null;
  advancedReports: boolean;
  loyaltySystem: boolean;
  multiBranch: boolean;
  apiAccess: boolean;
  sortOrder: number;
  isActive: boolean;
}

// ====== Subscription ======
export interface Subscription {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
  tenant?: Tenant;
  plan?: SubscriptionPlan | null;
  status: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SubscriptionResponse {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  tenantId: number;
  shopName: string;
  ownerName: string;
  planId?: number;
  planName?: string;
  planMonthlyPrice?: number;
}

// ====== Subscription Payment Response (NEW - Fixed) ======
export interface SubscriptionPaymentResponse {
  id: number;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  referenceNote?: string | null;
  paymentDate: string;
  confirmedBy?: string | null;
  subscriptionId?: number;
  planName?: string;
  planPrice?: number;
  tenantId?: number;
  shopName?: string;
}

// ====== Old SubscriptionPayment (keep for backward compatibility) ======
export interface SubscriptionPayment {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  isDeleted?: boolean;
  subscription?: Subscription;
  tenant?: Tenant;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  referenceNote?: string | null;
  paymentDate: string;
  confirmedBy?: string | null;
}

// ====== Dashboard ======
export interface DashboardResponse {
  todaySales?: number;
  todaySalesCount?: number;
  todayExpenses?: number;
  todayNetIncome?: number;
  totalOutstandingDues?: number;
  totalPayableDues?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  totalProducts?: number;
  totalCustomers?: number;
  unreadNotifications?: number;
  monthlySalesChart?: any[];
  topSellingProducts?: any[];
  topCustomers?: any[];
  recentSales?: any[];
  recentActivities?: any[];
  salesByCategory?: { [key: string]: number };
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  trialTenants: number;
  newRegistrationsThisMonth?: number;
  platformRevenueThisMonth: number;
  platformRevenueAllTime?: number;
  mrr?: number;
  revenueGrowthChart?: any[];
  tenantGrowthChart?: any[];
  planDistribution?: { [key: string]: number };
  expiringSubscriptions?: any[];
  recentRegistrations?: any[];
  recentPayments?: any[];
}

// ====== Request Payloads ======
export interface ActivateSubscriptionRequestPayload {
  tenantId: number;
  planId: number;
  paymentAmount: number;
  paymentMethod: string;
  transactionId?: string;
  referenceNote?: string;
}

export interface CreatePlanRequestPayload {
  name: string;
  description: string;
  monthlyPrice: number;
  durationDays: number;
  maxProducts?: number | null;
  maxStaff?: number | null;
  maxBranches?: number | null;
  maxStorageMb?: number | null;
  advancedReports: boolean;
  loyaltySystem: boolean;
  multiBranch: boolean;
  apiAccess: boolean;
  sortOrder: number;
}