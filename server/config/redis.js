const Redis = require('ioredis');

const redis = new Redis({
  port: 18865,
  host: "redis-18865.c334.asia-southeast2-1.gce.redns.redis-cloud.com",
  username: "default",
  password: "nOlqvDvjeOFtypL3FLmJRIZf2WuCfDkx"
});

module.exports = redis