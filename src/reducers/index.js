import {authReducer} from '../auth/service.js';
import {employeeReducer} from '../employee/service.js';

import {combinedReducers} from 'redux';

export default combinedReducers({
    authReducer:authReducer,
    employeeReducer:employeeReducer
});