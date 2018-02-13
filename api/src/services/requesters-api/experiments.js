const Boom = require('boom');

const delegates = require(__base + 'delegates');

const getRequesterExperiments = async ctx => {
  // we use sub as requester primary key. Since is the userId inside Google API
  const { sub } = ctx.state.loginInfo;
  const loginInfo = ctx.state.loginInfo;
  let requester = await delegates.requesters.getRequesterById(sub);

  if (!requester) {
    throw Boom.badRequest('Requester account has not been initialized');
  }
  ctx.response.body = { experiments: [] };
};

exports.register = router => {
  router.get('/experiments', getRequesterExperiments);
};