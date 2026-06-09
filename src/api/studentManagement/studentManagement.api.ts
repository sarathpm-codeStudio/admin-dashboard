import { supabase } from "@/config/supabase"

export type Student = {
    id: string
    last_active: string
    email: string
    created_at: string
    phone: string
}
export const studentManagementFunctions = {
    getStudentById: async (studentId: string) => {
        const { data: students, error } = await supabase
            .from('profiles')
            .select('account_id, last_active, email, role, created_at, phone')
            .eq('role', 'STUDENT')
            .eq('id', studentId)
        if (error) {
            throw error
        }
        return students
    }
}