import api from './client'

interface TokenResponse {
  access_token: string
  refresh_token: string | null
  token_type: string
}

export function register(email: string, password: string, full_name: string) {
  return api.post('/auth/register', { email, password, full_name })
}

export function login(email: string, password: string) {
  const params = new URLSearchParams()
  params.append('username', email)
  params.append('password', password)
  return api.post<TokenResponse>('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export function refreshToken(refresh_token: string) {
  return api.post<TokenResponse>('/auth/refresh', { refresh_token })
}

export function logout(refresh_token: string) {
  return api.post('/auth/logout', { refresh_token })
}

export function googleLogin(idToken: string) {
  return api.post<TokenResponse>('/auth/google', { id_token: idToken })
}

export function appleLogin(idToken: string, fullName?: string) {
  return api.post<TokenResponse>('/auth/apple', { id_token: idToken, full_name: fullName })
}
