# 📂 Category API

Manage task categories.

**Base URL:** `/api/categories`

---

## 1. Create Category
- **Method:** `POST`
- **URL:** `/`
- **Auth Required:** Yes

### Request Body
```json
{
  "name": "Work",
  "color": "#FF5733",
  "icon": "briefcase"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Work",
    "color": "#FF5733",
    "icon": "briefcase"
  }
}
```

---

## 2. Get All Categories
- **Method:** `GET`
- **URL:** `/`
- **Auth Required:** Yes

### Success Response (200)
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": [
    { "id": 1, "name": "Work", "color": "#FF5733" }
  ]
}
```

---

## 3. Update Category
- **Method:** `PUT`
- **URL:** `/:id`
- **Auth Required:** Yes

### Request Body (Partial)
```json
{
  "name": "Office"
}
```

---

## 4. Delete Category
- **Method:** `DELETE`
- **URL:** `/:id`
- **Auth Required:** Yes
