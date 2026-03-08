import React, { useState, useEffect } from 'react';
import { Search, Plus, Copy, Tag, MessageSquare, Trash2, Settings } from 'lucide-react';

const App = () => {
    const [allPrompts, setAllPrompts] = useState(() => {
        const saved = localStorage.getItem('vp_prompts');
        return saved ? JSON.parse(saved) : [];
    });
    const [filteredPrompts, setFilteredPrompts] = useState([]);
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem('vp_categories');
        return saved ? JSON.parse(saved) : ['Todos'];
    });
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(allPrompts.length === 0);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsTab, setSettingsTab] = useState('general'); // 'general' | 'categories'
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [history, setHistory] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [managingCategories, setManagingCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newPrompt, setNewPrompt] = useState({ title: '', content: '', category_name: 'Programación', tags: '' });

    useEffect(() => {
        if (selectedPrompt) {
            fetchHistory(selectedPrompt.id);
            fetchComments(selectedPrompt.id);
            setEditingPrompt({ ...selectedPrompt });
        }
    }, [selectedPrompt]);

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [search, activeCategory, allPrompts]);

    const fetchAllData = async () => {
        try {
            const [pRes, cRes] = await Promise.all([
                fetch('http://localhost:3000/api/prompts'),
                fetch('http://localhost:3000/api/categories')
            ]);

            const pData = await pRes.json();
            const cData = await cRes.json();

            setAllPrompts(pData);
            const cats = ['Todos', ...cData.map(c => c.name)];
            setCategories(cats);
            setManagingCategories(cData);

            // Sync cache
            localStorage.setItem('vp_prompts', JSON.stringify(pData));
            localStorage.setItem('vp_categories', JSON.stringify(cats));
        } catch (err) {
            console.warn('Backend unavailable, using current state/fallback');
            if (allPrompts.length === 0) {
                const fallback = [
                    { id: 1, title: 'Generador de Código Python', content: 'Escribe un script en Python...', tags: 'python,dev', category_name: 'Programación' },
                    { id: 2, title: 'Optimización de Landing Page', content: 'Actúa como un experto en Copywriting...', tags: 'copy,sales', category_name: 'Copywriting' },
                ];
                setAllPrompts(fallback);
                setCategories(['Todos', 'Programación', 'Ventas', 'Copywriting', 'SEO']);
                setManagingCategories([
                    { id: 1, name: 'Programación' },
                    { id: 2, name: 'Ventas' },
                    { id: 3, name: 'Copywriting' },
                    { id: 4, name: 'SEO' }
                ]);
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (id) => {
        const res = await fetch(`http://localhost:3000/api/prompts/${id}/history`);
        const data = await res.json();
        setHistory(data);
    };

    const fetchComments = async (id) => {
        const res = await fetch(`http://localhost:3000/api/prompts/${id}/comments`);
        const data = await res.json();
        setComments(data);
    };

    const handleUpdatePrompt = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:3000/api/prompts/${editingPrompt.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPrompt)
            });
            if (res.ok) {
                const updated = { ...editingPrompt };
                setSelectedPrompt(updated);
                fetchAllData(); // Refresh list
            }
        } catch (err) { console.error(err); }
    };

    const handleAddComment = async () => {
        if (!newComment) return;
        try {
            await fetch(`http://localhost:3000/api/prompts/${selectedPrompt.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment })
            });
            setNewComment('');
            fetchComments(selectedPrompt.id);
        } catch (err) { console.error(err); }
    };

    const handleAddCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch('http://localhost:3000/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                setNewCategoryName('');
                fetchAllData();
            } else {
                const data = await res.json();
                alert(data.error || "Error al añadir categoría");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión al añadir categoría");
        }
    };

    const handleRenameCategory = async (id, newName) => {
        if (!newName || newName.trim() === "") return;
        try {
            const res = await fetch(`http://localhost:3000/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            });
            if (res.ok) {
                setEditingCategory(null);
                fetchAllData();
            } else {
                const data = await res.json();
                alert(data.error || "Error al renombrar");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
    };

    const applyFilters = () => {
        const filtered = allPrompts.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                p.content.toLowerCase().includes(search.toLowerCase());
            const matchesCat = activeCategory === 'Todos' || p.category_name === activeCategory;
            return matchesSearch && matchesCat;
        });
        setFilteredPrompts(filtered);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Visual feedback would go here
    };

    const handleAddPrompt = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:3000/api/prompts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrompt)
            });
            if (res.ok) {
                setIsAdding(false);
                setNewPrompt({ title: '', content: '', category_name: 'Programación', tags: '' });
                fetchAllData();
            }
        } catch (err) {
            console.error('Error adding prompt:', err);
            alert('Error connecting to backend for saving.');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm('¿Borrar esta categoría?')) return;
        const res = await fetch(`http://localhost:3000/api/categories/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const data = await res.json();
            alert(data.error || 'Error al borrar');
            return;
        }
        fetchAllData();
    };

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="logo">VaroPromptVault</div>
                <div className="search-bar">
                    <Search size={20} color="#9ca3af" style={{ margin: 'auto 0' }} />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Buscar en tu archivo..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> Nuevo Prompt
                    </button>
                    <button className="btn" style={{ padding: '0.5rem' }} onClick={() => setIsSettingsOpen(true)}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="main-layout">
                <aside className="sidebar glass-panel">
                    <h4 style={{ padding: '0 1rem', marginBottom: '1rem', color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase' }}>Categorías</h4>
                    {categories.map(cat => (
                        <div
                            key={cat}
                            className={`nav-item ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </div>
                    ))}
                </aside>

                <main>
                    {loading && filteredPrompts.length === 0 ? (
                        <div className="stats-grid">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="prompt-card glass-panel skeleton-card" style={{ height: '200px' }}>
                                    <div className="skeleton-title"></div>
                                    <div className="skeleton-text"></div>
                                    <div className="skeleton-text" style={{ width: '60%' }}></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="stats-grid">
                            {filteredPrompts.map((prompt) => (
                                <div key={prompt.id} className="prompt-card glass-panel" onClick={() => setSelectedPrompt(prompt)}>
                                    <div className="prompt-header">
                                        <h3 className="prompt-title">{prompt.title}</h3>
                                        <span className="tag-badge">{prompt.category_name}</span>
                                    </div>
                                    <p className="prompt-preview">{prompt.content}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                                            {prompt.tags?.split(',').map(tag => (
                                                <span key={tag} className="tag-badge" style={{ background: 'transparent', border: '1px solid var(--glass-border)', fontSize: '0.6rem' }}>#{tag}</span>
                                            ))}
                                        </div>
                                        <button className="btn copy-button" onClick={(e) => { e.stopPropagation(); copyToClipboard(prompt.content); }}>
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Prompt Creation Modal */}
            {isAdding && (
                <div className="modal-overlay" onClick={() => setIsAdding(false)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
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
                            <select
                                className="search-input"
                                style={{ width: '100%', background: 'var(--glass-bg)' }}
                                value={newPrompt.category_name}
                                onChange={e => setNewPrompt({ ...newPrompt, category_name: e.target.value })}
                            >
                                {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <textarea
                                placeholder="Contenido del Prompt..."
                                className="search-input"
                                style={{ width: '100%', height: '150px', background: 'var(--glass-bg)', padding: '1rem' }}
                                value={newPrompt.content}
                                onChange={e => setNewPrompt({ ...newPrompt, content: e.target.value })}
                                required
                            />
                            <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>Crear Prompt</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedPrompt && (
                <div className="modal-overlay" onClick={() => setSelectedPrompt(null)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '900px', width: '90%' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedPrompt(null)}>✕</button>

                        <div style={{ display: 'flex', gap: '2rem' }}>
                            {/* Left Column: Editor/Content */}
                            <div style={{ flex: 2 }}>
                                <form onSubmit={handleUpdatePrompt}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <input
                                            className="search-input"
                                            style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '80%', padding: '0.5rem' }}
                                            value={editingPrompt?.title || ''}
                                            onChange={e => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button type="submit" className="btn btn-primary">Guardar</button>
                                            <button type="button" className="btn" onClick={() => copyToClipboard(editingPrompt.content)}><Copy size={16} /></button>
                                        </div>
                                    </div>
                                    <select
                                        className="search-input"
                                        style={{ marginBottom: '1rem', background: 'var(--glass-bg)' }}
                                        value={editingPrompt?.category_name || ''}
                                        onChange={e => setEditingPrompt({ ...editingPrompt, category_name: e.target.value })}
                                    >
                                        {categories.filter(c => c !== 'Todos').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <textarea
                                        className="search-input"
                                        style={{ width: '100%', minHeight: '300px', background: 'var(--glass-bg)', padding: '1rem', fontFamily: 'monospace' }}
                                        value={editingPrompt?.content || ''}
                                        onChange={e => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                                    />
                                </form>

                                {/* Comments Section */}
                                <div style={{ marginTop: '2rem' }}>
                                    <h4>Comentarios & Notas</h4>
                                    <div className="comments-list" style={{ marginTop: '1rem' }}>
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
                                        />
                                        <button className="btn btn-primary" onClick={handleAddComment}>Postear</button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: History */}
                            <div style={{ flex: 1, borderLeft: '1px solid var(--glass-border)', paddingLeft: '1.5rem' }}>
                                <h4>Historial de Versiones</h4>
                                <div className="history-list" style={{ marginTop: '1rem' }}>
                                    {history.map(v => (
                                        <div
                                            key={v.id}
                                            className="nav-item"
                                            style={{ padding: '0.8rem', fontSize: '0.85rem', marginBottom: '0.5rem' }}
                                            onClick={() => setEditingPrompt({ ...editingPrompt, content: v.content })}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span>v{v.version_number}</span>
                                                <small style={{ color: '#666' }}>{new Date(v.created_at).toLocaleDateString()}</small>
                                            </div>
                                            <p style={{ opacity: 0.5, fontSize: '0.7rem', marginTop: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {v.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Modal Hub */}
            {isSettingsOpen && (
                <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
                    <div className="modal-content glass-panel" style={{ maxWidth: '700px', width: '90%', minHeight: '500px' }} onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setIsSettingsOpen(false)}>✕</button>

                        <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
                            {/* Settings Sidebar */}
                            <div style={{ width: '180px', borderRight: '1px solid var(--glass-border)', paddingRight: '1rem' }}>
                                <h3 style={{ marginBottom: '2rem' }}>Ajustes</h3>
                                <div
                                    className={`nav-item ${settingsTab === 'general' ? 'active' : ''}`}
                                    onClick={() => setSettingsTab('general')}
                                >General</div>
                                <div
                                    className={`nav-item ${settingsTab === 'categories' ? 'active' : ''}`}
                                    onClick={() => setSettingsTab('categories')}
                                >Categorías</div>
                            </div>

                            {/* Settings Content */}
                            <div style={{ flex: 1, padding: '1rem 0' }}>
                                {settingsTab === 'general' ? (
                                    <div className="settings-section">
                                        <h4>Configuración General</h4>
                                        <div style={{ marginTop: '2rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.6 }}>Nombre de la Bóveda</label>
                                            <input className="search-input" value="VaroPromptVault" readOnly style={{ width: '100%' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="settings-section">
                                        <h4>Gestión de Categorías</h4>
                                        <div style={{ marginTop: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                            {managingCategories.length === 0 && <div style={{ opacity: 0.5, textAlign: 'center', padding: '1rem' }}>Sincronizando categorías...</div>}
                                            {managingCategories.map(cat => (
                                                <div key={cat.id || cat.name} className="nav-item" style={{ background: 'rgba(255,255,255,0.02)', margin: '0.5rem 0', cursor: 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem' }}>
                                                    {editingCategory?.id === cat.id ? (
                                                        <>
                                                            <input
                                                                autoFocus
                                                                className="search-input"
                                                                style={{ flex: 1, margin: 0, padding: '2px 5px', background: 'var(--glass-bg)', border: '1px solid var(--primary-color)' }}
                                                                value={editingCategory.name}
                                                                onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') handleRenameCategory(cat.id, editingCategory.name);
                                                                    if (e.key === 'Escape') setEditingCategory(null);
                                                                }}
                                                            />
                                                            <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
                                                                <button className="btn btn-primary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} onClick={() => handleRenameCategory(cat.id, editingCategory.name)}>
                                                                    OK
                                                                </button>
                                                                <button className="btn" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem' }} onClick={() => setEditingCategory(null)}>
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span style={{ flex: 1 }}>{cat.name}</span>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button className="btn" style={{ padding: '0.2rem 0.5rem', opacity: 0.8, fontSize: '0.7rem' }} onClick={() => setEditingCategory({ ...cat })}>
                                                                    Renombrar
                                                                </button>
                                                                <button className="btn" style={{ padding: '2px', color: '#ef4444' }} onClick={() => handleDeleteCategory(cat.id)}>
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                                            <input
                                                className="search-input"
                                                placeholder="Añadir nueva..."
                                                style={{ flex: 1 }}
                                                value={newCategoryName}
                                                onChange={e => setNewCategoryName(e.target.value)}
                                            />
                                            <button className="btn btn-primary" onClick={handleAddCategory}>Añadir</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
