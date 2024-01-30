// SongPlayer.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import './SongPlayer.css';
import { usePlayer } from '../contexts/PlayerContext';
import Swal from 'sweetalert2';

const SongPlayer = ({ selectedSong: propSelectedSong, songs: propSongs,customHandlePrevious, customHandleNext, fromPlaylistSidebar,disableDefaultHandlers, localSongs}) => {
  const { selectedSong, setSong,  play, pause, seek, playNextSong, playPreviousSong } = usePlayer();
  const [audioSrc, setAudioSrc] = useState(null);
  const [albumArt, setAlbumArt] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [songs, setSongs] = useState(propSongs || []);
  const audioElementRef = useRef(new Audio());
  const [stateChangeSource, setStateChangeSource] = useState(null);
  const [seekbarValue, setSeekbarValue] = useState(0);

  
  const [isPlaying, setIsPlaying,] = useState(false);
  const [isPlayingIcon, setIsPlayingIcon,] = useState('');
  const changeSourceRef = useRef(null);
  const [audioElement] = useState(new Audio());


  //Responsible for changing song next/previous
  useEffect(() => {
    setSongs(propSongs || []);
    // Store songs in local storage
    // localStorage.setItem('songs', JSON.stringify(propSongs || []));

    setSongs(localSongs || []);
    // console.log("Local Songs: ",localSongs);
    // Ensure audioElementRef is updated
    audioElementRef.current = new Audio();

    const audioElement = audioElementRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
      setSeekbarValue(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Clean up event listeners when the component unmounts
    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [propSongs, audioElementRef,localSongs]);

  //Main useEffect
  useEffect(() => {
    const fetchSongData = async () => {
      if (!propSelectedSong) return;

      try {
        // console.log("Song : ",propSelectedSong.file.filename)
        const audioResponse = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/songs/${propSelectedSong.file.filename}`, {
          headers: {
            'Content-Type': 'audio/*',
            'username': localStorage.getItem('username'),
          },
          responseType: 'blob',
        });
        setAudioSrc(URL.createObjectURL(audioResponse.data));
        // console.log("Audio source fetched successfully.");
        // console.log("Audio Response: ",URL.createObjectURL(audioResponse.data))
        // Inside the fetchSongData function
        // console.log('Song:', propSelectedSong.file.filename);
        // console.log('Album Art ID:', propSelectedSong._id);

        const albumArtResponse = await axios.get(`${process.env.REACT_APP_BACK_URL}/api/admin/album-art/${propSelectedSong._id}`, {
          headers: {
            'Content-Type': 'image/*',
            'username': localStorage.getItem('username'),
          },
          responseType: 'blob',
        });

        if (albumArtResponse.status === 200) {
          const base64Image = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(albumArtResponse.data);
          });
          setAlbumArt(base64Image);
        } else {
          setAlbumArt(null);
        }
        setSong(propSelectedSong);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error Fetching Data',
          text: 'Failed to fetch data. Please try again later.',
        });
      }
    };

    setAlbumArt(null);
    fetchSongData();
  }, [propSelectedSong, propSongs, setSong]);

  //SeekBar's Working useEffect
  useEffect(() => {
    const handleTimeUpdate = () => {
      // console.log("Current time:", audioElement.currentTime);
      setCurrentTime(audioElement.currentTime);
      setSeekbarValue(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      // console.log("Duration:", audioElement.duration);
      setDuration(audioElement.duration);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    // console.log("Event listeners added for time update and loaded metadata.");

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      // console.log("Event listeners removed for time update and loaded metadata.");
    };
  }, [audioElement]);

  

  //For Playing also affects seekbar
  useEffect(() => {
    // Update audio source
    if (audioElement) {
      audioElement.src = audioSrc;
      audioElement.load();
    }
    // console.log("Playing state from hook: ",isPlaying);
  
    // Start playback
    if (isPlaying && audioElement && audioSrc) {
      audioElement.play()
      // .catch(error => console.error('Error playing audio:', error));
    }
  }, [audioElement, audioSrc, isPlaying]);
  

  const handlePlayPause = () => {
    if (audioElement) {
      if (audioElement.paused) {
        // setIsPlaying(true);
        setIsPlayingIcon(true);
        audioElement
          .play()
          .catch((error) => Swal("Error", "Failed to play audio. Please try again later.", "error"));
      } else {
        // setIsPlaying(false);
        audioElement.pause();
        setIsPlayingIcon(false);
      }
    }
  };
  
  const handlePrevious = disableDefaultHandlers ? customHandlePrevious : () => {
    if (!localSongs || localSongs.length === 0 || !propSelectedSong) return;
    // console.log("Handle previous of song player");
    const currentIndex = localSongs.findIndex((song) => song._id === selectedSong._id);
    const previousSong = currentIndex > 0 ? localSongs[currentIndex - 1] : null;
    if (previousSong) {
      setSong(previousSong);
      // setIsPlaying(true);
    }
  };

  const handleNext = disableDefaultHandlers ? customHandleNext : () => {
    if (!localSongs || localSongs.length === 0 || !propSelectedSong) return;
    // console.log("Handle next of song player");
    const currentIndex = localSongs.findIndex((song) => song._id === selectedSong._id);

    if (currentIndex < localSongs.length - 1) {
      const nextSong = localSongs[currentIndex + 1];
      setSong(nextSong);
      // setIsPlaying(true);
      audioElementRef.current.currentTime = 0;
      audioElementRef.current.play();
    }
  };

  const handleSeek = (event) => {
    if (audioElement) {
      audioElement.currentTime = event.target.value;
      setSeekbarValue(event.target.value);
    }
  };

  
  
  const handleForward = () => {
    if(audioElement){
      audioElement.currentTime+=10
    }
  };

  const handleBackward = () => {
    if(audioElement){
      audioElement.currentTime-=10
    }
  };

  return (
    <div className="spotify-like-player">
      {propSelectedSong && (
        <>
          <div className="player-header">
            <img className="album-cover" src={albumArt} alt="Album Cover" />
            <div className="song-details">
              <h2 className="song-title">{propSelectedSong.title}</h2>
              <p className="artist-name">{propSelectedSong.artist}</p>
            </div>
          </div>
          <div className="audio-controls">
            <button className="control-btn" onClick={handlePrevious}>&#9665;&#9665;</button>
            <button className="control-btn" onClick={handlePlayPause}>{isPlayingIcon ? '⏸️' : '▶️'}</button>
            <button className="control-btn" onClick={handleNext}>&#9658;&#9658;</button>
          </div>
          <div className="progress-bar">
            <div className="custom-audio-controls">
              <button onClick={handlePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
              <button onClick={handlePrevious}>Previous</button>
              <button onClick={handleNext}>Next</button>
              <button onClick={handleBackward}>-10s</button>
              <button onClick={handleForward}>+10s</button>
            </div>
            <input
              type="range"
              min="0"
              max={duration}
              value={seekbarValue}
              onChange={handleSeek}
            />

            <audio id="custom-audio" controlsList="nodownload">
              Your browser does not support the audio element.
            </audio>
          </div>
        </>
      )}
    </div>
  );
};

export default SongPlayer;