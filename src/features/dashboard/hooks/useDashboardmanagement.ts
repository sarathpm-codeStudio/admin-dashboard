

import { useQuery } from "@tanstack/react-query"
import { dashboardManagementFunctions } from "@/api/dashboard/dashboard.api"
import type { DashboardPendingAction, TopPerformers } from "@/api/dashboard/dashboard.api"
import type { DashboardAnalytics } from "@/features/dashboard/data/dashboardStatItems"
import { EnrollmentTrendPoint, RevenueTrendPoint } from "../data/chartTrends"



export const useGetDashboardAnalytics = () => {
    return useQuery<DashboardAnalytics>({
        queryKey: ['dashboard-analytics'],
        queryFn: () => dashboardManagementFunctions.getDashboardAnalytics(),
    })
}


export const useGetPendingActions = () => {
    return useQuery<DashboardPendingAction[]>({
        queryKey: ['dashboard-pending-actions'],
        queryFn: () => dashboardManagementFunctions.getPendingActions(),
    })
}


export const useGetTopPerformers = () => {
    return useQuery<TopPerformers>({
        queryKey: ['dashboard-top-performers'],
        queryFn: () => dashboardManagementFunctions.getTopPerformers(),
    })
}


export const useGetEnrollmentTrends = (period: 'week' | 'month' | 'year') => {
    return useQuery<EnrollmentTrendPoint[]>({
        queryKey: ['enrollment-trends', period],
        queryFn: () => dashboardManagementFunctions.getEnrollmentTrends(period),
    });
};


export const useGetRevenueTrends = (period: 'week' | 'month' | 'year') => {
    return useQuery<RevenueTrendPoint[]>({
        queryKey: ['revenue-trends', period],
        queryFn: () => dashboardManagementFunctions.getRevenueTrends(period),
    });
};
