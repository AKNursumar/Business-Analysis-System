# Business Analytics System - Full Stack

A comprehensive data analytics platform with a React frontend and Django backend. Users can upload CSV files, and the system automatically cleans the data, handles outliers, and displays detailed analysis results.

## 📋 Project Structure

```
Business-Analysis-System/
├── backend/                      # Django REST API
│   ├── config/                  # Django settings
│   ├── analysis_api/            # Main API app
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py       # Data serializers
│   │   ├── services.py          # Business logic
│   │   └── urls.py              # API routes
│   ├── manage.py
│   └── requirements.txt
├── frontend/                     # React application
│   ├── public/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── src/                         # Original Python analysis scripts
│   ├── analysis.py
│   ├── data_cleaning.py
│   ├── data_loader.py
│   └── outlier_handling.py
└── main.py
```

## ✨ Features

- **File Upload**: Drag-and-drop or click to upload CSV files
- **Data Inspection**: View data shape, columns, data types, and missing values
- **Data Cleaning**: Automatic duplicate removal and missing value handling
- **Outlier Detection**: IQR-based outlier removal
- **Statistical Analysis**: Mean, median, min, max, and sum calculations
- **Before/After Comparison**: See statistics before and after outlier removal
- **Responsive UI**: Works on desktop and mobile devices

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Step 1: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```

The backend API will be available at `http://localhost:8000`

### Step 2: Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`

## 🚀 Usage

1. Open `http://localhost:3000` in your browser
2. Upload a CSV file by:
   - Clicking the upload area and selecting a file, OR
   - Dragging and dropping a file
3. Wait for the analysis to complete
4. View results in different tabs:
   - **Data Inspection**: Overview of your dataset
   - **Cleaning Report**: Details about what was cleaned
   - **Stats (Before)**: Statistical summary before outlier removal
   - **Stats (After)**: Statistical summary after outlier removal
5. Click "Upload Another File" to analyze a different dataset

## 📊 API Endpoints

### Health Check
```
GET /api/health/
```
Returns: `{"status": "API is running"}`

### Analyze File
```
POST /api/analyze/
Content-Type: multipart/form-data

Body: file (CSV file)
```

Returns:
```json
{
  "inspection": {
    "shape": [1000, 10],
    "columns": ["col1", "col2", ...],
    "data_types": {...},
    "missing_values": {...},
    "sample_data": [...]
  },
  "cleaning_report": {
    "duplicates_removed": 5,
    "numeric_columns_filled": {...},
    "categorical_columns_filled": {...}
  },
  "stats_before": {
    "mean": {...},
    "median": {...},
    "min": {...},
    "max": {...},
    "sum": {...}
  },
  "stats_after": {
    "mean": {...},
    "median": {...},
    "min": {...},
    "max": {...},
    "sum": {...}
  },
  "rows_before_outlier_removal": 995,
  "rows_after_outlier_removal": 987,
  "outliers_removed": 8
}
```

## ⚙️ Configuration

### Django Settings (`backend/config/settings.py`)

- Maximum file size: 5MB
- Allowed hosts: All (change in production)
- CORS enabled for localhost:3000
- SQLite database (can upgrade to PostgreSQL)

### Environment Variables (Optional)

Create a `.env` file in the backend directory:
```
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📝 File Requirements

- **Format**: CSV (Comma-Separated Values)
- **Maximum Size**: 5MB
- **Must contain**: At least one numeric column for analysis
- **Recommended**: Include headers in the first row

## 🐛 Troubleshooting

### Port Already in Use
If port 8000 or 3000 is already in use:

```bash
# For Django (use different port):
python manage.py runserver 8001

# For React:
PORT=3001 npm start
```

### CORS Issues
Make sure both backend and frontend are running, and the frontend is configured to proxy to the correct backend URL in `package.json`.

### File Upload Fails
- Verify the file is a valid CSV format
- Check file size is under 5MB
- Ensure the CSV has proper headers

## 🔧 Development Notes

### Backend Tech Stack
- **Django 4.2**: Web framework
- **Django REST Framework**: API development
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing

### Frontend Tech Stack
- **React 18**: UI library
- **Axios**: HTTP client
- **CSS3**: Styling

## 📦 Deploying to Production

### Backend (Django)
1. Set `DEBUG = False` in `settings.py`
2. Generate a secure `SECRET_KEY`
3. Update `ALLOWED_HOSTS` with your domain
4. Configure a production database (PostgreSQL recommended)
5. Use gunicorn: `pip install gunicorn`
6. Deploy to Heroku, AWS, or other platforms

### Frontend (React)
1. Build the application: `npm run build`
2. Deploy the `build/` directory to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Need help?** Check the troubleshooting section or create an issue in the repository.
