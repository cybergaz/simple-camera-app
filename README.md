# Simple Camera App

A simple mobile camera application built with React Native and Expo, featuring image/video capture, local gallery management, and cloud storage capabilities.

## Features

- 📸 Camera functionality for both photos and videos
- 🔄 Front/back camera switching
- 🖼️ Local gallery with preview support
- ☁️ Cloud storage integration with AWS S3
- 🗑️ Local file management
- 📱 Modern, intuitive UI

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v16 or newer)
- [Bun](https://bun.sh) (v1.1.43 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your mobile device


## Project Structure
```
simple-camera-app/
├── frontend/
│   ├── screens/           # Screen components
│   ├── components/        # Reusable UI components
│   ├── context/          # React Context providers
│   └── navigation/       # Navigation configuration
├── backend/
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   └── routes/      # API routes
│   └── index.ts        # Express server setup
└── shared/
    └── types/           # Shared TypeScript types
```

## Environment Setup

1. Create a `.env` file at `backend/.env` directory with the following variables:

```env
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket_name

DATABASE_URL=your_database_url
```

2. Create a `.env` file at `frontend/.env` directory with the following variables:

```env
EXPO_PUBLIC_SERVER_HOST=your_server_host (ip address of your machine)
EXPO_PUBLIC_SERVER_PORT=5000
```
> Note: in the server host, you must use the ip address of your machine where the server is running (local ipv4), you can't use `localhost` if you are running the server locally.

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cybergaz/simple-camera-app
cd simple-camera-app
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
bun install

# Install frontend dependencies
cd frontend
bun install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
bun run start
```
The server will start on `http://localhost:5000`

2. Start the frontend development server (in a new terminal):
```bash
cd frontend
bun run start
```

3. Launch the app:
   - 📱 Scan the QR code with Expo Go (Android)
   - 📱 Scan the QR code with Camera app (iOS)
   - 💻 Press 'a' for Android emulator
   - 💻 Press 'i' for iOS simulator


## Server API Documentation

### Authentication Endpoints

#### POST /auth/signin
- Login with email and password
- Request body: `{ email: string, password: string }`
- Response: `{ user: UserObject }`

#### POST /auth/signup
- Register new user
- Request body: `{ email: string, password: string}`
- Response: `{ user: UserObject }`

### Media Endpoints

#### POST /api/media/upload
- Upload media to S3
- Request: Multipart form data with 'media' field
- Headers: 
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <token>`
- Response: `{ url: string, key: string }`

### Error Responses
All endpoints return error responses in the format:
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Usage

1. **Camera Screen**
   - Take photos/videos using the capture button
   - Switch between front/back cameras
   - Access gallery via the gallery button

2. **Gallery Screen**
   - View all captured media
   - Tap to preview in full screen
   - Long press to enter selection mode
   - Delete selected files
   - Upload selected files to cloud

## Development

- Backend API runs on `http://localhost:5000`
- Uses TypeScript for type safety
- Follows React Native best practices
- Implements modern UI/UX patterns

## Troubleshooting

1. **Camera/Gallery Access Issues**
   - Ensure proper permissions are granted in device settings
   - Restart Expo Go app if camera is unresponsive

2. **Upload Failures**
   - Verify server host and port in `.env`
   - Check network connectivity
   - Ensure AWS S3 credentials are properly configured

3. **Server Issues**
   - Check if server is running on port 5000
   - Verify all environment variables are set correctly
   - Check server logs for detailed error messages
