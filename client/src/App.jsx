import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Settings } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import PromptCard from './components/PromptCard';
import CreatePromptModal from './components/CreatePromptModal';
import PromptDetailModal from './components/PromptDetailModal';
import SettingsModal from './components/SettingsModal';

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

    // Global Hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsAdding(false);
                setIsSettingsOpen(false);
                setSelectedPrompt(null);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                setIsAdding(true);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search').focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

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
                        id="global-search"
                        type="text"
                        className="search-input"
                        placeholder="Buscar en tu archivo (Ctrl+K)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" onClick={() => setIsAdding(true)} title="Ctrl+N">
                        <Plus size={18} /> Nuevo Prompt
                    </button>
                    <button className="btn" style={{ padding: '0.5rem' }} onClick={() => setIsSettingsOpen(true)}>
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="main-layout">
                <Sidebar
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                />

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
                                <PromptCard
                                    key={prompt.id}
                                    prompt={prompt}
                                    setSelectedPrompt={setSelectedPrompt}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <CreatePromptModal
                isAdding={isAdding}
                setIsAdding={setIsAdding}
                newPrompt={newPrompt}
                setNewPrompt={setNewPrompt}
                handleAddPrompt={handleAddPrompt}
                categories={categories}
            />

            <PromptDetailModal
                selectedPrompt={selectedPrompt}
                setSelectedPrompt={setSelectedPrompt}
                editingPrompt={editingPrompt}
                setEditingPrompt={setEditingPrompt}
                handleUpdatePrompt={handleUpdatePrompt}
                categories={categories}
                comments={comments}
                history={history}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                copyToClipboard={copyToClipboard}
            />

            <SettingsModal
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                settingsTab={settingsTab}
                setSettingsTab={setSettingsTab}
                managingCategories={managingCategories}
                editingCategory={editingCategory}
                setEditingCategory={setEditingCategory}
                handleRenameCategory={handleRenameCategory}
                handleDeleteCategory={handleDeleteCategory}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                handleAddCategory={handleAddCategory}
            />
        </div>
    );
};

export default App;
