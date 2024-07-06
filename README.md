## Resource Management System

This repository contains the source code for a web application designed to track project progress and manage resources efficiently. Key features include user authentication, session management, timesheet management, interactive dashboards, dedicated admin controls, and leave and holiday management.

### Backend

The backend is built using .NET 6 Core Web Application with Entity Framework following the code-first approach. The backend architecture adheres to good coding practices and design principles. Key features include:

- **Entity Framework Code-First Approach:** Utilizes Entity Framework for database operations with a code-first methodology.
- **SQL Database:** Structured SQL database to store all application data, accessible via db context.
- **Docker Support:** Containerization support for ease of deployment and environment consistency.
- **Swagger Documentation:** Integrated Swagger for API documentation, facilitating ease of testing and development.

### Frontend

The frontend is developed using React with the Next.js framework, TypeScript, and Tailwind CSS. The application is a multipage setup with the following pages:

- **Home:** The landing page of the application.
- **Timesheet:** Allows users to fill in their timesheets for the current month.
- **View:** Provides views of past timesheets and other data.
- **Holidays:** Displays the list of holidays for the year.
- **Dashboard:** An interactive dashboard for comprehensive analysis and tracking.
- **Profile:** Allows users to update their profile and change their passwords.
- **Admin:** A dedicated admin page to manage users, projects, holidays, etc.

### Security

User authentication and authorization are implemented using NextAuth.js. This provides secure login functionality, session management, and token-based authentication.

### Features

- **Timesheet Management:** Users can fill in and view their monthly timesheets.
- **Leave Management:** Users can apply for leaves and view holiday schedules.
- **Interactive Dashboard:** Comprehensive analytics and data visualization for project tracking and resource management.
- **Admin Controls:** Admins can add, update, or delete users, projects, and holidays.
- **User Profile Management:** Users can update their profile details and change their passwords.

### Installation

To set up the application locally, follow these steps:

#### Backend

1. Clone the repository.
2. Navigate to the `backend` directory.
3. Ensure you have .NET 6 SDK installed.
4. Run the following commands to set up the database and start the application:
```sh
dotnet restore
dotnet ef database update
dotnet run
```

#### Frontend
1. Navigate to the frontend directory.
2. Ensure you have Node.js and npm installed.
3. Run the following commands to install dependencies and start the application:
```sh
npm install
npm run dev
```

### Docker Support
To run the application using Docker, ensure you have Docker installed and run the following commands from the project root:

```sh
docker-compose build
docker-compose up
```

### Contributing
Contributions are welcomed to enhance the functionality and fix any issues. Please follow the standard GitHub workflow for contributions:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push the branch to your forked repository.
4. Create a pull request with a detailed description of your changes.

### License
This project is licensed under the MIT License. See the `LICENSE` file for more details.