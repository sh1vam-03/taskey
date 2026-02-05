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
- **Query Params:** `categoryId`, `priority`, `isArchived`, `search`
- **Response:**
  ```json
  {
    "success": true,
    "data": [ { "id": "...", "title": "..." } ]
  }
  ```

## 3. Update Task
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
