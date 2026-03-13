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