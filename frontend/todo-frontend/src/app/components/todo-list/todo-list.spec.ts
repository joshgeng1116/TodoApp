import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { TodoListComponent } from './todo-list';
import { Todo } from '../../models/todo';

// Create a simple jasmine spy service
class TodoServiceStub {
  list = jasmine.createSpy('list').and.returnValue(of([]));
  add = jasmine.createSpy('add').and.callFake(({ title, description }: {title: string; description?: string}) => {
    const todo: Todo = {
      id: crypto.randomUUID(),
      title, description,
      createdAt: new Date().toISOString(),
      completed: false
    };
    return of(todo);
  });
  patch = jasmine.createSpy('patch').and.callFake((id: string, body: Partial<Todo>) =>
    of({ id, ...body } as Partial<Todo>)
  );
  delete = jasmine.createSpy('delete').and.returnValue(of(void 0));
}

describe('TodoListComponent', () => {
  let fixture: ComponentFixture<TodoListComponent>;
  let component: TodoListComponent;
  let svc: TodoServiceStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [{ provide: (await import('../../services/todo.service')).TodoService, useClass: TodoServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
    svc = TestBed.inject((await import('../../services/todo.service')).TodoService) as unknown as TodoServiceStub;
  });

  it('loads items on init and renders', () => {
    const items: Todo[] = [
      { id: '1', title: 'A', description: 'D', createdAt: new Date().toISOString(), completed: false }
    ];
    svc.list.and.returnValue(of(items));

    fixture.detectChanges(); // ngOnInit

    const cards = fixture.debugElement.queryAll(By.css('.todo-card'));
    expect(cards.length).toBe(1);
    expect(cards[0].nativeElement.textContent).toContain('A');
  });

  it('adds a todo and clears fields', () => {
    fixture.detectChanges();

    component.newTitle = 'Milk';
    component.newDescription = '2L';
    component.add();

    fixture.detectChanges();

    const cards = fixture.debugElement.queryAll(By.css('.todo-card'));
    expect(cards.length).toBe(1);
    expect(svc.add).toHaveBeenCalledWith({ title: 'Milk', description: '2L' });
    expect(component.newTitle).toBe('');
    expect(component.newDescription).toBe('');
  });

  it('toggles completed when card is clicked', () => {
    const item: Todo = { id: '1', title: 'A', description: '', createdAt: new Date().toISOString(), completed: false };
    svc.list.and.returnValue(of([item]));
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css('.todo-card'));
    // Simulate clicking the card (not in edit mode)
    card.nativeElement.click();
    fixture.detectChanges();

    expect(svc.patch).toHaveBeenCalledWith('1', { completed: true });
  });

  it('shows error if list fails', () => {
    svc.list.and.returnValue(throwError(() => new Error('boom')));
    fixture.detectChanges();

    expect(component.error).toBeTruthy();
    // Updated selector to match new template
    const errEl = fixture.debugElement.query(By.css('.error-message'));
    expect(errEl).toBeTruthy();
    expect(errEl.nativeElement.textContent).toContain('Failed to load');
  });

  it('deletes a todo', () => {
    const item: Todo = { id: '1', title: 'A', description: '', createdAt: new Date().toISOString(), completed: false };
    svc.list.and.returnValue(of([item]));
    fixture.detectChanges();

    // Updated selector to match new template structure
    const deleteButtons = fixture.debugElement.queryAll(By.css('.action-btn[color="warn"]'));
    expect(deleteButtons.length).toBeGreaterThan(0);
    
    // Create and dispatch a proper click event
    const clickEvent = new MouseEvent('click');
    Object.defineProperty(clickEvent, 'stopPropagation', { 
      value: jasmine.createSpy('stopPropagation') 
    });
    
    deleteButtons[0].triggerEventHandler('click', clickEvent);
    fixture.detectChanges();

    expect(svc.delete).toHaveBeenCalledWith('1');
    expect(component.todos.length).toBe(0);
  });

it('should disable refresh button when loading', () => {
  svc.list.and.returnValue(of([]));
  fixture.detectChanges();
  
  component.loading = true;
  fixture.detectChanges();
  
  const buttons = fixture.debugElement.queryAll(By.css('button'));
  const refreshButton = buttons.find(btn => 
    btn.nativeElement.querySelector('mat-icon')?.textContent?.includes('refresh')
  );
  
  expect(refreshButton?.nativeElement.disabled).toBeTrue();
});

  it('should disable add button when saving', () => {
    component.newTitle = 'Test';
    component.saving = true;
    fixture.detectChanges();
    
    const addButton = fixture.debugElement.query(By.css('.add-btn'));
    expect(addButton.nativeElement.disabled).toBeTrue();
  });

  it('should disable add button when title is empty', () => {
    component.newTitle = '';
    fixture.detectChanges();
    
    const addButton = fixture.debugElement.query(By.css('.add-btn'));
    expect(addButton.nativeElement.disabled).toBeTrue();
  });

  // ============================================================
  // FILTER TESTS
  // ============================================================

  it('should filter todos by active status', () => {
    component.todos = [
      { id: '1', title: 'Active', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Done', completed: true, createdAt: new Date().toISOString() }
    ];
    component.setFilter('active');
    
    expect(component.filteredTodos.length).toBe(1);
    expect(component.filteredTodos[0].title).toBe('Active');
  });

  it('should filter todos by completed status', () => {
    component.todos = [
      { id: '1', title: 'Active', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Done', completed: true, createdAt: new Date().toISOString() }
    ];
    component.setFilter('completed');
    
    expect(component.filteredTodos.length).toBe(1);
    expect(component.filteredTodos[0].title).toBe('Done');
  });

  it('should show all todos when filter is "all"', () => {
    component.todos = [
      { id: '1', title: 'Active', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Done', completed: true, createdAt: new Date().toISOString() }
    ];
    component.setFilter('all');
    
    expect(component.filteredTodos.length).toBe(2);
  });

  it('should handle multiple rapid filter changes', () => {
    component.todos = [
      { id: '1', title: 'Active', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Done', completed: true, createdAt: new Date().toISOString() }
    ];
    
    component.setFilter('active');
    expect(component.filteredTodos.length).toBe(1);
    
    component.setFilter('completed');
    expect(component.filteredTodos.length).toBe(1);
    
    component.setFilter('all');
    expect(component.filteredTodos.length).toBe(2);
  });

  // ============================================================
  // COUNT CALCULATIONS
  // ============================================================

  it('should calculate completed count correctly', () => {
    component.todos = [
      { id: '1', title: 'Task 1', completed: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'Task 2', completed: false, createdAt: new Date().toISOString() },
      { id: '3', title: 'Task 3', completed: true, createdAt: new Date().toISOString() }
    ];
    
    expect(component.completedCount).toBe(2);
  });

  it('should calculate active count correctly', () => {
    component.todos = [
      { id: '1', title: 'Task 1', completed: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'Task 2', completed: false, createdAt: new Date().toISOString() },
      { id: '3', title: 'Task 3', completed: false, createdAt: new Date().toISOString() }
    ];
    
    expect(component.activeCount).toBe(2);
  });

  it('should calculate total count correctly', () => {
    component.todos = [
      { id: '1', title: 'Task 1', completed: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'Task 2', completed: false, createdAt: new Date().toISOString() }
    ];
    
    expect(component.totalCount).toBe(2);
  });

  // ============================================================
  // INPUT VALIDATION & TRIMMING
  // ============================================================

  it('should trim whitespace from title before adding', () => {
    component.newTitle = '  Test Task  ';
    component.newDescription = '  Test Description  ';
    fixture.detectChanges();
    
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: 'Test Task', 
      description: 'Test Description' 
    });
  });

  it('should not add todo if title is only whitespace', () => {
    component.newTitle = '   ';
    component.add();
    
    expect(svc.add).not.toHaveBeenCalled();
  });

  it('should handle empty description by sending undefined', () => {
    component.newTitle = 'Test';
    component.newDescription = '';
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: 'Test', 
      description: undefined 
    });
  });

  it('should handle whitespace-only description by sending undefined', () => {
    component.newTitle = 'Test';
    component.newDescription = '   ';
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: 'Test', 
      description: undefined 
    });
  });

  // ============================================================
  // ERROR HANDLING
  // ============================================================

  it('should handle add error and display error message', () => {
    svc.add.and.returnValue(throwError(() => new Error('Failed')));
    fixture.detectChanges();
    
    component.newTitle = 'Test';
    component.add();
    
    expect(component.error).toBe('Failed to add todo.');
    expect(component.saving).toBeFalse();
  });

  it('should handle toggle error and revert completion status', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Test', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    svc.patch.and.returnValue(throwError(() => new Error('Failed')));
    
    component.toggleComplete(todo);
    
    expect(todo.completed).toBe(false);
    expect(component.error).toBe('Failed to update todo.');
  });

  it('should handle delete error and restore todos', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Test', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    svc.delete.and.returnValue(throwError(() => new Error('Failed')));
    
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'stopPropagation', { 
      value: jasmine.createSpy('stopPropagation') 
    });
    
    component.remove(todo, mockEvent);
    
    expect(component.todos.length).toBe(1);
    expect(component.error).toBe('Failed to delete todo.');
  });

  it('should clear error when refreshing', () => {
    component.error = 'Some error';
    svc.list.and.returnValue(of([]));
    
    component.refresh();
    
    expect(component.error).toBeUndefined();
  });

  it('should clear error when adding successfully', () => {
    component.error = 'Previous error';
    component.newTitle = 'Test';
    component.add();
    
    expect(component.error).toBeUndefined();
  });

  // ============================================================
  // EDIT MODE TESTS
  // ============================================================

  it('should start edit mode for a todo', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original', 
      description: 'Desc',
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'stopPropagation', { 
      value: jasmine.createSpy('stopPropagation') 
    });
    
    component.startEdit(todo, mockEvent);
    
    expect(component.editingTodo).toBe(todo);
    expect(component.editTitle).toBe('Original');
    expect(component.editDescription).toBe('Desc');
  });

  it('should handle todo without description in edit mode', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original',
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'stopPropagation', { 
      value: jasmine.createSpy('stopPropagation') 
    });
    
    component.startEdit(todo, mockEvent);
    
    expect(component.editDescription).toBe('');
  });

  it('should save edited todo', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    component.editingTodo = todo;
    component.editTitle = 'Updated';
    component.editDescription = 'New Desc';
    
    const updated = { id: '1', title: 'Updated', description: 'New Desc' };
    svc.patch.and.returnValue(of(updated));
    
    component.saveEdit();
    
    expect(svc.patch).toHaveBeenCalledWith('1', { 
      title: 'Updated', 
      description: 'New Desc' 
    });
    expect(component.editingTodo).toBeNull();
  });

  it('should trim edit fields before saving', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    component.editingTodo = todo;
    component.editTitle = '  Updated  ';
    component.editDescription = '  New Desc  ';
    
    svc.patch.and.returnValue(of({}));
    component.saveEdit();
    
    expect(svc.patch).toHaveBeenCalledWith('1', { 
      title: 'Updated', 
      description: 'New Desc' 
    });
  });

  it('should send undefined for empty edit description', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    component.editingTodo = todo;
    component.editTitle = 'Updated';
    component.editDescription = '';
    
    svc.patch.and.returnValue(of({}));
    component.saveEdit();
    
    expect(svc.patch).toHaveBeenCalledWith('1', { 
      title: 'Updated', 
      description: undefined 
    });
  });

  it('should cancel edit mode', () => {
    component.editingTodo = { 
      id: '1', 
      title: 'Test', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.editTitle = 'Test';
    component.editDescription = 'Desc';
    
    component.cancelEdit();
    
    expect(component.editingTodo).toBeNull();
    expect(component.editTitle).toBe('');
    expect(component.editDescription).toBe('');
  });

  it('should not save edit if title is empty', () => {
    component.editingTodo = { 
      id: '1', 
      title: 'Test', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.editTitle = '';
    
    component.saveEdit();
    
    expect(svc.patch).not.toHaveBeenCalled();
  });

  it('should not save edit if title is only whitespace', () => {
    component.editingTodo = { 
      id: '1', 
      title: 'Test', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.editTitle = '   ';
    
    component.saveEdit();
    
    expect(svc.patch).not.toHaveBeenCalled();
  });

  it('should handle edit save error', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    component.editingTodo = todo;
    component.editTitle = 'Updated';
    
    svc.patch.and.returnValue(throwError(() => new Error('Failed')));
    component.saveEdit();
    
    expect(component.error).toBe('Failed to update todo.');
  });

  it('should update todo in list after successful edit', () => {
    const todo: Todo = { 
      id: '1', 
      title: 'Original',
      description: 'Old',
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [todo];
    component.editingTodo = todo;
    component.editTitle = 'Updated';
    component.editDescription = 'New';
    
    const updated = { title: 'Updated', description: 'New' };
    svc.patch.and.returnValue(of(updated));
    
    component.saveEdit();
    
    expect(component.todos[0].title).toBe('Updated');
    expect(component.todos[0].description).toBe('New');
  });

  // ============================================================
  // TODO LIST ORDERING
  // ============================================================

  it('should add new todo to the beginning of the list', () => {
    const existing: Todo = { 
      id: '1', 
      title: 'Old', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    component.todos = [existing];
    
    const newTodo: Todo = { 
      id: '2', 
      title: 'New', 
      completed: false, 
      createdAt: new Date().toISOString() 
    };
    svc.add.and.returnValue(of(newTodo));
    
    component.newTitle = 'New';
    component.add();
    
    expect(component.todos[0].id).toBe('2');
    expect(component.todos[1].id).toBe('1');
  });

  // ============================================================
  // EDGE CASES
  // ============================================================

  it('should handle very long titles', () => {
    const longTitle = 'a'.repeat(500);
    component.newTitle = longTitle;
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: longTitle, 
      description: undefined 
    });
  });

  it('should handle special characters in title', () => {
    component.newTitle = '<script>alert("xss")</script>';
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: '<script>alert("xss")</script>', 
      description: undefined 
    });
  });

  it('should handle unicode characters in title', () => {
    component.newTitle = '✓ Task with emoji 🎉';
    component.add();
    
    expect(svc.add).toHaveBeenCalledWith({ 
      title: '✓ Task with emoji 🎉', 
      description: undefined 
    });
  });

  it('should handle empty todo list', () => {
    component.todos = [];
    
    expect(component.completedCount).toBe(0);
    expect(component.activeCount).toBe(0);
    expect(component.totalCount).toBe(0);
    expect(component.filteredTodos.length).toBe(0);
  });

  it('should handle all completed todos', () => {
    component.todos = [
      { id: '1', title: 'Done 1', completed: true, createdAt: new Date().toISOString() },
      { id: '2', title: 'Done 2', completed: true, createdAt: new Date().toISOString() }
    ];
    
    expect(component.completedCount).toBe(2);
    expect(component.activeCount).toBe(0);
  });

  it('should handle all active todos', () => {
    component.todos = [
      { id: '1', title: 'Active 1', completed: false, createdAt: new Date().toISOString() },
      { id: '2', title: 'Active 2', completed: false, createdAt: new Date().toISOString() }
    ];
    
    expect(component.completedCount).toBe(0);
    expect(component.activeCount).toBe(2);
  });

  it('should handle empty description in todos', () => {
    component.todos = [
      { id: '1', title: 'Task', completed: false, createdAt: new Date().toISOString() }
    ];
    
    expect(component.todos[0].description).toBeUndefined();
  });

  it('should handle large number of todos', () => {
    const manyTodos: Todo[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      title: `Task ${i}`,
      completed: i % 2 === 0,
      createdAt: new Date().toISOString()
    }));
    
    component.todos = manyTodos;
    
    expect(component.totalCount).toBe(100);
    expect(component.completedCount).toBe(50);
    expect(component.activeCount).toBe(50);
  });

  // ============================================================
  // INTEGRATION TEST
  // ============================================================

  it('should complete full workflow: add -> toggle -> edit -> delete', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    // Add a todo
    const newTodo: Todo = {
      id: 'test-id',
      title: 'Integration Test',
      completed: false,
      createdAt: new Date().toISOString()
    };
    svc.add.and.returnValue(of(newTodo));
    
    component.newTitle = 'Integration Test';
    component.add();
    tick();
    fixture.detectChanges();
    
    expect(component.todos.length).toBe(1);
    expect(component.newTitle).toBe('');
    
    // Toggle completion
    const todo = component.todos[0];
    svc.patch.and.returnValue(of({ completed: true }));
    component.toggleComplete(todo);
    tick();
    
    expect(svc.patch).toHaveBeenCalledWith('test-id', { completed: true });
    
    // Edit the todo
    const mockEvent = new MouseEvent('click');
    Object.defineProperty(mockEvent, 'stopPropagation', { 
      value: jasmine.createSpy('stopPropagation') 
    });
    
    component.startEdit(todo, mockEvent);
    expect(component.editingTodo).toBe(todo);
    
    component.editTitle = 'Updated Title';
    svc.patch.and.returnValue(of({ title: 'Updated Title' }));
    component.saveEdit();
    tick();
    
    expect(component.editingTodo).toBeNull();
    
    // Delete the todo
    svc.delete.and.returnValue(of(void 0));
    component.remove(todo, mockEvent);
    tick();
    
    expect(component.todos.length).toBe(0);
    expect(svc.delete).toHaveBeenCalledWith('test-id');
  }));
});