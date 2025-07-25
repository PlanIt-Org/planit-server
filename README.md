# PlanIt 2025 – All-in-One Event & Trip Planner (Backend)

## Overview

PlanIt is a modern, user-friendly web application that streamlines the process of planning hangouts, trips, and events. Instead of juggling multiple apps for navigation, transport, weather, and group coordination, PlanIt brings all these tools together in a single platform. Users can select locations, filter preferences (like dietary restrictions or mood), and invite friends or colleagues—all with just a few clicks.

> **Note:** This repository contains only the backend (Node.js/Express/PostgreSQL) code for PlanIt. Frontend services (React) are not included here.

---

## Features

- **Trip & Event Planning:** Organize locations and activities for your next outing.
- **Interactive Map:** Visualize and manage trip stops using Google Maps integration.
- **Smart Search:** Find and add places with autocomplete search.
- **Personalized Filtering:** Tailor plans based on group preferences and constraints.
- **User Accounts:** Register, log in, and manage your profile.
- **Trip Summaries:** Review and share a summary of your planned trip.

> **Note:** PlanIt is in ACTIVE DEVELOPMENT.

---

## Tech Stack

- Node.js
- Express.js
- Prisma
- Supabase
- OpenRouter
- PostgreSQL

---

## Project Structure

```
planit-server/
├── prisma
└── src
    ├── controllers
    ├── db
    ├── middleware
    ├── routes
    ├── server.js
    ├── services
    └── supabaseAdmin.js
```

---
