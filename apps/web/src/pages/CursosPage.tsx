import { useState, useEffect } from 'react'
import type { Curso } from '../api'
import { cursosApi } from '../api'
import Modal from '../components/Modal'

interface FormState { nome: string; descricao: string }
const EMPTY: FormState = { nome: '', descricao: '' }

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Curso | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { cursosApi.list().then(setCursos) }, [])

  const reload = () => cursosApi.list().then(setCursos)

  const openCreate = () => { setEditing(null); setForm(EMPTY); setOpen(true) }
  const openEdit = (c: Curso) => { setEditing(c); setForm({ nome: c.nome, descricao: c.descricao }); setOpen(true) }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este curso?')) return
    await cursosApi.delete(id)
    reload()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      editing ? await cursosApi.update(editing.id, form) : await cursosApi.create(form)
      setOpen(false)
      reload()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cursos</h1>
          <p className="page-subtitle">{cursos.length} curso{cursos.length !== 1 ? 's' : ''} cadastrado{cursos.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Novo Curso</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th style={{ width: 120 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.length === 0 ? (
              <tr><td colSpan={4} className="table-empty">Nenhum curso cadastrado ainda.</td></tr>
            ) : cursos.map(c => (
              <tr key={c.id}>
                <td className="cell-id">{c.id}</td>
                <td className="cell-bold">{c.nome}</td>
                <td className="cell-muted cell-clamp">{c.descricao}</td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(c)}>Editar</button>
                    <button className="btn btn-sm btn-danger-outline" onClick={() => handleDelete(c.id)}>Excluir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <Modal title={editing ? 'Editar Curso' : 'Novo Curso'} onClose={() => setOpen(false)}>
          <form onSubmit={handleSubmit} className="form">
            <div className="field">
              <label className="field-label">Nome</label>
              <input className="field-input" type="text" value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                placeholder="Ex: Ciência da Computação" minLength={3} maxLength={100} required />
            </div>
            <div className="field">
              <label className="field-label">Descrição</label>
              <textarea className="field-input field-textarea" value={form.descricao}
                onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                placeholder="Descreva o curso..." minLength={10} maxLength={500} required />
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
