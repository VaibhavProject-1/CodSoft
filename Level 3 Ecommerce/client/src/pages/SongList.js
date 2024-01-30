// SongList.js
import React from 'react';

const SongList = ({ songs, onEdit, onDelete }) => {
  return (
    <ul>
      {songs.map((song) => (
        <li key={song._id}>
          <span>{song.title} by {song.artist}</span>
          <button onClick={() => onEdit(song)}>Edit</button>
          <button onClick={() => onDelete(song._id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
};

export default SongList;