import React, { useState, useEffect } from 'react';
import './modal.css';
import './form.css';
import './select.css';
import './test-button.css';
import { SSHKey, Group } from '../../../types/config';

interface Server {
  id: string;
  name: string;
  host: string;
  port: number;
  username: string;
  password?: string;
  keyName?: string;
  keyValue?: string;
  groupId?: string;
}

interface ServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: Server) => void;
  sshKeys: SSHKey[];
  groups: Group[];
  editServer?: Server | null;
}

const generateId = () => `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const ServerModal: React.FC<ServerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  sshKeys,
  groups,
  editServer
}) => {
  const [name, setName] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState(22);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keyName, setKeyName] = useState('');
  const [useKey, setUseKey] = useState(false);
  const [groupId, setGroupId] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'none' | 'success' | 'error' | 'testing'>('none');

  // Инициализация полей при редактировании
  useEffect(() => {
    if (editServer) {
      setName(editServer.name);
      setHost(editServer.host);
      setPort(editServer.port);
      setUsername(editServer.username);
      setPassword(editServer.password || '');
      setKeyName(editServer.keyName || '');
      setUseKey(!!editServer.keyName);
      setGroupId(editServer.groupId || '');
    } else {
      // Сброс полей при создании нового сервера
      setName('');
      setHost('');
      setPort(22);
      setUsername('');
      setPassword('');
      setKeyName('');
      setUseKey(false);
      setGroupId('');
    }
  }, [editServer, isOpen]);

  // Сброс статуса теста при изменении формы
  useEffect(() => {
    setTestStatus('none');
  }, [name, host, port, username, password, keyName, useKey]);

  const handleSave = () => {
    if (name && host && username && (useKey ? keyName : password)) {
      const selectedKey = sshKeys.find(k => k.name === keyName);
      onSave({
        id: editServer?.id || generateId(),
        name,
        host,
        port,
        username,
        password: useKey ? undefined : password,
        keyName: useKey ? keyName : undefined,
        keyValue: useKey ? selectedKey?.privateKey : undefined,
        groupId: groupId || undefined
      });
      onClose();
    }
  };

  const handleTest = async () => {
    if (!host || !username || (!useKey && !password) || (useKey && !keyName)) {
      return;
    }

    setTestStatus('testing');
    const selectedKey = sshKeys.find(k => k.name === keyName);

    try {
      const result = await window.electronAPI.testSSHConnection({
        host,
        port,
        username,
        password: useKey ? undefined : password,
        keyValue: useKey ? selectedKey?.privateKey : undefined
      });

      setTestStatus(result.success ? 'success' : 'error');
    } catch (error) {
      setTestStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{editServer ? 'Edit server' : 'Add server'}</h3>
        <input
          className="modal-input"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="modal-input"
          placeholder="Host"
          value={host}
          onChange={e => setHost(e.target.value)}
        />
        <input
          className="modal-input"
          placeholder="Port"
          type="number"
          value={port}
          onChange={e => setPort(Number(e.target.value))}
        />
        <input
          className="modal-input"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <div className="select-wrapper">
          <select
            className="custom-select"
            value={groupId}
            onChange={e => setGroupId(e.target.value)}
          >
            <option value="">No group</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-checkbox">
          <label>
            <input
              type="checkbox"
              checked={useKey}
              onChange={e => setUseKey(e.target.checked)}
            /> Use SSH key
          </label>
        </div>
        {useKey && (
          <div className="select-wrapper">
            <select
              className="custom-select"
              value={keyName}
              onChange={e => setKeyName(e.target.value)}
            >
              <option value="">Select key</option>
              {sshKeys.map(key => (
                <option key={key.name} value={key.name}>{key.name}</option>
              ))}
            </select>
          </div>
        )}
        {!useKey && (
          <input
            className="modal-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        )}
        <div className="button-group justify-between">
          <button
            className={`modal-btn test-button ${
              testStatus === 'success' ? 'success' :
              testStatus === 'error' ? 'error' :
              testStatus === 'testing' ? 'testing' : ''
            }`}
            onClick={handleTest}
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'success' ? '✓ Success' :
             testStatus === 'error' ? '✕ Error' :
             testStatus === 'testing' ? 'Testing...' : 'Test'}
          </button>
          <button className="modal-btn" onClick={handleSave}>
            {editServer ? 'Save' : 'Add'}
          </button>
          <button className="modal-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ServerModal;
