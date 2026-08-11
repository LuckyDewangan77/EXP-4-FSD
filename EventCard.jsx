import React from 'react';
import { Trash2 } from 'lucide-react';

const EventCard = React.memo(({ event, onDragStart, onDelete, onEdit }) => {
  const categoryClass = `cat-${event.category || 'default'}`;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e, event.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(event);
      }}
      className={`event-card ${categoryClass}`}
    >
      <div className="event-title">{event.title}</div>
      <button 
        className="delete-btn" 
        onClick={(e) => {
          e.stopPropagation(); // prevent triggering edit click
          onDelete(event.id);
        }}
        title="Delete Event"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
});

export default EventCard;
