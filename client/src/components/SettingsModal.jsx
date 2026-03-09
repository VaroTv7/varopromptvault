import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

const SettingsModal = ({
    isSettingsOpen,
    setIsSettingsOpen,
    settingsTab,
    setSettingsTab,
    managingCategories,
    editingCategory,
    setEditingCategory,
    handleRenameCategory,
    handleDeleteCategory,
    newCategoryName,
    setNewCategoryName,
    handleAddCategory,
    handleExportData,
    aiSettings,
    setAiSettings
}) => {
    if (!isSettingsOpen) return null;

    return (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
            <div className="modal-content glass-panel" style={{ maxWidth: '800px', width: '90%', minHeight: '550px' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setIsSettingsOpen(false)}>✕</button>

                <div style={{ display: 'flex', gap: '2rem', height: '100%' }}>
                    {/* Settings Sidebar */}
                    <div style={{ width: '200px', borderRight: '1px solid var(--glass-border)', paddingRight: '1rem' }}>
                        <h3 style={{ marginBottom: '2rem' }}>Ajustes</h3>
                        <div
                            className={`nav-item ${settingsTab === 'general' ? 'active' : ''}`}
                            onClick={() => setSettingsTab('general')}
                        >General</div>
                        <div
                            className={`nav-item ${settingsTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setSettingsTab('categories')}
                        >Categorías</div>
                        <div
                            className={`nav-item ${settingsTab === 'ia' ? 'active' : ''}`}
                            onClick={() => setSettingsTab('ia')}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Sparkles size={16} />
                            IA & Conectividad
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div style={{ flex: 1, padding: '1rem 0' }}>
                        {settingsTab === 'general' ? (
                            <div className="settings-section">
                                <h4>Configuración General</h4>
                                <div style={{ marginTop: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.6 }}>Nombre de la Bóveda</label>
                                    <input className="search-input" value="VaroPromptVault" readOnly style={{ width: '100%', marginBottom: '2rem' }} />
                                </div>
                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2rem' }}>
                                    <h4>Copias de Seguridad</h4>
                                    <p style={{ opacity: 0.6, fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                        Exporta todos tus prompts y categorías a un archivo local .json para tener un respaldo seguro de tu conocimiento.
                                    </p>
                                    <button
                                        className="btn btn-primary"
                                        style={{ marginTop: '1rem' }}
                                        onClick={handleExportData}
                                    >
                                        Exportar Backup (JSON)
                                    </button>
                                </div>
                            </div>
                        ) : settingsTab === 'ia' ? (
                            <div className="settings-section">
                                <h4>IA & Conectividad</h4>
                                <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                    Configura los motores de IA para las funciones de refinamiento y personalización con Ollama o APIs externas.
                                </p>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Ollama Endpoint (Local)</label>
                                    <input
                                        className="search-input"
                                        value={aiSettings.ollamaUrl}
                                        onChange={e => setAiSettings({ ...aiSettings, ollamaUrl: e.target.value })}
                                        placeholder="http://localhost:11434"
                                        style={{ width: '100%' }}
                                    />
                                    <small style={{ opacity: 0.4 }}>Configuración por defecto para LLMs locales.</small>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>Modelo por Defecto</label>
                                    <input
                                        className="search-input"
                                        value={aiSettings.defaultModel}
                                        onChange={e => setAiSettings({ ...aiSettings, defaultModel: e.target.value })}
                                        placeholder="llama3, mistral, etc."
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>OpenAI API Key (Opcional)</label>
                                    <input
                                        type="password"
                                        className="search-input"
                                        value={aiSettings.openaiKey}
                                        onChange={e => setAiSettings({ ...aiSettings, openaiKey: e.target.value })}
                                        placeholder="sk-..."
                                        style={{ width: '100%' }}
                                    />
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
                                                        style={{ flex: 1, margin: 0, padding: '2px 5px', background: 'var(--glass-bg)', border: '1px solid var(--accent-primary)' }}
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
                                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                                    />
                                    <button className="btn btn-primary" onClick={handleAddCategory}>Añadir</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
