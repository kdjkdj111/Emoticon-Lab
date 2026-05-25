import React from 'react';

const SlotItem = React.memo(({ slot, onRemove, isUploading }) => {
  return (
    <div 
      className={`grid-slot-v2 ${slot.file ? 'has-file' : ''}`} 
      onClick={() => {
        if (!isUploading) onRemove(slot.id);
      }}
    >
      <div className="slot-number-v2">{slot.id}</div>
      {slot.previewUrl && (
        <div className="slot-image-preview real-image">
          <img src={slot.previewUrl} alt={`slot-${slot.id}`} loading="lazy" />
        </div>
      )}
    </div>
  );
});

export default SlotItem;
