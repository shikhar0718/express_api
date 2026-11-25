import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json());

  // Task 1: Book reservations
  const reservations = [
    { id: 1, bookId: 'clean-code', quantity: 1 },
    { id: 2, bookId: 'ddia', quantity: 2 }
  ];

  // TODO: Implement GET /reservations and POST /reservations

  // Task 2: Store announcement
  let announcement = {
    message: 'New books arriving this Friday',
    active: true
  };

  // TODO: Implement app.route('/announcement') with GET, PUT, PATCH, and DELETE

  // Task 3: Featured books and individual book lookup
  const books = [
    { slug: 'clean-code', title: 'Clean Code', featured: true },
    {
      slug: 'ddia',
      title: 'Designing Data-Intensive Applications',
      featured: true
    },
    {
      slug: 'atomic-habits',
      title: 'Atomic Habits',
      featured: false
    }
  ];

  // TODO: Implement GET /books/featured and GET /books/:slug (watch route ordering!)

  // Task 4: Covers wildcard
  // TODO: Implement GET /covers/*file

  // Task 5: Optional docs wildcard
  // TODO: Implement GET /docs/{*section}

  // Task 6: Nested author and book parameters
  const authors = [
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
        {
          id: 'ddia',
          title: 'Designing Data-Intensive Applications'
        }
      ]
    }
  ];

  // TODO: Implement GET /authors/:authorId/books/:bookId

  // Task 8: Download routes
  // TODO: Implement GET /downloads/latest and GET /downloads/*file

  // Task 7: JSON 404 catch-all (must be last)
  // TODO: Implement app.use() 404 handler

  return app;
}
