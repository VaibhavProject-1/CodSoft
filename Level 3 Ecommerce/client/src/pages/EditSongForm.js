// EditSongForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SongForm.css';
import Swal from 'sweetalert2';


const EditSongForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState(initialData || {});
  const [songs, setSongs] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [albumArtData, setAlbumArtData] = useState(null);
  const [albumArtContentType, setAlbumArtContentType] = useState('image/png');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value };
      // console.log('Updated form data:', updatedData);
      return updatedData;
    });
  };
  
  
  const handleFileChange = async (e) => {
    // console.log("Handle File change called");
    const name = e.target.name;
    const file = e.target.files[0];
  
    if (name === "albumArt") {
      setAlbumArtData(file); // Set albumArtData to the selected file
      if (file) {
        const base64String = await convertFileToBase64(file);
        setFormData((prevData) => ({
          ...prevData,
          albumArt: base64String, // Set albumArt to the base64 string
        }));
      } else {
        // If albumArt file is null or not present, set albumArt to null
        setFormData((prevData) => ({
          ...prevData,
          albumArt: null,
        }));
      }
    } else if (name === "file") {
      // Handle "file" input separately
      setFormData((prevData) => ({
        ...prevData,
        file: file, // Set file to the selected file
      }));
  
      // Log information about the audio file
      // console.log("Audio File Information:");
      // console.log("Name:", file.name);
      // console.log("Size:", file.size, "bytes");
      // console.log("Type:", file.type);
      // console.log("Last Modified Date:", file.lastModifiedDate);
      // Add more details as needed
  
      // Add audio file information to the form data
      const audioFileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModifiedDate: file.lastModifiedDate,
        // Add more details as needed
      };
      setFormData((prevData) => ({
        ...prevData,
        audioFileInfo: audioFileInfo,
      }));
    }
  };
  
  
  

  const convertAlbumArtToBase64 = (albumArtObject) => {
    if (albumArtObject && albumArtObject.data) {
      // console.log("Album art object:", albumArtObject);
      // console.log("Album art object data type:", typeof albumArtObject.data);
  
      // Check if data is an ArrayBuffer
      if (albumArtObject.data instanceof ArrayBuffer) {
        const base64String = Buffer.from(albumArtObject.data).toString('base64');
        // console.log("Base64 string:", base64String);
        return {
          data: base64String,
          contentType: albumArtObject.contentType,
        };
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Invalid data type for album art. Expected ArrayBuffer.',
        });
      }
    }
    return null;
  };
  
  
  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };
  

  const handleAlbumArtChange = (file) => {
    // console.log("Handle Album Art change called");
    if (file.type.startsWith('image/')) {
      // Set the selected album art file
      setAlbumArtData(file);

      // Read the file extension from the file name
      const fileExtension = file.name.split('.').pop().toLowerCase();

      // Map common file extensions to content types (you can extend this mapping)
      const extensionToContentType = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        // Add more extensions and content types as needed
      };

      // Get content type based on the file extension
      const contentType = extensionToContentType[fileExtension] || 'image/png';

      // Set the content type in state
      setAlbumArtContentType(contentType);
      // console.log("Content Type from handle album art: ",contentType);

      // You can also read the file as a data URL if needed
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid file type for album art. Please select an image.',
      });
    }
  };

  // Function to extract content type from base64 string
  const getContentTypeFromBase64 = (base64String) => {
    const matches = base64String.match(/^data:(.+?);base64,/);
    return matches ? matches[1] : null;
  };

  
  const handleSubmit = async (e) => {
    // console.log("Handle File submit called");
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Form data submitted successfully!',
    });
  
    if (isSubmitting) {
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Check if initialData exists and has the _id property
      const username = localStorage.getItem('username');
      const headers = {
        username: username,
      };
  
      const form = new FormData();
  
      // Append only the fields that have changed
      if (formData.title !== (initialData?.title || '')) {
        form.append('title', formData.title || '');
      }
      if (formData.artist !== (initialData?.artist || '')) {
        form.append('artist', formData.artist || '');
      }
      if (formData.album !== (initialData?.album || '')) {
        form.append('album', formData.album || '');
      }
      if (formData.duration !== (initialData?.duration || '')) {
        form.append('duration', formData.duration || '');
      }
  
      const songId = formData._id || (initialData?._id || ''); // Added default values
  
       // Check if the audio file has changed
        if (formData.file instanceof File) {
          form.append('file', formData.file, formData.file.name);

          // Include audioFileInfo in the form data
          if (formData.audioFileInfo) {
            form.append('audioFileInfo', JSON.stringify(formData.audioFileInfo));
          }
        }
  
      // Check if album art has changed and already handled separately
      if (albumArtData) {
        const base64String = await convertFileToBase64(albumArtData);
        console.log("Before appending: ",base64String);
        form.append('albumArt', base64String);
        form.append('albumArtContentType', albumArtContentType);

        const albumArtUpdateUrl = `${process.env.REACT_APP_BACK_URL}/api/admin/songs/${songId}/albumArt`;
  
        // Send the album art data to update the album art
        const albumArtResponse = await axios.put(albumArtUpdateUrl, {
          albumArt: base64String,
          albumArtContentType: albumArtContentType,
        }, { headers });
  
        console.log('Album Art Server response:', albumArtResponse.data);

        console.log('Album Art: ', base64String);
        console.log('Album Art Content type: ', albumArtContentType);
      }
  
      const formObject = Object.fromEntries(form.entries());
      console.log("Complete file object",formObject);
  
      if (!username) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Username not found. User may not be logged in.',
        });
        return;
      }
  
      const apiUrl = `${process.env.REACT_APP_BACK_URL}/api/admin/songs/${songId}`;
  
      // console.log('Form data before submitting:', formObject);
  
      const response = await axios.put(apiUrl, form, { headers });
  
      console.log('Server response:', response.data);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error submitting form: ' + error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDelete = async (songId) => {
    try {
      const username = localStorage.getItem('username');

      if (!username) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Username not found. User may not be logged in.',
        });
        return;
      }

      const response = await axios.delete(`${process.env.REACT_APP_BACK_URL}/api/admin/songs/${songId}`, {
        headers: {
          username: username,
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Song deleted successfully',
      });

      // Update the song list after deletion
      handleGetSongs();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete song. Please try again later.',
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
        title: 'Error',
        text: 'Failed to get songs. Please try again later.',
      });
    }
  };
    // Add a new function to handle the edit button click
    const handleEdit = (song) => {
      setFormData({ ...song, _id: song._id });
      setIsEditMode(true);
    };

