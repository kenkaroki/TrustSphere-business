# Business Growth Platform

An AI-powered platform to help businesses and SMEs grow and succeed, powered by Google's Gemini 2.5 Flash AI model.

## Features

### 🚀 Core Features
- **AI-Powered Business Insights**: Get personalized insights and recommendations for your business
- **Interactive AI Assistant**: Chat with an AI business advisor for real-time guidance
- **Business Analytics**: Track metrics, visualize trends, and analyze performance
- **Growth Recommendations**: Receive prioritized, actionable growth strategies
- **Market Insights**: Get industry-specific market trends and opportunities
- **Metric Analysis**: AI-powered analysis of your business metrics

### 🤖 AI Capabilities (Gemini 2.5 Flash)
- Business strategy recommendations
- Market analysis and competitive insights
- Performance metrics analysis
- Growth plan generation
- Real-time Q&A assistant
- Personalized action items

## Tech Stack

### Backend
- **FastAPI**: Modern, fast Python web framework
- **Google Gemini AI**: Advanced AI model (gemini-2.0-flash-exp)
- **SQLAlchemy**: SQL database ORM
- **SQLite**: Lightweight database
- **Pydantic**: Data validation

### Frontend
- **React 18**: Modern UI library
- **Vite**: Fast build tool
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Axios**: HTTP client
- **Lucide React**: Beautiful icons

## Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

### 1. Clone or Navigate to the Repository

```bash
cd "C:\Users\kenka\Desktop\Trust sphere v2"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env and add your Gemini API key
```

**Configure your `.env` file:**
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=sqlite:///./business_growth.db
SECRET_KEY=your-secret-key-change-this-in-production
```

### 3. Frontend Setup

```bash
# Open a new terminal
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start Backend Server

```bash
# In backend directory with venv activated
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API documentation: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
# In a new terminal
cd frontend
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage Guide

### 1. Setup Your Business
1. Navigate to the **Setup** page
2. Fill in your business details:
   - Business name
   - Industry
   - Description
   - Owner email
3. Click "Create Business"
4. Note the Business ID for adding metrics

### 2. Add Business Metrics
1. Use the Business ID from step 1
2. Add metrics like:
   - Revenue
   - Customers
   - Growth rate
   - Conversion rate
3. Add historical data for better AI insights

### 3. Get AI Insights
**Dashboard:**
- Select your business
- Click "Get AI Insights" for personalized recommendations

**AI Assistant:**
- Chat with the AI for specific questions
- Get growth recommendations
- Ask about strategies, market trends, or specific challenges

**Analytics:**
- View visualized metrics
- Get AI-powered metric analysis
- Track trends over time

## API Endpoints

### Business Endpoints
- `POST /api/business/` - Create a business
- `GET /api/business/` - List all businesses
- `GET /api/business/{id}` - Get specific business
- `POST /api/business/metrics` - Add metric
- `GET /api/business/{id}/metrics` - Get business metrics

### AI Endpoints
- `POST /api/ai/insights/{business_id}` - Get AI insights
- `POST /api/ai/analyze-metrics/{business_id}` - Analyze metrics
- `POST /api/ai/growth-plan/{business_id}` - Generate growth plan
- `GET /api/ai/market-insights/{industry}` - Get market insights
- `POST /api/ai/ask` - Ask AI a question
- `POST /api/ai/recommendations/{business_id}` - Get recommendations
- `GET /api/ai/history/{business_id}` - Get interaction history

## Features Breakdown

### Dashboard
- Business overview
- Key metrics display
- Quick AI insights
- Quick action links

### AI Assistant
- Real-time chat interface
- Context-aware responses
- Growth recommendations
- Prioritized action items

### Analytics
- Interactive charts
- Revenue and customer trends
- Growth metrics visualization
- AI-powered metric analysis

### Setup
- Business profile creation
- Metric tracking setup
- Quick start guide

## Project Structure

```
Trust sphere v2/
├── backend/
│   ├── app/
│   │   ├── routers/          # API routes
│   │   │   ├── business.py   # Business endpoints
│   │   │   └── ai.py         # AI endpoints
│   │   ├── models/           # Data models
│   │   │   ├── database.py   # SQLAlchemy models
│   │   │   └── schemas.py    # Pydantic schemas
│   │   ├── services/         # Business logic
│   │   │   └── gemini_service.py  # Gemini AI integration
│   │   ├── config.py         # Configuration
│   │   └── main.py           # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Analytics.jsx
│   │   │   └── Setup.jsx
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── App.jsx           # Main app component
│   │   ├── App.css           # Global styles
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Environment Variables

**Backend (.env):**
- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: Secret key for security

## Development

### Adding New Features
1. Backend: Add routes in `backend/app/routers/`
2. Frontend: Add components in `frontend/src/components/` or pages in `frontend/src/pages/`
3. Update API service in `frontend/src/services/api.js`

### Testing the API
Visit `http://localhost:8000/docs` for interactive API documentation with Swagger UI.

## Troubleshooting

**Backend won't start:**
- Check if your Gemini API key is correctly set in `.env`
- Ensure Python virtual environment is activated
- Verify all dependencies are installed

**Frontend won't start:**
- Run `npm install` again
- Check Node.js version (16+)
- Clear `node_modules` and reinstall if needed

**AI not responding:**
- Verify Gemini API key is valid
- Check internet connection
- Review backend logs for errors

**CORS errors:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app/main.py`

## Security Notes

- Never commit your `.env` file
- Change the SECRET_KEY in production
- Keep your Gemini API key private
- Use environment variables for sensitive data

## Future Enhancements

- User authentication
- Multi-user support
- Export reports (PDF/Excel)
- Email notifications
- Advanced analytics dashboards
- Integration with accounting software
- Mobile app
- Team collaboration features

## License

This project is created for business growth and SME support.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation at `/docs`
3. Check backend logs for errors
4. Ensure all services are running

## Acknowledgments

- Powered by Google Gemini 2.5 Flash AI
- Built with FastAPI and React
- Designed for SME growth and success

---

**Start growing your business with AI today!** 🚀
