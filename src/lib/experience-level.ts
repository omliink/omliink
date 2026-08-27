// Shared with CandidateExperienceBlock.tsx (the candidate's own edit view)
// and CandidateProfileReveal.tsx (the employer-facing reveal panel) so the
// two surfaces never drift on how an experience_level code is worded.
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'debutant', label: 'Débutant' },
  { value: '1-3ans', label: '1 à 3 ans d’expérience' },
  { value: '3-5ans', label: '3 à 5 ans d’expérience' },
  { value: '5ans-plus', label: 'Plus de 5 ans d’expérience' },
] as const

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = Object.fromEntries(
  EXPERIENCE_LEVEL_OPTIONS.map((option) => [option.value, option.label])
)
