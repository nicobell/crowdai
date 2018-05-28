const Boom = require('boom');
const CronJob = require('cron').CronJob;
const moment = require('moment');

const qualityManager = require('./quality');
const taskManager = require('./task');
const stateManager = require('./state');
const delegates = require(__base + 'delegates');
const MTurk = require(__base + 'utils/mturk');
const config = require(__base + 'config');
const { JobStatus } = require(__base + 'utils/constants');
const { EventTypes } = require(__base + 'events/jobs');
const { emit } = require(__base + 'events/emitter');

/**
 * Returns a task for the worker.
 *
 * @param {string} uuid - The job's UUID
 * @param {string} turkId - The worker's Mechanical Turk ID.
 * @param {string} assignmentTurkId - The worker's assignment ID on Mechanical Turk.
 */
exports.nextTask = async (uuid, turkId, assignmentTurkId) => {
  try {
    const job = await delegates.jobs.getByUuid(uuid);
    let worker = await delegates.workers.getByTurkId(turkId);

    if (!worker) {
      worker = await delegates.workers.create(turkId);
    }
    let workerAssignment = await stateManager.getWorkerAssignmentStatus(
      job,
      worker,
      assignmentTurkId
    );

    if (workerAssignment.data.end) {
      return null;
    }
    let response = await taskManager.generateTasks(job, worker);

    if (response.items.length === 0) {
      return await stateManager.finishAssignment(job.uuid, worker.id);
    }
    const runQuiz = await qualityManager.shouldRunInitialTest(job, worker);

    if (runQuiz) {
      let task = await qualityManager.getTestForWorker(
        job,
        worker,
        response.criteria,
        true
      );
      task.workerSolvedMinTasks = false;
      return task;
    }
    const runHoneypot = await qualityManager.shouldRunHoneypot(job, worker);

    if (runHoneypot) {
      let task = await qualityManager.getTestForWorker(
        job,
        worker,
        response.criteria,
        false
      );
      task.workerSolvedMinTasks = await stateManager.checkWorkerSolvedMinTasks(
        job,
        worker
      );
      return task;
    }
    let task = await delegates.tasks.getTaskFromBuffer(job.id, worker.id);
    task.instructions = [];

    for (let c of task.data.criteria) {
      task.instructions.push(job.data.instructions[c.label]);
    }
    task.workerSolvedMinTasks = await stateManager.checkWorkerSolvedMinTasks(
      job,
      worker
    );
    return task;
  } catch (error) {
    console.error(error);

    if (error.isBoom) {
      throw error;
    }
    throw Boom.badImplementation(
      'Error while trying to generate next task for worker'
    );
  }
};

/**
 * Update task/test_task record with the worker's answer.
 *
 * @param {Object} payload - The answer payload. Format {workerTurkId: '', task: {...}}
 * @param {Boolean} isTest
 */
const saveAnswer = (exports.saveAnswer = async (payload, isTest) => {
  try {
    let worker = await delegates.workers.getByTurkId(payload.workerTurkId);

    if (isTest) {
      let testTask = await delegates.testTasks.getTestTaskById(payload.task.id);

      if (testTask.worker_id !== worker.id) {
        throw Boom.badRequest(
          'The worker is not associated with the task record'
        );
      }
      let answersMap = {};

      for (c of payload.task.data.criteria) {
        if (!c.workerAnswer) {
          throw Boom.badRequest('An answer is required');
        }
        answersMap[c.id] = c.workerAnswer;
      }

      for (c of testTask.data.criteria) {
        c.workerAnswer = answersMap[c.id];
      }
      testTask.data.answered = true;
      testTask.data.end = new Date();
      return await delegates.testTasks.updateTestTask(
        testTask.id,
        testTask.data
      );
    } else {
      let task = await delegates.tasks.getTaskById(payload.task.id);

      if (task.worker_id !== worker.id) {
        throw Boom.badRequest(
          'The worker is not associated with the task record'
        );
      }
      let answersMap = {};

      for (c of payload.task.data.criteria) {
        if (!c.workerAnswer) {
          throw Boom.badRequest('An answer is required');
        }
        answersMap[c.id] = c.workerAnswer;
      }

      for (c of task.data.criteria) {
        c.workerAnswer = answersMap[c.id];
      }
      task.data.answered = true;
      task.data.end = new Date();
      return await delegates.tasks.updateTask(task.id, task.data);
    }
  } catch (error) {
    console.error(error);

    if (error.isBoom) {
      throw error;
    }
    throw Boom.badImplementation("Error while trying to save worker's answer");
  }
});

