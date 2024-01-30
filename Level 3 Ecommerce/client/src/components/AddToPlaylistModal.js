// AddToPlaylistModal.js
import React, { useState } from 'react';

const AddToPlaylistModal = ({ playlists, onAddToPlaylist, onClose }) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState('');

  const handleAddToPlaylist = () => {
    if (selectedPlaylist) {
      onAddToPlaylist(selectedPlaylist);
      onClose();
    }
  };

  return (
    <div className="add-to-playlist-modal">
      <h3>Select Playlist</h3>
      <ul>
        {playlists.map((playlist) => (
          <li key={playlist._id} onClick={() => setSelectedPlaylist(playlist._id)}>
            {playlist.title}
          </li>
        ))}
      </ul>
      <button onClick={handleAddToPlaylist}>Add to Playlist</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default AddToPlaylistModal;
