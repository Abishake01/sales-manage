# Quick Start Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Getting Started

### Option 1: localStorage Mode (Default - No Backend Required)

1. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the Frontend**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

3. **Start Using the App**
   - Register a new account
   - Create enquiries
   - All data is stored in your browser's localStorage

### Option 2: Full Stack Mode (With Backend)

1. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Start the Backend Server**
   ```bash
   npm start
   ```
   The API will run at `http://localhost:5000`

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure Frontend to Use API**
   Create a `.env` file in the `frontend` directory:
   ```
   REACT_APP_USE_API=true
   REACT_APP_API_URL=http://localhost:5000/api
   ```

5. **Start the Frontend**
   ```bash
   npm start
   ```

## First Steps

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Enquiry**: Click "Create New Enquiry" from the dashboard
3. **Fill Details**: 
   - Enter transaction details (engagement number, enquiry number, date, status)
   - Add seller and customer information
   - Add enquiry items using the table
4. **Import Excel**: Click "Import Excel" to bulk import items
5. **Export**: Use "Export Excel" or "Download PDF" to save your enquiry

## Excel Import Format

Your Excel file should have these columns (case-insensitive):
- Item Description
- Part Number
- Made
- Quantity
- Unit Price
- Sale Price
- Sub Name
- UOM

## Troubleshooting

### Frontend won't start
- Make sure port 3000 is not in use
- Check that all dependencies are installed (`npm install`)

### Backend won't start
- Make sure port 5000 is not in use
- Check that SQLite3 is properly installed
- Verify Node.js version is 14+

### Database errors
- The SQLite database is created automatically in `backend/database/database.sqlite`
- Delete this file to reset the database

## Development

### Frontend Development
```bash
cd frontend
npm start  # Starts development server with hot reload
```

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-restart
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```
The build folder contains the production-ready files.

### Backend
```bash
cd backend
npm start
```
Make sure to set environment variables in production:
- `PORT`: Server port
- `JWT_SECRET`: Secret key for JWT tokens

