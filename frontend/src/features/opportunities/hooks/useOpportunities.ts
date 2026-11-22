import { useQuery } from "@tanstack/react-query";

import { opportunityService } from "../services/opportunityService";

import type { OpportunityListParams } from "../types/opportunityTypes";

export const opportunityKeys = {
  all: ["opportunities"] as const,

  lists: () => [...opportunityKeys.all, "list"] as const,

  list: (params: OpportunityListParams) =>
    [...opportunityKeys.lists(), params] as const,

  details: () => [...opportunityKeys.all, "detail"] as const,

  detail: (id: string) =>
    [...opportunityKeys.details(), id] as const,
};

export const useOpportunities = (
  params: OpportunityListParams = {},
) => {
  return useQuery({
    queryKey: opportunityKeys.list(params),
    queryFn: () => opportunityService.getOpportunities(params),
  });
};

export const useOpportunity = (id: string) => {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: async () => {
      const response = await opportunityService.getOpportunityById(id);

      return response.opportunity;
    },
    enabled: Boolean(id),
  });
};
