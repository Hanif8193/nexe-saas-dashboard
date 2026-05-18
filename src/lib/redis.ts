import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

export const redis = hasRedisConfig
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

export const ratelimit = hasRedisConfig
  ? new Ratelimit({
      redis: redis as Redis,
      limiter: Ratelimit.slidingWindow(100, "1 m"),
    })
  : null
