const Boom = require('boom');
const couchbase = require('couchbase');

const bucket = require(__base + 'db').bucket;
const config = require(__base + 'config');
const { DOCUMENTS, TYPES } = require(__base + 'db');

const getRequesterById = (exports.getRequesterById = async requesterId => {
  try {
    return await new Promise((resolve, reject) => {
      bucket.get(`${DOCUMENTS.Requester}${requesterId}`, (err, data) => {
        if (err) {
          if (err.code === couchbase.errors.keyNotFound) {
            resolve(null);
          } else {
            reject(err);
          }
        } else {
          resolve(data.value);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation(
      'Error while trying to fetch requester information'
    );
  }
});

const create = (exports.create = async requester => {
  try {
    const key = `${DOCUMENTS.Requester}${requester.id}`;
    requester.type = TYPES.requester;
    return await new Promise((resolve, reject) => {
      bucket.insert(key, requester, (error, result) => {
        if (error) {
          console.error(
            `Error while inserting document ${key}. Error: ${error}`
          );
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to persist requester');
  }
});

const update = (exports.update = async requester => {
  try {
    const key = `${DOCUMENTS.Requester}${requester.id}`;
    return await new Promise((resolve, reject) => {
      bucket.upsert(key, requester, (error, result) => {
        if (error) {
          console.error(
            `Error while inserting document ${key}. Error: ${error}`
          );
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  } catch (error) {
    console.error(error);
    throw Boom.badImplementation('Error while trying to update requester');
  }
});