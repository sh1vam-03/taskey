# 📝 Task Management API

Manage user tasks, priorities, and assignments.

**Base URL:** `/api/tasks`

---

## 1. Create Task
Create a new task.
- **Limit:** Free users max 20 tasks/month.

- **Method:** `POST`
- **URL:** `/`
- **Auth Required:** Yes

### Request Body
```json
{
  "title": "Buy groceries",
  "description": "Milk, Eggs, Bread",
  "priority": "HIGH", // LOW, MEDIUM, HIGH
  "dueDate": "2024-12-31T23:59:00Z",
  "categoryId": "uuid-optional"
}
```

### Success Response (201)
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "priority": "HIGH",
  "userId": "uuid",
  "createdAt": "..."
}
```

### Error Response (403)
Limit Reached.
```json
{
  "success": false,
  "message": "Free plan task limit reached. Upgrade to PRO."
}
```

---

## 2. Get Tasks
Retrieve tasks with filtering and pagination.

- **Method:** `GET`
- **URL:** `/`
- **Auth Required:** Yes

### Query Parameters
| Param | Type | Description | Default |
|-------|------|-------------|---------|
| `categoryId` | UUID | Filter by category | - |
| `priority` | Enum | `LOW`, `MEDIUM`, `HIGH` | - |
| `isArchived` | Boolean | `true` or `false` | `false` |
| `search` | String | Search title/description | - |
| `page` | Int | Page number | 1 |
| `limit` | Int | Items per page | 10 |
| `sortBy` | String | Field to sort by | `createdAt` |
| `sortOrder` | String | `asc` or `desc` | `desc` |

### Success Response (200)
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "priority": "HIGH",
      "category": { "id": "uuid", "name": "Personal" }
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

---

## 3. Get Single Task
- **Method:** `GET`
- **URL:** `/:id`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "..."
}
```

---

## 4. Update Task
- **Method:** `PUT`
- **URL:** `/:id`
- **Auth Required:** Yes

### Request Body (Partial)
```json
{
  "title": "Buy Organic Groceries",
  "isCompleted": true
}
```

### Success Response (200)
Returns updated task object.

---

## 5. Delete Task
- **Method:** `DELETE`
- **URL:** `/:id`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## ✅ Task Completion

### 6. Complete Task
Mark task as done for a specific date (for recurring/tracking).

- **Method:** `POST`
- **URL:** `/:id/complete`
- **Body:** `{ "date": "2024-05-20" }`

### 7. Undo Completion
- **Method:** `DELETE`
- **URL:** `/:id/completed`
- **Body:** `{ "date": "2024-05-20" }`

### 8. Bulk Complete
- **Method:** `POST`
- **URL:** `/complete-bulk`
- **Body:**
  ```json
  {
    "taskIds": ["uuid1", "uuid2"],
    "date": "2024-05-20"
  }
  ```
