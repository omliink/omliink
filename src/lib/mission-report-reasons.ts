export const MISSION_REPORT_REASON_OPTIONS = [
  { value: 'contenu_inapproprie', label: 'Contenu inapproprié' },
  { value: 'arnaque_suspectee', label: 'Arnaque suspectée' },
  { value: 'informations_trompeuses', label: 'Informations trompeuses' },
  { value: 'autre', label: 'Autre' },
] as const

export const MISSION_REPORT_REASON_LABELS: Record<string, string> = Object.fromEntries(
  MISSION_REPORT_REASON_OPTIONS.map((option) => [option.value, option.label])
)
