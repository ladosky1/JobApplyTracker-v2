import { apiClient } from "../../../services/api/apiClient";

import type {
  CreateOpportunityRequest,
  Opportunity,
  OpportunityListParams,
  OpportunityListResponse,
  OpportunityResponse,
  UpdateOpportunityRequest,
} from "../types/opportunityTypes";

import type { MessageResponse } from "../../auth/types/auth.types";

const BASE_URL = "/opportunities";

export const opportunityService = {
  async getOpportunities(
    params: OpportunityListParams = {},
  ): Promise<OpportunityListResponse> {
    const response = await apiClient.get<OpportunityListResponse>(
      BASE_URL,
      { params },
    );

    return response.data;
  },

  async getOpportunityById(id: string): Promise<{ opportunity: Opportunity }> {
    const response = await apiClient.get<{ opportunity: Opportunity }>(
        `${BASE_URL}/${id}`,
    );

    return response.data;
  },

  async createOpportunity(
    payload: CreateOpportunityRequest,
  ): Promise<OpportunityResponse> {
    const response = await apiClient.post<OpportunityResponse>(
      BASE_URL,
      payload,
    );

    return response.data;
  },

  async updateOpportunity(
    id: string,
    payload: UpdateOpportunityRequest,
  ): Promise<OpportunityResponse> {
    const response = await apiClient.patch<OpportunityResponse>(
      `${BASE_URL}/${id}`,
      payload,
    );

    return response.data;
  },

  async deleteOpportunity(id: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `${BASE_URL}/${id}`,
    );

    return response.data;
  },
};
