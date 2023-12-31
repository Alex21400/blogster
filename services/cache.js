const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/ci');

const redisURL = keys.redisUrl;
const client = redis.createClient(redisURL);
client.hget = util.promisify(client.hget);

client.on('connect', function(){
    console.log('Connected to Redis');
});

client.on("error", function (err) {
    console.log("Error " + err);
});

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
    this.useCache = true;
    this.hashKey = JSON.stringify(options.key || '');

    return this;
}

mongoose.Query.prototype.exec = async function() {
  
    // If there is no need for caching just run the query
    if(!this.useCache) {
        return exec.apply(this, arguments);
    }

    const key = JSON.stringify(
        Object.assign({}, this.getQuery(), {
            collection: this.mongooseCollection.name
        })
    );

    // Check if cached value is present
    const cachedValue = await client.hget(this.hashKey, key);

    if(cachedValue) {
        doc = JSON.parse(cachedValue);
        console.log('Pulling from redis');

        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
    }

    // If cached value is not present execute and set key
    const result = await exec.apply(this, arguments);
    
    client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);

    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
  }