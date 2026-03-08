import React, { useState, useEffect } from 'react';
import { Search, Plus, Copy, Tag, MessageSquare, Trash2, ExternalLink } from 'lucide-react';

const App = () => {
    const [prompts, setPrompts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    useEffect(() => {
        fetchPrompts();
        fetchCategories();
    }, [search, activeCategory]);

    const fetchPrompts = async () => {
        try {
            let url = `http://localhost:3000/api/prompts?search=${search}`;
            if (activeCategory && activeCategory !== 'Todos') {
                url += `&category=${encodeURIComponent(activeCategory)}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setPrompts(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching prompts:', err);
            // Fallback
            setPrompts([
                { id: 1, title: 'Generador de Código Python', content: 'Escribe un script en Python que realice el análisis de datos de un archivo CSV y genere una gráfica de barras usando Matplotlib.\n\nInstrucciones:\n1. Usa pandas para el análisis.\n2. Asegúrate de manejar errores de archivo no encontrado.', tags: 'python,dev', category_name: 'Programación' },
                { id: 2, title: 'Asistente de Marketing', content: 'Actúa como un experto en marketing digital con 10 años de experiencia. Redacta 5 copies variados para un anuncio de Facebook sobre un nuevo curso de IA.\n\nPúblico objetivo: Dueños de negocios pequeños.', tags: 'marketing,seo', category_name: 'Ventas' },
            ]);
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/categories');
            const data = await res.json();
            setCategories(['Todos', ...data.map(c => c.name)]);
        } catch (err) {
            setCategories(['Todos', 'Programación', 'Ventas', 'Copywriting', 'SEO']);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Visual feedback logic...
    };

    return (
        <div className="app-container">
            <header className="header glass-panel">
                <div className="logo">PromptVault</div>
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
                <button className="btn btn-primary">
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
                    {loading ? (
                        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Sincronizando archivo maestro...</div>
                    ) : (
                        <div className="stats-grid">
                            {prompts.map((prompt) => (
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
