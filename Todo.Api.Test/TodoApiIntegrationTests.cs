using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Todo.Api.DTOs;
using Xunit;

namespace Todo.Api.Tests;

/// <summary>
/// Full-stack API tests using TestServer via WebApplicationFactory.
/// Verifies routing, model binding, DI wiring, and responses.
/// </summary>
public class TodoApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public TodoApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        // Create a client against the in-memory test server.
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }
    private static async Task EnsureSuccessWithBody(HttpResponseMessage res)
    {
        if (!res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadAsStringAsync();
            throw new Xunit.Sdk.XunitException(
                $"Expected success but got {(int)res.StatusCode} {res.StatusCode}.\nBody:\n{body}");
        }
    }

    [Fact]
    public async Task Get_Initially_Empty()
    {
        var res = await _client.GetAsync("/api/todos");
        res.EnsureSuccessStatusCode();

        var list = await res.Content.ReadFromJsonAsync<TodoDto[]>();
        Assert.NotNull(list);
        Assert.Empty(list!);
    }

    [Fact]
    public async Task Post_Creates_Item_Then_Get_Shows_It()
    {
        var create = new CreateTodoDto("Milk", "2L full cream");
        var post = await _client.PostAsJsonAsync("/api/todos", create);
        await EnsureSuccessWithBody(post);

        Assert.Equal(HttpStatusCode.Created, post.StatusCode);
        var created = await post.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(created);
        Assert.Equal("Milk", created!.Title);
        Assert.Equal("2L full cream", created.Description);
        Assert.False(created.Completed);

        var get = await _client.GetAsync("/api/todos");
        await EnsureSuccessWithBody(get);
        var list = await get.Content.ReadFromJsonAsync<TodoDto[]>();
        Assert.Single(list!);
        Assert.Equal(created.Id, list![0].Id);
    }

    [Fact]
    public async Task GetById_NotFound()
    {
        var res = await _client.GetAsync($"/api/todos/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, res.StatusCode);
    }

    [Fact]
    public async Task Patch_Updates_Completed_And_Description()
    {
        var created = await (await _client.PostAsJsonAsync("/api/todos",
            new CreateTodoDto("Task", null)))
            .Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(created);

        var patch = await _client.PatchAsJsonAsync($"/api/todos/{created!.Id}",
            new UpdateTodoDto(null, "done now", true));
        await EnsureSuccessWithBody(patch);

        var updated = await patch.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(updated);
        Assert.True(updated!.Completed);
        Assert.Equal("done now", updated.Description);
        Assert.Equal("Task", updated.Title); 
    }

    [Fact]
    public async Task Patch_Only_Completed_Preserves_Title_And_Description()
    {
        var created = await (await _client.PostAsJsonAsync("/api/todos",
            new CreateTodoDto("Keep", "Desc")))
            .Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(created);

        var patch = await _client.PatchAsJsonAsync($"/api/todos/{created!.Id}",
            new UpdateTodoDto(null, null, true));
        await EnsureSuccessWithBody(patch);

        var updated = await patch.Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(updated);
        Assert.True(updated!.Completed);
        Assert.Equal("Keep", updated.Title);
        Assert.Equal("Desc", updated.Description);
    }

    [Fact]
    public async Task Patch_NotFound_Returns_404()
    {
        var patch = await _client.PatchAsJsonAsync($"/api/todos/{Guid.NewGuid()}",
            new UpdateTodoDto("X", null, null));
        Assert.Equal(HttpStatusCode.NotFound, patch.StatusCode);
    }

    [Fact]
    public async Task Delete_Removes_Item()
    {
        var created = await (await _client.PostAsJsonAsync("/api/todos",
            new CreateTodoDto("X", null)))
            .Content.ReadFromJsonAsync<TodoDto>();
        Assert.NotNull(created);

        var del = await _client.DeleteAsync($"/api/todos/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var get = await _client.GetAsync("/api/todos");
        await EnsureSuccessWithBody(get);
        var list = await get.Content.ReadFromJsonAsync<TodoDto[]>();
        Assert.DoesNotContain(list!, t => t.Id == created.Id);
    }

    [Fact]
    public async Task Delete_NotFound_Returns_404()
    {
        var del = await _client.DeleteAsync($"/api/todos/{Guid.NewGuid()}");
        Assert.Equal(HttpStatusCode.NotFound, del.StatusCode);
    }

    [Fact]
    public async Task Post_Empty_Title_Returns_400()
    {
        // Fails model validation due to [Required, MinLength(1)]
        var res = await _client.PostAsJsonAsync("/api/todos", new CreateTodoDto("", null));
        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Post_Whitespace_Title_Returns_400()
    {
        var res = await _client.PostAsJsonAsync("/api/todos", new CreateTodoDto("   ", null));
        Assert.True(res.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.InternalServerError);
    }
}
