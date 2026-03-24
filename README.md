# Business-Analysis-System

A modern full-stack application for data analysis combining a React frontend with a Django REST API backend.

## Quick Start

### Backend (Django)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` to use the application.

## Features

✅ Drag-and-drop CSV file upload  
✅ Automatic data cleaning (duplicates, missing values)  
✅ Outlier detection using IQR method  
✅ Comprehensive statistical analysis  
✅ Before/after comparison reports  
✅ Beautiful, responsive UI  

## Tech Stack

- **Frontend**: React 18, Axios
- **Backend**: Django, Django REST Framework
- **Data Processing**: Pandas, NumPy

## File Requirements

- CSV format
- Max 5MB
- Must contain at least one numeric column

See [SETUP.md](SETUP.md) for detailed installation and usage instructions.