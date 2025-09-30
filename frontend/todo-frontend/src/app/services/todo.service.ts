import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from '../models/todo';
//import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class TodoService {
  private base = '/api/todos';
  //private base = `${environment.apiUrl}/api/todos`;

  constructor(private http: HttpClient) {}

  list(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.base);
  }

  add(body: { title: string; description?: string }): Observable<Todo> {
    return this.http.post<Todo>(this.base, body);
  }

  patch(id: string, body: Partial<Todo>): Observable<Todo> {
    return this.http.patch<Todo>(`${this.base}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
