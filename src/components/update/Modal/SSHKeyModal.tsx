import React, { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import './modal.css';
import './form.css';
import { SSHKey } from '../../../types/config';

interface SSHKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: SSHKey) => void;
  onDelete: (name: string) => void;
  sshKeys: SSHKey[];
}

const SSHKeyModal: React.FC<SSHKeyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  sshKeys
}) => {
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleSave = () => {
    if (name && privateKey) {
      onSave({
        name,
        privateKey,
        publicKey: '' // Оставляем пустым, так как не используем
      });
      setName('');
      setPrivateKey('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>SSH Keys</h3>
        <div className="ssh-keys-form">
          <input
            className="modal-input"
            placeholder="Key name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <textarea
            className="modal-input"
            placeholder="Private key"
            value={privateKey}
            onChange={e => setPrivateKey(e.target.value)}
            rows={4}
          />
          <button
            className="modal-btn"
            onClick={handleSave}
            disabled={!name || !privateKey}
          >
            Add key
          </button>
        </div>

        <div className="ssh-keys-list">
          <h4>Added keys:</h4>
          {sshKeys.length === 0 ? (
            <div className="empty-keys">No keys added</div>
          ) : (
            sshKeys.map(key => (
              <div key={key.name} className="ssh-key-item">
                <span>{key.name}</span>
                <button
                  className="key-delete-btn"
                  onClick={() => onDelete(key.name)}
                  title="Delete key"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SSHKeyModal;
