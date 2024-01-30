// PlayerContext.js
import React, { createContext, useContext, useState, useRef } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false); // Add isPlaying state
  const audioElementRef = useRef(new Audio()); 

  const setSong = (song) => {
    setSelectedSong(song);
    setIsPlaying(true); // Automatically start playing when a song is selected
  };

  const play = () => {
    setIsPlaying(true);
    if (audioElementRef.current) {
      audioElementRef.current.play();
    }
  };

  const pause = () => {
    setIsPlaying(false);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  };

  const seek = (time) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  };

  const playNextSong = () => {
    const currentIndex = songs.findIndex((song) => song._id === selectedSong._id);

    if (currentIndex < songs.length - 1) {
      const nextSong = songs[currentIndex + 1];
      setSelectedSong(nextSong);
    }
  };

  const playPreviousSong = () => {
    const currentIndex = songs.findIndex((song) => song._id === selectedSong._id);

    if (currentIndex > 0) {
      const previousSong = songs[currentIndex - 1];
      setSelectedSong(previousSong);
    }
  };

  const value = {
    selectedSong,
    setSong,
    playlist,
    setPlaylist,
    isPlaying, // Add isPlaying to the context
    setIsPlaying, // Add function to update isPlaying
    playNextSong,
    playPreviousSong,
    play,
    pause,
    seek,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};