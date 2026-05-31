const TOKEN_KEY = 'token'
const USER_EMAIL_KEY = 'userEmail'

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function setUserEmail(email: string) {
  localStorage.setItem(USER_EMAIL_KEY, email)
}

export function getUserEmail(): string | null {
  return localStorage.getItem(USER_EMAIL_KEY)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_EMAIL_KEY)
}

export function getAuthHeader(): Record<string, string> {
  const token = getToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
