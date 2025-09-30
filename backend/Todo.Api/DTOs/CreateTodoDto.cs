using System.ComponentModel.DataAnnotations;

namespace Todo.Api.DTOs;

public record CreateTodoDto(
    [ Required, MinLength(1)] string Title,
    string? Description
);
