using Todo.Api.DTOs;

namespace Todo.Api.Services;

public interface ITodoService
{
    IEnumerable<TodoDto> GetAll();
    TodoDto? Get(Guid id);
    TodoDto Add(CreateTodoDto dto);
    TodoDto? Update(Guid id, UpdateTodoDto dto);
    bool Delete(Guid id);
}
