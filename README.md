# Forensic File Management System

A web-based application for managing forensic files with metadata management and IPFS storage capabilities.

## Features

- File upload with metadata management
- Chain of custody tracking
- Automatic metadata extraction using exiftool-vendored
- IPFS storage using Pinata
- Interactive file listing with copyable IPFS CIDs

## Project Structure

```
forensic-file-system/
├── src/
│   ├── routes/
│   │   ├── upload.ts
│   │   └── files.ts
│   ├── services/
│   │   ├── pinataService.ts
│   │   └── metadataService.ts
│   ├── public/
│   │   ├── css/
│   │   └── js/
│   └── views/
│       ├── index.html
│       └── partials/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- ExifTool installed on your system ([ExifTool Installation Guide](https://exiftool.org/install.html))
- Pinata API credentials ([Get from Pinata](https://app.pinata.cloud/))

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd forensic-file-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```env
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_KEY=your_pinata_secret_key
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Usage

### File Upload
1. Navigate to the main page
2. Fill in the form with:
   - File selection
   - Brief description
   - Culprit Name
   - Chain of custody details
3. Click "Upload" to process and store the file

### Viewing Files
- All uploaded files are displayed in the table on the main page
- Hover over file names to see the IPFS CID
- Click on the file name to copy the IPFS CID to clipboard

## Technology Stack

- Backend: Node.js with Express
- Frontend: HTML, CSS, JavaScript
- File Processing: exiftool-vendored
- IPFS Storage: Pinata SDK
- Database: SQLite (for storing file metadata and references)

## API Documentation

### POST /api/upload
Uploads a file with metadata to IPFS via Pinata

Request:
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - file: File
  - description: string
  - culpritName: string
  - custodyDetails: string

Response:
```json
{
  "success": true,
  "ipfsCid": "Qm...",
  "fileDetails": {
    "name": "filename.ext",
    "size": 1234,
    "metadata": {}
  }
}
```

### GET /api/files
Retrieves all uploaded files

Response:
```json
{
  "files": [
    {
      "id": 1,
      "name": "filename.ext",
      "ipfsCid": "Qm...",
      "description": "...",
      "culpritName": "...",
      "custodyDetails": "...",
      "uploadedAt": "2025-02-26T12:42:22Z"
    }
  ]
}
```

## Error Handling

The application includes comprehensive error handling for:
- File upload failures
- IPFS storage issues
- Metadata extraction errors
- Invalid file types
- Network connectivity issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License