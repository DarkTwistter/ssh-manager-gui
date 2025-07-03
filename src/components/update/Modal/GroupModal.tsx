import React, { useState } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import './modal.css';
import './form.css';
import { Group } from '../../../types/config';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Group[];
  onSave: (group: Group) => void;
}

const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, groups, onSave }) => {
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      const newGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newGroupName.trim()
      };
      onSave(newGroup);
      setNewGroupName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Группы</h3>
        <div className="group-input-container">
          <input
            className="modal-input"
            placeholder="Название новой группы"
            value={newGroupName}
            onChange={e => setNewGroupName(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleAddGroup()}
          />
          <button
            className="modal-btn add-group-btn"
            onClick={handleAddGroup}
            disabled={!newGroupName.trim()}
          >
            Добавить
          </button>
        </div>

        <div className="groups-list">
          {groups.map(group => (
            <div key={group.id} className="group-item">
              <span>{group.name}</span>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
