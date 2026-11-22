import type {
  GigStatus,
  JobStatus,
  OpportunityType,
} from "../../opportunities/types/opportunityTypes";

export interface DashboardOverview {
  total: number;
  jobs: number;
  gigs: number;
  activeJobs: number;
  activeGigs: number;
  acceptedJobs: number;
  completedGigs: number;
  rejectedJobs: number;
  declinedGigs: number;
  cancelledGigs: number;
  successfulOutcomes: number;
}

export interface DashboardPerformance {
  applicationSuccess: {
    accepted: number;
    rejected: number;
    decided: number;
    rate: number | null;
  };
  gigCompletion: {
    completed: number;
    declined: number;
    cancelled: number;
    finalized: number;
    rate: number | null;
  };
}

export interface DashboardStatusCount<TStatus extends string> {
  status: TStatus;
  count: number;
}

export interface DashboardReminders {
  upcoming: number;
  due: number;
  overdue: number;
  sent: number;
}

export interface DashboardCategoryBreakdown {
  type: OpportunityType;
  categoryId: string;
  categoryName: string;
  count: number;
}

export interface DashboardActivity {
  month: string;
  type: OpportunityType;
  count: number;
}

export interface DashboardApplicationActivity {
  month: string;
  count: number;
}

export interface DashboardSummary {
  overview: DashboardOverview;
  performance: DashboardPerformance;
  jobStatuses: DashboardStatusCount<JobStatus>[];
  gigStatuses: DashboardStatusCount<GigStatus>[];
  reminders: DashboardReminders;
  categoryBreakdown: DashboardCategoryBreakdown[];
  activityOverTime: DashboardActivity[];
  applicationsOverTime: DashboardApplicationActivity[];
}

export interface DashboardResponse {
  summary: DashboardSummary;
}
