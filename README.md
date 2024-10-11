1. **Setup and Configuration**

   - [x] Set up Node.js with Fastify for HTTP layer.
   - [x] Set up PostgreSQL for relational database.
   - [x] Set up Redis for ranking and caching.
   - [x] Integrate Swagger/OpenAPI for API documentation.
   - [ ] Configure Sentry/Datadog for monitoring metrics.

2. **Security and Performance**

   - [x] Implement JWT authentication for admin access.
   - [x] Add rate limiting to prevent abuse.
   - [x] Secure endpoints against SQL injection.
   - [x] Ensure response times under 200ms

3. **Core Features**

   - [x] Subscription: allow users to register in event with name and email.
   - [x] Ensure users can only subscribe once and only during the event's start and end dates.
   - [x] Generate unique referral links for subscribers.
   - [x] Track direct and indirect referrals for each referral link.
   - [x] Display the referral ranking ordered by the number of referrals.
   - [x] Allow hosts to filter the referral links ranking by day.

4. **Testing**

   - [x] Write tests with at least 90% coverage.
   - [x] Set up continuous integration to run tests and check coverage.

5. **Monitoring and Optimization**

   - [x] Track key metrics (requests per second, system load, response time).
   - [ ] Send performance data to Sentry/Datadog.
   - [ ] Optimize database and cache configurations regularly.

6. **Documentation and Deployment**
   - [x] Document API endpoints using Swagger/OpenAPI.
   - [x] Set up deployment using Docker.
   - [ ] Ensure proper security and performance settings in production.
