import {combineReducers} from 'redux';
//import {getReducer} from 'src/utils/form';
//import {scopes, FileFormats} from 'src/utils/constants';
import {actionTypes} from './actions';

const defaultState = {
  reports: {
    tasks: []
  },
  error: undefined,
  loading: false
};

const worker_defaultState = {
  workers: {
    workers: []
  },
  error: undefined,
  loading: false
};

const chart_reducer = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.FETCH_TTIME:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_TTIME_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false
      };
    case actionTypes.FETCH_TTIME_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };

    /*case actionTypes.FETCH_WTIME:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_WTIME_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false
      };
    case actionTypes.FETCH_WTIME_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };*/

    /*case actionTypes.FETCH_WANSWERS:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_WANSWERS_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false
      };
    case actionTypes.FETCH_WANSWERS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };*/

    case actionTypes.FETCH_AGREEMENTS:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_AGREEMENTS_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false
      };
    case actionTypes.FETCH_AGREEMENTS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    
    /*case actionTypes.FETCH_WAGREES:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_WAGREES_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false
      };
    case actionTypes.FETCH_WAGREES_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };*/
    /*case actionTypes.FETCH_METRIC:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_METRIC_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_METRIC_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };*/
    case actionTypes.FETCH_CROWDGOLDS:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_CROWDGOLDS_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_CROWDGOLDS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case actionTypes.FETCH_PAIRS:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_PAIRS_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_PAIRS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case actionTypes.FETCH_CONTRIBUTION:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_CONTRIBUTION_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_CONTRIBUTION_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case actionTypes.FETCH_GLOBAL:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_GLOBAL_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_GLOBAL_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    case actionTypes.FETCH_SINGLE:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_SINGLE_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_SINGLE_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    default:
      return state;
  }
};

/*const single_reducer = (state = defaultState, action) => {
  switch(action.type) {
    case actionTypes.FETCH_SINGLE:
      return {
        ...state,
        error: undefined,
        loading: true,
      };
    case actionTypes.FETCH_SINGLE_SUCCESS:
      return {
        ...state,
        reports: action.response,
        loading: false,
      };
    case actionTypes.FETCH_SINGLE_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false,
      };
    default:
      return state;
  }
}*/

const worker_reducer = (state = worker_defaultState, action) => {
  switch(action.type) {
    case actionTypes.FETCH_WORKERS:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_WORKERS_SUCCESS:
      return {
        ...state,
        workers: action.response,
        loading: false
      };
    case actionTypes.FETCH_WORKERS_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    case actionTypes.FETCH_WFILTER:
      return {
        ...state,
        error: undefined,
        loading: true
      };
    case actionTypes.FETCH_WFILTER_SUCCESS:
      return {
        ...state,
        workers: action.response,
        loading: false
      };
    case actionTypes.FETCH_WFILTER_ERROR:
      return {
        ...state,
        error: action.error,
        loading: false
      };
    default:
      return state;
  }
};

export default combineReducers({
  list: chart_reducer,
  wlist: worker_reducer,
  //single_list: single_reducer,
});
