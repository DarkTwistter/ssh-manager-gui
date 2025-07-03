import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Main from './components/Main';
import SSHKeyModal from './components/update/Modal/SSHKeyModal';
import ServerModal from './components/update/Modal/ServerModal';
import GroupModal from './components/update/Modal/GroupModal';
import ConfirmModal from './components/update/Modal/ConfirmModal';
import { SSHKey, Server, Group } from './types/config';
import './App.css';
import './components/app-ui.css';

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: Server) => void;
  sshKeys: SSHKey[];
  groups: Group[];
  editServer?: Server | null;
}

function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [sshKeys, setSSHKeys] = useState<SSHKey[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showServerModal, setShowServerModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [serverToDelete, setServerToDelete] = useState<Server | null>(null);

  // Загрузка данных при старте приложения
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedServers, loadedKeys, loadedGroups] = await Promise.all([
          window.electronAPI.getServers(),
          window.electronAPI.getSSHKeys(),
          window.electronAPI.getGroups()
        ]);

        setServers(loadedServers);
        setSSHKeys(loadedKeys);
        setGroups(loadedGroups);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleAddServer = async (server: Server) => {
    try {
      await window.electronAPI.addServer(server);
      const updatedServers = await window.electronAPI.getServers();
      setServers(updatedServers);
      setShowServerModal(false);
    } catch (error) {
      console.error('Error adding server:', error);
    }
  };

  const handleUpdateServer = async (server: Server) => {
    try {
      await window.electronAPI.updateServer(server.id, server);
      const updatedServers = await window.electronAPI.getServers();
      setServers(updatedServers);
      setShowServerModal(false);
      setEditingServer(null);
    } catch (error) {
      console.error('Error updating server:', error);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      await window.electronAPI.removeServer(serverId);
      setServers(prevServers => prevServers.filter(server => server.id !== serverId));
      setServerToDelete(null);
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const handleAddKey = async (key: SSHKey) => {
    try {
      await window.electronAPI.addSSHKey(key);
      const updatedKeys = await window.electronAPI.getSSHKeys();
      setSSHKeys(updatedKeys);
      setShowKeyModal(false);
    } catch (error) {
      console.error('Error adding SSH key:', error);
    }
  };

  const handleDeleteKey = async (name: string) => {
    try {
      await window.electronAPI.removeSSHKey(name);
      const updatedKeys = await window.electronAPI.getSSHKeys();
      setSSHKeys(updatedKeys);
    } catch (error) {
      console.error('Error deleting SSH key:', error);
    }
  };

  const handleAddGroup = async (group: Group) => {
    try {
      await window.electronAPI.addGroup(group);
      const updatedGroups = await window.electronAPI.getGroups();
      setGroups(updatedGroups);
      setShowGroupModal(false);
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleUpdateGroup = async (id: string, group: Group) => {
    try {
      await window.electronAPI.updateGroup(id, group);
      const updatedGroups = await window.electronAPI.getGroups();
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await window.electronAPI.removeGroup(id);
      const updatedGroups = await window.electronAPI.getGroups();
      setGroups(updatedGroups);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  // Запуск терминала через Electron
  const handleServerClick = (server: Server) => {
    window.electronAPI?.openSSH(server);
  };

  const handleDeleteServerModal = (server: Server) => {
    setServerToDelete(server);
  };

  const handleConfirmDelete = () => {
    if (serverToDelete) {
      handleDeleteServer(serverToDelete.id);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        onAddServer={() => {
          setEditingServer(null);
          setShowServerModal(true);
        }}
        onManageKeys={() => setShowKeyModal(true)}
        onManageGroups={() => setShowGroupModal(true)}
      />
      <Main
        servers={servers}
        groups={groups}
        onServerClick={handleServerClick}
        onEditServer={(server) => {
          setEditingServer(server);
          setShowServerModal(true);
        }}
        onDeleteServer={handleDeleteServerModal}
      />
      <ServerModal
        isOpen={showServerModal}
        onClose={() => {
          setShowServerModal(false);
          setEditingServer(null);
        }}
        onSave={editingServer ? handleUpdateServer : handleAddServer}
        sshKeys={sshKeys}
        groups={groups}
        editServer={editingServer}
      />
      <SSHKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleAddKey}
      />
      <GroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        groups={groups}
        onSave={handleAddGroup}
      />
      <ConfirmModal
        isOpen={!!serverToDelete}
        title="Удаление сервера"
        message={`Вы действительно хотите удалить сервер "${serverToDelete?.name}"?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setServerToDelete(null)}
      />
    </div>
  );
}

export default App;
