using Todo.Api.DTOs;
using Todo.Api.Models;
using Todo.Api.Repositories;

namespace Todo.Api.Services;

public class TodoService : ITodoService
{
    private readonly ITodoRepository _repo;

    public TodoService(ITodoRepository repo) => _repo = repo;

    public IEnumerable<TodoDto> GetAll()
        => _repo.GetAll().Select(x => x.ToDto());

    public TodoDto? Get(Guid id)
    {
        var item = _repo.Get(id);
        return item?.ToDto();
    }

    public TodoDto Add(CreateTodoDto dto)
    {
        var title = dto.Title?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(dto.Title));

        var item = new TodoItem
        {
            Title = title,
            Description = dto.Description?.Trim() ?? string.Empty
        };
        return _repo.Add(item).ToDto();
    }

    public TodoDto? Update(Guid id, UpdateTodoDto dto)
    {
        var existing = _repo.Get(id);
        if (existing is null) return null;

        var title = dto.Title is null ? existing.Title : dto.Title.Trim();
        title = string.IsNullOrWhiteSpace(title) ? existing.Title : title;

        var updated = new TodoItem
        {
            Id = existing.Id,
            CreatedAt = existing.CreatedAt,
            Title = title,
            Description = dto.Description is null ? existing.Description : (dto.Description?.Trim() ?? string.Empty),
            Completed = dto.Completed ?? existing.Completed
        };

        return _repo.Update(updated)?.ToDto();
    }

    public bool Delete(Guid id) => _repo.Delete(id);
}
