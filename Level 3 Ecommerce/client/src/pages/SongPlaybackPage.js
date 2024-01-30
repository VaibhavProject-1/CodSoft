// SongPlaybackPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SongPlayer from './SongPlayer';
import PlaylistSelectionDropdown from '../components/PlaylistSelectionDropdown';
import { usePlayer } from '../contexts/PlayerContext';
import Swal from 'sweetalert2';
import SongCard from '../components/SongCard';

const SongPlaybackPage = ({ localSongs }) => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const { selectedSong, setSong } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchedSongs, setFetchedSongs] = useState([]);


  useEffect(() => {
    // Fetch songs and user playlists when the component mounts
    const fetchSongsAndPlaylists = async () => {
      try {
        // const storedSongs = JSON.parse(localStorage.getItem('songs')) || [];
        // setSongs(storedSongs);
  
        setSongs(localSongs || []);
        const songsResponse = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/songs`, {
          params: {
            username: username,
          },
          headers: {
            mode: 'cors',
            credentials: 'include',
            username: username,
          },
        });
  
        const playlistsResponse = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/playlists`, {
          headers: {
            username: username,
          },
        });
  
        setSongs(songsResponse.data);
        // console.log("Song response: " + JSON.stringify(songsResponse));
        setUserPlaylists(playlistsResponse.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching Data',
          text: 'There was an error fetching songs or playlists. Please try again later.',
        });
      }
    };
  
    fetchSongsAndPlaylists();
  }, [username,localSongs]);

  const handleAddToPlaylist = async (songId, playlistId) => {
    try {
      // console.log('Adding song to playlist. Playlist ID:', playlistId, 'Song ID:', songId);

      // Make a request to add the song to the playlist
      const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/api/playlists/${playlistId}/add-song/${songId}`, {
        headers: {
          'Content-Type': 'application/json',
          'username': localStorage.getItem('username'),
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Song Added',
        text: 'The song was added to the playlist successfully.',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add the song to the playlist. Please try again later.',
      });

      // Handle the error and display a user-friendly message
      if (error.response && error.response.status === 400) {
        // Bad Request (duplicate song)
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Song',
          text: 'This song is already in the playlist.',
        });
      } else {
        // Other errors
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add the song to the playlist. Please try again later.',
        });
      }
    }
  };

  useEffect(() => {
    // Filter songs based on the search query (ignore casing)
    const filtered = songs.filter(song =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSongs(filtered);
  }, [songs, searchQuery]);
  

  return (
    <div>
      <h2>Song Playback</h2>
      <input
        type="text"
        placeholder="Search songs"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {filteredSongs.map((song) => (
            <SongCard
              key={song._id}
              song={song}
              setSong={setSong}
              handleAddToPlaylist={handleAddToPlaylist}
              showPlaylistDropdown={showPlaylistDropdown}
              userPlaylists={userPlaylists}
              setShowPlaylistDropdown={setShowPlaylistDropdown}
            />
          ))}
        </div>
      </div>
      <SongPlayer selectedSong={selectedSong} localSongs={songs} />
    </div>
  );
};

export default SongPlaybackPage;
