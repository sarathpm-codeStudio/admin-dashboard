

import { useQuery } from "@tanstack/react-query"
import { dashboardManagementFunctions } from "@/api/dashboard/dashboard.api"
import type { DashboardAnalytics } from "@/features/dashboard/data/dashboardStatItems"
import { EnrollmentTrendPoint } from "../data/chartTrends"



export const useGetDashboardAnalytics = () => {
    return useQuery<DashboardAnalytics>({
        queryKey: ['dashboard-analytics'],
        queryFn: () => dashboardManagementFunctions.getDashboardAnalytics(),
    })
}


export const useGetEnrollmentTrends = (period: 'week' | 'month' | 'year') => {
    return useQuery<EnrollmentTrendPoint[]>({
        queryKey: ['enrollment-trends', period],
        queryFn: () => dashboardManagementFunctions.getEnrollmentTrends(period),
    });
};
