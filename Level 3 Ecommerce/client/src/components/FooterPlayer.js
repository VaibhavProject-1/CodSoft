import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStepBackward, faStepForward } from '@fortawesome/free-solid-svg-icons';
import './FooterPlayer.css';
import { usePlayer } from '../contexts/PlayerContext';

const FooterPlayer = () => {
    const { selectedSong, setSong, isPlaying, setIsPlaying, playNextSong, playPreviousSong } = usePlayer();

    const handlePlayPause = () => {
        // Toggle play/pause
        setIsPlaying(!isPlaying);
    };

    const handlePrevious = () => {
        playPreviousSong(); // Play the previous song
    };

    const handleNext = () => {
        playNextSong(); // Play the next song
    };

    // This effect ensures that the footer player updates when the selected song changes
    useEffect(() => {
        // Use the selectedSong state as needed
        console.log('Current Song:', selectedSong);
    }, [selectedSong]);

    return (
        <footer className="footer-player">
            <div className="song-info">
                {selectedSong ? (
                    <>
                        <div className="song-title">{selectedSong.title}</div>
                        <div className="song-artist">{selectedSong.artist}</div>
                    </>
                ) : (
                    <div className="song-placeholder">No song selected</div>
                )}
            </div>
            <div className="controls">
                <button onClick={handlePrevious}>
                    <FontAwesomeIcon icon={faStepBackward} />
                </button>
                <button onClick={handlePlayPause}>
                    {isPlaying ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}
                </button>
                <button onClick={handleNext}>
                    <FontAwesomeIcon icon={faStepForward} />
                </button>
            </div>
        </footer>
    );
};

export default FooterPlayer;