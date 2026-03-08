import React from 'react';
import MDEditor from '@uiw/react-md-editor';

const CreatePromptModal = ({ isAdding, setIsAdding, newPrompt, setNewPrompt, handleAddPrompt, categories }) => {
    if (!isAdding) return null;

    return (
        <div className="modal-overlay" onClick={() => setIsAdding(false)}>
            <div className="modal-content glass-panel" style={{ width: '90%', maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setIsAdding(false)}>✕</button>
                <h2>Añadir Nuevo Prompt</h2>
                <form onSubmit={handleAddPrompt} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Título del Prompt"
                        className="search-input"
                        style={{ width: '100%', background: 'var(--glass-bg)' }}
                        value={newPrompt.title}
                        onChange={e => setNewPrompt({ ...newPrompt, title: e.target.value })}
                        required
                    />
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select
                            className="search-input"
                            style={{ flex: 1, background: 'var(--glass-bg)' }}
                            value={newPrompt.category_name}
                            onChange={e => setNewPrompt({ ...newPrompt, category_name: e.target.value })}
                        >
                            {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Tags (ej: seo, blog)"
                            className="search-input"
                            style={{ flex: 1, background: 'var(--glass-bg)' }}
                            value={newPrompt.tags}
                            onChange={e => setNewPrompt({ ...newPrompt, tags: e.target.value })}
                        />
                    </div>

                    <div data-color-mode="dark">
                        <MDEditor
                            value={newPrompt.content}
                            onChange={val => setNewPrompt({ ...newPrompt, content: val || '' })}
                            height={300}
                            style={{ backgroundColor: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Crear Prompt</button>
                </form>
            </div>
        </div>
    );
};

export default CreatePromptModal;
