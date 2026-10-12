// Stand-in for the real auth API. Any login works; the password "wrong" is rejected
// so the error state can be seen. The first successful login requires a new password.

const PASSWORD_CHANGED_KEY = 'birzum.passwordChanged'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const INVALID_CREDENTIALS = 'invalid_credentials'

function hasChangedPassword() {
  try {
    return localStorage.getItem(PASSWORD_CHANGED_KEY) === '1'
  } catch {
    return false
  }
}

export async function login(_login: string, password: string) {
  await delay(700)
  if (password === 'wrong') throw new Error(INVALID_CREDENTIALS)
  return { mustChangePassword: !hasChangedPassword() }
}

export async function changePassword(_newPassword: string) {
  await delay(700)
  try {
    localStorage.setItem(PASSWORD_CHANGED_KEY, '1')
  } catch {
    // storage unavailable, the next login will ask again
  }
}
