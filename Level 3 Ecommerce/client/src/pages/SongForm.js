// SongForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SongForm.css';
import Swal from 'sweetalert2';

const SongForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {premiumSong: false });
  const [songs, setSongs] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Use the checked property for checkboxes
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({ ...prevData, [name]: newValue }));
  };

  const handleAlbumArtChange = (e) => {
    const albumArtFile = e.target.files[0];
    if (albumArtFile) {
      convertImageToBase64(albumArtFile, (base64String) => {
        setFormData((prevData) => ({ ...prevData, albumArt: base64String }));
      });
    }
  };

  const convertImageToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({ ...prevData, file: file, premiumSong: prevData.premiumSong || false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Form data submitted:', formData);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('artist', formData.artist);
      form.append('album', formData.album);
      form.append('duration', formData.duration);
      // Append albumArt only if it is not 'undefined'
    if (formData.albumArt && formData.albumArt !== 'undefined') {
      form.append('albumArt', formData.albumArt);
    }

     
      form.append('file', formData.file);
      // console.log("File: ",formData.file);
    

      form.append('premiumSong', formData.premiumSong);

      // console.log('Form data:', Object.fromEntries(form.entries()));

      const username = localStorage.getItem('username');

      if (!username) {
        Swal.fire({
          icon: 'warning',
          title: 'User Not Found',
          text: 'The username was not found. Please make sure you are logged in.',
        });
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_BACK_URL}/api/admin/songs`, form, {
        headers: {
          username: username,
        },
      });

      // console.log('Server response:', response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Form Submission Failed',
        text: 'There was an error submitting the form. Please try again later.',
      });
    }
  };

  const handleGetSongs = async () => {
    try {
      const username = localStorage.getItem('username');

      if (!username) {
        console.error('Username not found. User may not be logged in.');
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/songs`, {
        headers: {
          username: username,
        },
      });

      // console.log('Songs retrieved:', response.data);
      setSongs(response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error Fetching Songs',
        text: 'There was an error fetching the songs. Please try again later.',
      });
    }
  };

  useEffect(() => {
    handleGetSongs();
  }, []);

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <label>
        Title:
        <input type="text" name="title" value={formData.title || ''} onChange={handleChange} />
      </label>
      <br />
      <label>
        Artist:
        <input type="text" name="artist" value={formData.artist || ''} onChange={handleChange} />
      </label>
      <br />
      <label>
        Album:
        <input type="text" name="album" value={formData.album || ''} onChange={handleChange} />
      </label>
      <br />
      <label>
        Duration (seconds):
        <input type="number" name="duration" value={formData.duration || ''} onChange={handleChange} />
      </label>
      <br />
      <br />
      <div className="labelWithCheckbox">
        <label>
          Premium Song:
          <input type="checkbox" name="premiumSong" checked={formData.premiumSong || false} onChange={handleChange} />
        </label>
      </div>
      <br />
      <label>
        Album Art:
        <input type="file" name="albumArt" accept="image/*" onChange={handleAlbumArtChange} />
      </label>
      <br />
      <label>
        Upload Song:
        <input type="file" name="file" accept="audio/*" onChange={handleFileChange} />
      </label>
      <br />
      <button type="submit">{initialData ? 'Update Song' : 'Add Song'}</button>
    </form>
  );
};

export default SongForm;