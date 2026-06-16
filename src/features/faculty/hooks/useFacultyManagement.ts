import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { facultyManagementFunctions } from '@/api/FacultyManagement/facultyManagement.api'
import { queryClient } from "@/config/queryClient"

export const useGetFacultyById = (facultyId: string) => {
    return useQuery({
        queryKey: ['faculty', facultyId],
        queryFn: () => facultyManagementFunctions.getFacultyById(facultyId),
        enabled: Boolean(facultyId),
    })
}

export const useGetFacultyAcademicProfile = (facultyId: string) => {
    return useQuery({
        queryKey: ['faculty-academic-profile', facultyId],
        queryFn: () => facultyManagementFunctions.getFacultyAcademicProfile(facultyId),
        enabled: Boolean(facultyId),
    })
}


type FacultyCourseFilters = {
    search?: string
    status?: string
    category?: string
}

export const useGetFacultyCourses = (
    facultyId: string,
    page: number,
    filters: FacultyCourseFilters = {},
    pageSize = 8,
) => {
    const { search = '', status = 'all', category = 'all' } = filters
    return useQuery({
        queryKey: ['faculty-courses', facultyId, page, pageSize, search, status, category],
        queryFn: () =>
            facultyManagementFunctions.getFacultyCourses(facultyId, {
                limit: pageSize,
                offset: (page - 1) * pageSize,
                search,
                status,
                category,
            }),
        enabled: Boolean(facultyId),
        placeholderData: keepPreviousData,
    })
}

type FacultyStudentFilters = {
    search?: string
    courseId?: string
}

export const useGetFacultyStudents = (
    facultyId: string,
    page: number,
    filters: FacultyStudentFilters = {},
    pageSize = 25,
) => {
    const { search = '', courseId = 'all' } = filters
    return useQuery({
        queryKey: ['faculty-students', facultyId, page, pageSize, search, courseId],
        queryFn: () =>
            facultyManagementFunctions.getFacultyStudents(facultyId, {
                limit: pageSize,
                offset: (page - 1) * pageSize,
                search,
                courseId,
            }),
        enabled: Boolean(facultyId),
        placeholderData: keepPreviousData,
    })
}

export const useGetFacultyCourseCategories = (facultyId: string) => {
    return useQuery({
        queryKey: ['faculty-course-categories', facultyId],
        queryFn: () => facultyManagementFunctions.getFacultyCourseCategories(facultyId),
        enabled: Boolean(facultyId),
    })
}


export const useAddNoteToProfile = (facultyId: string) => {
    return useMutation({

        mutationFn: (data: { facultyId: string, note: string }) => facultyManagementFunctions.addNoteToProfile(data.facultyId, data.note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculty', facultyId] })
        }
    })
}


export const useGetFacultyRevenueStats = (facultyId: string) => {
    return useQuery({
        queryKey: ['faculty-revenue-stats', facultyId],
        queryFn: () => facultyManagementFunctions.getFacultyRevenueStats(facultyId),
        enabled: Boolean(facultyId),
    })
}




