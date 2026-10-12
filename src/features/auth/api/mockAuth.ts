// Stand-in for the real auth API.
// - Any login works; the password "wrong" is rejected so the error state can be seen.
// - The first successful login requires a new password.
// - Login must be confirmed by SMS code once per calendar day. Any 6-digit code works
//   except "000000", which is rejected.

const PASSWORD_CHANGED_KEY = 'birzum.passwordChanged'
const CONFIRMED_ON_KEY = 'birzum.loginConfirmedOn'
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const INVALID_CREDENTIALS = 'invalid_credentials'
export const INVALID_CODE = 'invalid_code'
export const CODE_LENGTH = 6
export const RESEND_AFTER_SECONDS = 60

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // storage unavailable, the step will be asked for again next time
  }
}

const today = () => new Date().toDateString()

export function needsLoginConfirmation() {
  return read(CONFIRMED_ON_KEY) !== today()
}

export async function login(_login: string, password: string) {
  await delay(700)
  if (password === 'wrong') throw new Error(INVALID_CREDENTIALS)
  return { mustChangePassword: read(PASSWORD_CHANGED_KEY) !== '1' }
}

export async function changePassword(_newPassword: string, _logoutOtherDevices: boolean) {
  await delay(700)
  write(PASSWORD_CHANGED_KEY, '1')
}

export async function sendLoginCode(_phone: string) {
  await delay(700)
}

export async function verifyLoginCode(_phone: string, code: string) {
  await delay(700)
  if (code === '000000') throw new Error(INVALID_CODE)
  write(CONFIRMED_ON_KEY, today())
}
