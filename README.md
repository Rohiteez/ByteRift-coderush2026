# Aafno Pay

A secure FinTech platform that provides instant micro-loans to university students in Nepal during financial emergencies.

## Team Information

**Team Name:** Byte Rift

### Team Members

| Name           | Email                                                           | GitHub Username   |
| -------------- | --------------------------------------------------------------- | ----------------- |
| Rohit Adhikari | [rohit986158@gmail.com](mailto:rohit986158@gmail.com)           | **@Rohiteez**     |
| Sahil Maharjan | [sahilmaharjan619@gmail.com](mailto:sahilmaharjan619@gmail.com) | **@smzn01**       |
| Karan Magrati  | [karunmaurati@gmail.com](mailto:karunmaurati@gmail.com)         | **@KarunMagrati** |

## Project Details

**Project Title:** Aafno Pay

**Category:** ☑ FinTech

### Problem Statement

Many university students living away from home face urgent financial situations but need only a small amount of money (NPR 2,000–5,000). Traditional banks and lending services often require lengthy verification processes, guarantors, or collateral, making emergency financial assistance difficult to access. This creates unnecessary stress and can affect students' education and daily living.

### Solution Overview

Aafno Pay is a student-focused FinTech platform that enables verified university students to receive instant emergency micro-loans in a secure and transparent way. The platform verifies student identity through university enrollment, tracks loan applications and repayments, provides spending insights, and includes fraud detection features to promote responsible lending and financial safety.

## Technical Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React, Vite, Tailwind CSS |
| Backend        | Supabase                  |
| Database       | Supabase PostgreSQL       |
| Authentication | Supabase Auth             |
| Other          | REST APIs, GitHub, Vercel |

## Installation & Setup

### Prerequisites

* Node.js 18+
* npm
* Git

### Steps

```bash
# Clone the repository
git clone https://github.com/Nepalaya-IT-Club/aafno-pay.git

# Navigate to the project folder
cd aafno-pay

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will run locally on **http://localhost:5173**.

## Environment Variables

Create a `.env` file in the project root.

```bash
cp .env.example .env
```

| Variable               | Required | Description                      |
| ---------------------- | -------- | -------------------------------- |
| VITE_SUPABASE_URL      | Yes      | Your Supabase project URL.       |
| VITE_SUPABASE_ANON_KEY | Yes      | Your Supabase anonymous API key. |

## Demo Credentials

| Role    | Access                                                     |
| ------- | ---------------------------------------------------------- |
| Student | Register with demo student details inside the application. |
| Judge   | Full demo access for project demonstration.                |

## Demo Flow

1. Open the Aafno Pay application.
2. Register or log in as a student.
3. Complete student verification details.
4. Apply for an emergency micro-loan (NPR 2,000–5,000).
5. View loan approval status and repayment schedule.
6. Track spending insights and transaction history.

## Screenshots / Demo

Add screenshots of the application or include a demo video link here.

## Project Structure

```text
aafno-pay/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   └── assets/
├── public/
├── supabase/
│   ├── migrations/
│   └── config/
├── package.json
├── vite.config.js
└── README.md
```

## Future Improvements

* AI-powered loan eligibility prediction.
* eSewa and Khalti payment integration.
* University verification API integration.
* Credit score generation based on repayment behavior.
* Nepali and English language support.

## License

This project was built for **CodeRush 2026**, organized by **Nepalaya IT Club**.
