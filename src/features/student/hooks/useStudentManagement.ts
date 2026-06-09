import { useQuery } from "@tanstack/react-query"
import { studentManagementFunctions } from "@/api/studentManagement/studentManagement.api"

export const useGetStudentById = (studentId: string) => {
    return useQuery({
        queryKey: ['students', studentId],
        queryFn: () => studentManagementFunctions.getStudentById(studentId),
    })
}
