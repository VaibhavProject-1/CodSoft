import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SongPlayer from './SongPlayer';
import SongPlaybackPage from './SongPlaybackPage';

const SongManager = () => {
  const [localSongs, setLocalSongs] = useState([]);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/songs`, {
          params: {
            username: localStorage.getItem('username'),
          },
          headers: {
            mode: 'cors',
            credentials: 'include',
            username: localStorage.getItem('username'),
          },
        });
        setLocalSongs(response.data);
        console.log("Local Songs: ",response.data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div>
      <SongPlayer localSongs={localSongs} />
      <SongPlaybackPage localSongs={localSongs} />
    </div>
  );
};

export default SongManager;
