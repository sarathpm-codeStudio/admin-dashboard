import { useMutation, useQuery } from "@tanstack/react-query"
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


export const useAddNoteToProfile = (facultyId: string) => {
    return useMutation({

        mutationFn: (data: { facultyId: string, note: string }) => facultyManagementFunctions.addNoteToProfile(data.facultyId, data.note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['faculty', facultyId] })
        }
    })
}




