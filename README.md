# Vision Intek Backend API

This is the backend API for the Vision Intek website. It provides endpoints for managing services, products, categories, events, team members, partners, and company information.

## Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Running the Application

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints with Examples

### Authentication
#### Register a new user
- **POST** `/api/auth/register`
- **Request Body**:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword"
}
```
- **Response**:
```json
{
  "message": "تم إنشاء الحساب بنجاح",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login user
- **POST** `/api/auth/login`
- **Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Categories
#### Get all categories
- **GET** `/api/categories`
- **Response**:
```json
[
  {
    "_id": "60d21b4967d0d8992e610c85",
    "title": "Web Development",
    "description": "Web development services",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2021-06-22T19:20:25.121Z",
    "updatedAt": "2021-06-22T19:20:25.121Z"
  }
]
```

#### Get single category
- **GET** `/api/categories/:id`
- **Response**:
```json
{
  "_id": "60d21b4967d0d8992e610c85",
  "title": "Web Development",
  "description": "Web development services",
  "imageUrl": "https://example.com/image.jpg",
  "createdAt": "2021-06-22T19:20:25.121Z",
  "updatedAt": "2021-06-22T19:20:25.121Z"
}
```

#### Create category (requires authentication)
- **POST** `/api/categories`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "title": "Mobile Development",
  "description": "Mobile application development services",
  "imageUrl": "https://example.com/mobile.jpg"
}
```
- **Response**: The created category object

#### Update category (requires authentication)
- **PUT** `/api/categories/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "title": "Mobile App Development",
  "description": "Updated description"
}
```
- **Response**: The updated category object

#### Delete category (requires authentication)
- **DELETE** `/api/categories/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Category deleted"
}
```

### Services
#### Get all services
- **GET** `/api/services`
- **Response**:
```json
[
  {
    "_id": "60d21b4967d0d8992e610c86",
    "title": "Website Design",
    "description": "Professional website design services",
    "imageUrl": "https://example.com/website-design.jpg",
    "createdAt": "2021-06-22T19:20:25.121Z",
    "updatedAt": "2021-06-22T19:20:25.121Z"
  }
]
```

#### Get single service
- **GET** `/api/services/:id`
- **Response**: The requested service object

#### Create service (requires authentication)
- **POST** `/api/services`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "title": "SEO Optimization",
  "description": "Improve your website's search engine ranking",
  "imageUrl": "https://example.com/seo.jpg"
}
```
- **Response**: The created service object

#### Update service (requires authentication)
- **PUT** `/api/services/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**: Fields to update
- **Response**: The updated service object

#### Delete service (requires authentication)
- **DELETE** `/api/services/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Service deleted"
}
```

### Products
#### Get all products
- **GET** `/api/products`
- **Response**: Array of product objects

#### Get single product
- **GET** `/api/products/:id`
- **Response**: The requested product object

#### Create product (requires authentication)
- **POST** `/api/products`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "title": "Smart Home System",
  "description": "Complete smart home automation system",
  "imageUrl": "https://example.com/smart-home.jpg",
  "details": "Control lights, temperature, and security from your phone"
}
```
- **Response**: The created product object

#### Update product (requires authentication)
- **PUT** `/api/products/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**: Fields to update
- **Response**: The updated product object

#### Delete product (requires authentication)
- **DELETE** `/api/products/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Product deleted"
}
```

### Events
#### Get all events
- **GET** `/api/events`
- **Response**: Array of event objects with populated category

#### Get single event
- **GET** `/api/events/:id`
- **Response**: The requested event object with populated category

#### Create event (requires authentication)
- **POST** `/api/events`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "title": "Tech Conference 2023",
  "description": "Annual technology conference",
  "category": "60d21b4967d0d8992e610c85",
  "imageUrl": "https://example.com/conference.jpg",
  "details": "Join us for a day of technology insights and networking"
}
```
- **Response**: The created event object

