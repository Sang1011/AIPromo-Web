export interface WithdrawalRequest {
  bankAccountNumber: string;
  bankName: string;
  amount: number;
  notes: string;
}