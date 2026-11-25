
# Express.js — Chapter 02: Routing 

Welcome to the Routing Challenge!

In this chapter, you'll build a bookstore API and practise routing concepts using Express 5.

**8 Challenges | Beginner to Advanced | Interview Preparation**

## Getting Started

```bash
npm install
npm test
```

- Write your solutions in `exercise.js`.
- Automated tests are provided in `exercise.test.js`.
- Implement everything inside `createApp()`.
- Do not modify the provided seed data.
- All challenges use Express 5.

---

# 🧩 Challenges

## 01. Book Reservations

**Difficulty:** Beginner  
**Concepts:** GET, POST, Request Body, Validation, Status Codes

Build an API that allows customers to view and create book reservations.

Initial data:

```js
[
  { id: 1, bookId: 'clean-code', quantity: 1 },
  { id: 2, bookId: 'ddia', quantity: 2 }
]
```

Implement:

| Method | Endpoint | Expected Behaviour |
|---|---|---|
| GET | `/reservations` | Return all reservations (200) |
| POST | `/reservations` | Create a reservation (201) |

POST accepts:

```json
{
  "bookId": "pragmatic-programmer",
  "quantity": 2
}
```

**Requirements:**

- `bookId` is required.
- `quantity` must be a positive integer.
- Invalid input returns 400:

```json
{
  "error": "bookId and a positive integer quantity are required"
}
```

- IDs start from 3 and increment after successful creation.
- Invalid requests must not modify data or consume IDs.
- Every `createApp()` instance must maintain independent data.

**Think about it:** What happens if the reservations array is declared outside `createApp()`?

---

## 02. The Store Announcement

**Difficulty:** Beginner → Intermediate  
**Concepts:** `app.route()`, PUT, PATCH, DELETE, 204

The bookstore displays an announcement on its homepage.

Initial announcement:

```js
{
  message: 'New books arriving this Friday',
  active: true
}
```

Use `app.route('/announcement')` to implement all four methods.

| Method | Expected Behaviour |
|---|---|
| GET | Return the announcement (200) |
| PUT | Replace the entire announcement (200) |
| PATCH | Update provided fields only (200) |
| DELETE | Remove the announcement (204) |

After deletion:

- GET returns 404.
- PATCH returns 404.

Both should return:

```json
{
  "error": "No announcement available"
}
```

PUT must be able to recreate a deleted announcement.

**Think about it:** What is the difference between replacing an object and updating only selected properties?

---

## 03. Featured Books: The Route That Never Runs

**Difficulty:** Intermediate  
**Concepts:** Route Ordering, Dynamic Parameters  
**Interview Focus:** ⭐

Seed data:

```js
[
  { slug: 'clean-code', title: 'Clean Code', featured: true },
  {
    slug: 'ddia',
    title: 'Designing Data-Intensive Applications',
    featured: true
  },
  { slug: 'atomic-habits', title: 'Atomic Habits', featured: false }
]
```

Implement:

- `GET /books/featured` — Return only featured books in their original order.
- `GET /books/:slug` — Return an individual book.
- Unknown books return 404:

```json
{
  "error": "Book not found: unknown-book"
}
```

**The Bug:**

If `/books/:slug` is registered before `/books/featured`, the featured endpoint may return a 404.

Fix the route ordering.

**Interview Questions:**

1. Why does `/books/:slug` match `/books/featured`?
2. Why does the later route never send its response?
3. What happens if the first handler calls `next()`?

---

## 04. Book Covers at Any Depth

**Difficulty:** Intermediate  
**Concepts:** Express 5 Wildcards, `req.params`

Book cover images are stored in nested directories.

Implement:

`GET /covers/*file`

Examples:

| Request | Expected `file` |
|---|---|
| `/covers/clean-code.jpg` | `clean-code.jpg` |
| `/covers/fiction/fantasy/hobbit.png` | `fiction/fantasy/hobbit.png` |
| `/covers/technical/db/postgres/cover.webp` | `technical/db/postgres/cover.webp` |

Expected response:

```json
{
  "file": "fiction/fantasy/hobbit.png"
}
```

**Requirements:**