const handleEditClick = (song) => {
  setCurrentSong(song);
};


  

  useEffect(() => {
    handleGetSongs();
    setFormData(currentSong || {});
    setIsEditMode(!!currentSong);
  }, [currentSong]);

  return (
    <div>
      {isEditMode ? (
        <form onSubmit={handleSubmit}>
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
            <input
              type="number"
              name="duration"
              value={formData.duration || ''}
              onChange={handleChange}
            />
          </label>
          <br />
          <label>
            Upload Album Art:
            <input type="file" name="albumArt" accept="image/*" onChange={(e) => handleFileChange(e)}  />
          </label>
          <br />
          <br />
          <br />
          <div className="labelWithCheckbox">
            <label>
              Premium Song:
            </label>
            <input
              type="checkbox"
              name="premiumSong"
              checked={formData.premiumSong || false}
              onChange={handleChange}
            />
          </div>
          <br />
          <br />
          <br />
          <label>
            Upload Song:
            <input type="file" name="file" accept="audio/*" onChange={handleFileChange} />
          </label>
          <br />
          <button type="submit" disabled={isSubmitting}>Update Song</button>
        </form>
      ) : (
        <h2>Song List</h2>
      )}
      <ul>
        {songs.map((song) => (
          <li key={song._id}>
            {song.title} by {song.artist} ({song.album})
            <button onClick={() => handleEditClick(song)}>Edit</button>
            <button onClick={() => handleDelete(song._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditSongForm;