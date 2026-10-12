/** Series and number without a space: two letters, then seven digits. */
export const isPassport = (value: string) => /^[A-Z]{2}\d{7}$/.test(value)
