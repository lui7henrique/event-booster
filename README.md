### Complete Todo List

1. **Setup and Configuration**

   - [x] Initialize Node.js project with Fastify.
   - [x] Set up PostgreSQL database and configure the connection.
   - [x] Set up Redis for caching and real-time ranking.
   - [x] Set up Swagger/OpenAPI for API documentation.
   - [ ] Implement logging and monitoring with Sentry or Datadog.

2. **Security and Performance**

   - [x] Implement JWT authentication for admin routes.
   - [x] Add middleware for rate limiting.
   - [ ] Secure endpoints against SQL injection.
   - [x] Ensure critical endpoints have response times under 200ms.

3. **Testing and Maintenance**

   - [ ] Achieve 90% test coverage with unit and integration tests.
   - [ ] Set up continuous integration to run tests and check coverage.
   - [ ] Document setup and maintenance procedures.

4. **Core Features**

   - [x] Create an endpoint for user subscriptions with email and name validation.
   - [x] Prevent duplicate email registrations.
   - [x] Ensure subscription within event start and end dates.
   - [x] Develop unique referral link generation.
   - [x] Track and store referral link conversions.
   - [x] Implement hierarchical referral tracking.
   - [x] Build referral ranking endpoint with Redis caching and daily filtering.
   - [ ] Develop admin endpoints for event monitoring and management.
   - [ ] Allow admins to view detailed metrics and logs.

5. **Documentation and Deployment**

   - [x] Document API endpoints with Swagger/OpenAPI.
   - [ ] Create user guides for admins and event managers.
   - [ ] Prepare end-user FAQ for participation and referrals.
   - [ ] Set up deployment using Docker or similar tools.
   - [ ] Configure PostgreSQL and Redis cloud hosting.
   - [ ] Ensure production security settings are configured.

6. **Monitoring and Optimization**
   - [ ] Set up real-time monitoring for API performance and health.
   - [ ] Configure alerts for anomalies in response times or metrics.
   - [ ] Regularly optimize database and cache configurations.
