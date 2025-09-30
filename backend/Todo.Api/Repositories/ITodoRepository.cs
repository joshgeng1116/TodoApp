using Todo.Api.Models;

namespace Todo.Api.Repositories;

public interface ITodoRepository
{
    IEnumerable<TodoItem> GetAll();
    TodoItem? Get(Guid id);
    TodoItem Add(TodoItem item);
    TodoItem? Update(TodoItem item);
    bool Delete(Guid id);
}
