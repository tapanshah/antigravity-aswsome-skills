---
name: api-rate-limiting
description: "Implement and manage API rate limiting strategies to protect backend services and ensure fair usage"
risk: safe
source: community
date_added: "2025-01-20"
---

# API Rate Limiting

## Overview

This skill provides comprehensive guidance on implementing and managing API rate limiting strategies. Rate limiting is crucial for protecting your backend services from overload, preventing abuse, and ensuring fair resource allocation across all users. Whether you're building a REST API, GraphQL endpoint, or microservices architecture, this skill covers the essential concepts, implementation patterns, and best practices.

## When to Use This Skill

- Use when designing APIs that need to handle multiple concurrent users
- Use when protecting backend services from abuse or denial-of-service attacks
- Use when implementing fair usage policies across different user tiers
- Use when building microservices that need to prevent cascade failures
- Use when optimizing API costs by controlling request volumes

## Core Concepts

### Rate Limiting Algorithms

**Token Bucket**: Allows bursts of traffic while maintaining average rate. Tokens are added at a fixed rate, and requests consume tokens.

**Leaky Bucket**: Smooths out traffic by processing requests at a constant rate. Excess requests overflow and are rejected.

**Fixed Window**: Counts requests within fixed time windows (e.g., per minute). Simple but can allow bursts at window boundaries.

**Sliding Window**: Combines fixed window with sliding time calculation for more accurate rate limiting without boundary issues.

### Key Metrics

- **Rate Limit**: Maximum number of requests allowed in a time period
- **Window Size**: Duration of the time period (seconds, minutes, hours)
- **Burst Capacity**: Maximum requests allowed in a short burst
- **Retry-After**: Time to wait before making another request

## Step-by-Step Implementation Guide

### 1. Choose Your Algorithm

Select the rate limiting algorithm based on your requirements:
- **Token Bucket** for APIs that need to allow traffic bursts
- **Sliding Window** for precise, fair rate limiting
- **Fixed Window** for simple, resource-efficient implementation

### 2. Define Rate Limit Tiers

Establish different limits for user types:
```
Free Tier: 100 requests/hour
Basic Tier: 1,000 requests/hour
Premium Tier: 10,000 requests/hour
Enterprise: Custom limits
```

### 3. Implement Rate Limiting Middleware

Add rate limiting at the application or gateway level to intercept requests before they reach your business logic.

### 4. Store Rate Limit State

Use fast, distributed storage:
- **Redis** for distributed rate limiting across multiple servers
- **In-memory cache** for single-server applications
- **Database** only as last resort (too slow)

### 5. Return Appropriate Headers

Include standard rate limit headers in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642780800
Retry-After: 3600
```

### 6. Handle Rate Limit Exceeded

Return HTTP 429 status code with clear error messages and retry information.

## Examples

### Example 1: Express.js with Redis (Token Bucket)

```javascript
const redis = require('redis');
const client = redis.createClient();

const rateLimit = async (req, res, next) => {
  const key = `rate_limit:${req.user.id}`;
  const limit = req.user.tier.limit; // e.g., 1000
  const window = req.user.tier.window; // e.g., 3600 seconds
  
  const current = await client.incr(key);
  
  if (current === 1) {
    await client.expire(key, window);
  }
  
  const ttl = await client.ttl(key);
  
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current));
  res.setHeader('X-RateLimit-Reset', Date.now() + ttl * 1000);
  
  if (current > limit) {
    res.setHeader('Retry-After', ttl);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: ttl
    });
  }
  
  next();
};

app.use(rateLimit);
```

**Explanation:** This implements a simple fixed window counter using Redis. Each request increments the counter, and when the limit is exceeded, returns a 429 error with retry information.

### Example 2: Python Flask with Sliding Window

```python
from flask import Flask, request, jsonify
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis

app = Flask(__name__)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",
    strategy="moving-window"
)

@app.route('/api/data')
@limiter.limit("100 per hour")
def get_data():
    return jsonify({"data": "Your data here"})

@app.route('/api/premium')
@limiter.limit("1000 per hour")
def premium_endpoint():
    return jsonify({"premium": "data"})

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({
        "error": "Rate limit exceeded",
        "message": str(e.description)
    }), 429
