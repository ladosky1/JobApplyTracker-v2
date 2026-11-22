import { useMutation, useQueryClient } from "@tanstack/react-query";

import { opportunityService } from "../services/opportunityService";

import { opportunityKeys } from "./useOpportunities";

import type {
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
} from "../types/opportunityTypes";

const invalidateOpportunityData = async (
  queryClient: ReturnType<typeof useQueryClient>,
) => {
  await Promise.all([
    queryClient.invalidateQueries({
      queryKey: opportunityKeys.all,
    }),
    queryClient.invalidateQueries({
      queryKey: ["dashboard"],
    }),
  ]);
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOpportunityRequest) =>
      opportunityService.createOpportunity(payload),

    onSuccess: () => invalidateOpportunityData(queryClient),
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOpportunityRequest;
    }) => opportunityService.updateOpportunity(id, payload),

    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateOpportunityData(queryClient),
        queryClient.invalidateQueries({
          queryKey: opportunityKeys.detail(variables.id),
        }),
      ]);
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      opportunityService.deleteOpportunity(id),

    onSuccess: async (_, id) => {
      await Promise.all([
        invalidateOpportunityData(queryClient),
        queryClient.removeQueries({
          queryKey: opportunityKeys.detail(id),
        }),
      ]);
    },
  });
};
