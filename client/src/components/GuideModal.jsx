import React from 'react';
import { HelpCircle, Keyboard, Sparkles, Database, Code } from 'lucide-react';

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: 'Variables Dinámicas',
            icon: <Sparkles size={20} color="var(--accent-primary)" />,
            content: (
                <>
                    <p>¡Convierte tus prompts en plantillas inteligentes! Usa la sintaxis <code>{`{{ variable }}`}</code> en tu texto.</p>
                    <p>La app detectará automáticamente estos campos y generará un formulario para que los rellenes rápidamente antes de copiar el prompt final.</p>
                </>
            )
        },
        {
            title: 'Atajos de Teclado',
            icon: <Keyboard size={20} color="var(--accent-primary)" />,
            content: (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '0.5rem' }}><code>Ctrl + N</code> : Crear nuevo prompt instantáneamente.</li>
                    <li style={{ marginBottom: '0.5rem' }}><code>Ctrl + K</code> : Enfocar barra de búsqueda global.</li>
                    <li><code>Esc</code> : Cerrar cualquier ventana emergente.</li>
                </ul>
            )
        },
        {
            title: 'Configuración de IA (Local)',
            icon: <Code size={20} color="var(--accent-primary)" />,
            content: (
                <p>Puedes conectar <strong>Ollama</strong> u otros LLMs en la pestaña de IA de los ajustes. Esto te permite usar la función "Refinar con IA" para mejorar tus prompts con lenguaje natural.</p>
            )
        },
        {
            title: 'Copias de Seguridad',
            icon: <Database size={20} color="var(--accent-primary)" />,
            content: (
                <p>No pierdas tu conocimiento. En el menú de Ajustes (General), puedes exportar toda tu base de datos en un archivo JSON para guardarlo como respaldo seguro.</p>
            )
        }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-panel" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>✕</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <HelpCircle size={32} color="var(--accent-primary)" />
                    <h2 style={{ margin: 0 }}>Instrucciones de Uso</h2>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {sections.map((sec, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                                {sec.icon}
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{sec.title}</h3>
                            </div>
                            <div style={{ opacity: 0.8, fontSize: '0.95rem', lineHeight: '1.6' }}>
                                {sec.content}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.85rem' }}>
                    VaroPromptVault v1.5 - Diseñado para la eficiencia.
                </div>
            </div>
        </div>
    );
};

export default GuideModal;
