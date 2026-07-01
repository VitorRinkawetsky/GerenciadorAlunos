import { useState, useEffect } from 'react'
import type { Aluno, Curso } from '../api'
import { alunosApi, cursosApi } from '../api'
import Modal from '../components/Modal'

interface FormState { nome: string; email: string; matricula: string; cursoId: string }
const EMPTY: FormState = { nome: '', email: '', matricula: '', cursoId: '' }

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Aluno | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    alunosApi.list().then(setAlunos)
    cursosApi.list().then(setCursos)
  }, [])

  const reload = () => alunosApi.list().then(setAlunos)

  const cursoNome = (id: number) => cursos.find(c => c.id === id)?.nome ?? '—'

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (a: Aluno) => {
    setEditing(a)
    setForm({ nome: a.nome, email: a.email, matricula: a.matricula, cursoId: String(a.cursoId) })
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este aluno?')) return
    await alunosApi.delete(id)
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, cursoId: Number(form.cursoId) }
    try {
      editing ? await alunosApi.update(editing.id, payload) : await alunosApi.create(payload)
      setOpen(false)
      reload()
    } finally {
      setSaving(false)
    }
  }

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Alunos</h1>
          <p className="page-subtitle">{alunos.length} aluno{alunos.length !== 1 ? 's' : ''} matriculado{alunos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Aluno</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Matrícula</th>
              <th>Curso</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr><td colSpan={6} className="table-empty">Nenhum aluno cadastrado ainda.</td></tr>
            ) : alunos.map(a => (
              <tr key={a.id}>
                <td className="cell-id">{a.id}</td>
                <td className="cell-bold">{a.nome}</td>
                <td className="cell-muted">{a.email}</td>
                <td><span className="badge badge-mono">{a.matricula}</span></td>
                <td className="cell-muted">{cursoNome(a.cursoId)}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(a)}>Editar</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(a.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Aluno' : 'Novo Aluno'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="field-label">Nome completo</label>
              <input className="field-input" type="text" value={form.nome} onChange={f('nome')}
                placeholder="Ex: Ana Silva" minLength={3} maxLength={100} required />
            </div>
            <div className="field">
              <label className="field-label">E-mail</label>
              <input className="field-input" type="email" value={form.email} onChange={f('email')}
                placeholder="ana.silva@email.com" required />
            </div>
            <div className="field">
              <label className="field-label">Matrícula</label>
              <input className="field-input" type="text" value={form.matricula} onChange={f('matricula')}
                placeholder="Ex: CC2024001" minLength={5} maxLength={20} required />
            </div>
            <div className="field">
              <label className="field-label">Curso</label>
              <select className="field-input" value={form.cursoId} onChange={f('cursoId')} required>
                <option value="">Selecione um curso</option>
                {cursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando…' : editing ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
