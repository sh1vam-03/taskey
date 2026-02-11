# 📝 Task API

Base URL: `/api/tasks`

## Middleware
- `authMiddleware`
- `usageLimit("TASK")`: Applied only to CREATE endpoint for FREE users.

---

## 1. Create Task
- **URL:** `/`
- **Method:** `POST`
- **Limit:** Free users max 20 tasks/month.
- **Body:**
  ```json
  {
    "title": "Buy groceries",
    "description": "Milk, Eggs, Bread",
    "priority": "HIGH", // LOW, MEDIUM, HIGH
    "dueDate": "2024-12-31T23:59:00Z",
    "categoryId": "uuid"
  }
  ```

## 2. Get Tasks
- **URL:** `/`
- **Method:** `GET`
- **Query Params:**
  - `categoryId`: Filter by category UUID
  - `priority`: `LOW`, `MEDIUM`, `HIGH`
  - `isArchived`: `true` or `false`
  - `search`: Search term for title
  - `page`: Page number (default 1)
  - `limit`: Items per page (default 10)
  - `sortBy`: Field to sort by (default `createdAt`)
  - `sortOrder`: `asc` or `desc` (default `desc`)

- **Response:**
  ```json
  {
    "tasks": [
      {
        "id": "...",
        "title": "...",
        "priority": "HIGH",
        "category": { ... }
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
  ```


## 3. Get Single Task
- **URL:** `/:id`
- **Method:** `GET`
- **Response:** Single task object.

## 4. Update Task
- **URL:** `/:id`
- **Method:** `PUT`
- **Body:** Partial task object.

## 4. Delete Task
- **URL:** `/:id`
- **Method:** `DELETE`

---

## ✅ Task Completion

### 1. Complete Task
- **URL:** `/:id/complete`
- **Method:** `POST`
- **Body:** `{ "date": "2024-05-20" }`

### 2. Undo Completion
- **URL:** `/:id/completed`
- **Method:** `DELETE`
- **Body:** `{ "date": "2024-05-20" }`

### 3. Bulk Complete
- **URL:** `/complete-bulk`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "taskIds": ["id1", "id2"],
    "date": "2024-05-20"
  }
  ```
