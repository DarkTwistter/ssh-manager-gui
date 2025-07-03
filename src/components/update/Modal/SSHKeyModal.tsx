import React, { useState } from 'react';
import './modal.css';
import { SSHKey } from '../../../types/config';

interface SSHKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: SSHKey) => void;
}

const SSHKeyModal: React.FC<SSHKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');

  const handleSave = () => {
    if (name && privateKey && publicKey) {
      onSave({ name, privateKey, publicKey });
      setName('');
      setPrivateKey('');
      setPublicKey('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Добавить SSH ключ</h3>
        <input
          className="modal-input"
          placeholder="Имя ключа"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          className="modal-input"
          placeholder="Приватный ключ"
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
        />
        <textarea
          className="modal-input"
          placeholder="Публичный ключ"
          value={publicKey}
          onChange={e => setPublicKey(e.target.value)}
        />
        <div className="modal-actions">
          <button
            className="modal-btn"
            onClick={handleSave}
            disabled={!name || !privateKey || !publicKey}
          >
            Сохранить
          </button>
          <button className="modal-btn" onClick={onClose}>Отмена</button>
        </div>
      </div>
    </div>
  );
};

export default SSHKeyModal;
