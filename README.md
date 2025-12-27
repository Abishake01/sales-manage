# Stock Distribution and Enquiry Management System

A full-stack web application for managing stock distribution, enquiries, and seller-customer relationships. Built with React (frontend) and Express.js (backend).

## Features

### Phase 1: localStorage-based (Current)
- ✅ Secure user authentication (login/register)
- ✅ User-specific data isolation
- ✅ Enquiry/transaction creation with:
  - Seller and customer details (name, address)
  - Transaction metadata (engagement number, enquiry number, date, status)
  - Dynamic editable item table with auto-calculation
- ✅ Excel import/export functionality
- ✅ PDF enquiry generation
- ✅ Data persistence in browser localStorage

### Phase 2: Database-backed (Available)
- ✅ Express.js REST API backend
- ✅ SQLite database for data persistence
- ✅ JWT-based authentication
- ✅ RESTful APIs for enquiries, customers, and sellers

## Project Structure

```
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # Storage and API services
│   │   └── App.js
│   └── package.json
├── backend/           # Express.js backend
│   ├── routes/        # API routes
│   ├── database/      # Database setup
│   └── server.js
└── README.md
```

## Installation

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

## Usage

### localStorage Mode (Default)

By default, the application uses localStorage for data persistence. Simply:
1. Register a new account or login
2. Create enquiries with seller and customer details
3. Add items to enquiries using the dynamic table
4. Import/export Excel files
5. Generate PDF enquiries

### Database Mode (Optional)

To use the backend API instead of localStorage:

1. Start the backend server
2. Update the frontend API service to point to `http://localhost:5000`
3. The frontend will automatically switch to API mode

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Enquiry
- `GET /api/enquiry` - Get all enquiry (requires auth)
- `GET /api/enquiry/:id` - Get single enquiry (requires auth)
- `POST /api/enquiry` - Create/update enquiry (requires auth)
- `DELETE /api/enquiry/:id` - Delete enquiry (requires auth)

### Customers
- `GET /api/customers` - Get all customers (requires auth)
- `POST /api/customers` - Create/update customer (requires auth)

### Sellers
- `GET /api/sellers` - Get all sellers (requires auth)
- `POST /api/sellers` - Create/update seller (requires auth)

## Enquiry Item Fields

Each enquiry item includes:
- Description
- Part Number
- Made
- Quantity
- Unit Price
- Sale Price
- Sub Name
- UOM (Unit of Measure)

Total is automatically calculated as: `Quantity × Unit Price`

## Excel Import/Export

### Import Format
The Excel file should have columns matching:
- Item Description
- Part Number
- Made
- Quantity
- Unit Price
- Sale Price
- Sub Name
- UOM

### Export Format
Exports use the same column structure for easy reuse.

## PDF Enquiry

The PDF includes:
- Company header
- Enquiry details (number, date, engagement number, status)
- Seller and customer information
- Complete itemized table
- Total amount
- Professional formatting

## Technology Stack

- **Frontend**: React 18, React Router, XLSX (SheetJS), jsPDF
- **Backend**: Express.js, SQLite3, bcryptjs, jsonwebtoken
- **Storage**: localStorage (Phase 1) / SQLite (Phase 2)

## Future Enhancements

- Inventory tracking
- Payment management
- Advanced reporting and analytics
- Multi-currency support
- Email enquiry delivery
- Mobile responsive improvements

## License

MIT

