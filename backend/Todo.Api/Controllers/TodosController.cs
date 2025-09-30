using Microsoft.AspNetCore.Mvc;
using Todo.Api.DTOs;
using Todo.Api.Services;

namespace Todo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodosController : ControllerBase
{
    private readonly ITodoService _service;
    public TodosController(ITodoService service) => _service = service;

    [HttpGet]
    public ActionResult<IEnumerable<TodoDto>> Get() => Ok(_service.GetAll());

    [HttpGet("{id:guid}", Name = "GetTodoById")]
    public ActionResult<TodoDto> GetById(Guid id)
    {
        var todo = _service.Get(id);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpPost]
    public ActionResult<TodoDto> Post([FromBody] CreateTodoDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var created = _service.Add(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPatch("{id:guid}")]
    public ActionResult<TodoDto> Patch(Guid id, [FromBody] UpdateTodoDto dto)
    {
        var updated = _service.Update(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult Delete(Guid id)
        => _service.Delete(id) ? NoContent() : NotFound();
}
