const Boom = require('boom');
const db = require(__base + 'db');

// Database query function
// const getAllTasksByJobId = (exports.getAllTasksByJobId = async id => {
//   try {
//     let res = await db.query(
//       `select * from ${db.TABLES.Task} where experiment_id = $1`,
//       [id]
//     );
//     return res.rows;
//   } catch (error) {
//     console.error(error);
//     throw Boom.badImplementation('Error while trying to fetch the record');
//   }
// });

//test function
const getAllTasksByJobId = (exports.getAllTasksByJobId = async id => {
  switch (parseInt(id, 10)) {
    case 1:
      return (tasks = {
        tasks: {
          task1: { total_time: 2.21, task_id: 1 },
          task2: { total_time: 3.45, task_id: 3 },
          task3: { total_time: 4.65, task_id: 7 },
          task4: { total_time: 5.6, task_id: 2 },
          task5: { total_time: 9.6, task_id: 5 },
          task6: { total_time: 8.6, task_id: 9 },
          task7: { total_time: 2.6, task_id: 11 },
          task8: { total_time: 3.6, task_id: 32 },
          task9: { total_time: 4.6, task_id: 27 },
          task10: { total_time: 8.6, task_id: 21 },
          task11: { total_time: 7.6, task_id: 22 }
        }
      });
      break;
    case 2:
      return (tasks = {
        tasks: {
          task1: { total_time: 16.21, task_id: 1 },
          task2: { total_time: 54.45, task_id: 3 },
          task3: { total_time: 21.65, task_id: 7 },
          task4: { total_time: 43.6, task_id: 2 },
          task5: { total_time: 12.6, task_id: 5 },
          task6: { total_time: 32.6, task_id: 9 },
          task7: { total_time: 12.6, task_id: 11 },
          task8: { total_time: 43.6, task_id: 32 },
          task9: { total_time: 22.6, task_id: 27 },
          task10: { total_time: 54.6, task_id: 21 },
          task11: { total_time: 43.6, task_id: 22 }
        }
      });
      break;
    default:
      console.error('Error while trying to fetch the record');
      throw Boom.badImplementation('Error while trying to fetch the record');
  }
});