/**
 * Computes the worker's reward based on their answers. If asBonus
 * is true, then we subtract job.data.taskRewardRule from the reward
 * so that we can pay the resulting amount to the worker as a bonus.
 *
 * @param {string} uuid - The job's UUID
 * @param {string} turkId - The worker's AMT ID
 * @param {boolean} asBonus
 */
const getWorkerReward = (exports.getWorkerReward = async (
  uuid,
  turkId,
  asBonus = false
) => {
  const job = await delegates.jobs.getByUuid(uuid);

  if (!job) {
    throw Boom.badRequest('Experiment with the given ID does not exist');
  }

  try {
    let worker = await delegates.workers.getByTurkId(turkId);

    if (!worker) {
      // worker record does not exist yet.
      return { reward: 0 };
    }
    const assignment = await delegates.workers.getAssignment(uuid, worker.id);
    const workerSolvedMinTask = await stateManager.checkWorkerSolvedMinTasks(
      job,
      worker
    );

    if (
      !assignment ||
      assignment.data.initialTestFailed ||
      (assignment.data.end && !workerSolvedMinTask)
    ) {
      return { reward: 0 };
    }

    const taskCount = await delegates.tasks.getWorkerTasksCount(
      job.id,
      worker.id
    );
    let testCount = await delegates.testTasks.getWorkerTestTasksCount(
      job.id,
      worker.id
    );

    if (assignment.data.honeypotFailed) {
      // we do not pay for failed honeypot.
      --testCount;
    }
    // the total amount that we pay to a worker is HIT reward + bonus. Therefore we
    // should subtract 1 in order to pay the worker using the reward + bonus strategy.
    const delta = asBonus ? -1 : 0;
    return {
      reward: (taskCount + testCount + delta) * job.data.taskRewardRule
    };
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while computing reward');
  }
});

/**
 * Publish the job on Amazon Mechanical Turk.
 *
 * @param {Number} id - The job ID.
 * @return {Object} - The job with new status.
 */
const publish = (exports.publish = async id => {
  try {
    let job = await delegates.jobs.getById(id);
    let requester = await delegates.requesters.getById(job.requester_id);
    // we fetch the instructions and save them.
    let instructions = await delegates.jobs.getInstructions(job);
    const maxAssignments = await computeMaxAssignments(job);
    const jobUrl = `${config.frontend.url}/#/welcome/${job.uuid}`;
    const mt = MTurk.getInstance(requester);
    let params = {
      Description: job.data.description,
      Reward: `${job.data.taskRewardRule}`,
      Title: job.data.name,
      MaxAssignments: maxAssignments,
      Question: `${MTurk.getExternalQuestionPayload(jobUrl)}`,
      RequesterAnnotation: job.data.name,
      LifetimeInSeconds: job.data.hitConfig.lifetimeInMinutes * 60,
      AssignmentDurationInSeconds:
        job.data.hitConfig.assignmentDurationInMinutes * 60
    };

    console.log(`Creating HIT on Amazon Mechanical Turk for job ${id}`);
    let hit = await new Promise((resolve, reject) => {
      mt.createHIT(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.HIT);
        }
      });
    });
    console.log(`HIT created. HITId: ${hit.HITId}`);
    job.data.status = JobStatus.PUBLISHED;
    job.data.start = new Date();
    job.data.hit = { ...hit };
    job.data.instructions = instructions;
    emit(EventTypes.START_CRON_FOR_HIT, job, hit.HITId, mt);
    return await delegates.jobs.update(id, job);
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to publish the job');
  }
});

