### Setup and Configuration

1. **Initial Setup**

   - [x] Initialize a Node.js project with Fastify.
   - [x] Set up PostgreSQL database and configure the connection.
   - [ ] Set up Redis for caching and real-time ranking.
   - [ ] Set up Swagger/OpenAPI for API documentation.
   - [ ] Implement a logging and monitoring setup using a platform like Sentry or Datadog.

2. **Security and Performance**

   - [x] Implement JWT authentication for admin routes.
   - [ ] Add middleware for rate limiting to prevent abuse.
   - [ ] Secure all endpoints against SQL injection.
   - [ ] Ensure API response times are under 200ms for critical endpoints.

3. **Testing and Maintenance**
   - [ ] Write unit and integration tests to cover at least 90% of the codebase.
   - [ ] Set up continuous integration to run tests and check coverage.
   - [ ] Document the setup and basic maintenance procedures.

### Core Features

1. **Event Subscription**

   - [x] Create an endpoint for users to subscribe using their name and email.
   - [x] Implement checks to prevent duplicate email registration.
   - [x] Ensure subscriptions are only allowed within the event start and end dates.

2. **Referral Link Generation**

   - [x] Develop a system to generate unique referral links for each subscriber.
   - [x] Store these links in the database associated with the user’s account.

3. **Referral Tracking and Metrics**

   - [x] Track the number of subscriptions made through each referral link.
   - [x] Calculate and store the conversion rate for each user.
   - [x] Implement hierarchical tracking of direct and indirect referrals.

4. **Ranking and Insights**

   - [ ] Develop an endpoint to display referral rankings, utilizing Redis for fast retrieval.
   - [ ] Allow filtering of rankings on a daily basis during the event.
   - [ ] Implement a cache system to optimize the retrieval of these rankings.

5. **Admin Features**
   - [ ] Develop admin-only endpoints for monitoring and managing the event.
   - [ ] Provide admins with the ability to view detailed metrics and logs.

### Documentation and Deployment

1. **Documentation**

   - [ ] Document all API endpoints using Swagger/OpenAPI.
   - [ ] Create user guides for system administrators and event managers.
   - [ ] Prepare an end-user FAQ section regarding how to participate, generate referrals, and check rankings.

2. **Deployment**

   - [ ] Set up a deployment process using Docker or a similar container tool.
   - [ ] Configure cloud-based services for hosting PostgreSQL and Redis.
   - [ ] Ensure proper security settings in the production environment.

3. **Monitoring and Optimization**
   - [ ] Configure real-time monitoring for API performance and system health.
   - [ ] Set up alerts for any anomalies in response times or system metrics.
   - [ ] Regularly review and optimize the database and cache configurations based on usage patterns.
