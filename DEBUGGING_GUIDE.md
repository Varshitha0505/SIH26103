# ProjectIQ Debugging Guide

## Current Issues & Solutions

### Issue 1: Missing Python Dependencies
**Error**: `ModuleNotFoundError` for flask, flask_cors, pandas, etc.
**Cause**: Python packages not installed
**Solution**: 
```bash
pip install -r requirements.txt
```

### Issue 2: Analytics Module Import Failed
**Error**: `ImportError: cannot import name 'calculate_analytics'` or similar
**Cause**: Missing __init__.py in ai-analytics folder
**Solution**: ✅ FIXED - Added __init__.py to ai-analytics/

### Issue 3: Path Resolution Issues
**Error**: Flask app can't find ai-analytics module when running from different directory
**Cause**: sys.path.append in app.py might not work correctly
**Solution**: Ensure running Flask from correct directory:
```bash
cd ML-engine
python app.py
```

### Issue 4: CORS Issues (Frontend ↔ Backend)
**Error**: "Access to XMLHttpRequest blocked by CORS policy"
**Cause**: flask-cors not configured properly
**Solution**: ✅ ALREADY CONFIGURED in app.py
- CORS(app) is enabled
- All endpoints support cross-origin requests

---

## Quick Start Guide

### Option A: Using Batch Script (Easiest)
```bash
startup.bat
```
This will:
1. Install all Python dependencies
2. Install all Node.js dependencies
3. Start Flask backend (http://127.0.0.1:5000)
4. Start React frontend (http://localhost:5173)

### Option B: Manual Startup

**Terminal 1 - Backend:**
```bash
cd C:\Users\DELL\Desktop\SIH26103\SIH26103
python -m pip install -r requirements.txt
cd ML-engine
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd C:\Users\DELL\Desktop\SIH26103\SIH26103\frontend
npm install
npm run dev
```

---

## Verification Steps

### 1. Test Backend API
```bash
curl http://127.0.0.1:5000/
# Expected: {"message": "Project Risk Prediction API is running", "status": "success"}

curl http://127.0.0.1:5000/projects
# Expected: JSON with 143 projects
```

### 2. Test Frontend
- Open browser: http://localhost:5173
- Check console for errors: F12 → Console tab
- Navigate through pages: Dashboard → Projects → Analytics → etc.

### 3. Common Frontend Errors

**Error**: "Cannot find module '@icons/lucide'"
```bash
cd frontend
npm install lucide-react
```

**Error**: "Cannot find module 'recharts'"
```bash
cd frontend
npm install recharts
```

**Error**: "Cannot find module 'react-router-dom'"
```bash
cd frontend
npm install react-router-dom
```

---

## File Structure Verification

Expected structure:
```
SIH26103/
├── ML-engine/
│   ├── app.py ✓
│   ├── risk_analysis.py ✓
│   ├── risk_model.pkl ✓
│   ├── data/
│   │   └── project_predictions.csv ✓
│   └── __pycache__/
├── ai-analytics/
│   ├── __init__.py ✓ (just added)
│   ├── analytics.py ✓
│   └── recommendations.py ✓
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx ✓
│   │   │   ├── Projects.jsx ✓
│   │   │   ├── ProjectDetails.jsx ✓
│   │   │   ├── Analytics.jsx ✓ (newly created)
│   │   │   ├── EarlyWarnings.jsx ✓ (newly created)
│   │   │   ├── RiskMatrix.jsx ✓ (newly created)
│   │   │   ├── Benchmarking.jsx ✓ (newly created)
│   │   │   ├── AIAssistant.jsx ✓ (newly created)
│   │   │   └── Methodology.jsx ✓ (newly created)
│   │   ├── utils/
│   │   │   └── projectUtils.js ✓ (newly created)
│   │   └── App.jsx ✓
│   ├── package.json ✓
│   └── vite.config.js ✓
├── data/
│   └── projects.csv
├── requirements.txt ✓ (just added)
└── startup.bat ✓ (just added)
```

---

## ML Model Information

**Model File**: ML-engine/risk_model.pkl
**Type**: Random Forest Classifier
**Input Features**: 
- cost_escalation
- schedule_delay
- expenditure
- physical_progress

**Output**: 
- risk_level (LOW/MEDIUM/HIGH/CRITICAL)
- confidence (0-100)

---

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/projects` | GET | Get all projects with predictions |
| `/predict` | POST | Get risk prediction for single project |
| `/analytics` | POST | Calculate portfolio analytics |

---

## Environment Variables (if needed)

Currently not required, but can be added to `.env` file:
```
FLASK_ENV=development
FLASK_DEBUG=True
REACT_APP_API_URL=http://127.0.0.1:5000
```

---

## Troubleshooting Checklist

- [ ] Python 3.8+ installed: `python --version`
- [ ] Node.js 16+ installed: `node --version`
- [ ] All dependencies installed: `pip list` and `npm list`
- [ ] Flask backend running on port 5000
- [ ] React frontend running on port 5173 (or assigned port)
- [ ] No firewall blocking localhost ports
- [ ] Browser console (F12) shows no errors
- [ ] Network tab shows /projects API call succeeding
- [ ] CSV file exists: `ML-engine/data/project_predictions.csv`
- [ ] Model file exists: `ML-engine/risk_model.pkl`

---

## Additional Notes

1. **Data Source**: 143 projects from CSV file (not a live database)
2. **Real-time**: Data updates only when CSV is modified
3. **Model**: Uses pre-trained Random Forest (no retraining needed)
4. **Styling**: Tailwind CSS for UI
5. **Charts**: Recharts library for visualizations

---

## Next Steps

1. Run `startup.bat` to start both servers
2. Open http://localhost:5173 in browser
3. Verify all 9 pages load correctly:
   - Dashboard
   - Projects
   - ProjectDetails
   - Analytics
   - EarlyWarnings
   - RiskMatrix
   - Benchmarking
   - AIAssistant
   - Methodology

4. Test data flow: Dashboard → Click any project → Details should load with AI predictions

---

## Support

If errors persist:
1. Check terminal output for specific error messages
2. Verify Python/Node versions match requirements
3. Delete node_modules and package-lock.json, run `npm install` again
4. Delete __pycache__ folders and reinstall Python packages
5. Ensure no other services running on ports 5000 and 5173
