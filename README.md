# ChessKidoo Website

A complete full-stack chess academy website built with vanilla HTML/CSS/JavaScript frontend and Node.js/Express backend.

## Features

- **Landing Page**: Professional marketing site with features, curriculum, coaches, and pricing
- **Authentication**: JWT-based login system with role-based access
- **Admin Portal**: Manage students, coaches, and classes
- **Student Portal**: View progress, schedule, and game reviews
- **Coach Portal**: Manage classes and student progress
- **Responsive Design**: Mobile-friendly interface
- **Mock API**: Works without backend for development

## Demo Credentials

- **Admin**: `admin@ck` / `Admin123$`
- **Student**: `student@ck` / `Student123`
- **Coach**: `coach@ck` / `Coach123`

## Local Development

### Frontend Only (Recommended for Vercel)
```bash
# Serve static files
python -m http.server 8080
# or
npx serve .
```

### Full Stack Development
```bash
# Install dependencies
npm install

# Start backend server
npm run dev
# Server runs on http://localhost:5000

# In another terminal, serve frontend
python -m http.server 8080
```

### Database Setup (PostgreSQL)
```bash
# Create database
createdb chesskidoo

# Run initialization script
psql -U postgres -d chesskidoo -f mock/db_init.sql
```

## Deployment

### Vercel (Frontend Only)
1. Push this code to GitHub
2. Connect repository to Vercel
3. Deploy - the site will be available at your Vercel domain

### Backend Deployment (Optional)
For full functionality, deploy the backend separately:
- **Railway**: `railway login && railway init`
- **Render**: Connect GitHub repo
- **Heroku**: `heroku create && git push heroku master`

## Project Structure

```
/ (project root)
├── index.html          # Landing page
├── login.html          # Login page
├── admin.html          # Admin dashboard
├── student.html        # Student dashboard
├── coach.html          # Coach dashboard
├── assets/
│   ├── css/style.css   # Main styles
│   ├── css/dashboard.css # Dashboard styles
│   └── js/             # JavaScript files
├── mock/               # Mock data and API
├── routes/             # Backend API routes
├── server.js           # Express server
├── db.js               # Database connection
└── package.json        # Dependencies
```

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Charts**: Chart.js
- **Deployment**: Vercel (frontend), various options for backend

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/students` - Get all students (admin)
- `GET /api/students/:id` - Get specific student
- `GET /api/coaches` - Get all coaches
- `GET /api/classes` - Get all classes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.