import { useState, useEffect, useRef } from "react";
import { Buffer } from "buffer";
import { parseBlob } from "music-metadata-browser";
import { useSongsStore } from "../store/songs";

function Home() {
  const { song: songList, getSong, loading, error } = useSongsStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSongBlob, setCurrentSongBlob] = useState(null);
  const [blobURL, setBlobURL] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef(null);
  window.Buffer = Buffer;

  // Fetch songs on mount
  useEffect(() => {
    getSong();
    console.log(songList);
  }, [getSong]);

  // Load song when currentIndex changes
  useEffect(() => {
    if (!songList.length) return;
    loadSong(songList[currentIndex].url);
  }, [currentIndex, songList]);

  // Update audio and metadata when current song changes
  useEffect(() => {
    if (!currentSongBlob) return;

    const url = URL.createObjectURL(currentSongBlob);
    setBlobURL(url);

    (async () => {
      try {
        const metadata = await parseBlob(currentSongBlob);
        setTitle(metadata.common.title || "Unknown Title");
        setArtist(metadata.common.artist || "Unknown Artist");

        if (metadata.common.picture && metadata.common.picture.length > 0) {
          const coverImage = metadata.common.picture[0];
          setCover(
            URL.createObjectURL(
              new Blob([coverImage.data], { type: coverImage.format })
            )
          );
        } else {
          setCover("");
        }
      } catch (err) {
        console.error("Error parsing song metadata:", err);
      }
    })();

    return () => URL.revokeObjectURL(url);
  }, [currentSongBlob]);

  // Handle song fetch and load
  const loadSong = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    setCurrentSongBlob(blob);

    // Wait a tick for blob URL to update
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = URL.createObjectURL(blob);
        audioRef.current.load();
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    }, 500);
  } catch (err) {
    console.error("Error loading song:", err);
  }
};


  // Play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Next/Previous
  const playNext = () => {
    setCurrentIndex((prev) => (prev + 1) % songList.length);
  };
  const playPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + songList.length) % songList.length);
  };

  // Update currentTime and duration
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
    setDuration(audioRef.current.duration || 0);
  };

  // Seek
  const handleSeek = (e) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = e.target.value;
    setCurrentTime(e.target.value);
  };

  // Format time mm:ss
  const formatTime = (sec) => {
    if (isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (loading) {
  return (
    <div className="text-white min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <h2 className="text-3xl font-bold">Loading songs...</h2>
    </div>
  );
}

if (error) {
  return (
    <div className="text-white min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <h2 className="text-3xl font-bold text-red-500">{error}</h2>
    </div>
  );
}

if (!songList.length) {
  return (
    <div className="text-white min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <h2 className="text-3xl font-bold">No songs available</h2>
    </div>
  );
}


  return (
    <div className="text-white min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 p-4">
      <h2 className="text-3xl font-bold mb-4">Song Player</h2>

      {loading && <p>Loading songs...</p>}
      {error && <p className="text-red-500">{error}</p>}


      {currentSongBlob && (
        <div className="mt-6 p-5 bg-gray-900/60 shadow-md rounded-lg flex flex-col items-center w-full max-w-md">

          {cover ? (
            <div className="w-48 h-48 my-4 overflow-hidden rounded-md">
              <img src={cover} alt="Song Cover" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-40 h-40 my-4 bg-gray-200 rounded-md flex items-center justify-center">
              No Cover
            </div>
          )}
          <h2 className="my-2 text-xl text-center font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-500 mb-2">{artist}</p>

          <audio
            ref={audioRef}
            src={blobURL}
            onTimeUpdate={handleTimeUpdate}
            onEnded={playNext}
            className="w-full hidden"
          />

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-3 w-full">
            <button onClick={playPrev} className="p-2 bg-gray-700 rounded-full">⏮️</button>
            <button onClick={togglePlay} className="p-2 bg-gray-700 rounded-full">
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button onClick={playNext} className="p-2 bg-gray-700 rounded-full">⏭️</button>
          </div>

          {/* Seekbar */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full mt-3"
          />
          <div className="flex justify-between w-full text-sm text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
