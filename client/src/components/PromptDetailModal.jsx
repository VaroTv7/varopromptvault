import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';

const PromptDetailModal = ({
    selectedPrompt,
    setSelectedPrompt,
    editingPrompt,
    setEditingPrompt,
    handleUpdatePrompt,
    categories,
    comments,
    history,
    newComment,
    setNewComment,
    handleAddComment
}) => {
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!selectedPrompt) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(editingPrompt.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await handleUpdatePrompt(e);
        setTimeout(() => setIsSaving(false), 800); // UI Feedback
    };

    return (
        <div className="modal-overlay" onClick={() => setSelectedPrompt(null)}>
            <div className="modal-content glass-panel" style={{ maxWidth: '1000px', width: '95%' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setSelectedPrompt(null)}>✕</button>

                <div style={{ display: 'flex', gap: '2rem' }}>
                    {/* Left Column: Editor/Content */}
                    <div style={{ flex: 2, minWidth: '60%' }}>
                        <form onSubmit={onSubmit}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        className="search-input"
                                        style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                                        value={editingPrompt?.title || ''}
                                        onChange={e => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                                        placeholder="Título del Prompt"
                                    />
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <select
                                            className="search-input"
                                            style={{ background: 'var(--glass-bg)', flex: 1 }}
                                            value={editingPrompt?.category_name || ''}
                                            onChange={e => setEditingPrompt({ ...editingPrompt, category_name: e.target.value })}
                                        >
                                            {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <input
                                            className="search-input"
                                            style={{ background: 'var(--glass-bg)', flex: 1 }}
                                            value={editingPrompt?.tags || ''}
                                            onChange={e => setEditingPrompt({ ...editingPrompt, tags: e.target.value })}
                                            placeholder="Tags (coma separados)"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                        {isSaving ? 'Guardado ✓' : 'Guardar'}
                                    </button>
                                    <button type="button" className="btn" onClick={handleCopy} style={{ display: 'flex', justifyContent: 'center' }}>
                                        {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div data-color-mode="dark" style={{ marginTop: '1rem' }}>
                                <MDEditor
                                    value={editingPrompt?.content || ''}
                                    onChange={val => setEditingPrompt({ ...editingPrompt, content: val || '' })}
                                    height={400}
                                    style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                                />
                            </div>
                        </form>

                        {/* Comments Section */}
                        <div style={{ marginTop: '2rem' }}>
                            <h4>Comentarios & Notas</h4>
                            <div className="comments-list" style={{ marginTop: '1rem', maxHeight: '150px', overflowY: 'auto' }}>
                                {comments.map(c => (
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
                                    value={newComment}
                                    onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                                />
                                <button className="btn btn-primary" onClick={handleAddComment}>Postear</button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: History */}
                    <div style={{ flex: 1, borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                        <h4>Historial de Versiones</h4>
                        <div className="history-list" style={{ marginTop: '1rem', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                            {history.map(v => (
                                <div
                                    key={v.id}
                                    className="nav-item"
                                    style={{ padding: '0.8rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                                    onClick={() => setEditingPrompt({ ...editingPrompt, content: v.content })}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>v{v.version_number}</span>
                                        <small style={{ color: '#666' }}>{new Date(v.created_at).toLocaleDateString()}</small>
                                    </div>
                                    <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '0.3rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
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
