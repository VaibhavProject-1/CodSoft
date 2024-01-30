import React, { useState, useEffect } from 'react';
import "./PlaylistSidebar.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { usePlayer } from '../contexts/PlayerContext';
import SongPlayer from '../pages/SongPlayer';
import Swal from 'sweetalert2';


const PlaylistSidebar = () => {
  const username = localStorage.getItem('username');
  const [playlists, setPlaylists] = useState([]);
  const { setSong } = usePlayer();
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');
  const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedPlaylistSongs, setSelectedPlaylistSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [playedOnce, setPlayedOnce] = useState(false); 

  const fetchPlaylists = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists`, {
        headers: {
          'Content-Type': 'application/json',
          username: username,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
        });
        throw new Error(errorMessage.error || 'Unknown error');
      }

      const data = await response.json();
      // console.log('Fetched playlists:', data);
      setPlaylists(data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error fetching playlists: ${error.message}`,
      });
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [username]);

  const handleAddToPlaylist = (playlistId) => {
    setSelectedPlaylist(playlistId);
    // Implement your logic to handle adding to the playlist
    Swal.fire({
      icon: 'success',
      title: 'Song Added',
      text: 'The song has been added to the playlist successfully.',
    });
    setShowAddToPlaylistModal(false);
  };

  const fetchPlaylistSongs = async (playlistId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists/${playlistId}/songs`, {
        headers: {
          'Content-Type': 'application/json',
          username: localStorage.getItem('username'),
        },
      });


      if (!response.ok) {
        const errorMessage = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch playlist songs. Please try again later.',
        });
        throw new Error(errorMessage.error || 'Unknown error');
      }

      const songs = await response.json();
      
      // console.log('Fetched playlist songs:', songs);
      setSelectedPlaylistSongs(songs);
      return songs;
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error fetching playlist songs: ${error.message}`,
      });
    }
  };

  const handleCreatePlaylist = async () => {
    if (newPlaylistTitle.trim() !== '') {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            username: localStorage.getItem('username'),
          },
          body: JSON.stringify({
            title: newPlaylistTitle,
          }),
        });
  
        if (!response.ok) {
          const errorMessage = await response.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to create playlist. Please try again later.',
          });
          throw new Error(errorMessage.error || 'Unknown error');
        }
  
        const createdPlaylist = await response.json();
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Playlist created successfully.',
          footer: `Playlist created: ${newPlaylistTitle}, User: ${localStorage.getItem('username')}`,
        });
        setNewPlaylistTitle('');
        setSelectedPlaylist(createdPlaylist._id);
        setShowAddToPlaylistModal(false);
        // Fetch songs for the created playlist
        await fetchPlaylistSongs(createdPlaylist._id);
        
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create playlist. Please try again later.',
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Playlist title cannot be empty',
      });
    }
  };

  const handlePlayPlaylist = async (playlistId) => {
    try {
      // console.log('Fetching songs for playlist:', playlistId);
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists/${playlistId}/songs`, {
        headers: {
          'Content-Type': 'application/json',
          username: username,
        },
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch playlist songs. Please try again later.',
        });
        throw new Error(errorMessage.error || 'Unknown error');
      }
  
      const songs = await response.json();
      // console.log('Fetched playlist songs:', songs);
      setSelectedPlaylistSongs(songs);
      // console.log("Songs from playlist:", songs);
  
      // Play the first song in the playlist
      if (songs.length > 0) {
        setSong(songs[0]); // Set the first song as the selected song
        setSelectedSong(songs[0]); // Update selectedSong state
        setPlayedOnce(true); // Update playedOnce state
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error fetching playlist songs: ${error.message}`,
      });
    }
  };
  


  const handleDeletePlaylist = async (playlistId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          username: localStorage.getItem('username'),
        },
      });
  
      if (!response.ok) {
        const errorMessage = await response.json();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete playlist. Please try again later.',
        });
        throw new Error(errorMessage.error || 'Unknown error');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Playlist deleted successfully',
      });
  
      // After deleting the playlist, you may want to refetch the updated list of playlists
      fetchPlaylists();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the playlist. Please try again later.',
      });
    }
  };

  const handleDeleteSong = async (playlistId, songId) => {
    try {
        // console.log("Removing from playlist: ",playlistId);
        // console.log("Removing Song: ",songId);
        const response = await fetch(`${process.env.REACT_APP_BACK_URL}/api/playlists/${playlistId}/remove-song/${songId}`, {
            method: 'PUT', // Use the PUT method
            headers: {
                'Content-Type': 'application/json',
                username: localStorage.getItem('username'),
            },
        });

        if (!response.ok) {
            const errorMessage = await response.json();
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to remove song from playlist',
              footer: errorMessage, // Display the error message in the footer
            });
            throw new Error(errorMessage.error || 'Unknown error');
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Song removed successfully from playlist',
        });

        // After removing the song, refetch the updated list of songs in the playlist
        await fetchPlaylistSongs(playlistId);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to remove the song from the playlist. Please try again later.',
      });
    }
};

