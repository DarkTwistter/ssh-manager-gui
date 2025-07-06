import React, { useState } from 'react';
import { FiPlus, FiKey, FiChevronLeft, FiChevronRight, FiLayers } from 'react-icons/fi';
import '../components/app-ui.css';

interface SidebarProps {
  onAddServer: () => void;
  onManageKeys: () => void;
  onManageGroups: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddServer, onManageKeys, onManageGroups }) => {
  const [collapsed, setCollapsed] = useState(true); // По умолчанию свернут

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">SSH Manager</h2>}
        <button className="sidebar-toggle" onClick={() => setCollapsed(v => !v)}>
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>
      <button className="sidebar-btn" onClick={onAddServer} title="Add server">
        <FiPlus className="sidebar-icon" />
        {!collapsed && 'Add server'}
      </button>
      <button className="sidebar-btn" onClick={onManageKeys} title="SSH keys">
        <FiKey className="sidebar-icon" />
        {!collapsed && 'SSH keys'}
      </button>
      <button className="sidebar-btn" onClick={onManageGroups} title="Groups">
        <FiLayers className="sidebar-icon" />
        {!collapsed && 'Groups'}
      </button>
    </aside>
  );
};

export default Sidebar;
