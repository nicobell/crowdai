const couchbase = require('couchbase');
const config = require(__base + 'config/config.json');

const cluster = new couchbase.Cluster(`couchbase://${config.db.host}`);
cluster.authenticate(config.db.user, config.db.password);
const bucket = cluster.openBucket(config.db.bucket);

const DOCUMENTS = {
  Task: 'Task::',
  Answer: 'Answer::',
  WorkerAssignment: 'WorkerAssignment::',
  TestTask: 'TestTask::'
};

const TYPES = {
  task: 'task',
  answer: 'answer',
  assignment: 'assignment',
  test: 'test'
};

module.exports = {
  DOCUMENTS,
  TYPES,
  bucket
};
