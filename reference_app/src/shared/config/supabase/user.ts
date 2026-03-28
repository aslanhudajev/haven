import {Database} from './database'

export type User = Database['public']['Tables']['profiles']['Row'] & {email: string}
