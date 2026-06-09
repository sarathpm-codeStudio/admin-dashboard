import { useQuery } from "@tanstack/react-query"
import { studentManagementFunctions } from "@/api/studentManagement/studentManagement.api"

export const useGetStudentById = (studentId: string) => {
    return useQuery({
        queryKey: ['student', studentId],
        queryFn: () => studentManagementFunctions.getStudentById(studentId),
        enabled: Boolean(studentId),
    })
}

export const useGetStudentCourses = (studentId: string, page: number, limit: number, search: string) => {
    return useQuery({
        queryKey: ['student-courses', studentId, page, limit, search],
        queryFn: () => studentManagementFunctions.getStudentCourses({ studentId, page, limit, search }),
        enabled: Boolean(studentId),
    })
}