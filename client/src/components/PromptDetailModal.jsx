import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles, Trash2, Edit3, Save, X } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

const PromptDetailModal = ({
    selectedPrompt,
    setSelectedPrompt,
    editingPrompt,
    setEditingPrompt,
    handleUpdatePrompt,
    handleDeletePrompt,
    categories,
    comments,
    history,
    newComment,
    setNewComment,
    handleAddComment,
    handleDeleteHistory,
    handleUpdateHistoryNote
}) => {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [variables, setVariables] = useState({});
    const [detectedVars, setDetectedVars] = useState([]);
    const [editingVersionNote, setEditingVersionNote] = useState(null); // { id, note }

    // Parse variables from content whenever it changes
    useEffect(() => {
        const content = editingPrompt?.content || '';
        // Use non-greedy regex to find all {{...}} patterns
        const regex = /{{(.*?)}}/g;
        const matches = Array.from(content.matchAll(regex));
        const uniqueVars = [...new Set(matches.map(m => m[1].trim()))];

        setDetectedVars(uniqueVars);

        // Cleanup state: remove keys that are no longer present, keep existing ones
        setVariables(prev => {
            const next = { ...prev };
            let changed = false;
            // Remove old vars that are no longer in content
            Object.keys(next).forEach(key => {
                if (!uniqueVars.includes(key)) {
                    delete next[key];
                    changed = true;
                }
            });
            // Ensure we don't return a new object if nothing changed to prevent unnecessary re-renders
            return changed ? next : prev;
        });
    }, [editingPrompt?.content]);

    // Safety check: if no prompt is selected OR the editing state hasn't synced yet, render nothing.
    // This prevents null pointer exceptions during state transitions.
    if (!selectedPrompt || !editingPrompt) return null;

    const getProcessedContent = () => {
        let content = editingPrompt.content || '';
        detectedVars.forEach(v => {
            const val = variables[v] || `{{${v}}}`;
            // Escape special regex characters in variable name to avoid crash
            const escapedV = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`{{${escapedV}}}`, 'g');
            content = content.replace(regex, val);
        });
        return content;
    };

    const handleCopy = () => {
        const processed = getProcessedContent();
        navigator.clipboard.writeText(processed);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!editingPrompt.id) return;
        setIsSaving(true);
        await handleUpdatePrompt(e);
        setTimeout(() => setIsSaving(false), 800);
    };

    return (
        <div className="modal-overlay" onClick={() => setSelectedPrompt(null)}>
            <div className="modal-content glass-panel" style={{ maxWidth: '1200px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedPrompt(null)}>✕</button>
                {editingPrompt?.id && (
                    <button
                        className="btn"
                        style={{ position: 'absolute', top: '1.5rem', right: '4rem', padding: '4px 8px', color: '#ef4444', opacity: 0.6 }}
                        onClick={() => handleDeletePrompt(editingPrompt.id)}
                        title="Borrar prompt"
                    >
                        <Trash2 size={16} />
                    </button>
                )}

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Left Column: Editor & Dynamic Form */}
                    <div style={{ flex: 2, minWidth: '60%' }}>
                        <form onSubmit={onSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        className="search-input"
                                        style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                                        value={editingPrompt.title || ''}
                                        onChange={e => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                                        placeholder="Título del Prompt"
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="search-input"
                                            style={{ background: 'var(--glass-bg)', flex: 1 }}
                                            value={editingPrompt.category_name || ''}
                                            onChange={e => setEditingPrompt({ ...editingPrompt, category_name: e.target.value })}
                                        >
                                            {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input
                                            className="search-input"
                                            style={{ background: 'var(--glass-bg)', flex: 1 }}
                                            value={editingPrompt.tags || ''}
                                            onChange={e => setEditingPrompt({ ...editingPrompt, tags: e.target.value })}
                                            placeholder="Tags (coma separados)"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', minWidth: '100px' }}>
                                        {isSaving ? '✓' : 'Guardar'}
                                    </button>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button type="button" className="btn" onClick={handleCopy} title="Copiar prompt con variables" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                                            {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                        </button>
                                        <button type="button" className="btn" style={{ flex: 1, color: 'var(--accent-primary)', opacity: 0.8 }} title="Refinar con IA (Próximamente)">
                                            <Sparkles size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Variables Form */}
                            {detectedVars.length > 0 && (
                                <div className="glass-panel" style={{
                                    padding: '1.25rem',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    background: 'rgba(59, 130, 246, 0.03)',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                        <Sparkles size={18} color="var(--accent-primary)" />
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', letterSpacing: '0.5px' }}>Variables de Plantilla</h4>
                                            <small style={{ opacity: 0.5, fontSize: '0.75rem' }}>Sustituye {'{{ ... }}'} antes de copiar.</small>
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
                                        {detectedVars.map(v => (
                                            <div key={v}>
                                                <label style={{
                                                    display: 'block',
                                                    fontSize: '0.65rem',
                                                    fontWeight: '700',
                                                    opacity: 0.5,
                                                    marginBottom: '0.4rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '1px'
                                                }}>{v.replace(/_/g, ' ')}</label>
                                                <input
                                                    className="search-input"
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.6rem 1rem',
                                                        fontSize: '0.9rem',
                                                        background: 'rgba(0,0,0,0.2)',
                                                        border: '1px solid var(--glass-border)'
                                                    }}
                                                    placeholder={`Escribir ${v}...`}
                                                    value={variables[v] || ''}
                                                    onChange={e => setVariables({ ...variables, [v]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div data-color-mode="dark">
                                <MDEditor
                                    value={editingPrompt.content || ''}
                                    onChange={val => setEditingPrompt({ ...editingPrompt, content: val || '' })}
                                    height={400}
                                    preview="edit"
                                    style={{ backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}
                                />
                            </div>
                        </form>

                        {/* Comments Section */}
                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={18} /> Notas de Uso</h4>
                            <div className="comments-list" style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                                {(!comments || comments.length === 0) && <p style={{ opacity: 0.3, fontSize: '0.85rem' }}>Sin notas adicionales.</p>}
                                {Array.isArray(comments) && comments.map(c => (
                                    <div key={c.id} className="nav-item" style={{ background: 'rgba(255,255,255,0.02)', cursor: 'default', padding: '0.8rem', marginBottom: '0.5rem' }}>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{c.text}</p>
                                        <small style={{ color: '#666' }}>{new Date(c.created_at).toLocaleString()}</small>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <input
                                    className="search-input"
                                    style={{ flex: 1 }}
                                    placeholder="Añadir nota técnica..."
                                    value={newComment || ''}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddComment();
                                        }
                                    }}
                                />
                                <button type="button" className="btn btn-primary" onClick={handleAddComment}>Postear</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div style={{ flex: 1, borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1.5rem' }}>Versiones Anteriores</h4>
                        <div className="history-list" style={{ maxHeight: 'calc(100vh - 250px)', overflowY: 'auto' }}>
                            {(!Array.isArray(history) || history.length === 0) && <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Sin historial.</p>}
                            {Array.isArray(history) && history.map(v => (
                                <div
                                    key={v.id}
                                    className="nav-item"
                                    style={{
                                        padding: '1rem',
                                        fontSize: '0.85rem',
                                        marginBottom: '0.75rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setEditingPrompt(prev => ({ ...prev, content: v.content }))}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <div style={{ flex: 1 }} onClick={e => e.stopPropagation()}>
                                            {editingVersionNote?.id === v.id ? (
                                                <div style={{ display: 'flex', gap: '0.3rem' }}>
                                                    <input
                                                        autoFocus
                                                        className="search-input"
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', margin: 0, height: 'auto' }}
                                                        value={editingVersionNote.note}
                                                        onChange={e => setEditingVersionNote({ ...editingVersionNote, note: e.target.value })}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter') {
                                                                handleUpdateHistoryNote(v.id, editingVersionNote.note);
                                                                setEditingVersionNote(null);
                                                            }
                                                            if (e.key === 'Escape') setEditingVersionNote(null);
                                                        }}
                                                    />
                                                    <button className="btn" style={{ padding: '4px' }} onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUpdateHistoryNote(v.id, editingVersionNote.note);
                                                        setEditingVersionNote(null);
                                                    }}><Check size={14} /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>v{v.version_number}</span>
                                                    {v.note && <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}> - {v.note}</span>}
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                                            <button
                                                className="btn"
                                                style={{ padding: '4px', opacity: 0.5 }}
                                                onClick={() => setEditingVersionNote({ id: v.id, note: v.note || '' })}
                                                title="Añadir nota"
                                            >
                                                <Edit3 size={12} />
                                            </button>
                                            <button
                                                className="btn"
                                                style={{ padding: '4px', opacity: 0.5, color: '#ef4444' }}
                                                onClick={() => handleDeleteHistory(v.id)}
                                                title="Borrar versión"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.4 }}>
                                        <small>{new Date(v.created_at).toLocaleDateString()}</small>
                                        <small>{v.content.length} chars</small>
                                    </div>
                                    <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {v.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptDetailModal;
