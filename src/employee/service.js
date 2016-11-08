import {action,getLogger,errorPayload} from '../core/utils';
import {search,save} from './resource';

const log = getLogger('employee/service');

const SAVE_EMPLOYEE_STARTED = 'employee/saveStarted';
const SAVE_EMPLOYEE_SUCCEEDED = 'employee/saveSucceeded';
const SAVE_EMPLOYEE_FAILED = 'employee/saveFailed';
const CANCEL_SAVE_EMPLOYEE = 'employee/cancelSave';

const LOAD_EMPLOYEE_STARTED = 'employee/loadStarted';
const LOAD_EMPLOYEE_SUCCEEDED = 'employee/loadSucceeded';
const LOAD_EMPLOYEE_FAILED = 'employee/loadFailed';
const CANCEL_LOAD_EMPLOYEE = 'employee/cancelLoad';

export const loadEmployees = () => async(dispatch,getState) => {
  log(`loadEmployees...`);
  const state = getState();
  const employeeState = state.employee;
  try {
    dispatch(action(LOAD_EMPLOYEE_STARTED));
    const employees = await search(state.auth.token);
    log('loadEmployees succeeded');
    if(!employeeState.isLoadingCancelled) {
      dispatch(action(LOAD_EMPLOYEE_SUCCEEDED, employees));
    }
  } catch (err) {
    log(`loadEmployees failed`);
    if(!employeeState.isLoadingCancelled){
      dispatch(action(LOAD_EMPLOYEE_FAILED, errorPayload(err)));
    }
  }
}

export const cancelLoadEmployee = () => action(CANCEL_LOAD_EMPLOYEE);

export const saveEmployee = (employee) => async(dispatch,getState) => {
  log(`saveEmployee...`);
  const state = getState();
  const employeeState = state.employee;
  try {
    dispatch(action(SAVE_EMPLOYEE_STARTED));
    const savedEmployee = await save(state.auth.token, employee);
    log('saveEmployee succeeded');
    if(!employeeState.isSavingCancelled){
      dispatch(action(SAVE_EMPLOYEE_SUCCEEDED, savedEmployee));
    }
  } catch (err) {
    log(`saveEmployee failed`);
    if(!employeeState.isSavingCancelled){
      dispatch(action(SAVE_EMPLOYEE_FAILED, errorPayload(err)));
    }
  }
}

export const cancelSaveEmployee = () => action(CANCEL_SAVE_EMPLOYEE)

export const employeeReducer = (state = {items: [], isLoading: false, isSaving:false},action) => { //newState(new object)
  switch (action.type) {
    case LOAD_EMPLOYEE_STARTED:
      return {...state, isLoading:true, isLoadingCancelled: false, issue:null};
    case LOAD_EMPLOYEE_SUCCEEDED:
      return {...state, items: action.payload, isLoading: false};
    case LOAD_EMPLOYEE_FAILED:
      return {...state, issue: action.payload.issue, isLoading:false};
    case CANCEL_LOAD_EMPLOYEE:
      return {...state, isLoading:false, isLoadingCancelled:true};
    case SAVE_EMPLOYEE_STARTED:
      return {...state, isSaving:true, isSavingCancelled:false, issue:null};
    case SAVE_EMPLOYEE_SUCCEEDED:
      let items = [...state.items];
      let index = items.findIndex((i) => i._id == action.payload._id);
      if(index != -1){
        items.splice(index,1,action.payload);
      }else{
        items.push(action.payload);
      }
      return {...state,items,isSaving:false};
    case SAVE_EMPLOYEE_FAILED:
      return {...state,issue: action.payload.issue, isSaving: false};
    case CANCEL_SAVE_EMPLOYEE:
      return {...state,isSaving: false, isSavingCancelled: true};
    default:
      return state;
  }

}
