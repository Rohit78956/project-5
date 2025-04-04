class SongManager {
    constructor() {
        this.songs = this.loadSongs();
        this.currentPlaylist = null;
    }

    // Load songs from localStorage
    loadSongs() {
        const storedSongs = localStorage.getItem('songs');
        return storedSongs ? JSON.parse(storedSongs) : [];
    }

    // Save songs to localStorage
    saveSongs() {
        localStorage.setItem('songs', JSON.stringify(this.songs));
    }

    // Add a new song
    addSong(song) {
        const newSong = {
            id: Date.now(),
            title: song.title,
            artist: song.artist,
            album: song.album || 'Unknown Album',
            duration: song.duration,
            albumArt: song.albumArt || 'https://via.placeholder.com/300',
            file: song.file,
            dateAdded: new Date().toISOString()
        };

        this.songs.push(newSong);
        this.saveSongs();
        return newSong;
    }

    // Get all songs
    getAllSongs() {
        return this.songs;
    }

    // Get song by ID
    getSongById(id) {
        return this.songs.find(song => song.id === id);
    }

    // Create a playlist
    createPlaylist(name) {
        const playlists = this.loadPlaylists();
        const newPlaylist = {
            id: Date.now(),
            name,
            songs: [],
            dateCreated: new Date().toISOString()
        };
        playlists.push(newPlaylist);
        localStorage.setItem('playlists', JSON.stringify(playlists));
        return newPlaylist;
    }

    // Load playlists
    loadPlaylists() {
        const storedPlaylists = localStorage.getItem('playlists');
        return storedPlaylists ? JSON.parse(storedPlaylists) : [];
    }

    // Add song to playlist
    addSongToPlaylist(playlistId, songId) {
        const playlists = this.loadPlaylists();
        const playlist = playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            localStorage.setItem('playlists', JSON.stringify(playlists));
        }
    }

    // Get playlist songs
    getPlaylistSongs(playlistId) {
        const playlist = this.loadPlaylists().find(p => p.id === playlistId);
        if (!playlist) return [];
        return playlist.songs.map(songId => this.getSongById(songId)).filter(Boolean);
    }

    // Search songs
    searchSongs(query) {
        const lowerQuery = query.toLowerCase();
        return this.songs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.album.toLowerCase().includes(lowerQuery)
        );
    }

    // Get recently added songs
    getRecentlyAdded(limit = 10) {
        return [...this.songs]
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .slice(0, limit);
    }
} 