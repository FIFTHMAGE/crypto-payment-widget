/** Session Management */
import { redis } from '../cache/redis';
export class SessionManager {
  async create(userId: string, data: any) {
    const sessionId = `session:${userId}:${Date.now()}`;
    await redis.setex(sessionId, 3600, JSON.stringify(data));
    return sessionId;
  }
  async get(sessionId: string) {
    const data = await redis.get(sessionId);
    return data ? JSON.parse(data) : null;
  }
  async destroy(sessionId: string) { await redis.del(sessionId); }
}

