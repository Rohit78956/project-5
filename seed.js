const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function seedDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        // Create a test user
        const hashedPassword = await bcrypt.hash('password123', 10);
        const [userResult] = await connection.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            ['testuser', 'test@example.com', hashedPassword]
        );
        const userId = userResult.insertId;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        // Sample songs data with free-to-use music
        const sampleSongs = [
            {
                title: 'Sample Beat 1',
                artist: 'Free Music Archive',
                album: 'Sample Beats',
                duration: 180,
                file_path: '/uploads/sample_beat_1.mp3',
                album_art: 'https://via.placeholder.com/300'
            },
            {
                title: 'Ambient Soundscape',
                artist: 'Free Music Archive',
                album: 'Ambient Collection',
                duration: 240,
                file_path: '/uploads/ambient_soundscape.mp3',
                album_art: 'https://via.placeholder.com/300'
            },
            {
                title: 'Jazz Sample',
                artist: 'Free Music Archive',
                album: 'Jazz Collection',
                duration: 210,
                file_path: '/uploads/jazz_sample.mp3',
                album_art: 'https://via.placeholder.com/300'
            },
            {
                title: 'Electronic Loop',
                artist: 'Free Music Archive',
                album: 'Electronic Beats',
                duration: 195,
                file_path: '/uploads/electronic_loop.mp3',
                album_art: 'https://via.placeholder.com/300'
            },
            {
                title: 'Acoustic Guitar',
                artist: 'Free Music Archive',
                album: 'Acoustic Collection',
                duration: 225,
                file_path: '/uploads/acoustic_guitar.mp3',
                album_art: 'https://via.placeholder.com/300'
            }
        ];

        // Insert sample songs
        const songIds = [];
        for (const song of sampleSongs) {
            const [result] = await connection.execute(
                'INSERT INTO songs (title, artist, album, duration, file_path, album_art, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [song.title, song.artist, song.album, song.duration, song.file_path, song.album_art, userId]
            );
            songIds.push(result.insertId);
        }

        // Create sample playlists
        const samplePlaylists = [
            {
                name: 'Instrumental Mix',
                description: 'A collection of instrumental tracks'
            },
            {
                name: 'Study Music',
                description: 'Perfect for focusing and studying'
            }
        ];

        // Insert playlists and add songs to them
        for (const playlist of samplePlaylists) {
            const [result] = await connection.execute(
                'INSERT INTO playlists (name, description, user_id) VALUES (?, ?, ?)',
                [playlist.name, playlist.description, userId]
            );
            const playlistId = result.insertId;

            // Add songs to playlists
            if (playlist.name === 'Instrumental Mix') {
                // Add first 3 songs to Instrumental Mix playlist
                for (let i = 0; i < 3; i++) {
                    await connection.execute(
                        'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
                        [playlistId, songIds[i], i + 1]
                    );
                }
            } else {
                // Add last 2 songs to Study Music playlist
                for (let i = 3; i < 5; i++) {
                    await connection.execute(
                        'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)',
                        [playlistId, songIds[i], i - 2]
                    );
                }
            }
        }

        console.log('Database seeded successfully!');
        console.log('Please download the following free sample music files and place them in the uploads directory:');
        console.log('1. sample_beat_1.mp3');
        console.log('2. ambient_soundscape.mp3');
        console.log('3. jazz_sample.mp3');
        console.log('4. electronic_loop.mp3');
        console.log('5. acoustic_guitar.mp3');
        console.log('\nYou can find free music samples at:');
        console.log('- https://freemusicarchive.org/');
        console.log('- https://freesound.org/');
        console.log('- https://pixabay.com/music/');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await connection.end();
    }
}

seedDatabase(); 