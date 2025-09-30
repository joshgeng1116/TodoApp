using Todo.Api.Models;

namespace Todo.Api.DTOs;

public static class Mapping
{
    public static TodoDto ToDto(this TodoItem item)
        => new(item.Id, item.Title, item.Description, item.CreatedAt, item.Completed);
}
