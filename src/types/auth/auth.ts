export interface LoginRequest {
  emailOrUserName: string
  password: string
  deviceId: string
  deviceName: string
  ipAddress: string
  userAgent: string
}

export interface RegisterRequest {
  email: string;
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
}

export interface UserProfile {
  email: string;
  userName: string;
  profileImageUrl: string,
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string | null;
  birthday: string | null;
  gender: string | null;
  roles: string[];
  id: string;
  createdAt: string;
  createdBy: string;
  modifiedAt: string;
  modifiedBy: string;
  isActive: boolean;
}


export interface UserProfileRequest {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  birthday: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
  socialLink: string | null;
  profileImageUrl: string | null;
}

export interface MeInfo {
  userId: string;
  email: string;
  name: string;
  roles: string[];
  jti: string;
  ipAddress: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  operatingSystem: string;
  deviceType: string;
  browserVersion: string;
  osVersion: string;
  userAgent: string;
}