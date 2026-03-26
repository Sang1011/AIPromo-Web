export interface PaymentOrderPaymentRequest {
  orderId: string;
  method: "BatchWalletPay" | "BatchDirectPay";
  description: string;
}


export interface PaymentOrderPaymentResponse {
  paymentTransactionId: string;
  paymentUrl: string | null;
  totalAmount: number;
  completedAt: string; 
}

export interface PaymentMyOrderResponse {
  items: PaymentItem[];
}

export interface PaymentItem {
  id: string;
  type: "BatchWalletPay" | "BatchDirectPay";
  internalStatus: "Pending" | "Completed" | "Failed";
  amount: number;
  currency: string;
  orderId: string;
  items: PaymentDetailItem[];

  gatewayTxnRef: string | null;
  gatewayTransactionNo: string | null;
  gatewayResponseCode: string | null;
  gatewayBankCode: string | null;

  createdAt: string;
  completedAt: string | null;
  failedAt: string | null;
  refundedAt: string | null;
}

export interface PaymentDetailItem {
  id: string;
  orderTicketId: string;
  eventSessionId: string;
  amount: number;
  internalStatus: "Pending" | "Completed" | "Failed";
  refundedAt: string | null;
  createdAt: string;
}

export interface PaymentHistoryParamsRequest {
  page?: number;
  pageSize?: number;
  status?: string;
}