const handlePrevious = () => {
  // console.log("Handle Previous from playlist");
  const currentIndex = selectedPlaylistSongs.findIndex((song) => song._id === selectedSong._id);
  // console.log("Current index from previous playlist:", currentIndex);
  const previousSong = currentIndex > 0 ? selectedPlaylistSongs[currentIndex - 1] : null;
  if (previousSong) {
    setSong(previousSong);
    setSelectedSong(previousSong);
  }
};

const handleNext = () => {
  // console.log("Handle Next from playlist");
  const currentIndex = selectedPlaylistSongs.findIndex((song) => song._id === selectedSong._id);
  // console.log("Current index from next playlist :",currentIndex);
  if (currentIndex < selectedPlaylistSongs.length - 1) {
    const nextSong = selectedPlaylistSongs[currentIndex + 1];
    setSong(nextSong);
    setSelectedSong(nextSong);
  }
};

useEffect(() => {
  // Fetch playlist songs when selectedPlaylist changes
  if (selectedPlaylist) {
    fetchPlaylistSongs(selectedPlaylist);
  }
}, [selectedPlaylist]);


return (
  <div className="playlist-sidebar">
    <div className="song-player-container">
      {/* Pass the selected playlist songs to the SongPlayer component */}
      <SongPlayer
        selectedSong={playedOnce ? selectedSong : selectedPlaylistSongs[0]}
        songs={selectedPlaylistSongs}
        customHandlePrevious={handlePrevious} // Rename handlePrevious to customHandlePrevious
        customHandleNext={handleNext} // Rename handleNext to customHandleNext
        fromPlaylistSidebar={true}
        disableDefaultHandlers={true}
      />
    </div>
    <div>
      <h3>Your Playlists</h3>
      <ul>
        {playlists.map((playlist) => (
          <li
            key={playlist._id}
            className={selectedPlaylist === playlist._id ? "selected" : ""}
          >
            <div className="playlist-item">
              <button
                className="playlist-button"
                onClick={() => setSelectedPlaylist(playlist._id)}
              >
                {playlist.title}
              </button>
              <div className="playlist-buttons">
                <button
                  className="play-playlist-button"
                  onClick={() => handlePlayPlaylist(playlist._id)}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
                <button
                  className="delete-playlist-button"
                  onClick={() => handleDeletePlaylist(playlist._id)}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              </div>
            </div>
            {selectedPlaylist === playlist._id && (
              <ul className="playlist-songs">
                {playlist.songs.map((song) => (
                  <li key={song._id}>
                    {song.title}
                    <button
                      className="delete-song-button"
                      onClick={() => handleDeleteSong(playlist._id, song._id)}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <button onClick={() => setShowAddToPlaylistModal(true)}>
        Create Playlist
      </button>
    </div>
    {showAddToPlaylistModal && (
      <div className="add-to-playlist-modal">
        <button onClick={() => setShowAddToPlaylistModal(false)}>Close</button>
        <div>
          <h3>Choose a Playlist or Create a New One</h3>
          <ul>
            {playlists.map((playlist) => (
              <li
                key={playlist._id}
                onClick={() => handleAddToPlaylist(playlist._id)}
              >
                {playlist.title}
              </li>
            ))}
          </ul>
          <input
            type="text"
            placeholder="New Playlist Title"
            value={newPlaylistTitle}
            onChange={(e) => setNewPlaylistTitle(e.target.value)}
          />
          <button onClick={handleCreatePlaylist}>Create Playlist</button>
        </div>
      </div>
    )}
    
  </div>
);

};

export default PlaylistSidebar;