/**
 * Makes sure the job stops, making unavailable to new workers. This changes
 * the status of the HIT to Reviewable.
 *
 * HITStatus changes as follows:
 *
 *  Assignable   -> Reviewable
 *  Unassignable -> Reviewable
 *
 * @param {Object} job
 */
const stop = (exports.stop = async job => {
  try {
    await expireHIT(job);
    await finishJob(job);
    console.debug(`Stopped job ${job.id}.`);
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to stop the job');
  }
});

/**
 * Returns the state of the job. This function returns:
 *
 *   - Information about the associated HIT.
 *   - The status of the job
 *   - The status of the task assignment box associated with the box (if available)
 *
 * @param {Number} jobId
 */
const getState = (exports.getState = async jobId => {
  try {
    let job = await delegates.jobs.getById(jobId);
    let state = {
      job: job.data.status,
      hit: null
    };

    if (job.data.hit) {
      let requester = await delegates.requesters.getById(job.requester_id);
      const mturk = MTurk.getInstance(requester);
      state.hit = await getHIT(job.data.hit.HITId, mturk);
    }
    state.taskAssignmentApi = await taskManager.getState(job);
    // TODO: return information about the workers.
    return state;
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation(
      'Error while trying to get the state of the job'
    );
  }
});

/**
 * Helper wrapper to call the getHIT method on AMT.
 *
 * @param {String} hitId
 * @param {Object} mturk
 */
const getHIT = (exports.getHIT = async (hitId, mturk) => {
  return new Promise((resolve, reject) => {
    mturk.getHIT({ HITId: hitId }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.HIT);
      }
    });
  });
});

/**
 * Approves or rejects the submitted assignments for a HIT.
 *
 * @param {string} job
 * @param {Object} hit
 * @param {Object} mturk
 */
const reviewAssignments = (exports.reviewAssignments = async (
  job,
  hit,
  mturk
) => {
  const jobId = job.id;
  console.log(`Review assignments for job: ${jobId}`);

  try {
    const assignments = await delegates.jobs.getAssignments(jobId);

    if (
      !assignments ||
      assignments.rows.length === 0 ||
      hit.HITStatus === 'Unassignable'
    ) {
      console.debug(`Skipping assignments review for job: ${jobId}`);
      return false;
    }
    // We check if the job is actually done.
    const workerTmp = { id: assignments.rows[0].worker_id };
    const jobDone = await checkJobDone(job, workerTmp);

    if (hit.HITStatus === 'Assignable') {
      if (jobDone) {
        console.debug(`Job: ${job.id} is done.`);
        await expireHIT(job);
      }
      return false;
    }

    if (
      hit.HITStatus === 'Reviewable' &&
      job.data.hitConfig.maxAssignments === 0 &&
      !jobDone
    ) {
      console.debug(
        `Job: ${job.id} is not done yet. Adding more Assignments for HIT ${
          hit.HITId
        }`
      );
      await createAdditionalAssignmentsForHIT(job, hit, mturk);
      return false;
    }

    for (assignment of assignments.rows) {
      console.log(`Reviewing assignment: ${assignment.data.assignmentTurkId}`);

      if (
        !assignment.data.finished ||
        assignment.data.initialTestFailed ||
        (assignment.data.assignmentApproved &&
          assignment.data.assignmentBonusSent)
      ) {
        continue;
      }

      if (assignment.data.finishedWithError) {
        // if an error ocurred and the worker did not finish initial quiz
        // we just skip it.
        let quizPending = await qualityManager.shouldRunInitialTest(job, {
          id: assignment.worker_id
        });

        if (quizPending) {
          continue;
        }
      }

      if (!assignment.data.initialTestFailed) {
        try {
          await mturkApproveAssignment(assignment.data.assignmentTurkId, mturk);
          await delegates.workers.updateAssignment(
            job.uuid,
            assignment.worker_id,
            {
              assignmentApproved: true
            }
          );
        } catch (error) {
          console.error('Approve assignment failed.', error);
          return;
        }

        try {
          await sendBonus(
            job,
            assignment.worker_id,
            assignment.data.assignmentTurkId,
            mturk
          );
          await delegates.workers.updateAssignment(
            job.uuid,
            assignment.worker_id,
            {
              assignmentBonusSent: true
            }
          );
        } catch (error) {
          console.error('sendBonus failed.', error);
          return;
        }
      }
    }
    console.log(`Review assignments for job: ${jobId} done`);
    await finishJob(job);
    return true;
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation(
      'Error while trying to review the assignments'
    );
  }
});

