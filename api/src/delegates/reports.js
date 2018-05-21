const Boom = require('boom');
const db = require(__base + 'db');

const getAllTasksTimesByJob = (exports.getAllTasksTimesByJob = async id => {
  try {
    let res = await db.query(`
  SELECT times_table.item_id,
      times_table.criteria_id,
      AVG (
        ( EXTRACT ( EPOCH FROM times_table.time_end ) * 1000 - 
          EXTRACT ( EPOCH FROM times_table.time_start ) * 1000 )
        ) AS avgtime_ms 
  FROM
    ( SELECT item_id,
        (data->'criteria')::json#>>'{0,id}' AS criteria_id,
        (data->>'end')::TIMESTAMP WITHOUT TIME ZONE AS time_end,
        (data->>'start')::TIMESTAMP WITHOUT TIME ZONE AS time_start 
      FROM ${db.TABLES.Task_7500}
      WHERE job_id=$1
    ) AS times_table 
  GROUP BY
    times_table.item_id,
    times_table.criteria_id 
  ORDER BY
    times_table.item_id,
    times_table.criteria_id`, [id]);
    return tasks = { tasks: res.rows };
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch the record');
  }
});

const getWorkersByJob = (exports.getWorkersByJob = async id => {
  try {
    let res = await db.query(
    `select distinct t.worker_id, w.turk_id
    from ${db.TABLES.Task_7500} t join ${db.TABLES.Worker} w on t.worker_id=w.id
    where t.job_id=$1
    order by t.worker_id`, [id]);
    return workers = { workers: res.rows };
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch record');
  }
});

const getWorkerTimes = (exports.getWorkerTimes = async (jobId, workerId) => {
  try {
    let res = await db.query(`
  SELECT times_table.item_id,
      times_table.criteria_id,
      AVG (
        ( EXTRACT ( EPOCH FROM times_table.time_end ) * 1000 - 
          EXTRACT ( EPOCH FROM times_table.time_start ) * 1000 )
        ) AS avgtime_ms 
  FROM
    ( SELECT item_id,
        (data->'criteria')::json#>>'{0,id}' AS criteria_id,
        (data->>'end')::TIMESTAMP WITHOUT TIME ZONE AS time_end,
        (data->>'start')::TIMESTAMP WITHOUT TIME ZONE AS time_start 
      FROM ${db.TABLES.Task_7500}
      WHERE job_id=$1 and worker_id=$2
    ) AS times_table 
  GROUP BY
    times_table.item_id,
    times_table.criteria_id 
  ORDER BY
    times_table.item_id,
    times_table.criteria_id`, [jobId,workerId]);
    return tasks = { tasks: res.rows };
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch the record');
  }
});

const getWorkerAnswers = (exports.getWorkerAnswers = async (jobId,workerId) => {
  try {
    let res = await db.query(
      `select id, item_id, (data->'criteria')::json#>>'{0,id}' as criteria_id, (data->'criteria')::json#>>'{0,workerAnswer}' as answer
    from ${db.TABLES.Task_7500} 
    where worker_id=$2 and job_id=$1`,
      [jobId,workerId]);
    return (tasks = { tasks: res.rows });
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch record');
  }
});

const getTasksAgreements = (exports.getTasksAgreements = async id => {
  try {
    let res = await db.query(
    `SELECT item_id,(data->'criteria')::json#>>'{0,id}' AS criteria_id,
      COUNT( CASE (data->'criteria')::json#>>'{0,workerAnswer}' WHEN 'yes' THEN 1 ELSE null END) AS c1,
      COUNT( CASE (data->'criteria')::json#>>'{0,workerAnswer}' WHEN 'no' THEN 1 ELSE null END) AS c2,
      COUNT( CASE (data->'criteria')::json#>>'{0,workerAnswer}' WHEN 'not clear' THEN 1 ELSE null END) AS c3
    FROM ${db.TABLES.Task_7500}
    WHERE job_id=$1
    GROUP BY item_id,(data->'criteria')::json#>>'{0,id}'
    ORDER BY item_id,(data->'criteria')::json#>>'{0,id}'`,
      [id]);
    return tasks = { tasks: res.rows }
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch record');
  }
});

const getWorkersAgreements = (exports.getWorkersAgreements = async (jobId, itemId, criteriaId) => {
  try {
    let res = await db.query(`
      SELECT item_id,(data->'criteria')::json#>>'{0,id}' AS criteria_id,worker_id,(data->'criteria')::json#>>'{0,workerAnswer}' AS answer
      FROM ${db.TABLES.Task_7500}
      WHERE job_id=$1 AND item_id=$2 AND (data->'criteria')::json#>>'{0,id}'=$3
      
    `, [jobId,itemId,criteriaId])
    return tasks = { tasks: res.rows }
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to fetch record');
  }
});