#### Update event (requires authentication)
- **PUT** `/api/events/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**: Fields to update
- **Response**: The updated event object

#### Delete event (requires authentication)
- **DELETE** `/api/events/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Event deleted"
}
```

## Event Architecture Change

> **IMPORTANT: Architecture Update**
> 
> Events are now managed as subdocuments within the Category model rather than as standalone documents.
> The standalone Event model is deprecated but maintained for backward compatibility.

### Legacy Event Routes
The following routes are maintained for backward compatibility but will internally redirect operations to work with events within categories:

- **GET** `/api/events` - Get all events from all categories
- **GET** `/api/events/:id` - Get a specific event
- **POST** `/api/events` - Create an event (requires category ID)
- **PUT** `/api/events/:id` - Update an event
- **DELETE** `/api/events/:id` - Delete an event

### New Category-based Event Routes
For new development, please use these routes to manage events within categories:

- **GET** `/api/categories/:id/events` - Get all events for a category
- **POST** `/api/categories/:id/events` - Create an event in a category
- **PUT** `/api/categories/:id/events/:eventId` - Update an event in a category
- **DELETE** `/api/categories/:id/events/:eventId` - Delete an event from a category

### Migration
To migrate existing standalone events to the new structure, run the migration script:

```bash
node migrateStandaloneEvents.js
```

This script will:
1. Find all events in the Event collection
2. Group them by their associated category
3. Add each event to its parent category's events array
4. Report on the migration results

After successful migration, you can safely use the new event management structure via categories.

### Team Members
#### Get all team members
- **GET** `/api/team`
- **Response**: Array of team member objects

#### Get single team member
- **GET** `/api/team/:id`
- **Response**: The requested team member object

#### Create team member (requires authentication)
- **POST** `/api/team`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "name": "John Doe",
  "surname": "Smith",
  "position": "Chief Technology Officer",
  "description": "John has over 15 years of experience in tech leadership",
  "email": "john@example.com",
  "imageUrl": "https://example.com/john.jpg"
}
```
- **Response**: The created team member object

#### Update team member (requires authentication)
- **PUT** `/api/team/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**: Fields to update
- **Response**: The updated team member object

#### Delete team member (requires authentication)
- **DELETE** `/api/team/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Team member deleted"
}
```

### Partners
#### Get all partners
- **GET** `/api/partners`
- **Response**: Array of partner objects

#### Get single partner
- **GET** `/api/partners/:id`
- **Response**: The requested partner object

#### Create partner (requires authentication)
- **POST** `/api/partners`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "name": "Tech Solutions Inc.",
  "description": "Leading provider of enterprise software solutions",
  "imageUrl": "https://example.com/partner-logo.jpg"
}
```
- **Response**: The created partner object

#### Update partner (requires authentication)
- **PUT** `/api/partners/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**: Fields to update
- **Response**: The updated partner object

#### Delete partner (requires authentication)
- **DELETE** `/api/partners/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Partner deleted"
}
```

### Company Information
#### Get company information
- **GET** `/api/company`
- **Response**: The company information object

#### Update company information (requires authentication)
- **PUT** `/api/company`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "name": "Vision Intek",
  "description": "Leading technology solutions provider",
  "email": "contact@visionintek.com",
  "phone": "+1 234 567 8900",
  "address": "123 Tech Street, Silicon Valley, CA",
  "faq": [
    {
      "question": "What services do you offer?",
      "answer": "We provide web development, mobile app development, and digital marketing services."
    }
  ]
}
```
- **Response**: The updated company information object

### File Upload
#### Upload file (requires authentication)
- **POST** `/api/upload`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request**: Form data with a field named 'image' containing the file
- **Response**:
```json
{
  "success": true,
  "imageUrl": "https://res.cloudinary.com/your-cloud-name/image/upload/v1623862825/sample.jpg",
  "publicId": "vision-intek/general/abc123",
  "metadata": {
    "width": 800,
    "height": 600,
    "format": "jpg",
    "resourceType": "image",
    "size": 123456
  }
}
```

#### Upload options
The upload endpoint supports the following options:

1. **Category-specific uploads**
   - **POST** `/api/upload/categories` - Upload to the categories folder
   - **POST** `/api/upload/products` - Upload to the products folder
   - **POST** `/api/upload/services` - Upload to the services folder

