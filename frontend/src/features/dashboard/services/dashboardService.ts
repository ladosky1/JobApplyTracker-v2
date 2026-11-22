
import { apiClient } from "../../../services/api/apiClient";

import type { DashboardResponse } from "../types/dashboardTypes";

const BASE_URL = "/opportunities/dashboard";

export const dashboardService = {
  async getDashboardSummary(): Promise<DashboardResponse> {
    const response = await apiClient.get<DashboardResponse>(BASE_URL);

    return response.data;
  },
};
