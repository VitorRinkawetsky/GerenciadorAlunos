import { useState, useEffect, useCallback } from 'react'
import type { Disciplina } from '../types'
import { disciplinasApi } from '../services/api'

export function useDisciplinas() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const reload = useCallback(() => disciplinasApi.list().then(setDisciplinas), [])
  useEffect(() => { reload() }, [reload])
  return { disciplinas, reload }
}
