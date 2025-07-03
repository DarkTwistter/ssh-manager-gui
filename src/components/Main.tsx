import React, { useState } from 'react';
import { FiEdit2, FiFilter, FiTrash2 } from 'react-icons/fi';
import '../components/app-ui.css';
import './update/Modal/select.css';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  keyName?: string;
  groupId?: string;
}

interface Group {
  id: string;
  name: string;
}

interface MainProps {
  servers: Server[];
  groups: Group[];
  onServerClick: (server: Server) => void;
  onEditServer: (server: Server) => void;
  onDeleteServer: (server: Server) => void;
}

const Main: React.FC<MainProps> = ({
  servers,
  groups,
  onServerClick,
  onEditServer,
  onDeleteServer
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  const filteredServers = selectedGroupId
    ? servers.filter(server => server.groupId === selectedGroupId)
    : servers;

  const handleCardClick = (e: React.MouseEvent, server: Server) => {
    if ((e.target as HTMLElement).closest('.server-edit-btn') ||
        (e.target as HTMLElement).closest('.server-delete-btn')) {
      return;
    }
    onServerClick(server);
  };

  return (
    <main className="main">
      <div className="main-header">
        <div className="group-filter">
          <FiFilter className="filter-icon" />
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
            >
              <option value="">Все серверы</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="server-grid">
        {filteredServers.length === 0 ? (
          <div className="empty">
            {selectedGroupId ? 'В этой группе нет серверов' : 'Нет добавленных серверов'}
          </div>
        ) : (
          filteredServers.map(server => (
            <div
              key={server.id}
              className="server-card"
              onClick={(e) => handleCardClick(e, server)}
            >
              <button
                className="server-delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteServer(server);
                }}
                title="Удалить"
              >
                <FiTrash2 />
              </button>
              <button
                className="server-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditServer(server);
                }}
                title="Редактировать"
              >
                <FiEdit2 />
              </button>
              <div className="server-title">{server.name}</div>
              <div className="server-host">{server.host}:{server.port}</div>
              <div className="server-user">{server.username}</div>
              {server.groupId && (
                <div className="server-group">
                  {groups.find(g => g.id === server.groupId)?.name}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Main;
