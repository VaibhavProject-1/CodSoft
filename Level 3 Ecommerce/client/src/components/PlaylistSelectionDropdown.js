// PlaylistSelectionDropdown.js
import React, { useState } from 'react';
import './PlaylistSelectionDropdown.css'; // Import the CSS file for styling
import Swal from 'sweetalert2';

const PlaylistSelectionDropdown = ({ playlists, onCreatePlaylist, onAddToExistingPlaylist }) => {
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showCreatePlaylistInput, setShowCreatePlaylistInput] = useState(false);

  const handleCreatePlaylist = () => {
    if (newPlaylistTitle.trim() !== '') {
      onCreatePlaylist(newPlaylistTitle);
      setNewPlaylistTitle('');
      Swal.fire({
        icon: 'success',
        title: 'Playlist Created!',
        text: `Playlist Title: ${newPlaylistTitle}`,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleAddToExistingPlaylist = (playlistId) => {
    onAddToExistingPlaylist(playlistId);
    Swal.fire({
      icon: 'success',
      title: 'Song Added to Playlist!',
      text: `Playlist ID: ${playlistId}`,
      showConfirmButton: false,
      timer: 1500,
    });

  };

  return (
    <div className="playlist-dropdown">
      <select className="playlist-select" onChange={(e) => handleAddToExistingPlaylist(e.target.value)}>
        <option value="" className="playlist-option">
          Select Playlist
        </option>
        {playlists.map((playlist) => (
          <option key={playlist._id} value={playlist._id} className="playlist-option">
            {playlist.title}
          </option>
        ))}
      </select>
      <button className="create-playlist-btn" onClick={() => setShowCreatePlaylistInput(true)}>
        Create Playlist
      </button>
      {showCreatePlaylistInput && (
        <>
          <input
            type="text"
            placeholder="New Playlist Title"
            value={newPlaylistTitle}
            onChange={(e) => setNewPlaylistTitle(e.target.value)}
            className="playlist-input"
          />
          <button className="create-playlist-btn" onClick={handleCreatePlaylist}>
            Create
          </button>
        </>
      )}
    </div>
  );
};

export default PlaylistSelectionDropdown;