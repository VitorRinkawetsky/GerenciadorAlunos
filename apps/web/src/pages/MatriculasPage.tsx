import { useState } from 'react'
import { matriculasApi } from '../services/api'
import { useMatriculas } from '../hooks/useMatriculas'
import { useAlunos } from '../hooks/useAlunos'
import { useCursos } from '../hooks/useCursos'
import { useDisciplinas } from '../hooks/useDisciplinas'
import { pluralize } from '../utils/format'
import Modal from '../components/Modal'
import { toast } from '../components/Toast'

interface FormState { alunoId: string; disciplinaId: string }
const EMPTY: FormState = { alunoId: '', disciplinaId: '' }

export default function MatriculasPage() {
  const { matriculas, reload } = useMatriculas()
  const { alunos } = useAlunos()
  const { cursos } = useCursos()
  const { disciplinas } = useDisciplinas()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [filterAlunoId, setFilterAlunoId] = useState('')
  const [filterDisciplinaId, setFilterDisciplinaId] = useState('')

  const alunoNome = (id: number) => alunos.find(a => a.id === id)?.nome ?? '—'
  const disciplina = (id: number) => disciplinas.find(d => d.id === id)
  const cursoNome = (id: number) => cursos.find(c => c.id === id)?.nome ?? '—'

  const visiveis = matriculas.filter(m =>
    (!filterAlunoId || String(m.alunoId) === filterAlunoId) &&
    (!filterDisciplinaId || String(m.disciplinaId) === filterDisciplinaId),
  )

  const openCreate = () => { setForm(EMPTY); setOpen(true) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await matriculasApi.create({ alunoId: Number(form.alunoId), disciplinaId: Number(form.disciplinaId) })
      toast('Matrícula criada com sucesso')
      setOpen(false)
      reload()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Erro ao criar matrícula', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Matrículas</h1>
          <p className="page-subtitle">{pluralize(matriculas.length, 'matrícula registrada', 'matrículas registradas')}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Nova Matrícula</button>
      </div>

      <div className="card">
        <div className="filters-row">
          <div className="field">
            <label className="field-label">Filtrar por aluno</label>
            <select className="field-input" value={filterAlunoId} onChange={e => setFilterAlunoId(e.target.value)}>
              <option value="">Todos os alunos</option>
              {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Filtrar por disciplina</label>
            <select className="field-input" value={filterDisciplinaId} onChange={e => setFilterDisciplinaId(e.target.value)}>
              <option value="">Todas as disciplinas</option>
              {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Aluno</th>
              <th>Disciplina</th>
              <th>Curso</th>
              <th>Matriculado em</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 ? (
              <tr><td colSpan={5} className="table-empty">Nenhuma matrícula encontrada.</td></tr>
            ) : visiveis.map(m => (
              <tr key={m.id}>
                <td className="cell-id">{m.id}</td>
                <td className="cell-bold">{alunoNome(m.alunoId)}</td>
                <td>{disciplina(m.disciplinaId)?.nome ?? '—'} <span className="badge badge-mono">{disciplina(m.disciplinaId)?.codigo}</span></td>
                <td className="cell-muted">{cursoNome(disciplina(m.disciplinaId)?.cursoId ?? -1)}</td>
                <td className="cell-muted">{new Date(m.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title="Nova Matrícula" onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="field-label">Aluno</label>
              <select className="field-input" value={form.alunoId}
                onChange={e => setForm(f => ({ ...f, alunoId: e.target.value }))} required>
                <option value="">Selecione um aluno</option>
                {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Disciplina</label>
              <select className="field-input" value={form.disciplinaId}
                onChange={e => setForm(f => ({ ...f, disciplinaId: e.target.value }))} required>
                <option value="">Selecione uma disciplina</option>
                {disciplinas.map(d => <option key={d.id} value={d.id}>{d.nome} ({d.codigo})</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando…' : 'Matricular'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
