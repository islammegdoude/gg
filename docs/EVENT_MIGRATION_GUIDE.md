# Event Migration Guide

## Overview

Vision Intek has updated its event management architecture. Events are no longer managed as standalone entities but are now embedded within their respective categories. This guide explains how to migrate to the new system and how to use it going forward.

## Why We Changed the Architecture

1. **Better Organization**: Events logically belong to categories and are now stored directly with them.
2. **Simplified Data Access**: Retrieving a category automatically includes its events.
3. **Reduced Database Queries**: Fewer database lookups are needed to get related data.
4. **More Consistent API**: All parent-child relationships follow the same pattern.

## Migration Process

### Step 1: Run the Migration Script

Run the following command from the backend project root:

```bash
npm run migrate-events
```

This script will:
- Find all events in the standalone Event collection
- Group them by category
- Add each event to its parent category
- Report on the migration progress

### Step 2: Verify Migration

After running the migration, verify that all events appear correctly within their categories:

1. Log in to the admin dashboard
2. Go to Categories Management
3. Click on a category that should contain events
4. Verify that all events appear properly

### Step 3: Update Your Code (For Developers)

If you've built custom components that use the events API:

#### Backend:
Use the category-event routes for any new event operations:
- `GET /api/categories/:id/events`
- `POST /api/categories/:id/events`
- `PUT /api/categories/:id/events/:eventId`
- `DELETE /api/categories/:id/events/:eventId`

#### Frontend:
Use the categoriesAPI methods for event operations:
```javascript
// Import the API client
import { categoriesAPI } from '../api/api';

// Get events for a category
const events = await categoriesAPI.getEvents(categoryId);

// Create an event
await categoriesAPI.createEvent(categoryId, eventData);

// Update an event
await categoriesAPI.updateEvent(categoryId, eventId, eventData);

// Delete an event
await categoriesAPI.deleteEvent(categoryId, eventId);
```

## FAQs

### What happens to existing API requests?
Existing API calls to `/api/events` will continue to work as they are redirected to the new system internally.

### Will my old code still work?
Yes, we've maintained backward compatibility. However, we recommend updating to the new approach for better performance.

### Can I still query all events across all categories?
Yes, you can still use `GET /api/events` to get all events, or use the eventsAPI.getAll() method in the frontend.

### What if I need to move an event to a different category?
You'll need to:
1. Get the event data from its current category
2. Create a new event in the destination category with that data
3. Delete the event from the original category 