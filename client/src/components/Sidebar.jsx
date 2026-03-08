import React from 'react';

const Sidebar = ({ categories, activeCategory, setActiveCategory }) => {
    return (
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
    );
};

export default Sidebar;