/**
 * Creates additional assignments for the HIT.
 *
 * HITStatus changes as follows:
 *
 *  Unassignable -> Assignable
 *  Reviewable   -> Assignable
 *
 * In the HIT is already in Reviewable state, then we need to update the
 * expiration time to make it Assignable again.
 *
 * @param {Object} job
 * @param {Object} hit
 * @param {Object} mturk - Mechanical Turk instance
 */
const createAdditionalAssignmentsForHIT = (exports.createAdditionalAssignmentsForHIT = async (
  job,
  hit,
  mturk
) => {
  const records = await delegates.jobs.getAssignmentsFinishedByWorkers(job.id);
  let params = {
    HITId: hit.HITId,
    NumberOfAdditionalAssignments: records.meta.count
  };
  await new Promise((resolve, reject) => {
    mturk.createAdditionalAssignmentsForHIT(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.debug(
          `Added ${records.meta.count} assignments to HIT: ${hit.HITId}`
        );
        resolve(data);
      }
    });
  });
  let expiration = moment(hit.Expiration, 'YYYY-MM-DDTHH:mm:ss.S Z');
  let now = moment();

  if (hit.HITStatus === 'Reviewable' && expiration.isBefore(now)) {
    console.debug(
      `HIT ${hit.HITId} is Reviewable and has expired. Changing the expiration 
      to make it Assignable again.`
    );
    let expireAt = moment()
      .add(job.data.lifetimeInMinutes, 'm')
      .unix();
    await updateExpirationForHIT(hit.HITId, expireAt, mturk);
  }
});

/**
 * Wrapper for Mechanical Turk approveAssignment operation.
 * @param {string} id - The assignment's AMT ID
 * @param {Object} mturk
 */
const mturkApproveAssignment = (exports.mturkApproveAssignment = async (
  id,
  mturk
) => {
  console.log(`Approving assignment ${id}...`);
  return await new Promise((resolve, reject) => {
    mturk.approveAssignment({ AssignmentId: id }, function(err, data) {
      if (err) {
        reject(err);
      } else {
        console.log(
          `Approve assignment done. Response for ${id} is: ${JSON.stringify(
            data
          )}`
        );
        resolve(data);
      }
    });
  });
});

/**
 * Wrapper for Mechanical Turk rejectAssignment operation.
 * @param {string} id - The assignment's AMT ID
 * @param {Object} mturk
 */
const mturkRejectAssignment = (exports.mturkRejectAssignment = async (
  id,
  mturk
) => {
  console.log(`Rejecting assignment ${id}...`);
  const payload = {
    AssignmentId: id,
    RequesterFeedback:
      'Thank you for participating, but you failed to pass the qualification test.'
  };
  return await new Promise((resolve, reject) => {
    mturk.rejectAssignment(payload, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(
          `Reject assignment response for ${id} is: ${JSON.stringify(data)}`
        );
        resolve(data);
      }
    });
  });
});

