import os
import redis
import json
from datetime import datetime

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
r = redis.Redis.from_url(REDIS_URL, decode_responses=True)

def cache_key(resource_id: str, date: str):
    return f"availability:{resource_id}:{date}"

def get_cached_availability(resource_id: str, date: str):
    key = cache_key(resource_id, date)
    cached = r.get(key)
    if cached:
        return json.loads(cached)
    return None

def set_cached_availability(resource_id: str, date: str, data):
    key = cache_key(resource_id, date)
    r.set(key, json.dumps(data), ex=30)  # 30 second TTL

def invalidate_cache(resource_id: str, date: str):
    key = cache_key(resource_id, date)
    r.delete(key)
