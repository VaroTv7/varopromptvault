import React, { useState, useEffect } from 'react';
import { Search, Plus, Copy, Tag, MessageSquare, Trash2, ExternalLink } from 'lucide-react';

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
    const [newPrompt, setNewPrompt] = useState({ title: '', content: '', category_name: 'Programación', tags: '' });

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
            }
        } finally {
            setLoading(false);
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
                fetchPrompts();
            }
        } catch (err) {
            console.error('Error adding prompt:', err);
            alert('Error connecting to backend for saving.');
        }
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
                <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                    <Plus size={18} /> Nuevo Prompt
                </button>
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

            {/* Modal View */}
            {selectedPrompt && (
                <div className="modal-overlay" onClick={() => setSelectedPrompt(null)}>
                    <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedPrompt(null)}>✕</button>
                        <div className="modal-header">
                            <span className="tag-badge" style={{ marginBottom: '1rem', display: 'inline-block' }}>{selectedPrompt.category_name}</span>
                            <h2 style={{ fontSize: '1.8rem' }}>{selectedPrompt.title}</h2>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contenido del Prompt:</label>
                                <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => copyToClipboard(selectedPrompt.content)}>
                                    <Copy size={14} /> Copiar Prompt
                                </button>
                            </div>
                            <div className="prompt-full-content">
                                {selectedPrompt.content}
                            </div>
                            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem' }}>
                                {selectedPrompt.tags?.split(',').map(tag => (
                                    <span key={tag} className="tag-badge">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
