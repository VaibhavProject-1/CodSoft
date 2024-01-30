// AdminPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SongForm from './SongForm';
import SongList from './SongList';
import Swal from 'sweetalert2';


const AdminPage = () => {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    // Fetch songs from the server
    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/admin/songs`);
        setSongs(response.data);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch songs. Please try again later.',
        });
      }
    };

    fetchSongs();
  }, []);

  const handleAddOrUpdateSong = async (formData) => {
    try {
      if (selectedSong) {
        // Update existing song
        await axios.put(`${process.env.REACT_APP_BACK_URL}/admin/songs/${selectedSong._id}`, formData);
      } else {
        // Add new song
        await axios.post(`${process.env.REACT_APP_BACK_URL}/admin/songs`, formData);
      }

      // Refresh the song list
      const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/admin/songs`);
      setSongs(response.data);

      // Clear the selected song
      setSelectedSong(null);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add/update the song. Please try again later.',
      });
    }
  };

  const handleEditSong = (song) => {
    setSelectedSong(song);
  };

  const handleDeleteSong = async (songId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACK_URL}/admin/songs/${songId}`);
      // Refresh the song list
      const response = await axios.get('/admin/songs');
      setSongs(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete the song. Please try again later.',
      });
    }
  };

  return (
    <div>
      <h2>Song Management</h2>
      <SongForm onSubmit={handleAddOrUpdateSong} initialData={selectedSong} />
      <SongList songs={songs} onEdit={handleEditSong} onDelete={handleDeleteSong} />
    </div>
  );
};

export default AdminPage;