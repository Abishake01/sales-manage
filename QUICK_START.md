# Quick Start Guide - New Multi-Page System

## What's New

### 🎯 New Pages
1. **Dashboard** - Statistics and analytics view
2. **Enquiry** - Create and manage enquiries
3. **Quotation** - View enquiries as quotations (Qty × Unit Price)
4. **Purchase** - View enquiries as purchase orders (Qty × Sub Price)

### 📊 Dashboard Features
- **4 Stat Cards**: Total Enquiries, Quotations, Purchases, Total Amount
- **Analytics Chart**: Bar graph showing distribution
- **Recent Enquiries**: Latest 5 enquiries in table format

### 📝 Enquiry Page
- **Create New Enquiry** button to add new entries
- **Edit/Delete** actions for each enquiry
- **UOM Field** is now a dropdown with options: nes, pcts, pks, ltrs, roll
- **Auto-calculation**: Quantity × Unit Price = Total

### 🎯 Quotation Page
- Shows enquiries in quotation context
- **View** button opens detailed quotation
- **Excludes** Sub Name and Sub Price columns
- **Total Calculation**: Qty × Unit Price
- **PDF Export** available

### 🛒 Purchase Page
- Shows enquiries in purchase order context
- **View** button opens purchase order details
- **Shows** Sub Price field
- **Total Calculation**: Qty × Sub Price (different from quotation)
- **PDF Export** available

---

## Running the Application

### Backend
```bash
cd backend
bun run dev
```
Server runs on: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm start
```
Application runs on: http://localhost:3000

---

## Navigation

The left sidebar provides quick access to all pages:
- 📊 **Dashboard** - Overview and statistics
- 📝 **Enquiry** - Create and manage enquiries
- 🎯 **Quotation** - View as quotations
- 🛒 **Purchase** - View as purchase orders

---

## Key Improvements

### 1. UOM Dropdown
**Before**: Text input field
**After**: Select dropdown with 5 predefined options
```
Options: nes, pcts, pks, ltrs, roll
```

### 2. Calculations
**Enquiry/Quotation**: Total = Quantity × Unit Price
**Purchase**: Total = Quantity × Sub Price

### 3. Page-Specific Views
- **Quotation**: Hides Sub Name and Sub Price
- **Purchase**: Shows Sub Price instead of Unit Price
- **Enquiry**: Shows all fields with edit capability

### 4. Dashboard Analytics
- Real-time stat cards
- Visual bar chart
- Summary of recent activity

---

## Data Flow

```
User Login
    ↓
Dashboard (View stats)
    ↓
Enquiry Page (Create/Edit/Delete)
    ↓
Quotation Page (View as quotation) OR Purchase Page (View as purchase)
    ↓
PDF Export (Optional)
```

---

## File Structure

```
frontend/src/
├── components/
│   ├── Dashboard.js (Updated)
│   ├── Dashboard.css (Updated)
│   ├── EnquiryForm.js (Updated - UOM dropdown)
│   ├── EnquiryForm.css (Updated)
│   ├── EnquiryList.js (New)
│   ├── EnquiryList.css (New)
│   ├── QuotationList.js (New)
│   ├── QuotationList.css (New)
│   ├── QuotationDetail.js (New)
│   ├── QuotationDetail.css (New)
│   ├── PurchaseList.js (New)
│   ├── PurchaseList.css (New)
│   ├── PurchaseDetail.js (New)
│   ├── PurchaseDetail.css (New)
│   ├── Sidebar.js (New)
│   ├── Sidebar.css (New)
│   └── ...other components
├── App.js (Updated with new routes)
└── ...rest of application
```

---

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | Redirects to `/dashboard` | Home |
| `/login` | Login | Authentication |
| `/dashboard` | Dashboard | Main view with stats |
| `/enquiry` | EnquiryList | List all enquiries |
| `/enquiry/new` | EnquiryForm | Create new |
| `/enquiry/:id` | EnquiryForm | Edit existing |
| `/quotation` | QuotationList | List as quotations |
| `/quotation/:id` | QuotationDetail | View quotation |
| `/purchase` | PurchaseList | List as purchases |
| `/purchase/:id` | PurchaseDetail | View purchase |

---

## Styling

### Colors
- **Primary Gradient**: #667eea → #764ba2 (Purple)
- **Success**: #27ae60 (Green)
- **Warning**: #f39c12 (Orange)
- **Error**: #e74c3c (Red)
- **Neutral**: #95a5a6 (Gray)

### Layout
- **Sidebar Width**: 250px (fixed)
- **Content Margin**: margin-left: 250px (for all pages)
- **Responsive Breakpoint**: 768px

---

## Common Tasks

### Create New Enquiry
1. Navigate to **Enquiry** page
2. Click **+ Create New Enquiry**
3. Fill in details (Customer, Seller, Items)
4. Set UOM using dropdown
5. View auto-calculated totals
6. Click **Save**

### View as Quotation
1. Navigate to **Quotation** page
2. Find enquiry in list
3. Click **View**
4. See quotation without Sub Name/Sub Price
5. Export as PDF if needed

### Create Purchase Order
1. Navigate to **Purchase** page
2. Find enquiry in list
3. Click **View**
4. See purchase with Sub Price
5. Export as PDF if needed

---

## Troubleshooting

### Page not loading?
1. Check browser console for errors
2. Ensure sidebar component is imported
3. Verify all routes are defined in App.js

### Data not persisting?
1. Check localStorage in DevTools
2. Ensure storageService methods are called
3. Verify user ID is being passed correctly

### UOM dropdown not showing?
1. Check EnquiryForm.js for select element
2. Ensure options are defined with correct values
3. Verify CSS classes are applied

---

## Performance Tips

- Dashboard loads first 5 recent enquiries (not all)
- Data cached in localStorage for instant access
- PDF generation is client-side (no server load)
- Sidebar is fixed position (no scroll performance impact)

---

## Support

For issues or questions:
1. Check the implementation details in components
2. Review the IMPLEMENTATION_SUMMARY.md
3. Check browser console for error messages
4. Verify backend is running (port 5000)
5. Clear localStorage if data seems corrupted