- Support any nesting depth.
- Join wildcard segments using `/`.
- `/covers` without a filename must return 404.
- Use a named wildcard as required by Express 5.

**Interview Question:** Why does an Express 5 named wildcard return an array?

---

## 05. Documentation Browser

**Difficulty:** Intermediate → Advanced  
**Concepts:** Optional Wildcards, Express 5 Routing

Implement:

`GET /docs/{*section}`

It must support:

```text
/docs
/docs/getting-started
/docs/api/books
/docs/api/orders/reservations
```

Expected responses:

| Request | Response |
|---|---|
| `/docs` | `{ "section": "" }` |
| `/docs/getting-started` | `{ "section": "getting-started" }` |
| `/docs/api/orders/reservations` | `{ "section": "api/orders/reservations" }` |

All valid requests return 200.

**Interview Question:** What is the difference between `/*section` and `/{*section}`?

---

## 06. Find a Book Through Its Author

**Difficulty:** Intermediate  
**Concepts:** Multiple Route Parameters, Nested Lookup, 404

Seed data:

```js
[
  {
    id: 'martin',
    name: 'Robert C. Martin',
    books: [
      { id: 'clean-code', title: 'Clean Code' },
      { id: 'clean-architecture', title: 'Clean Architecture' }
    ]
  },
  {
    id: 'kleppmann',
    name: 'Martin Kleppmann',
    books: [
      { id: 'ddia', title: 'Designing Data-Intensive Applications' }
    ]
  }
]
```

Implement:

`GET /authors/:authorId/books/:bookId`

Examples:

```text
GET /authors/martin/books/clean-code
GET /authors/kleppmann/books/ddia
```

**Requirements:**

- Return the requested book with status 200.
- Unknown author returns 404:

```json
{ "error": "Author not found" }
```

- Book not belonging to the requested author returns 404:

```json
{ "error": "Book not found for this author" }
```

**Important:** A book belonging to another author must never be returned.

---

## 07. JSON 404 Handler

**Difficulty:** Intermediate  
**Concepts:** Middleware, `app.use()`, Route Fallthrough  
**Interview Focus:** ⭐

Implement a catch-all middleware using `app.use()`.

Every request that no route handles must return:

- Status: 404
- Content-Type: JSON
- Error containing the HTTP method and requested pathname.

Example:

```json
{
  "error": "Route not found: GET /unknown"
}
```

Test these requests:

| Request | Expected Error |
|---|---|
| GET `/unknown` | `Route not found: GET /unknown` |
| POST `/announcement` | `Route not found: POST /announcement` |
| DELETE `/books` | `Route not found: DELETE /books` |
| PUT `/covers/image.jpg` | `Route not found: PUT /covers/image.jpg` |

Valid routes must continue working.

**Interview Questions:**

1. Why must the catch-all be registered last?
2. Does `app.use()` handle different HTTP methods?
3. Is a 404 middleware the same as error-handling middleware?

---

## 08. Latest Release vs Archive Downloads

**Difficulty:** Advanced  
**Concepts:** Static Routes, Wildcards, Route Precedence  
**Interview Focus:** ⭐

The bookstore provides a special endpoint for its latest release and another for archived downloads.

Implement:

### GET `/downloads/latest`

Expected response:

```json
{
  "type": "latest",
  "file": "latest-release.zip"
}
```

### GET `/downloads/*file`

For example:

```text
GET /downloads/2026/releases/v2.zip
```

Expected response:

```json
{
  "type": "archive",
  "file": "2026/releases/v2.zip"
}
```

**Requirements:**

- Both endpoints return 200.
- Support nested archive paths.
- `/downloads` must reach the JSON 404 handler.
- The specific route must not be intercepted by the wildcard route.

**Interview Questions:**

1. Difference between a dynamic parameter and a wildcard?
2. Why should specific routes generally come before broad routes?
3. What happens when a matching handler calls `next()`?

---

# ✅ Completion Checklist

After attempting all eight challenges:

```bash
npm test
```

- [ ] All eight tasks implemented.
- [ ] All automated tests passing.
- [ ] Edge cases handled.
- [ ] Interview questions understood.
- [ ] Able to explain route matching and execution order.

**Don't just aim for green tests. Understand why your routes work!**

Happy Coding! 💻
