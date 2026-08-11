import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'default', label: 'Default (Indigo)' },
  { id: 'work', label: 'Work (Blue)' },
  { id: 'personal', label: 'Personal (Green)' },
  { id: 'urgent', label: 'Urgent (Red)' },
];

const EventModal = ({ isOpen, onClose, onSave, defaultTime, initialEvent }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('default');

  // Reset or populate fields when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialEvent) {
        setTitle(initialEvent.title);
        setCategory(initialEvent.category || 'default');
      } else {
        setTitle('');
        setCategory('default');
      }
    }
  }, [isOpen, initialEvent]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({
        title,
        category,
        id: initialEvent ? initialEvent.id : undefined // pass id back if editing
      });
    }
  };

  const isEditing = !!initialEvent;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{isEditing ? 'Edit Event' : `Add Event at ${defaultTime}`}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="modal-input"
            placeholder="Event Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          
          <select 
            className="modal-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
