

import { useMutation, useQuery } from "@tanstack/react-query"
import { financialManagementFunctions } from "@/api/financial/financial.api"
import type { FinancialPayoutRow, FinancialSummary, FinancialTransactionRow, PayoutDetail, ProcessPayoutsResult } from "@/api/financial/financial.api"
import { gstFunctions } from "@/api/financial/gst.api"
import type { GstReport } from "@/api/financial/gst.api"
import { queryClient } from "@/config/queryClient"



export const useGetFinancialSummary = () => {
    return useQuery<FinancialSummary>({
        queryKey: ['financial-summary'],
        queryFn: () => financialManagementFunctions.getFinancialSummary(),
    })
}


export const useGetFinancialTransactions = () => {
    return useQuery<FinancialTransactionRow[]>({
        queryKey: ['financial-transactions'],
        queryFn: () => financialManagementFunctions.getFinancialTransactions(),
    })
}


export const useGetFinancialPayouts = () => {
    return useQuery<FinancialPayoutRow[]>({
        queryKey: ['financial-payouts'],
        queryFn: () => financialManagementFunctions.getFinancialPayouts(),
    })
}


export const useGetPayoutDetail = (payoutId: string | null) => {
    return useQuery<PayoutDetail>({
        queryKey: ['payout-detail', payoutId],
        queryFn: () => financialManagementFunctions.getPayoutDetail(payoutId as string),
        enabled: Boolean(payoutId),
    })
}


export const useGetGstReport = (fromISO: string, toISO: string) => {
    return useQuery<GstReport>({
        queryKey: ['gst-report', fromISO, toISO],
        queryFn: () => gstFunctions.getGstReport(fromISO, toISO),
        enabled: Boolean(fromISO && toISO),
    })
}


export const useProcessPayouts = () => {
    return useMutation<ProcessPayoutsResult, Error>({
        mutationFn: () => financialManagementFunctions.processAllPayouts(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] })
            queryClient.invalidateQueries({ queryKey: ['financial-payouts'] })
            queryClient.invalidateQueries({ queryKey: ['financial-transactions'] })
        },
    })
}
