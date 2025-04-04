// Sample music data
const sampleMusic = [
    {
        id: 1,
        title: 'Sample Beat 1',
        artist: 'Free Music Archive',
        album: 'Sample Beats',
        duration: '3:00',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        albumArt: 'https://via.placeholder.com/300'
    },
    {
        id: 2,
        title: 'Ambient Soundscape',
        artist: 'Free Music Archive',
        album: 'Ambient Collection',
        duration: '4:00',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        albumArt: 'https://via.placeholder.com/300'
    },
    {
        id: 3,
        title: 'Jazz Sample',
        artist: 'Free Music Archive',
        album: 'Jazz Collection',
        duration: '3:30',
        file: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        albumArt: 'https://via.placeholder.com/300'
    }
];

// Initialize localStorage with sample data if empty
if (!localStorage.getItem('musicData')) {
    localStorage.setItem('musicData', JSON.stringify(sampleMusic));
}

// Get music data from localStorage
function getMusicData() {
    return JSON.parse(localStorage.getItem('musicData')) || [];
}

// Update music data in localStorage
function updateMusicData(data) {
    localStorage.setItem('musicData', JSON.stringify(data));
}

// Add a new song
function addSong(song) {
    const musicData = getMusicData();
    const newSong = {
        id: Date.now(),
        ...song
    };
    musicData.push(newSong);
    updateMusicData(musicData);
    return newSong;
}

// Get song by ID
function getSongById(id) {
    const musicData = getMusicData();
    return musicData.find(song => song.id === id);
}