```

**Explanation:** Uses Flask-Limiter with Redis for sliding window rate limiting. Different endpoints can have different limits based on user tier or endpoint sensitivity.

### Example 3: API Gateway Rate Limiting (AWS)

```yaml
# AWS API Gateway CloudFormation
Resources:
  MyApiUsagePlan:
    Type: AWS::ApiGateway::UsagePlan
    Properties:
      ApiStages:
        - ApiId: !Ref MyApi
          Stage: !Ref MyStage
      Throttle:
        BurstLimit: 500
        RateLimit: 1000
      Quota:
        Limit: 10000
        Period: DAY

  ApiKey:
    Type: AWS::ApiGateway::ApiKey
    Properties:
      Enabled: true

  UsagePlanKey:
    Type: AWS::ApiGateway::UsagePlanKey
    Properties:
      KeyId: !Ref ApiKey
      KeyType: API_KEY
      UsagePlanId: !Ref MyApiUsagePlan
```

**Explanation:** Configures rate limiting at the AWS API Gateway level with burst capacity of 500 requests, steady rate of 1000 req/sec, and daily quota of 10,000 requests.

## Best Practices

- ✅ **Do:** Use distributed caching (Redis/Memcached) for rate limit state in production
- ✅ **Do:** Implement rate limiting at multiple layers (API gateway, application, and database)
- ✅ **Do:** Return clear, actionable error messages with retry information
- ✅ **Do:** Log rate limit violations for security monitoring and abuse detection
- ✅ **Do:** Provide different rate limits based on user authentication and tier
- ✅ **Do:** Document rate limits clearly in API documentation
- ✅ **Do:** Monitor rate limit metrics to adjust limits based on usage patterns
- ❌ **Don't:** Store rate limit state in the database (too slow)
- ❌ **Don't:** Use the same rate limit for all endpoints (some need stricter limits)
- ❌ **Don't:** Implement rate limiting without proper error handling
- ❌ **Don't:** Forget to set appropriate cache TTL values
- ❌ **Don't:** Rate limit health check endpoints

## Troubleshooting

### Problem: Rate limits hit too frequently by legitimate users

**Symptoms:** Users complaining about 429 errors during normal usage, especially during peak times

**Solution:** 
- Analyze usage patterns to identify if limits are too restrictive
- Consider implementing token bucket to allow bursts
- Increase limits for authenticated or premium users
- Implement exponential backoff on client side

### Problem: Rate limiting causing distributed system inconsistencies

**Symptoms:** Different servers showing different remaining counts, users getting inconsistent rate limit responses

**Solution:**
- Ensure Redis/cache is properly distributed and accessible to all servers
- Use Redis cluster with replication for high availability
- Implement proper cache synchronization
- Consider using a centralized rate limiting service

### Problem: Rate limit bypass through distributed attacks

**Symptoms:** Attackers using multiple IPs to bypass rate limits

**Solution:**
- Implement rate limiting on multiple identifiers (IP, user ID, API key)
- Add CAPTCHA challenges after multiple violations
- Use Web Application Firewall (WAF) for IP-based blocking
- Implement behavioral analysis to detect abuse patterns

### Problem: High Redis/cache load from rate limiting

**Symptoms:** Cache server CPU/memory high, slow response times

**Solution:**
- Use Redis pipelining for batch operations
- Implement local caching with eventual consistency
- Consider using Nginx rate limiting for static thresholds
- Optimize cache data structures (use counters instead of lists)

## Related Skills

- `@api-design` - Design APIs with rate limiting in mind from the start
- `@redis-optimization` - Optimize Redis for high-performance rate limiting
- `@microservices-resilience` - Implement circuit breakers alongside rate limiting
- `@api-security` - Combine rate limiting with other security measures
- `@monitoring-observability` - Track and alert on rate limit metrics

## Additional Resources

- [Redis Rate Limiting Patterns](https://redis.io/topics/rate-limiting)
- [IETF Draft: RateLimit Header Fields](https://datatracker.ietf.org/doc/html/draft-polli-ratelimit-headers)
- [AWS API Gateway Throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html)
- [Kong API Gateway Rate Limiting](https://docs.konghq.com/hub/kong-inc/rate-limiting/)
- [Cloudflare Rate Limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)
