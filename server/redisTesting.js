const redis = require('./config/redis')

redis.ping().then(pong => {
  console.log('Redis Ping Response:', pong);
}).catch(error => {
  console.error('Failed to ping Redis:', error);
}).finally(() => {
  redis.quit(() => {
    console.log('Redis connection closed.');
  });
});