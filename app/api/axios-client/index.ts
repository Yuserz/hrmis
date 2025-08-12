import axios, { InternalAxiosRequestConfig } from 'axios'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL

const isServer = typeof window === 'undefined'

const logInterceptor = async (req: InternalAxiosRequestConfig) => {
  if (isServer) {
    console.log('[AXIOS] [SERVER] ', req.url)
  } else {
    console.log('[AXIOS] [CLIENT] ', req.url)
  }
  return req
}

const cookiesInterceptor = async (req: any) => {
  if (isServer) {
    const { cookies } = await import('next/headers')
    const cookiesString = await cookies()

    cookiesString
      .getAll()
      .map((item) => `${item.name}=${item.value}`)
      .join('; ')

    req.headers.cookie = cookiesString
  }
  return req
}

export const AxiosService = axios.create({
  baseURL: baseUrl
})

AxiosService.interceptors.request.use(logInterceptor)
AxiosService.interceptors.request.use(cookiesInterceptor)
