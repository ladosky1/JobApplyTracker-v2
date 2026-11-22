import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { categoryService } from "../services/categoryService";

import type {
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/categoryTypes";

export const categoryKeys = {
  all: ["categories"] as const,
};

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: categoryService.getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCategoryRequest) =>
      categoryService.createCategory(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      categoryId,
      payload,
    }: {
      categoryId: string;
      payload: UpdateCategoryRequest;
    }) => categoryService.updateCategory(categoryId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteCategory(categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: ["opportunities"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
