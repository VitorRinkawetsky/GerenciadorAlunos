import { useState, useEffect, useCallback } from 'react'
import type { Matricula } from '../types'
import { matriculasApi } from '../services/api'

export function useMatriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const reload = useCallback(() => matriculasApi.list().then(setMatriculas), [])
  useEffect(() => { reload() }, [reload])
  return { matriculas, reload }
}
