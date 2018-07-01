import {Observable} from 'rxjs';
import {combineEpics} from 'redux-observable';

import {actionTypes, actions} from './actions';
import {requestersApi} from 'src/utils/axios';
import {flattenError} from 'src/utils';
import {reportingApi} from 'src/utils/axios';

const getTaskTime = (action$, store) =>
  action$.ofType(actionTypes.FETCH_TTIME).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getAllTasksTimesByJob/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchTaskTimeSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchTaskTimeError(flattenError(error))));
});
const fetchTaskTime = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(
      () => requestersApi.get(`getAllTasksTimesByJob/`+action.jobId))
    .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
    .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

/*const getWorkerTimes = (action$, store) =>
  action$.ofType(actionTypes.FETCH_WTIME).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getWorkerTimes/'+action.jobId+'/'+action.workerId))
      .mergeMap(response => Observable.of(actions.fetchWorkerTimesSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchWorkerTimesError(flattenError(error))));
});
const fetchWorkerTimes = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`getWorkerTimes/`+action.jobId+'/'+action.workerId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});*/

/*const getAnswers = (action$, store) =>
  action$.ofType(actionTypes.FETCH_WANSWERS).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getWorkerAnswers/'+action.jobId+'/'+action.workerId))
      .mergeMap(response => Observable.of(actions.fetchAnswersSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchAnswersError(flattenError(error))));
});
const fetchAnswers = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`getWorkerAnswers/`+action.jobId+'/'+action.workerId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});*/

const getTasksAgreements = (action$, store) =>
  action$.ofType(actionTypes.FETCH_AGREEMENTS).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getTasksAgreements/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchTasksAgreementsSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchTasksAgreementsError(flattenError(error))));
});
const fetchTasksAgreements = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`getTasksAgreements/`+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

/*const getWorkersAgreements = (action$, store) =>
  action$.ofType(actionTypes.FETCH_WAGREES).switchMap(action => {
  return Observable.defer(() => requestersApi.get('getWorkersAgreements/'+action.jobId))
    .mergeMap(response => Observable.of(actions.fetchWorkersAgreementsSuccess(response.data)))
    .catch(error => Observable.of(actions.fetchWorkersAgreementsError(flattenError(error))));
});
const fetchWorkersAgreements = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getWorkersAgreements/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});*/

/*const getMetric = (action$, store) =>
  action$.ofType(actionTypes.FETCH_METRIC).switchMap(action => {
    return Observable.defer(() => reportingApi.get(action.metric))
      .mergeMap(response => Observable.of(actions.fetchMetricSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchMetricError(flattenError(error))));
});

const fetchMetric = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => reportingApi.get(action.metric))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});*/

const getCrowdGolds = (action$, store) =>
  action$.ofType(actionTypes.FETCH_CROWDGOLDS).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getCrowdGolds/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchCrowdGoldsSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchCrowdGoldsError(flattenError(error))));
});

const fetchCrowdGolds = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getCrowdGolds/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getWorkers = (action$, store) =>
  action$.ofType(actionTypes.FETCH_WORKERS).switchMap(action => {
    return Observable.defer(() => requestersApi.get('getWorkersByJob/'+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchWorkersSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchWorkersError(flattenError(error))));
});
const fetchWorkers = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`getWorkersByJob/`+action.jobId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getWorkersPairs = (action$, store) =>
  action$.ofType(actionTypes.FETCH_PAIRS).switchMap(action => {
    return Observable.defer(() => requestersApi.get('ww/job/'+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchWorkersPairsSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchWorkersPairsError(flattenError(error))));
});
const fetchWorkersPairs = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`ww/job/`+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getSingleWorker = (action$, store) =>
  action$.ofType(actionTypes.FETCH_SINGLE).switchMap(action => {
    return Observable.defer(() => requestersApi.get('worker/'+action.workerId+'/job/'+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchSingleWorkerSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchSingleWorkerError(flattenError(error))));
});
const fetchSingleWorker = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get('worker/'+action.workerId+'/job/'+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getContribution = (action$, store) =>
  action$.ofType(actionTypes.FETCH_CONTRIBUTION).switchMap(action => {
    return Observable.defer(() => requestersApi.get('worker/job/'+action.jobId+'/contribution'))
      .mergeMap(response => Observable.of(actions.fetchContributionSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchContributionError(flattenError(error))));
});
const fetchContribution = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`worker/job/`+action.jobId+'/contribution'))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getJobStats = (action$, store) =>
  action$.ofType(actionTypes.FETCH_GLOBAL).switchMap(action => {
    return Observable.defer(() => requestersApi.get('global/job/'+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchJobStatsSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchJobStatsError(flattenError(error))));
});
const fetchJobStats = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get(`global/job/`+action.jobId+'/stats'))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

const getWorkersFilter = (action$, store) =>
  action$.ofType(actionTypes.FETCH_WFILTER).switchMap(action => {
    return Observable.defer(() => requestersApi.get('filterWorkers/'+action.jobId+'/item/'+action.itemId))
      .mergeMap(response => Observable.of(actions.fetchWorkersFilterSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchWorkersFilterError(flattenError(error))));
});
const fetchWorkersFilter = (action$, store) =>
  action$.ofType(actionTypes.FETCH_ITEM).switchMap(action => {
    return Observable.defer(() => requestersApi.get('filterWorkers/'+action.jobId+'/item/'+action.itemId))
      .mergeMap(response => Observable.of(actions.fetchItemSuccess(response.data)))
      .catch(error => Observable.of(actions.fetchItemError(flattenError(error))));
});

export default combineEpics(getTaskTime, fetchTaskTime,
                            getWorkers, fetchWorkers, 
                            //getWorkerTimes, fetchWorkerTimes, 
                            //getAnswers, fetchAnswers,
                            getWorkers, fetchWorkers,
                            getTasksAgreements, fetchTasksAgreements,
                            //getWorkersAgreements, fetchWorkersAgreements,
                            //getMetric, fetchMetric,
                            getCrowdGolds, fetchCrowdGolds,
                            getWorkersPairs, fetchWorkersPairs,
                            getSingleWorker, fetchSingleWorker,
                            getContribution, fetchContribution,
                            getJobStats, fetchJobStats,
                            getWorkersFilter, fetchWorkersFilter
                          );