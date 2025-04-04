# Music Player Application

A full-stack music player application with a Node.js backend and MySQL database.

## Features

- User authentication (register/login)
- Song upload and management
- Playlist creation and management
- Like/unlike songs
- Recently played songs tracking
- Secure file storage
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd music-player
```

2. Install dependencies:
```bash
npm install
```

3. Create a MySQL database:
```sql
CREATE DATABASE music_player;
```

4. Import the database schema:
```bash
mysql -u root -p music_player < database.sql
```

5. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the values in `.env` with your configuration

6. Create the uploads directory:
```bash
mkdir uploads
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Songs
- `POST /api/songs` - Upload a new song
- `GET /api/songs` - Get all songs
- `POST /api/songs/:songId/like` - Like a song
- `DELETE /api/songs/:songId/like` - Unlike a song
- `POST /api/songs/:songId/play` - Record a song play

### Playlists
- `POST /api/playlists` - Create a new playlist
- `POST /api/playlists/:playlistId/songs` - Add a song to a playlist

### Recently Played
- `GET /api/recently-played` - Get recently played songs

## Security

- All routes except register and login require authentication
- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- File uploads are restricted to audio files only

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License. 