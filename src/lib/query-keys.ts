export const queryKeys = {
  publicCreators: (limit: number) => ['public-creators', limit] as const,
  /** Shared pool used by sidebar / discover / right rail. */
  publicCreatorsPool: ['public-creators', 'pool'] as const,
  subscriptionsMe: ['subscriptions', 'me'] as const,
  storiesFeed: ['stories', 'feed'] as const,
  discoverCreators: (limit: number) => ['discover-creators', limit] as const,
}
