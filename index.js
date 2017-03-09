#!/usr/bin/env node

const aws = require('aws-sdk');
const highland = require('highland');
const Promise = require('bluebird');

const logs = new aws.CloudWatchLogs({ region: 'us-east-1' });
const putLogEvents = Promise.promisify(logs.putLogEvents, { context: logs });
const describeLogStreams = Promise.promisify(logs.describeLogStreams, { context: logs });

const groupName = process.env.LOG_GROUP_NAME;
const streamName = process.env.LOG_STREAM_NAME;
const prefix = process.argv[2];
const inputStream = highland(process.stdin);
const batchSize = 10;

module.exports = () => (
    describeLogStreams({ logGroupName: groupName }).then(({ logStreams }) => {
        const logStream = logStreams.find(({ logStreamName }) => (logStreamName === streamName));
        return logStream.uploadSequenceToken;
    }).then(token => {
        const promise = Promise.resolve(token);
        inputStream.split().filter(message => (message.length > 0)).map(message => ({
            message: `${prefix}: ${message}`,
            timestamp: Date.now(),
        })).batch(batchSize).each(logEvents => {
            promise.then(token => (
                putLogEvents({
                    logEvents,
                    logGroupName: groupName,
                    logStreamName: streamName,
                    sequenceToken: token
                })
            )).then(({ nextSequenceToken }) => nextSequenceToken);
        });
    })
);
