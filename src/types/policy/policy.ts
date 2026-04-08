import type { ApiResponse } from "../api";

export interface Policy {
    id: string;
    type: string;
    fileUrl: string;
    description: string;
}

export interface PolicyRequest {
  type: string;
  fileUrl: string;
  description: string;
}

export type GetAllPoliciesResponse = ApiResponse<Policy[]>;
export type GetPolicyByIdResponse = ApiResponse<Policy>;