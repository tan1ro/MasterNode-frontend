export const DELETE_ACCOUNT_CONFIRM_WORD = "DELETE"

export function emailsMatchForDelete(accountEmail: string, typedEmail: string): boolean {
  const expected = accountEmail.trim().toLowerCase()
  if (!expected) return false
  return typedEmail.trim().toLowerCase() === expected
}

export function isDeleteAccountUnlocked(opts: {
  accountEmail: string
  typedEmail: string
  typedConfirm: string
}): boolean {
  return (
    emailsMatchForDelete(opts.accountEmail, opts.typedEmail) &&
    opts.typedConfirm.trim() === DELETE_ACCOUNT_CONFIRM_WORD
  )
}
