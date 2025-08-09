import axios from 'axios'
import { createClient } from '@/config'
import { cookies } from 'next/headers'

export const client = () => {
  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  api.interceptors.request.use(
    async (config) => {
      const supabase = await createClient()
      const { data } = await supabase.auth.refreshSession()
      const { session } = data

      if (session) {
        config.headers['Authorization'] = `Bearer ${session.access_token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  const createAxiosResponseInterceptor = () => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const cookie = await cookies()
        const supabase = await createClient()
        const { data } = await supabase.auth.refreshSession()
        const { session } = data

        if (error?.response?.status !== 401) {
          return Promise.reject(error)
        }

        if (error?.response?.status === 401 && session) {
          try {
            api.interceptors.response.eject(interceptor)

            error.response.config.headers.Authorization = `Bearer ${session.access_token}`
          } catch (error) {
            cookie.getAll().forEach((cookieStore) => {
              cookie.delete(cookieStore.name)
            })

            return Promise.reject(error)
          } finally {
            createAxiosResponseInterceptor()
          }
        } else {
          return Promise.reject(error)
        }
      }
    )
    return interceptor
  }

  createAxiosResponseInterceptor()

  const get = api.get
  const post = api.post
  const put = api.put
  const del = api.delete

  return { get, post, put, delete: del }
}

export const fetchData = async (url: string) => {
  const response = await client().get(url)
  return response.data.data
}
