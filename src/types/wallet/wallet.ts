export interface ToUpWalletResquest{
    amount: number,
    description: string,
}

// Giá trị trả ra khi nạp tiền vào ví 
export interface ToUpWalletResponse{
    paymentTransactionId: string,
    paymentUrl: string | null,
}

// Giá trị trả ra của user đó 
export interface WalletUserResponse {
  id: string;
  userId: string;
  balance: number;
  status: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction {
  id: string;
  type: string;
  direction: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  note: string;
  createdAt: string; 
}