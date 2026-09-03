namespace AnimeSei.Application.Common.Models;

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int CurrentPage { get; set; } = 1;
    public int LastPage { get; set; } = 1;
    public int Total { get; set; } = 0;
    public bool HasNextPage { get; set; } = false;
}
