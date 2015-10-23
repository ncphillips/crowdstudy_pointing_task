# Crowdstudy: Pointing Task

This is an Express React app that wraps a Pointing Task application
so that it can be used with [Crowdstudy](http://github.com/ncphillips/crowdstudy).

## Configuration

### Feedback Type

There are four types of comparison feedback data that can be given to the workers:

* None: The worker is only shown their own performance
* Real: Shows the average and elite worker's performance.
* Fake (Better): Makes the worker look _better_ than most people
* Fake (Worse): Makes the worker look _worse_ than most people.

Only one type of feedback can be used at a time. This can be changed by 
going into `./config.js` and changing the `config.feedback_type` variables.
This file also contains the array of accepted values.

### Generating Real Feedback
The current implementation for the Real feedback type only pulls data from 
workers who were given the `None` condition. This can be changed by altering
the `stats_query` object inside of `./config.js`.


