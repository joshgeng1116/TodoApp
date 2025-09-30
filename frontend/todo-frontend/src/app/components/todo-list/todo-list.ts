import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatIconModule }       from '@angular/material/icon';
import { MatCheckboxModule }   from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatListModule }       from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { Todo } from '../../models/todo';
import { TodoService } from '../../services/todo.service';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule,
    MatIconModule, MatCheckboxModule, MatListModule, MatProgressBarModule,
    MatDialogModule
  ],
  templateUrl: './todo-list.html',
  styleUrls: ['./todo-list.css']
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  newTitle = '';
  newDescription = '';
  loading = false;
  saving = false;
  error?: string;
  editingTodo: Todo | null = null;
  editTitle = '';
  editDescription = '';
  activeFilter: 'all' | 'active' | 'completed' = 'all';

  constructor(private svc: TodoService) {}
  
  ngOnInit(): void { 
    this.refresh(); 
  }

  refresh(): void {
    this.loading = true;
    this.error = undefined;
    this.svc.list().subscribe({
      next: items => { 
        this.todos = items; 
        this.loading = false; 
      },
      error: () => { 
        this.error = 'Failed to load todos.'; 
        this.loading = false; 
      }
    });
  }

  add(): void {
    const title = this.newTitle.trim();
    const description = this.newDescription.trim();
    if (!title) return;

    this.saving = true;
    this.error = undefined;
    this.svc.add({
      title,
      description: description || undefined
    }).subscribe({
      next: created => {
        this.todos = [created, ...this.todos];
        this.newTitle = '';
        this.newDescription = '';
        this.saving = false;
      },
      error: () => { 
        this.error = 'Failed to add todo.'; 
        this.saving = false; 
      }
    });
  }

  toggleComplete(todo: Todo, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const original = todo.completed;
    todo.completed = !original;
    this.svc.patch(todo.id, { completed: todo.completed }).subscribe({
      next: updated => Object.assign(todo, updated),
      error: () => { 
        todo.completed = original; 
        this.error = 'Failed to update todo.'; 
      }
    });
  }

  startEdit(todo: Todo, event: Event): void {
    event.stopPropagation();
    this.editingTodo = todo;
    this.editTitle = todo.title;
    this.editDescription = todo.description || '';
  }

  saveEdit(): void {
    if (!this.editingTodo || !this.editTitle.trim()) return;
    
    const todoId = this.editingTodo.id;
    this.svc.patch(todoId, {
      title: this.editTitle.trim(),
      description: this.editDescription.trim() || undefined
    }).subscribe({
      next: updated => {
        const index = this.todos.findIndex(t => t.id === todoId);
        if (index !== -1) {
          this.todos[index] = { ...this.todos[index], ...updated };
        }
        this.cancelEdit();
      },
      error: () => {
        this.error = 'Failed to update todo.';
      }
    });
  }

  cancelEdit(): void {
    this.editingTodo = null;
    this.editTitle = '';
    this.editDescription = '';
  }

  remove(todo: Todo, event: Event): void {
    event.stopPropagation();
    const backup = [...this.todos];
    this.todos = this.todos.filter(t => t.id !== todo.id);
    this.svc.delete(todo.id).subscribe({
      error: () => { 
        this.todos = backup; 
        this.error = 'Failed to delete todo.'; 
      }
    });
  }

  get completedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  get totalCount(): number {
    return this.todos.length;
  }

  get filteredTodos(): Todo[] {
    switch (this.activeFilter) {
      case 'active':
        return this.todos.filter(t => !t.completed);
      case 'completed':
        return this.todos.filter(t => t.completed);
      default:
        return this.todos;
    }
  }

  get activeCount(): number {
    return this.todos.filter(t => !t.completed).length;
  }

  setFilter(filter: 'all' | 'active' | 'completed'): void {
    this.activeFilter = filter;
  }
}