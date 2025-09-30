namespace Todo.Api.DTOs;

public record UpdateTodoDto(string? Title, string? Description, bool? Completed);