document.addEventListener('DOMContentLoaded', () => {
    const songManager = new SongManager();
    const spotifyApi = new SpotifyAPI();
    let currentSong = null;
    let audio = new Audio();
    let isPlaying = false;

    // Load user profile
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        document.getElementById('user-profile-photo').src = userData.profilePhoto;
        document.getElementById('username').textContent = userData.username;
    }

    // Spotify connection
    const spotifyConnectBtn = document.getElementById('spotify-connect');
    spotifyConnectBtn.addEventListener('click', () => {
        spotifyApi.authenticate();
    });

    // Check if we have a Spotify access token
    if (localStorage.getItem('spotify_access_token')) {
        spotifyConnectBtn.textContent = 'Connected to Spotify';
        spotifyConnectBtn.disabled = true;
        loadSpotifyPlaylists();
    }

    // DOM Elements
    const playBtn = document.querySelector('.play-btn');
    const progressBar = document.querySelector('.progress');
    const progressFill = document.querySelector('.progress-fill');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeFill = document.querySelector('.volume-fill');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('nav ul li');
    const searchInput = document.querySelector('.search-bar input');
    const fileInput = document.getElementById('file-input');
    const uploadBox = document.getElementById('upload-box');
    const uploadProgress = document.querySelector('.upload-progress');
    const uploadProgressBar = document.querySelector('.upload-progress-bar');
    const createPlaylistBtn = document.querySelector('.create-playlist-btn');
    const modal = document.getElementById('create-playlist-modal');
    const playlistNameInput = document.getElementById('playlist-name');
    const cancelBtn = document.querySelector('.cancel-btn');
    const createBtn = document.querySelector('.create-btn');

    // User Profile Dropdown
    const profileDropdown = document.querySelector('.profile-dropdown');
    const profileHeader = document.querySelector('.profile-header');
    const darkModeToggle = document.querySelector('.menu-section li:nth-child(3)');
    const viewProfileBtn = document.querySelector('.menu-section li:nth-child(1)');
    const settingsBtn = document.querySelector('.menu-section li:nth-child(2)');
    const likedSongsBtn = document.querySelector('.menu-section li:nth-child(1)');
    const recentlyPlayedBtn = document.querySelector('.menu-section li:nth-child(2)');
    const logoutBtn = document.querySelector('.menu-section li:last-child');

    // File System Permission and Upload Handling
    const uploadContainer = document.querySelector('.upload-container');
    const permissionBtn = document.getElementById('request-permission');
    const permissionStatus = document.getElementById('permission-status');

    let hasFilePermission = false;

    // Request file system permission
    async function requestFilePermission() {
        try {
            // Request permission to access music directory
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read',
                startIn: 'music'
            });

            // Store the permission grant
            hasFilePermission = true;
            uploadContainer.classList.add('permission-granted');
            permissionStatus.textContent = 'File system access: Granted';
            permissionBtn.innerHTML = '<i class="fas fa-check"></i> Access Granted';
            
            showToast('File system access granted!', 'success');
            
            // Store the directory handle for future use
            localStorage.setItem('musicDirHandle', JSON.stringify({
                granted: true,
                timestamp: Date.now()
            }));

        } catch (error) {
            console.error('Error requesting file system permission:', error);
            showToast('Failed to get file system permission', 'error');
        }
    }

    // Check for existing permission
    async function checkFilePermission() {
        const savedPermission = localStorage.getItem('musicDirHandle');
        if (savedPermission) {
            const { granted, timestamp } = JSON.parse(savedPermission);
            if (granted && (Date.now() - timestamp) < 24 * 60 * 60 * 1000) { // 24 hours
                hasFilePermission = true;
                uploadContainer.classList.add('permission-granted');
                permissionStatus.textContent = 'File system access: Granted';
                permissionBtn.innerHTML = '<i class="fas fa-check"></i> Access Granted';
            }
        }
    }

    // Initialize permission handling
    if (permissionBtn) {
        permissionBtn.addEventListener('click', requestFilePermission);
        checkFilePermission();
    }

    // Initialize UI
    updateLibrary();
    updateRecentlyAdded();
    updatePlaylists();

    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${section}-section`).classList.add('active');
        });
    });

    // Search functionality
    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value;
        if (query.length > 2) {
            if (localStorage.getItem('spotify_access_token')) {
                const spotifyResults = await spotifyApi.searchTracks(query);
                displaySpotifyResults(spotifyResults);
            } else {
                const localResults = songManager.searchSongs(query);
                displaySearchResults(localResults);
            }
        }
    });

    // Playlist creation
    createPlaylistBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    createBtn.addEventListener('click', () => {
        const name = playlistNameInput.value.trim();
        if (name) {
            songManager.createPlaylist(name);
            updatePlaylists();
            modal.classList.remove('active');
            playlistNameInput.value = '';
        }
    });

    // Player controls
    playBtn.addEventListener('click', togglePlay);

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = (x / rect.width) * 100;
        if (currentSong) {
            audio.currentTime = (progress / 100) * audio.duration;
            updateProgress();
        }
    });

    volumeSlider.addEventListener('click', (e) => {
        const rect = volumeSlider.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const volume = x / rect.width;
        audio.volume = volume;
        updateVolume(volume);
    });

    // Toggle dropdown
    profileHeader.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!profileDropdown.contains(e.target)) {
            profileDropdown.classList.remove('active');
        }
    });

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });

    // Check for saved dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // View Profile
    viewProfileBtn.addEventListener('click', () => {
        // Show user profile modal
        showProfileModal();
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        // Show settings modal
        showSettingsModal();
    });

    // Liked Songs
    likedSongsBtn.addEventListener('click', () => {
        showLikedSongs();
    });

    // Recently Played
    recentlyPlayedBtn.addEventListener('click', () => {
        showRecentlyPlayed();
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('userData');
            localStorage.removeItem('spotify_access_token');
            localStorage.removeItem('spotify_refresh_token');
            window.location.href = 'index.html';
        }
    });

    // Handle file upload
    async function handleFiles(files) {
        if (!hasFilePermission) {
            showToast('Please grant file system permission first', 'error');
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith('audio/')) {
                showToast('Please upload audio files only', 'error');
                continue;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', file.name);
            formData.append('artist', 'Unknown Artist');
            formData.append('album', 'Unknown Album');

            try {
                uploadProgress.style.display = 'block';
                uploadProgressBar.style.width = '0%';

                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        uploadProgressBar.style.width = percentComplete + '%';
                    }
                });

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const song = JSON.parse(xhr.responseText);
                        addSong({
                            title: file.name,
                            artist: 'Unknown Artist',
                            album: 'Unknown Album',
                            file: song.file_path,
                            albumArt: 'https://via.placeholder.com/300'
                        });
                        updateLibrary();
                        showToast('Song uploaded successfully!', 'success');
                    } else {
                        showToast('Failed to upload song', 'error');
                    }
                    uploadProgress.style.display = 'none';
                };

                xhr.onerror = function() {
                    showToast('Error uploading song', 'error');
                    uploadProgress.style.display = 'none';
                };

                xhr.open('POST', '/api/songs', true);
                xhr.send(formData);

            } catch (error) {
                console.error('Upload error:', error);
                showToast('Error uploading song', 'error');
                uploadProgress.style.display = 'none';
            }
        }
    }

    async function updateLibrary() {
        try {
            const response = await fetch('/api/songs');
            if (response.ok) {
                const songs = await response.json();
                const librarySection = document.querySelector('#library-section .song-grid');
                librarySection.innerHTML = '';
                songs.forEach(song => {
                    const songCard = createSongCard(song);
                    librarySection.appendChild(songCard);
                });
            }
        } catch (error) {
            console.error('Error loading library:', error);
            showToast('Error loading library');
        }
    }

    function updateRecentlyAdded() {
        const recentSongs = document.getElementById('recent-songs');
        recentSongs.innerHTML = '';
        songManager.getRecentlyAdded().forEach(song => {
            const songElement = createSongCard(song);
            recentSongs.appendChild(songElement);
        });
    }

    function updatePlaylists() {
        const playlistList = document.getElementById('playlist-list');
        playlistList.innerHTML = '';
        songManager.loadPlaylists().forEach(playlist => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-list"></i> ${playlist.name}`;
            li.addEventListener('click', () => displayPlaylistSongs(playlist.id));
            playlistList.appendChild(li);
        });
    }

    function createSongElement(song) {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerHTML = `
            <img src="${song.albumArt}" alt="Album Art">
            <div class="song-item-info">
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
        `;
        div.addEventListener('click', () => playSong(song));
        return div;
    }

    function createSongCard(song) {
        const div = document.createElement('div');
        div.className = 'song-card';
        div.innerHTML = `
            <img src="${song.albumArt}" alt="Album Art">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        `;
        div.addEventListener('click', () => playSong(song));
        return div;
    }

    function playSong(song) {
        currentSong = song;
        audio.src = song.file;
        audio.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        updatePlayerUI(song);
    }

    function togglePlay() {
        if (!currentSong) return;
        
        isPlaying = !isPlaying;
        if (isPlaying) {
            audio.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function updatePlayerUI(song) {
        document.querySelector('.song-info h2').textContent = song.title;
        document.querySelector('.song-info p').textContent = song.artist;
        document.querySelector('.album-art img').src = song.albumArt;
        totalTimeEl.textContent = formatTime(song.duration);
    }

    function updateProgress() {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${progress}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }

    function updateVolume(volume) {
        volumeFill.style.width = `${volume * 100}%`;
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Audio event listeners
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    // Initialize volume
    audio.volume = 0.7;
    updateVolume(0.7);

    async function loadSpotifyPlaylists() {
        const playlists = await spotifyApi.getUserPlaylists();
        const playlistList = document.getElementById('playlist-list');
        playlists.forEach(playlist => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-list"></i> ${playlist.name}`;
            li.addEventListener('click', () => displaySpotifyPlaylist(playlist.id));
            playlistList.appendChild(li);
        });
    }

    function displaySpotifyResults(tracks) {
        const recentSongs = document.getElementById('recent-songs');
        recentSongs.innerHTML = '';
        tracks.forEach(track => {
            const div = document.createElement('div');
            div.className = 'song-card';
            div.innerHTML = `
                <img src="${track.album.images[0].url}" alt="Album Art">
                <h3>${track.name}</h3>
                <p>${track.artists[0].name}</p>
            `;
            div.addEventListener('click', () => playSpotifyTrack(track));
            recentSongs.appendChild(div);
        });
    }

    async function playSpotifyTrack(track) {
        if (await spotifyApi.playTrack(track.uri)) {
            currentSong = track;
            updatePlayerUI({
                title: track.name,
                artist: track.artists[0].name,
                albumArt: track.album.images[0].url,
                duration: track.duration_ms / 1000
            });
            isPlaying = true;
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    function showProfileModal() {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>User Profile</h2>
                <div class="profile-info">
                    <img src="${userData.profilePhoto}" alt="Profile Photo">
                    <div class="info">
                        <h3>${userData.username}</h3>
                        <p>${userData.email}</p>
                    </div>
                </div>
                <button class="close-btn">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    function showSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Settings</h2>
                <div class="settings-section">
                    <h3>Audio Quality</h3>
                    <select id="audio-quality">
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div class="settings-section">
                    <h3>Notifications</h3>
                    <label class="switch">
                        <input type="checkbox" id="notifications-toggle">
                        <span class="slider"></span>
                    </label>
                </div>
                <button class="close-btn">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }

    function showLikedSongs() {
        const likedSongs = songManager.getAllSongs().filter(song => song.liked);
        displaySongs(likedSongs, 'Liked Songs');
    }

    function showRecentlyPlayed() {
        const recentlyPlayed = songManager.getRecentlyPlayed();
        displaySongs(recentlyPlayed, 'Recently Played');
    }

    function displaySongs(songs, title) {
        const section = document.getElementById('home-section');
        section.innerHTML = `
            <h2>${title}</h2>
            <div class="song-grid" id="recent-songs">
                ${songs.map(song => `
                    <div class="song-card">
                        <img src="${song.albumArt}" alt="Album Art">
                        <h3>${song.title}</h3>
                        <p>${song.artist}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Profile Edit Functions
    function openProfileEdit() {
        const modal = document.getElementById('profile-edit-modal');
        modal.classList.add('active');
        
        // Load current profile data
        const profileData = JSON.parse(localStorage.getItem('profileData')) || {
            displayName: 'Music Lover',
            bio: '',
            favoriteGenre: '',
            isPublic: true
        };

        document.getElementById('display-name').value = profileData.displayName;
        document.getElementById('bio').value = profileData.bio;
        document.getElementById('favorite-genre').value = profileData.favoriteGenre;
        document.getElementById('profile-visibility').checked = profileData.isPublic;
    }

    function closeProfileEdit() {
        document.getElementById('profile-edit-modal').classList.remove('active');
    }

    function saveProfile() {
        const profileData = {
            displayName: document.getElementById('display-name').value,
            bio: document.getElementById('bio').value,
            favoriteGenre: document.getElementById('favorite-genre').value,
            isPublic: document.getElementById('profile-visibility').checked,
            avatarSeed: localStorage.getItem('avatarSeed') || 'music-lover'
        };

        // Save to localStorage
        localStorage.setItem('profileData', JSON.stringify(profileData));

        // Update UI
        document.querySelectorAll('.profile-header span').forEach(span => {
            span.textContent = profileData.displayName;
        });

        closeProfileEdit();
        showToast('Profile updated successfully!');
    }

    function generateRandomAvatar() {
        const newSeed = Math.random().toString(36).substring(7);
        const newAvatarUrl = `https://api.dicebear.com/6.x/adventurer/svg?seed=${newSeed}`;
        
        document.querySelectorAll('.current-profile-pic img, .profile-header img, .user-profile img').forEach(img => {
            img.src = newAvatarUrl;
        });
        
        localStorage.setItem('avatarSeed', newSeed);
    }

    // Toast notification function
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Trigger reflow
        toast.offsetHeight;
        
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Add event listeners
    document.addEventListener('DOMContentLoaded', () => {
        // Load profile data on page load
        const profileData = JSON.parse(localStorage.getItem('profileData')) || {
            displayName: 'Music Lover',
            bio: '',
            favoriteGenre: '',
            isPublic: true
        };

        document.querySelectorAll('.profile-header span').forEach(span => {
            span.textContent = profileData.displayName;
        });

        // Add click event for random avatar button
        document.querySelector('.random-avatar-btn').addEventListener('click', generateRandomAvatar);

        // Add click event for profile edit button in dropdown menu
        const editProfileBtn = document.querySelector('[data-action="edit-profile"]');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', openProfileEdit);
        }
    });
}); 