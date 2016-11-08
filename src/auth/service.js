import {action, getLogger, ResourceError, errorPayload} from '../core/utils';
import {getToken} from './resources';

const log = getLogger('auth/service');

const AUTH_STARTED = 'auth/started';
const AUTH_SUCCEEDED = 'auth/succeeded';
const AUTH_FAILED = 'auth/failed';

export const login = (user) => async(dispatch,getState) => {
  log(`login...`);
  try {
    dispatch(action(AUTH_STARTED));
    let token = await getToken(user());
    log(`login succeeded`);
    dispatch(action(AUTH_SUCCEEDED,{token}));
  } catch (err) {
    log(`login failed`);
    dispatch(action(AUTH_FAILED,errorPayload(err)));
  }
};

export const authReducer = (state = {token = null, isLoading = false},action) => {
  switch (action.type) {
    case AUTH_STARTED:
      return {token:null, isLoading:true};
    case AUTH_SUCCEEDED:
      return {token:action.payload.token,isLoading:false};
    case AUTH_FAILED:
      return {issue:action.payload.issue,isLoading:false};
    default:
      return state;
  }
}
