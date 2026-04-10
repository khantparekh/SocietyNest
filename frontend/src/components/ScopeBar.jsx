import React from 'react';
import { Layers } from 'lucide-react';

// Reusable wing/society scope switcher bar
export function ScopeBar({ scope, setScope, wingName, label }) {
  if (!wingName) return null; // guards and superadmins don't see this
  return (
    <div className="scope-bar">
      <div className="scope-bar-info">
        <Layers size={14} color="var(--primary)" />
        <span>
          {label || 'Showing'}: <strong style={{ color:'var(--text)' }}>
            {scope === 'wing' ? `Wing ${wingName}` : 'All Wings (Society)'}
          </strong>
        </span>
      </div>
      <div className="scope-tabs">
        <button className={`scope-tab${scope==='wing'?' active':''}`} onClick={() => setScope('wing')}>
          My Wing
        </button>
        <button className={`scope-tab${scope==='society'?' active':''}`} onClick={() => setScope('society')}>
          Society
        </button>
      </div>
    </div>
  );
}