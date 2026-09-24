import posthog, { isPostHogEnabled } from './posthog'

export const gameLogger = {
  sessionStarted(gameId: string, previouslyCompleted: boolean) {
    if (isPostHogEnabled) {
      posthog.logger.info('game session started', {
        game_id: gameId,
        previously_completed: previouslyCompleted,
      })
    }
  },
  stationCompleted(gameId: string, stationIndex: number) {
    if (isPostHogEnabled) {
      posthog.logger.info('game station completed', {
        game_id: gameId,
        station_index: stationIndex,
      })
    }
  },
  completed(gameId: string, stationCount: number) {
    if (isPostHogEnabled) {
      posthog.logger.info('game completed', {
        game_id: gameId,
        station_count: stationCount,
      })
    }
  },
}
