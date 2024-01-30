import React, { useState } from 'react';
import './Body.css';
import Player from './Player';

const songs = [
    { id: 1, title: 'Ateraxia', artist: '', file: '../songs/Ateraxia.mp3' },
    { id: 2, title: 'Brother', artist: '', file: '../songs/Brother.mp3' },
    { id: 3, title: 'Get Away', artist: '', file: '../songs/Get-Away.mp3' },
    { id: 4, title: 'Highschool Funeral', artist: '', file: '../songs/Highschool-Funeral.mp3' },
    { id: 5, title: 'Intro', artist: '', file: '../songs/Intro.mp3' },
    { id: 6, title: 'J5', artist: '', file: '../songs/J5.mp3' },
    { id: 7, title: 'Manimal', artist: '', file: '../songs/Manimal.mp3' },
    { id: 8, title: 'Neruda', artist: '', file: '../songs/Neruda.mp3' },
    { id: 9, title: 'Scarwhores', artist: '', file: '../songs/Scarwhores.mp3' },
    { id: 10, title: 'Solitude', artist: '', file: '../songs/Solitude.mp3' },
    { id: 11, title: 'Throne', artist: '', file: '../songs/Throne.mp3' },
    { id: 12, title: 'Victims of Chaos', artist: '', file: '../songs/Victims-of-Chaos.mp3' },
  ];

  const Body = () => {
    const [currentTrack, setCurrentTrack] = useState(null);
  
    const handlePlay = (file, title, artist) => {
      setCurrentTrack({
        title,
        artist,
        file,
      });
    };
  
    return (
      <div className="body">
        <Player currentTrack={currentTrack} />
  
        <div className="body__songs">
          {songs.map((song) => (
            <div key={song.id} className="body__song">
              {/* Use the correct path for your images */}
              <img src={`/images/albumCovers/${song.title}.png`} alt="Song Thumbnail" />
              <div className="body__songInfo">
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
              <button className="button" onClick={() => handlePlay(`/songs/${song.file}`, song.title, song.artist)}>
                Play
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default Body;
