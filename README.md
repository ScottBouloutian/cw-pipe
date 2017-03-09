# cw-pipe
Node utility for piping stdin to CloudWatch Logs

## Motivation
I wanted a way to capture the output of an AppleScript in CloudWatch. While I could write the output to a file and then upload the file to CloudWatch, I decided to write this utility which would directly pipe the data from `stdin`. The data is piped in real time, however it batches ten lines at a time to cut down on the number of requests sent to CLoudWatch.

## Getting Started
Install the module
```
npm install -g cw-pipe
```
When piping to CloudWatch the string passed to `cw-pipe` will be prefixed to each log line
```
export LOG_GROUP_NAME="my-log-group"
export LOG_STREAM_NAME="my-log-stream"
ls | cw-pipe "stdout"
```
If you also want to pipe `stderr` the best solution I could find is to pipe to `stdout`, switch the file descriptors, and then pipe to `stderr`
```
export LOG_GROUP_NAME="my-log-group"
export LOG_STREAM_NAME="my-log-stream"
( ls | cw-pipe stdout ) 3>&1 1>&2 2>&3 | cw-pipe stderr
```
