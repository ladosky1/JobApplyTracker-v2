import { apiClient } from "../../../services/api/apiClient";

import type { MessageResponse } from "../../auth/types/auth.types";

import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/categoryTypes";

const BASE_URL = "/categories";

export const categoryService = {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await apiClient.get<CategoriesResponse>(BASE_URL);

    return response.data;
  },

  async createCategory(
    payload: CreateCategoryRequest,
  ): Promise<CategoryResponse> {
    const response = await apiClient.post<CategoryResponse>(
      BASE_URL,
      payload,
    );

    return response.data;
  },

  async updateCategory(
    categoryId: string,
    payload: UpdateCategoryRequest,
  ): Promise<CategoryResponse> {
    const response = await apiClient.patch<CategoryResponse>(
      `${BASE_URL}/${categoryId}`,
      payload,
    );

    return response.data;
  },

  async deleteCategory(categoryId: string): Promise<MessageResponse> {
    const response = await apiClient.delete<MessageResponse>(
      `${BASE_URL}/${categoryId}`,
    );

    return response.data;
  },
};
