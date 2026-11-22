import type { OpportunityType } from "../../opportunities/types/opportunityTypes";

export interface Category {
  _id: string;
  name: string;
  type: OpportunityType;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface CategoryResponse {
  message: string;
  category: Category;
}

export interface CreateCategoryRequest {
  name: string;
  type: OpportunityType;
}

export interface UpdateCategoryRequest {
  name: string;
}
