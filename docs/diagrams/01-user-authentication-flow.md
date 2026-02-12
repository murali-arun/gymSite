# User Authentication & Onboarding Flow

This diagram shows the complete user authentication and onboarding process, including how the app handles existing users versus new user creation.

```mermaid
sequenceDiagram
    actor User
    participant App
    participant UserSelection
    participant Storage
    participant Backend
    
    User->>App: Open Application
    App->>Storage: getActiveUserId()
    
    alt Has Active User
        Storage-->>App: Return userId
        App->>Backend: getUser(userId)
        Backend-->>App: User data
        App->>App: Check currentWorkout
        alt Has Current Workout
            App->>App: Navigate to Tracker
        else No Current Workout
            App->>App: Show Home View
        end
    else No Active User
        App->>UserSelection: Show User Selection
        User->>UserSelection: Create New Profile / Select User
        UserSelection->>Backend: createUser(name, profile)
        Backend-->>UserSelection: New user created
        UserSelection->>Storage: setActiveUserId(userId)
        Storage-->>App: User activated
        App->>App: Navigate to Home
    end
```

## Key Points

- **Auto-login**: If a user was previously active, they're automatically logged in
- **Resume Support**: Detects if there's an active workout and navigates directly to tracker
- **Profile Creation**: Comprehensive user profile setup including fitness level, goals, equipment access
- **Backend Sync**: All user data stored in backend API (`/api/users`)
