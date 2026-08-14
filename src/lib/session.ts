import type { LearnerProfile } from './skills'

const KEY = 'anyskill.profile'

export function saveProfile(p: LearnerProfile) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function loadProfile(): LearnerProfile | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LearnerProfile) : null
  } catch {
    return null
  }
}