2. **Local storage fallback**
   - **POST** `/api/upload?local=true` - Force using local storage instead of Cloudinary
   - Image URL will be a local path like `http://localhost:5000/uploads/image-123456.jpg`

3. **Timeout handling**
   - If Cloudinary upload fails or times out, the system will automatically fall back to local storage
   - Maximum file size: 5MB
   - Supported formats: JPEG, PNG, GIF, WEBP

### Orders
#### Get all orders
- **GET** `/api/orders`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**: Array of order objects with populated product/service information

#### Get single order
- **GET** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**: The requested order object with populated product/service information

#### Create order (requires authentication)
- **POST** `/api/orders`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "items": [
    {
      "product": "60d21b4967d0d8992e610c86",
      "itemType": "Product",
      "quantity": 2,
      "price": 299.99
    },
    {
      "product": "60d21b4967d0d8992e610c87",
      "itemType": "Service",
      "quantity": 1,
      "price": 499.99
    }
  ],
  "total": 1099.97
}
```
- **Response**: The created order object

#### Update order status (requires authentication)
- **PUT** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Request Body**:
```json
{
  "status": "completed"
}
```
- **Response**: The updated order object

#### Delete order (requires authentication)
- **DELETE** `/api/orders/:id`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "message": "Order deleted"
}
```

### Dashboard
#### Get dashboard statistics (requires authentication)
- **GET** `/api/dashboard/stats`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "totalProducts": 24,
  "totalServices": 12,
  "totalEvents": 5,
  "totalTeamMembers": 8,
  "totalPartners": 6,
  "totalCategories": 9
}
```

#### Get sales analytics (requires admin authentication)
- **GET** `/api/dashboard/sales`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "totalSales": 125000,
  "monthlySales": [
    { "month": "January", "sales": 12000 },
    { "month": "February", "sales": 15000 }
    // ... other months
  ],
  "topSellingProducts": [
    { "product": { "title": "Smart Home System" }, "totalSold": 24 }
    // ... other products
  ]
}
```

#### Get user analytics (requires admin authentication)
- **GET** `/api/dashboard/users`
- **Headers**: `Authorization: Bearer <your_token>`
- **Response**:
```json
{
  "totalUsers": 150,
  "newUsersThisMonth": 12,
  "userGrowth": 8.5
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

You can obtain a token by registering or logging in using the authentication endpoints.

## Error Handling

The API returns appropriate HTTP status codes and error messages in JSON format:

```json
{
  "message": "Error message here"
}
```

## Models

### User
- email (String, required)
- password (String, required)
- name (String)
- role (String, default: 'admin')

### Order
- orderNumber (String, required, unique)
- customer (ObjectId, ref: 'User', required)
- items (Array of {
  - product (ObjectId, refPath: 'itemType')
  - itemType (String, enum: ['Product', 'Service'])
  - quantity (Number, required, default: 1)
  - price (Number, required)
})
- total (Number, required)
- status (String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending')
- timestamps (createdAt, updatedAt)

### Category
- title (String, required)
- description (String)
- imageUrl (String)
- timestamps (createdAt, updatedAt)

### Service
- title (String, required)
- description (String)
- imageUrl (String)
- timestamps (createdAt, updatedAt)

### Product
- title (String, required)
- description (String)
- imageUrl (String)
- details (String)
- timestamps (createdAt, updatedAt)

### Event
- category (ObjectId, ref: 'Category', required)
- title (String, required)
- description (String)
- imageUrl (String)
- details (String)
- timestamps (createdAt, updatedAt)

### TeamMember
- name (String, required)
- surname (String)
- email (String)
- position (String)
- description (String)
- imageUrl (String)
- timestamps (createdAt, updatedAt)

### Partner
- name (String, required)
- description (String)
- imageUrl (String)
- timestamps (createdAt, updatedAt)

### Company
- name (String)
- description (String)
- email (String)
- phone (String)
- address (String)
- faq (Array of {question: String, answer: String})
- timestamps (createdAt, updatedAt)
