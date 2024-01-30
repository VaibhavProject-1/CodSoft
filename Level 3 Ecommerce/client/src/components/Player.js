import React, { useState, useEffect } from 'react';
import AudioPlayer from 'react-audio-player';

const Player = ({ currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Reset the play state when the currentTrack changes
    setIsPlaying(false);
  }, [currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="player">
      {/* Display the current track information */}
      {currentTrack && (
        <div className="player__info">
          <h3>{currentTrack.title}</h3>
          <p>{currentTrack.artist}</p>
        </div>
      )}

      {/* Audio player component */}
      {currentTrack && (
        <AudioPlayer
          src={currentTrack.file}
          autoPlay={false}
          controls
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="player__audio"
        />
      )}

      {/* Play/Pause button */}
      {currentTrack && (
        <button className="player__playPauseButton" onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      )}
    </div>
  );
};

export default Player;