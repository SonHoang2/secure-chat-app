export default () => ({
    redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        ttl: 30 * 60,
    },
});
