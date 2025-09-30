using System.Collections.Concurrent;
using Todo.Api.Models;

namespace Todo.Api.Repositories;

public class InMemoryTodoRepository : ITodoRepository
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _store = new();

    public IEnumerable<TodoItem> GetAll()
        => _store.Values.OrderByDescending(x => x.CreatedAt);

    public TodoItem? Get(Guid id)
        => _store.TryGetValue(id, out var v) ? v : null;

    public TodoItem Add(TodoItem item)
    {
        _store[item.Id] = item;
        return item;
    }

    public TodoItem? Update(TodoItem item)
    {
        if (!_store.ContainsKey(item.Id)) return null;
        _store[item.Id] = item;
        return item;
    }

    public bool Delete(Guid id) => _store.TryRemove(id, out _);
}
