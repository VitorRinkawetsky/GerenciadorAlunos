import { useState, useEffect, useCallback } from 'react'
import type { Curso } from '../types'
import { cursosApi } from '../services/api'

export function useCursos() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const reload = useCallback(() => cursosApi.list().then(setCursos), [])
  useEffect(() => { reload() }, [reload])
  return { cursos, reload }
}
