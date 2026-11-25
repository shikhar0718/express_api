
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from './exercise.js';

describe('Chapter 2 - Express Routing', () => {

  describe('Task 1 - Book reservations', () => {

    test('GET returns initial reservations', async () => {
      const app = createApp();

      const res = await request(app).get('/reservations');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, [
        { id: 1, bookId: 'clean-code', quantity: 1 },
        { id: 2, bookId: 'ddia', quantity: 2 }
      ]);
    });

    test('POST creates a reservation with ID 3', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/reservations')
        .send({ bookId: 'pragmatic-programmer', quantity: 2 });

      assert.equal(res.status, 201);
      assert.deepEqual(res.body, {
        id: 3,
        bookId: 'pragmatic-programmer',
        quantity: 2
      });
    });

    test('IDs increment after successful creation', async () => {
      const app = createApp();

      const first = await request(app)
        .post('/reservations')
        .send({ bookId: 'book-one', quantity: 1 });

      const second = await request(app)
        .post('/reservations')
        .send({ bookId: 'book-two', quantity: 2 });

      assert.equal(first.body.id, 3);
      assert.equal(second.body.id, 4);
    });

    test('Created reservation appears in GET', async () => {
      const app = createApp();

      await request(app)
        .post('/reservations')
        .send({ bookId: 'new-book', quantity: 1 });

      const res = await request(app).get('/reservations');

      assert.equal(res.body.length, 3);
    });

    test('Missing bookId returns 400 with exact error', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/reservations')
        .send({ quantity: 2 });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, {
        error: 'bookId and a positive integer quantity are required'
      });
    });

    test('Empty bookId returns 400', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/reservations')
        .send({ bookId: '', quantity: 2 });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, {
        error: 'bookId and a positive integer quantity are required'
      });
    });

    test('Invalid quantities return 400 with exact error', async () => {
      const app = createApp();
      const invalidQuantities = [0, -1, 1.5, '2', null];

      for (const quantity of invalidQuantities) {
        const res = await request(app)
          .post('/reservations')
          .send({ bookId: 'ddia', quantity });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, {
          error: 'bookId and a positive integer quantity are required'
        });
      }
    });

    test('Invalid request does not consume an ID', async () => {
      const app = createApp();

      await request(app)
        .post('/reservations')
        .send({ bookId: 'ddia', quantity: 0 });

      const res = await request(app)
        .post('/reservations')
        .send({ bookId: 'ddia', quantity: 1 });

      assert.equal(res.body.id, 3);
    });

    test('Different app instances have independent data', async () => {
      const app1 = createApp();
      const app2 = createApp();

      await request(app1)
        .post('/reservations')
        .send({ bookId: 'new-book', quantity: 1 });

      const res = await request(app2).get('/reservations');

      assert.equal(res.body.length, 2);
    });

    test('GET returns application/json content-type', async () => {
      const app = createApp();

      const res = await request(app).get('/reservations');

      assert.match(res.headers['content-type'], /application\/json/);
    });

    test('Whitespace-only bookId returns 400', async () => {
      const app = createApp();

      const res = await request(app)
        .post('/reservations')
        .send({ bookId: '   ', quantity: 2 });

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, {
        error: 'bookId and a positive integer quantity are required'
      });
    });

    test('Non-string bookId returns 400', async () => {
      const app = createApp();
      const invalidBookIds = [123, true, null, { id: 'ddia' }, ['ddia']];

      for (const bookId of invalidBookIds) {
        const res = await request(app)
          .post('/reservations')
          .send({ bookId, quantity: 1 });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, {
          error: 'bookId and a positive integer quantity are required'
        });
      }
    });

    test('Missing request body returns 400', async () => {
      const app = createApp();

      const res = await request(app).post('/reservations');

      assert.equal(res.status, 400);
      assert.deepEqual(res.body, {
        error: 'bookId and a positive integer quantity are required'
      });
    });

    test('Boolean and negative float quantities return 400', async () => {
      const app = createApp();
      const invalidQuantities = [true, false, -2.5];

      for (const quantity of invalidQuantities) {
        const res = await request(app)
          .post('/reservations')
          .send({ bookId: 'ddia', quantity });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, {
          error: 'bookId and a positive integer quantity are required'
        });
      }
    });

    test('Invalid POST does not modify existing reservations', async () => {
      const app = createApp();

      await request(app)
        .post('/reservations')
        .send({ bookId: '', quantity: 0 });

      const res = await request(app).get('/reservations');

      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
    });
  });

  describe('Task 2 - Store announcement', () => {

    test('GET returns initial announcement', async () => {
      const app = createApp();

      const res = await request(app).get('/announcement');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'New books arriving this Friday',
        active: true
      });
    });

    test('PUT replaces entire announcement', async () => {
      const app = createApp();

      const res = await request(app)
        .put('/announcement')
        .send({ message: 'Store closed tomorrow' });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'Store closed tomorrow'
      });
    });

    test('PATCH updates only provided properties', async () => {
      const app = createApp();

      const res = await request(app)
        .patch('/announcement')
        .send({ active: false });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'New books arriving this Friday',
        active: false
      });
    });

    test('DELETE returns 204 with empty body', async () => {
      const app = createApp();

      const res = await request(app).delete('/announcement');

      assert.equal(res.status, 204);
      assert.equal(res.text ?? '', '');
    });

    test('GET after DELETE returns 404', async () => {
      const app = createApp();

      await request(app).delete('/announcement');

      const res = await request(app).get('/announcement');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'No announcement available'
      });
    });

    test('PATCH after DELETE returns 404', async () => {
      const app = createApp();

      await request(app).delete('/announcement');

      const res = await request(app)
        .patch('/announcement')
        .send({ active: false });

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'No announcement available'
      });
    });

    test('PUT can recreate deleted announcement', async () => {
      const app = createApp();

      await request(app).delete('/announcement');

      const res = await request(app)
        .put('/announcement')
        .send({ message: 'We are back', active: true });

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'We are back',
        active: true
      });
    });

    test('PUT removes omitted fields and GET reflects replacement', async () => {
      const app = createApp();

      await request(app)
        .put('/announcement')
        .send({ message: 'Holiday hours' });

      const res = await request(app).get('/announcement');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { message: 'Holiday hours' });
      assert.equal('active' in res.body, false);
    });

    test('PATCH persists partial updates across subsequent GET', async () => {
      const app = createApp();

      await request(app)
        .patch('/announcement')
        .send({ message: 'Updated message' });

      const res = await request(app).get('/announcement');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'Updated message',
        active: true
      });
    });

    test('DELETE called twice returns 204 both times', async () => {
      const app = createApp();

      const first = await request(app).delete('/announcement');
      const second = await request(app).delete('/announcement');

      assert.equal(first.status, 204);
      assert.equal(second.status, 204);
    });

    test('Different app instances have independent announcement state', async () => {
      const app1 = createApp();
      const app2 = createApp();

      await request(app1).delete('/announcement');

      const res = await request(app2).get('/announcement');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        message: 'New books arriving this Friday',
        active: true
      });
    });
  });

  describe('Task 3 - Featured books', () => {

    test('GET featured returns only featured books in order', async () => {
      const app = createApp();

      const res = await request(app).get('/books/featured');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body.map(book => book.slug), [
        'clean-code',
        'ddia'
      ]);
    });

    test('GET book by slug works', async () => {
      const app = createApp();

      const res = await request(app).get('/books/clean-code');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        slug: 'clean-code',
        title: 'Clean Code',
        featured: true
      });
    });

    test('Unknown book returns 404', async () => {
      const app = createApp();

      const res = await request(app).get('/books/unknown-book');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Book not found: unknown-book'
      });
    });

    test('GET featured excludes non-featured books and returns full objects', async () => {
      const app = createApp();

      const res = await request(app).get('/books/featured');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, [
        { slug: 'clean-code', title: 'Clean Code', featured: true },
        {
          slug: 'ddia',
          title: 'Designing Data-Intensive Applications',
          featured: true
        }
      ]);
    });

    test('GET non-featured book by slug works', async () => {
      const app = createApp();

      const res = await request(app).get('/books/atomic-habits');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        slug: 'atomic-habits',
        title: 'Atomic Habits',
        featured: false
      });
    });

    test('Unknown book 404 includes the requested slug', async () => {
      const app = createApp();

      const res = await request(app).get('/books/refactoring');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Book not found: refactoring'
      });
    });
  });

  describe('Task 4 - Book cover wildcards', () => {

    test('Matches a file at first level', async () => {
      const app = createApp();

      const res = await request(app).get('/covers/clean-code.jpg');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        file: 'clean-code.jpg'
      });
    });

    test('Matches nested folders', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/covers/fiction/fantasy/hobbit.png');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        file: 'fiction/fantasy/hobbit.png'
      });
    });

    test('Matches deeply nested folders', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/covers/technical/databases/postgresql/cover.webp');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        file: 'technical/databases/postgresql/cover.webp'
      });
    });

    test('/covers without filename returns 404', async () => {
      const app = createApp();

      const res = await request(app).get('/covers');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /covers'
      });
    });

    test('/covers/ with trailing slash returns 404', async () => {
      const app = createApp();

      const res = await request(app).get('/covers/');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /covers/'
      });
    });
  });

  describe('Task 5 - Documentation optional wildcard', () => {

    test('Matches /docs root', async () => {
      const app = createApp();

      const res = await request(app).get('/docs');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { section: '' });
    });

    test('Matches one documentation section', async () => {
      const app = createApp();

      const res = await request(app).get('/docs/getting-started');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        section: 'getting-started'
      });
    });

    test('Matches nested documentation sections', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/docs/api/orders/reservations');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        section: 'api/orders/reservations'
      });
    });

    test('Matches /docs/ with trailing slash', async () => {
      const app = createApp();

      const res = await request(app).get('/docs/');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { section: '' });
    });

    test('Matches two-level documentation section', async () => {
      const app = createApp();

      const res = await request(app).get('/docs/api/books');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, { section: 'api/books' });
    });
  });

  describe('Task 6 - Author books', () => {

    test('Returns a book belonging to the author', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/martin/books/clean-code');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        id: 'clean-code',
        title: 'Clean Code'
      });
    });

    test('Returns book of another valid author', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/kleppmann/books/ddia');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        id: 'ddia',
        title: 'Designing Data-Intensive Applications'
      });
    });

    test('Unknown author returns 404', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/unknown/books/ddia');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Author not found'
      });
    });

    test('Book belonging to another author returns 404', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/martin/books/ddia');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Book not found for this author'
      });
    });

    test('Unknown book for existing author returns 404', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/martin/books/unknown');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Book not found for this author'
      });
    });

    test('Returns second book belonging to martin', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/martin/books/clean-architecture');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        id: 'clean-architecture',
        title: 'Clean Architecture'
      });
    });

    test('Book belonging to martin requested under kleppmann returns 404', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/authors/kleppmann/books/clean-code');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Book not found for this author'
      });
    });
  });

  describe('Task 7 - JSON 404 handler', () => {

    test('Unknown GET route returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).get('/unknown');

      assert.equal(res.status, 404);
      assert.match(res.headers['content-type'], /application\/json/);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /unknown'
      });
    });

    test('POST on unsupported path-method combination returns 404', async () => {
      const app = createApp();

      const res = await request(app).post('/announcement');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: POST /announcement'
      });
    });

    test('DELETE /books returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).delete('/books');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: DELETE /books'
      });
    });

    test('PUT on unsupported path-method combination returns 404', async () => {
      const app = createApp();

      const res = await request(app).put('/covers/image.jpg');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: PUT /covers/image.jpg'
      });
    });

    test('Valid routes still work', async () => {
      const app = createApp();

      const res = await request(app).get('/books/clean-code');

      assert.equal(res.status, 200);
    });

    test('404 message excludes query string', async () => {
      const app = createApp();

      const res = await request(app).get('/unknown?source=test');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /unknown'
      });
    });

    test('PATCH on unsupported route returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).patch('/reservations');

      assert.equal(res.status, 404);
      assert.match(res.headers['content-type'], /application\/json/);
      assert.deepEqual(res.body, {
        error: 'Route not found: PATCH /reservations'
      });
    });

    test('POST on /books/featured returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).post('/books/featured');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: POST /books/featured'
      });
    });

    test('Deeply nested unknown path returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).get('/api/v1/does-not-exist');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /api/v1/does-not-exist'
      });
    });
  });

  
  describe('Task 8 - Download routes', () => {

    test('Latest route returns dedicated response', async () => {
      const app = createApp();

      const res = await request(app).get('/downloads/latest');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        type: 'latest',
        file: 'latest-release.zip'
      });
    });

    test('Wildcard handles nested archive paths', async () => {
      const app = createApp();

      const res = await request(app)
        .get('/downloads/2026/releases/v2.zip');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        type: 'archive',
        file: '2026/releases/v2.zip'
      });
    });

    test('Wildcard handles single-segment archive paths', async () => {
      const app = createApp();

      const res = await request(app).get('/downloads/manual.pdf');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        type: 'archive',
        file: 'manual.pdf'
      });
    });

    test('/downloads without filename returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).get('/downloads');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /downloads'
      });
    });

    test('/downloads/ with trailing slash returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).get('/downloads/');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: GET /downloads/'
      });
    });

    test('/downloads/latest/v1.zip is handled by wildcard as archive', async () => {
      const app = createApp();

      const res = await request(app).get('/downloads/latest/v1.zip');

      assert.equal(res.status, 200);
      assert.deepEqual(res.body, {
        type: 'archive',
        file: 'latest/v1.zip'
      });
    });

    test('POST /downloads/latest returns JSON 404', async () => {
      const app = createApp();

      const res = await request(app).post('/downloads/latest');

      assert.equal(res.status, 404);
      assert.deepEqual(res.body, {
        error: 'Route not found: POST /downloads/latest'
      });
    });
  });

});
