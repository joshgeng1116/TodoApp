import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TodoService } from './todo.service';
import { Todo } from '../models/todo';

describe('TodoService', () => {
  let svc: TodoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TodoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ],
    });
    svc = TestBed.inject(TodoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list() GETs /api/todos', () => {
    const mock: Todo[] = [
      { id: crypto.randomUUID(), title: 'A', description: 'D', createdAt: new Date().toISOString(), completed: false }
    ];

    svc.list().subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].title).toBe('A');
    });

    const req = http.expectOne('/api/todos');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('add() POSTs title/description', () => {
    const created: Todo = {
      id: crypto.randomUUID(),
      title: 'Milk',
      description: '2L',
      createdAt: new Date().toISOString(),
      completed: false
    };

    svc.add({ title: 'Milk', description: '2L' }).subscribe(res => {
      expect(res.id).toBe(created.id);
      expect(res.title).toBe('Milk');
    });

    const req = http.expectOne('/api/todos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Milk', description: '2L' });
    req.flush(created);
  });

  it('patch() PATCHes completed flag', () => {
    const id = crypto.randomUUID();
    const updated: Partial<Todo> = { id, completed: true };

    svc.patch(id, { completed: true }).subscribe(res => {
      expect(res.completed).toBeTrue();
    });

    const req = http.expectOne(`/api/todos/${id}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ completed: true });
    req.flush(updated);
  });

  it('delete() DELETEs /api/todos/:id', () => {
    const id = crypto.randomUUID();

    svc.delete(id).subscribe(ok => {
      expect(ok == null).toBeTrue();
    });

    const req = http.expectOne(`/api/todos/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
