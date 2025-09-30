import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TodoListComponent } from './components/todo-list/todo-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, TodoListComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {}
