// SongCard.js
import React, { useState } from 'react';
import PlaylistSelectionDropdown from './PlaylistSelectionDropdown';
import axios from 'axios';

const SongCard = ({ song, setSong, handleAddToPlaylist, showPlaylistDropdown, userPlaylists, setUserPlaylists, setShowPlaylistDropdown }) => {
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  const handleClick = () => {
    setSong(song);
  };

  const handleCreatePlaylist = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/api/playlists`, {
        title: newPlaylistTitle,
        username: localStorage.getItem('username'),
      });

      const newPlaylist = response.data;
      setUserPlaylists([...userPlaylists, newPlaylist]);
      setNewPlaylistTitle('');
      setShowPlaylistDropdown(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Handle error
    }
  };

  return (
    <div
      key={song._id}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px',
        cursor: 'pointer',
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      onClick={handleClick}
    >
      <h3>{song.title}</h3>
      <p>Artist: {song.artist}</p>
      <p>Album: {song.album}</p>
      <p>Duration: {song.duration} seconds</p>
      {/* Button to add the song to a playlist */}
      <button onClick={() => setShowPlaylistDropdown(true)}>Add to Playlist</button>
      {showPlaylistDropdown && (
        <PlaylistSelectionDropdown
          playlists={userPlaylists}
          onCreatePlaylist={handleCreatePlaylist}
          onAddToExistingPlaylist={(playlistId) => {
            handleAddToPlaylist(song._id, playlistId);
            setShowPlaylistDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default SongCard;
