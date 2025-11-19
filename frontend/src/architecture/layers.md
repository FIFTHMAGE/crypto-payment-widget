# Frontend Architecture Layers

## Layer Organization

The frontend follows a clean architecture pattern with clear separation of concerns:

### 1. Core Layer (`/core`)
**Purpose**: Foundation of the application
- **config**: Environment and app configuration
- **constants**: Application-wide constants
- **errors**: Error handling utilities
- **logger**: Logging infrastructure
- **providers**: Core React providers
- **router**: Routing configuration
- **utils**: Pure utility functions
- **validation**: Validation schemas

### 2. Domain Layer (`/domains`)
**Purpose**: Business logic organized by domain
- **payment**: Payment domain logic
- **transaction**: Transaction management
- **wallet**: Wallet interactions

Each domain contains:
- `api/`: Domain-specific API calls
- `components/`: Domain UI components
- `hooks/`: Domain business logic hooks
- `store/`: Domain state management
- `types/`: Domain type definitions

### 3. Feature Layer (`/features`)
**Purpose**: Complete feature modules
- admin
- batch, bridge, dispute, escrow
- invoice, link, milestone
- notifications
- payment, request
- settings, split, stream, subscription
- theme, wallet, webhooks

### 4. Shared Layer (`/shared`)
**Purpose**: Cross-cutting concerns
- **api**: Shared API client
- **config**: Shared configuration
- **di**: Dependency injection
- **errors**: Error boundaries
- **forms**: Form management
- **hooks**: Reusable hooks
- **optimization**: Performance optimizations
- **performance**: Performance monitoring
- **providers**: Shared providers
- **routing**: Route utilities
- **state**: State management
- **validation**: Shared validators

### 5. Infrastructure Layer (`/services`)
**Purpose**: External integrations
- api, blockchain, contract services

## Dependencies Flow

```
Features → Domains → Core
   ↓         ↓        ↓
   ← ← ← Shared ← ← ← 
```

- Core has no dependencies (foundation)
- Domains depend on Core
- Features depend on Domains and Core
- Shared can be used by all layers
- Infrastructure integrates external services

