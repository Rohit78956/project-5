class SpotifyAPI {
    constructor() {
        this.clientId = 'YOUR_CLIENT_ID'; // Replace with your Spotify Client ID
        this.redirectUri = 'http://localhost:8000/callback.html';
        this.scopes = [
            'user-read-private',
            'user-read-email',
            'user-library-read',
            'user-library-modify',
            'playlist-read-private',
            'playlist-modify-public',
            'playlist-modify-private',
            'user-read-playback-state',
            'user-modify-playback-state'
        ];
        this.accessToken = localStorage.getItem('spotify_access_token');
        this.refreshToken = localStorage.getItem('spotify_refresh_token');
    }

    async initialize() {
        if (!this.accessToken) {
            await this.authenticate();
        }
    }

    async authenticate() {
        const authEndpoint = 'https://accounts.spotify.com/authorize';
        const params = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'code',
            redirect_uri: this.redirectUri,
            scope: this.scopes.join(' '),
            show_dialog: true
        });

        window.location.href = `${authEndpoint}?${params.toString()}`;
    }

    async handleCallback(code) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${this.clientId}:${this.clientSecret}`)
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: this.redirectUri
                })
            });

            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;

            localStorage.setItem('spotify_access_token', this.accessToken);
            localStorage.setItem('spotify_refresh_token', this.refreshToken);

            return true;
        } catch (error) {
            console.error('Error getting access token:', error);
            return false;
        }
    }

    async searchTracks(query) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            const data = await response.json();
            return data.tracks.items;
        } catch (error) {
            console.error('Error searching tracks:', error);
            return [];
        }
    }

    async getCurrentUser() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }

    async getUserPlaylists() {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/playlists', {
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`
                }
            });
            const data = await response.json();
            return data.items;
        } catch (error) {
            console.error('Error getting playlists:', error);
            return [];
        }
    }

    async createPlaylist(name, description = '') {
        try {
            const user = await this.getCurrentUser();
            const response = await fetch(`https://api.spotify.com/v1/users/${user.id}/playlists`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: description,
                    public: false
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating playlist:', error);
            return null;
        }
    }

    async addTracksToPlaylist(playlistId, trackUris) {
        try {
            const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: trackUris
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error adding tracks to playlist:', error);
            return null;
        }
    }

    async playTrack(trackUri) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me/player/play', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    uris: [trackUri]
                })
            });
            return response.ok;
        } catch (error) {
            console.error('Error playing track:', error);
            return false;
        }
    }
} 