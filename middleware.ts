import { NextRequest } from 'next/server'
import { updateSession } from '@/config/updateSession'

export async function middleware(req: NextRequest) {
  return await updateSession(req)
}
