namespace Todo.Api.DTOs;

public record TodoDto(Guid Id, string Title, string Description, DateTime CreatedAt, bool Completed);
