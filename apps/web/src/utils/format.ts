export function pluralize(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`
}

export function vagasPct(ocupadas: number, limite: number): number {
  return limite > 0 ? Math.round((ocupadas / limite) * 100) : 0
}