/**
 * Wrapper for Mechanical Turk sendBonus operation. Here we pay
 * the worker based on the number of answers given.
 *
 * @param {Object} job - The job.
 * @param {string} workerId - The worker's ID.
 * @param {string} assignmentId - The assignment's AMT ID
 * @param {Object} mturk
 */
const sendBonus = (exports.sendBonus = async (
  job,
  workerId,
  assignmentId,
  mturk
) => {
  console.log(`Sending bonus assignment ${assignmentId}...`);
  const worker = await delegates.workers.getById(workerId);
  const { reward } = await getWorkerReward(job.uuid, worker.turk_id, true);
  const bonusAmount = reward.toFixed(2);
  const payload = {
    AssignmentId: assignmentId,
    BonusAmount: bonusAmount,
    Reason: `Reward based on the answers given in "${job.data.hit.Title}"`,
    WorkerId: worker.turk_id
  };
  return await new Promise((resolve, reject) => {
    mturk.sendBonus(payload, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.log(
          `Bonus sent. Response for ${assignmentId} is: ${JSON.stringify(data)}`
        );
        resolve(data);
      }
    });
  });
});

/**
 * Helper function to expire a HIT.
 *
 * @param {Object} job
 */
const expireHIT = (exports.expireHIT = async job => {
  console.debug(`Expiring HIT: ${job.data.hit.HITId}.`);
  let requester = await delegates.requesters.getById(job.requester_id);
  const mturk = MTurk.getInstance(requester);
  await updateExpirationForHIT(job.data.hit.HITId, 0, mturk);
});

/**
 * Updates the expiration for a HIT.
 *
 * @param {String} hitId
 * @param {Number} expireAt - timestamp or 0 (meaning expire immediately)
 * @param {Object} mturk
 */
const updateExpirationForHIT = (exports.updateExpirationForHIT = async (
  hitId,
  expireAt,
  mturk
) => {
  let params = {
    ExpireAt: expireAt,
    HITId: hitId
  };
  await new Promise((resolve, reject) => {
    mturk.updateExpirationForHIT(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        console.debug(`Expiration for HIT: ${hitId} updated`);
        resolve(data);
      }
    });
  });
});

/**
 * Check if the job is actually done by calling the task assignment API.
 *
 * @param {Object} job
 * @param {Object} worker
 * @return {Boolean} true if the job is done, false otherwise.
 */
const checkJobDone = async (job, worker) => {
  let response = await taskManager.getTasksFromApi(job, worker);
  return response.done;
};

/**
 * Changes the job's status to DONE.
 *
 * @param {Object} job
 */
const finishJob = async job => {
  job.data.status = JobStatus.DONE;
  job.data.end = new Date();
  return await delegates.jobs.update(job.id, job);
};

/**
 * Computes the max number of assignments (max number of workers) based on the
 * parameters configuration.
 *
 * @param {Object} job
 * @return {Number}
 */
const computeMaxAssignments = async job => {
  if (job.data.hitConfig.maxAssignments > 0) {
    return job.data.hitConfig.maxAssignments;
  }
  const itemsCount = await delegates.projects.getItemsCount(job.project_id);
  const criteriaCount = await delegates.projects.getCriteriaCount(
    job.project_id
  );
  const totalCount = itemsCount * criteriaCount * job.data.votesPerTaskRule;
  let maxAssignments = Math.ceil(totalCount / job.data.maxTasksRule);

  if (maxAssignments < 10) {
    console.warn(
      `Job ${job.id}. Max assignments: ${maxAssignments}. The job manager 
      would be able to create additional assignments up to 9 assignments in total.
      See: https://docs.aws.amazon.com/AWSMechTurk/latest/AWSMturkAPI/ApiReference_CreateAdditionalAssignmentsForHITOperation.html`
    );
  }
  return maxAssignments;
};
