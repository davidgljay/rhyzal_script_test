// const redis = require('redis');

// const client = redis.createClient();

// client.on('error', (err) => {
//     console.error('Redis error:', err);
// });

const set_user_status = (userId, status) => {
    return new Promise((resolve, reject) => {
        client.set(`user:${userId}:status`, status, (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(reply);
        });
    });
};

module.exports = {
    // client,
    set_user_status
};