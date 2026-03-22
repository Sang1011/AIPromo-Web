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