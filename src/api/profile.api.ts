import { supabase } from '@/config/supabase'
import type { ProfileAuthRow } from '@/types/profile'

const PROFILE_AUTH_COLUMNS =
  'role, first_name, last_name, avatar_url, account_id, email'

export async function fetchProfileForAuth(userId: string): Promise<ProfileAuthRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_AUTH_COLUMNS)
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data as ProfileAuthRow | null
}
