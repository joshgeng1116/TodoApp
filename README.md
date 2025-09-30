# Todo List Application

A full-stack todo list application built with Angular 18 and .NET 9, featuring a modern UI, comprehensive test coverage, and RESTful API architecture.
<img width="1799" height="896" alt="image" src="https://github.com/user-attachments/assets/aba7235f-aa46-4247-b28e-ef894363997a" />

**Live Demo**: https://joshgeng.com/todoapp

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete by clicking on task cards
- ✅ Filter tasks by status (All, Active, Completed)
- ✅ Inline editing of tasks
- ✅ Real-time task counters
- ✅ Responsive, modern UI with Angular Material
- ✅ Comprehensive test suite (56 tests with 85%+ coverage)
- ✅ RESTful API with in-memory data storage

## Technology Stack

### Frontend
- **Angular 20.3** - Standalone components architecture
- **Angular Material** - UI components and theming
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming
- **Jasmine/Karma** - Testing framework

### Backend
- **.NET 9.09** - Web API
- **ASP.NET Core** - RESTful services
- **In-memory repository** - Data storage pattern (no database required)
- **CORS enabled** - Cross-origin resource sharing

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **.NET 9.0 SDK**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/joshgeng1116/TodoApp.git
```

### 2. Backend Setup (.NET API)

```bash
cd backend/Todo.Api
dotnet restore
dotnet run
```

The API will start at `https://localhost:7093`

**API Endpoints:**
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `PATCH /api/todos/{id}` - Update a todo
- `DELETE /api/todos/{id}` - Delete a todo

### 3. Frontend Setup (Angular)

Open a new terminal window:

```bash
cd frontend/todo-frontend
npm install
ng serve
```

The app will open at `http://localhost:4200`

The frontend is configured to proxy API requests to `https://localhost:7093` during development.

## Running Tests

### Frontend Tests

```bash
cd frontend/todo-frontend
npm test
```

To run tests once (for CI/CD):
```bash
npm run test:once
```

To generate coverage report:
```bash
npm run test:coverage
# Open coverage/index.html in browser to view detailed report
```

**Test Results:**
- **Total Tests**: 56
  - TodoListComponent: 46 tests
  - TodoService: 4 tests  
  - App Component: 2 tests
  - Additional tests: 4 tests
- **Code Coverage**: 85%+
  - Statements: ~90%
  - Branches: ~85%
  - Functions: ~95%
  - Lines: ~90%

**Test Categories:**
- UI state and loading indicators
- Filter functionality (All/Active/Completed)
- Input validation and sanitization
- Error handling with recovery
- Edit mode operations
- Todo list ordering
- Edge cases (long titles, special characters, unicode)
- Full workflow integration test

### Backend Tests

```bash
cd backend/Todo.Api
dotnet test
```

## Project Structure

```
todo-app/
├── frontend/
│   └── todo-frontend/                 # Angular frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/
│       │   │   │   └── todo-list/
│       │   │   │       ├── todo-list.ts           # Component logic
│       │   │   │       ├── todo-list.html         # Template
│       │   │   │       ├── todo-list.css          # Styles
│       │   │   │       └── todo-list.spec.ts      # Tests (46)
│       │   │   ├── services/
│       │   │   │   ├── todo.service.ts            # HTTP service
│       │   │   │   └── todo.service.spec.ts       # Tests (4)
│       │   │   ├── models/
│       │   │   │   └── todo.ts                    # Todo interface
│       │   │   ├── app.component.ts
│       │   │   └── app.component.spec.ts          # Tests (2)
│       │   └── environments/
│       │       └── environment.prod.ts            # Prod config
│       ├── proxy.conf.json                        # Dev proxy setup
│       └── package.json
└── backend/
    └── Todo.Api/                      # .NET backend
        ├── Controllers/
        │   └── TodosController.cs                 # API endpoints
        ├── Services/
        │   ├── ITodoService.cs                    # Service interface
        │   └── TodoService.cs                     # Business logic
        ├── Repositories/
        │   ├── ITodoRepository.cs                 # Repository interface
        │   └── InMemoryTodoRepository.cs          # In-memory data store
        ├── Models/
        │   └── Todo.cs                            # Todo model
        └── Program.cs                             # App configuration
```

### Frontend (package.json)
```bash
npm start              # Start dev server
npm test               # Run tests in watch mode
npm run test:once      # Run tests once
npm run test:coverage  # Generate coverage report
npm run build          # Production build
```

## Contact

**Author**: Jingyun Geng (Josh)
**Email**: joshgeng1116@gmail.com
**GitHub**: https://github.com/joshgeng1116
**Website**: https://joshgeng.com

## Acknowledgments

This project was created as a technical assessment demonstrating:
- Modern Angular and .NET development practices
- Test-driven development approach
- Clean architecture principles
- Professional code quality and documentation

---

**Note**: This is a demonstration project. The in-memory storage is intentional for simplicity and to meet the assessment requirements of not requiring database setup.
