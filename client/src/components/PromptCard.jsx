import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PromptCard = ({ prompt, setSelectedPrompt }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e, text) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // UI Feedback reset
    };

    return (
        <div className="prompt-card glass-panel" onClick={() => setSelectedPrompt(prompt)}>
            <div className="prompt-header">
                <h3 className="prompt-title">{prompt.title}</h3>
                <span className="tag-badge">{prompt.category_name}</span>
            </div>
            <p className="prompt-preview">{prompt.content}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {prompt.tags?.split(',').filter(t => t.trim()).map(tag => (
                        <span key={tag} className="tag-badge" style={{ background: 'transparent', border: '1px solid var(--glass-border)', fontSize: '0.6rem' }}>#{tag.trim()}</span>
                    ))}
                </div>
                <button className="btn copy-button" onClick={(e) => handleCopy(e, prompt.content)}>
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
            </div>
        </div>
    );
};

export default PromptCard;
