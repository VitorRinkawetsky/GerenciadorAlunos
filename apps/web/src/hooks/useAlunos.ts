import { useState, useEffect, useCallback } from 'react'
import type { Aluno } from '../types'
import { alunosApi } from '../services/api'

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const reload = useCallback(() => alunosApi.list().then(setAlunos), [])
  useEffect(() => { reload() }, [reload])
  return { alunos, reload }
}
