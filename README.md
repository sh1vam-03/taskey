# blacktime

<div align="center">
  <h3>Personal Productivity, Task Scheduling & Behavior Tracking Platform</h3>
  <p><strong>Plan better. Build habits. Track progress.</strong></p>
  <p>A full-stack productivity system designed for individuals who want structure, clarity, and consistency in daily life.</p>
</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Documentation](#-documentation)
- [Team](#-team)
- [Core Features](#-core-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Contributing](#-contributing)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#-environment-variables)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**blacktime** is a personal productivity and life-management platform that helps users:

### Key Capabilities

- plan daily and long-term tasks
- schedule routines and recurring activities
- track habits and behavior patterns
- reflect on productivity and well-being

Unlike generic to-do apps, Blacktime focuses on **time-based planning**, **routine repetition**, and **behavior tracking**,making it ideal for **students**, **self-learners**, and **professionals** who want to improve consistency and discipline.

This project is also built as a real-world backend-heavy portfolio project, following industry practices in authentication, database design, and API architecture.

---

## 🎯 Target Audience

- 🎓 Students managing study schedules & habits
- 💻 Self-learners tracking daily routines
- 🧑‍💼 Individuals planning work, gym, sleep, and personal goals
- 👨‍💻 Recruiters evaluating backend & full-stack skills
---

## 📚 Documentation

For detailed technical specifications, please refer to our internal documentation:

- **[📖 Agile Scrum Backlog](docs/scrum_backlog.md)** - Feature roadmap, sprint plans, and task assignments.
- **[🏗️ System Architecture](docs/architecture.md)** - High-level design, context diagrams, and tech stack details.
- **[🗄️ Database Schema](docs/database_schema.md)** - ER Diagrams, table definitions, and relationships.
- **[🧪 Testing Strategy](docs/testing_strategy.md)** - QA protocols, testing tools, and coverage goals.
- **[📡 API Documentation Hub](docs/api_documation.md)** - Central index for all API endpoints and specs.

---

## 👥 Team

Blacktime is a collaborative, real-world project developed by a small team of student developers. The focus is on **clean backend architecture, practical frontend development, API design, testing, and documentation**, aligned with internship and entry-level industry expectations.

---

<table align="center">
  <tr>
    <!-- Atharv -->
    <td align="center" width="33%">
      <img src="https://github.com/atharvkundalkar.png" width="110" alt="Atharv Kundalkar" /><br /><br />
      <strong>Atharv Kundalkar</strong><br />
      <sub>Frontend Developer</sub><br /><br />
      <div align="left">
        • UI / UX Implementation<br />
        • Reusable Component Design<br />
        • Responsive Layouts<br />
        • Frontend API Integration
      </div><br />
      <a href="https://github.com/atharvkundalkar">GitHub</a> |
      <a href="https://linkedin.com/in/atharv-kundalkar-52467028b">LinkedIn</a> |
      <a href="https://instagram.com/atharvkundalkar_47">Instagram</a><br />
      <sub>📧 atharvkundalkar1@gmail.com</sub>
    </td>
    <!-- Balaji -->
    <td align="center" width="33%">
      <img src="https://github.com/sh1vam-03.png" width="110" alt="Balaji Bokare" /><br /><br />
      <strong>Balaji Bokare</strong><br />
      <sub>Backend Developer</sub><br /><br />
      <div align="left">
        • REST API Development<br />
        • Authentication & Security<br />
        • Database Design & Queries<br />
        • Testing, Debugging & Documentation
      </div><br />
      <a href="https://github.com/sh1vam-03">GitHub</a> |
      <a href="https://linkedin.com/in/sh1vam~03">LinkedIn</a> |
      <a href="https://instagram.com/sh1vam_03">Instagram</a><br />
      <sub>📧 l1acker03@gmail.com</sub>
    </td>
    <!-- Dinesh -->
    <td align="center" width="33%">
      <img src="https://github.com/Dinesh-more99.png" width="110" alt="Dinesh More" /><br /><br />
      <strong>Dinesh More</strong><br />
      <sub>Frontend Developer</sub><br /><br />
      <div align="left">
        • UI Development & Styling<br />
        • Frontend–Backend Coordination<br />
        • UI Testing & Bug Fixes<br />
        • Layout & Usability Improvements
      </div><br />
      <a href="https://github.com/Dinesh-more99">GitHub</a> |
      <a href="https://linkedin.com/in/dinesh~more">LinkedIn</a> |
      <a href="https://instagram.com/dineshmore5523">Instagram</a><br />
      <sub>📧 dineshmore9970@gmail.com</sub>
    </td>
  </tr>
</table>

---

## 🚀 Open for Opportunities

We are open to:
- Internship & entry-level roles  
- Open-source collaboration  
- Feedback, reviews, and mentorship  

Feel free to reach out through GitHub or LinkedIn.


---

## ✨ Core Features

### 🔐 Authentication & Security

- Email-based user registration
- OTP verification for email confirmation
- JWT-based authentication (stateless)
- Secure logout & account deletion
- Password reset via OTP

### ✅ Task Management

- Create, update, and delete tasks
- Task priority (Low / Medium / High)
- Task status tracking (Pending / Completed)
- Optional due dates

### 📆 Scheduling & Calendar System

- Assign tasks to specific dates & time slot
- Multiple schedules for the same task (e.g., gym morning & evening)
- Recurring schedules:
    - Daily routines
    - Weekly (selected days like Mon/Wed/Fri)
    - Monthly patterns
- Designed for day / week / month calendar views

### 🔁 Routine & Habit Tracking

- Repeat tasks across multiple days
- Support for long-term routines (e.g., 30-day habits)
- Flexible recurrence rules

### 🧠 Behavior & Productivity Tracking

- Daily behavior logs
- Mood tracking
- Productivity score
- Sleep & exercise indicators
- Personal notes for reflection

### 🌐 Public Pages

- Home page
- About Taskey
- Privacy Policy
- Terms & Conditions
- Contact Us (stored in database)

---

### 🔄 Upcoming Features
- Productivity dashboard with charts
- AI-powered behavior analysis
- AI-powered productivity suggestions
- AI-powered habit tracking

---

## 📁 Project Structure

```

blacktime/
├── frontend/ # Next.js frontend application
│ ├── components/ # Reusable React components
│ ├── pages/ # Next.js pages and routing
│ ├── styles/ # CSS and styling files
│ └── utils/ # Utility functions and helpers
│
├── backend/ # Node.js + Express backend API
│ ├── controllers/ # Request handlers
│ ├── services/ # Business logic
│ ├── routes/ # API route definitions
│ ├── middleware/ # Custom middleware
│ └── config/ # Configuration files
│
├── docs/ # Documentation and specifications
│ ├── api/ # API documentation
│ └── ... # System architecture docs
│
├── .gitignore # Git ignore rules
├── LICENSE # MIT License
└── README.md # Project documentation

```

---

## 🛠️ Tech Stack

<table>
  <thead>
    <tr>
      <th>Frontend</th>
      <th>Backend</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
      <table>
  <thead>
    <tr>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Next.js</td>
      <td>React framework for production</td>
    </tr>
    <tr>
      <td>Tailwind CSS</td>
      <td>Utility-first CSS framework</td>
    </tr>
    <tr>
      <td>HTML5/CSS3</td>
      <td>Core web technologies</td>
    </tr>
    <tr>
      <td>Axios</td>
      <td>HTTP client for API requests</td>
    </tr>
  </tbody>
</table>
      </td>
      <td>
      <table>
  <thead>
    <tr>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Node.js</td>
      <td>JavaScript runtime environment</td>
    </tr>
    <tr>
      <td>Express.js</td>
      <td>Web application framework</td>
    </tr>
    <tr>
      <td>JWT</td>
      <td>Authentication and authorization</td>
    </tr>
    <tr>
      <td>bcrypt</td>
      <td>Password hashing</td>
    </tr>
  </tbody>
</table>
      </td>
    </tr>
  </tbody>
</table>

### Database

- **PostgreSQL** database
- **Prisma** ORM

### Development Tools

- **Git & GitHub** - Version control and collaboration
- **Postman** - API development and testing
- **ESLint** - Code linting and formatting
- **dotenv** - Environment variable management

---

## 🤝 Contributing

- Clear role ownership with cross-support
- GitHub-based collaboration (issues, commits, pull requests)
- Focus on clean code, learning, and maintainability

### Branch Naming Convention

- `feature/feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/critical-fix` - Urgent production fixes
- `docs/update-description` - Documentation updates

### Commit Message Format

- Brief description
- More detailed explanation if needed
- Use bullet points for multiple changes


**Types:** Add, Update, Fix, Remove, Refactor, Docs, Style, Test

---

### How to Contribute

1. **Fork the repository**
   - Click the "Fork" button at the top right of this page

2. **Clone your fork**
```
git clone https://github.com/sh1vam-03/blacktime.git
cd blacktime
```


3. **Create a feature branch**
```
git checkout -b feature/amazing-feature
```


4. **Make your changes**
- Write clean, readable code
- Follow the existing code style
- Add comments where necessary

5. **Commit your changes**
```
git commit -m "Add: amazing feature description"
```


6. **Push to your branch**
```
git push origin feature/amazing-feature
```


7. **Open a Pull Request**
- Provide a clear description of your changes
- Link any related issues

### Code Style Guidelines

- Use meaningful variable and function names
- Keep functions small and focused
- Write self-documenting code
- Add comments for complex logic
- Follow ESLint rules

### Reporting Issues

Found a bug or have a suggestion? [Open an issue](https://github.com/sh1vam/blacktime/issues) with:
- Clear title and description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **Git** (v2.30.0 or higher)
- **Code Editor** (VS Code recommended)

---

### Backend Setup

1. Navigate to the backend directory:
```
cd backend
```


2. Install dependencies:
```
npm install
```


3. Create a `.env` file (see [Environment Variables](#-environment-variables))

4. Start the development server:
```
npm run dev
```


5. Verify the server is running:
- Server URL: `http://localhost:5000`
- Health check: `GET http://localhost:5000/api/health`

---

### Frontend Setup

1. Navigate to the frontend directory:
```
cd frontend
```


2. Install dependencies:
```
npm install
```


3. Start the development server:
```
npm run dev
```


4. Open your browser and visit:
```
http://localhost:3000
```


---

## 🔐 Environment Variables

Create a `.env` file in the **backend** directory with the following variables:
```
# Server Configuration
PORT=5000

# JWT Configuration
JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10

# Supabase Configuration
DATABASE_URL=postgresql://USER:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```


> **Note:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ℹ️ Attribution required
- ℹ️ License and copyright notice must be included

---

## 💬 Support

### Getting Help

- 📖 **Documentation:** Check the `/docs` folder for detailed guides
- 🐛 **Bug Reports:** [Open an issue](https://github.com/sh1vam-03/blacktime/issues)
- 💡 **Feature Requests:** [Start a discussion](https://github.com/sh1vam-03/blacktime/discussions)
- 👥 **Team Contact:** Reach out to any team member via their social links above

### Show Your Support

If you find this project helpful:
- ⭐ **Star this repository** to show your support
- 🍴 **Fork it** to build your own version
- 📢 **Share it** with others who might benefit
- 🤝 **Contribute** to make it even better

---

## 🏆 Acknowledgments

Special thanks to:
- Our mentors and instructors who guided us throughout this project
- The open-source community for inspiration and resources
- Everyone who has contributed to making this project better

---

<div align="center">
<p><strong>Built with ❤️ by the blacktime Team</strong></p>
<p>Making productivity simple and accessible for everyone</p>

<br>

<p>
 <a href="https://github.com/atharvkundalkar">Atharv Kundalkar</a> •
 <a href="https://github.com/sh1vam-03">Balaji Bokare</a> •
 <a href="https://github.com/Dinesh-more99">Dinesh More</a>
</p>

<br>

<p>
 <a href="#taskey">Back to Top ↑</a>
</p>
</div>

---
