using AnimeSei.Application.Common.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace AnimeSei.Infrastructure.BackgroundServices;

public class AniListAutoSyncWorker : BackgroundService
{
    private readonly IAniListService _aniListService;
    private readonly ILogger<AniListAutoSyncWorker> _logger;

    public AniListAutoSyncWorker(IAniListService aniListService, ILogger<AniListAutoSyncWorker> logger)
    {
        _aniListService = aniListService;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 AniList Auto Sync Worker started.");

        // Brief 10s initial delay after app startup
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(20));

        try
        {
            do
            {
                try
                {
                    await _aniListService.SyncIncrementalAnimeAsync(stoppingToken);
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    _logger.LogError(ex, "⚠️ Error occurred during background incremental AniList sync.");
                }
            }
            while (await timer.WaitForNextTickAsync(stoppingToken));
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("🛑 AniList Auto Sync Worker stopping due to cancellation signal.");
        }
    }
}

