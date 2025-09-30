using Todo.Api.DTOs;
using Todo.Api.Repositories;
using Todo.Api.Services;
using Xunit;

namespace Todo.Api.Tests;

/// <summary>
/// Unit tests for the service layer only (no web host).
/// These validate business rules, normalization, and repository behavior.
/// </summary>
public class TodoServiceTests
{
    [Fact]
    public void Add_Sets_Title_And_Description_And_Defaults()
    {
        // Arrange: fresh service with in-memory repo
        var svc = new TodoService(new InMemoryTodoRepository());

        // Act: create a basic item and then list
        var created = svc.Add(new CreateTodoDto("Task A", "Desc A"));
        var all = svc.GetAll().ToList();

        // Assert: one item with expected defaults & values
        Assert.Single(all);
        Assert.Equal("Task A", created.Title);
        Assert.Equal("Desc A", created.Description);
        Assert.False(created.Completed);
        Assert.True(created.CreatedAt <= DateTime.UtcNow);
    }

    [Fact]
    public void Add_Rejects_Empty_Title()
    {
        var svc = new TodoService(new InMemoryTodoRepository());

        // Act + Assert: whitespace-only title is invalid
        Assert.Throws<ArgumentException>(() => svc.Add(new CreateTodoDto("   ", null)));
    }

    [Fact]
    public void Add_Trims_Title_And_Normalizes_Description()
    {
        var svc = new TodoService(new InMemoryTodoRepository());

        // Act: title with spaces is trimmed; null/whitespace description -> empty string
        var created1 = svc.Add(new CreateTodoDto("  Task B  ", null));
        var created2 = svc.Add(new CreateTodoDto("Task C", "   "));

        // Assert
        Assert.Equal("Task B", created1.Title);
        Assert.Equal(string.Empty, created1.Description);

        Assert.Equal("Task C", created2.Title);
        Assert.Equal(string.Empty, created2.Description);
    }

    [Fact]
    public void Update_Toggles_Completed_And_Changes_Description()
    {
        var svc = new TodoService(new InMemoryTodoRepository());
        var created = svc.Add(new CreateTodoDto("Task B", "Old"));

        // Act: patch completed + description only
        var updated = svc.Update(created.Id, new UpdateTodoDto(null, "New", true));

        // Assert: title preserved, completed toggled, description updated
        Assert.NotNull(updated);
        Assert.Equal("Task B", updated!.Title);
        Assert.Equal("New", updated.Description);
        Assert.True(updated.Completed);
    }

    [Fact]
    public void Update_Ignores_Whitespace_Title_And_Preserves_Existing()
    {
        var svc = new TodoService(new InMemoryTodoRepository());
        var created = svc.Add(new CreateTodoDto("Original", "Keep desc"));

        // Act: send whitespace title -> service should keep existing title
        var updated = svc.Update(created.Id, new UpdateTodoDto("   ", null, null));

        // Assert
        Assert.NotNull(updated);
        Assert.Equal("Original", updated!.Title);
        Assert.Equal("Keep desc", updated.Description);
        Assert.False(updated.Completed);
    }

    [Fact]
    public void Update_Only_Title_Leaves_Other_Fields_Untouched()
    {
        var svc = new TodoService(new InMemoryTodoRepository());
        var created = svc.Add(new CreateTodoDto("Old Title", "Old Desc"));

        // Act: update just the title
        var updated = svc.Update(created.Id, new UpdateTodoDto("New Title", null, null));

        // Assert: description/completed unchanged
        Assert.NotNull(updated);
        Assert.Equal("New Title", updated!.Title);
        Assert.Equal("Old Desc", updated.Description);
        Assert.False(updated.Completed);
    }

    [Fact]
    public void Update_Returns_Null_When_Not_Found()
    {
        var svc = new TodoService(new InMemoryTodoRepository());

        // Act
        var result = svc.Update(Guid.NewGuid(), new UpdateTodoDto("X", null, null));

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void Delete_Removes_Item_And_Returns_Flag()
    {
        var svc = new TodoService(new InMemoryTodoRepository());
        var created = svc.Add(new CreateTodoDto("Delete me", null));

        // Act
        var ok = svc.Delete(created.Id);
        var remaining = svc.GetAll().ToList();

        // Assert
        Assert.True(ok);
        Assert.Empty(remaining);
    }

    [Fact]
    public void Delete_Returns_False_When_Not_Found()
    {
        var svc = new TodoService(new InMemoryTodoRepository());

        // Act
        var ok = svc.Delete(Guid.NewGuid());

        // Assert
        Assert.False(ok);
    }

    [Fact]
    public void GetAll_Is_Sorted_By_CreatedAt_Desc()
    {
        var svc = new TodoService(new InMemoryTodoRepository());
        var a = svc.Add(new CreateTodoDto("A", null));
        // slight delay to ensure different timestamps
        Thread.Sleep(10);
        var b = svc.Add(new CreateTodoDto("B", null));

        // Act
        var list = svc.GetAll().ToList();

        // Assert: newest first (B before A)
        Assert.Equal(2, list.Count);
        Assert.Equal(b.Id, list[0].Id);
        Assert.Equal(a.Id, list[1].Id);
    }
}
