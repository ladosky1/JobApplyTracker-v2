export type OpportunityType = "job" | "gig";

export type JobStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type GigStatus =
  | "lead"
  | "contacted"
  | "negotiating"
  | "in_progress"
  | "completed"
  | "declined"
  | "cancelled";

export type OpportunityStatus = JobStatus | GigStatus;

export type OpportunitySort =
  | "newest"
  | "oldest"
  | "title_asc"
  | "title_desc";

export interface OpportunityCategory {
  _id: string;
  name: string;
  type: OpportunityType;
  isDefault: boolean;
}

export interface Opportunity {
  _id: string;
  type: OpportunityType;
  title: string;
  organizationName?: string;
  category: OpportunityCategory;
  status: OpportunityStatus;
  statusChangedAt: string;
  appliedAt: string | null;
  link?: string;
  notes?: string;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface OpportunityListResponse {
  opportunities: Opportunity[];
  pagination: OpportunityPagination;
}

export interface OpportunityResponse {
  message: string;
  opportunity: Opportunity;
}

export interface OpportunityListParams {
  type?: OpportunityType;
  status?: OpportunityStatus;
  categoryId?: string;
  search?: string;
  sort?: OpportunitySort;
  page?: number;
  limit?: number;
}

export interface CreateOpportunityRequest {
  type: OpportunityType;
  title: string;
  organizationName?: string;
  categoryId?: string | null;
  status?: OpportunityStatus;
  link?: string;
  notes?: string;
  followUpAt?: string | null;
}

export interface UpdateOpportunityRequest {
  title?: string;
  organizationName?: string | null;
  categoryId?: string | null;
  status?: OpportunityStatus;
  link?: string | null;
  notes?: string | null;
  followUpAt?: string | null;
}
