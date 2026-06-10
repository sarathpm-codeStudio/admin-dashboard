import { useQuery } from "@tanstack/react-query"
import { facultyManagementFunctions } from '@/api/FacultyManagement/facultyManagement.api'

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