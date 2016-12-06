import {
      OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
  CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, setIssueRes 
} from './utils.js';

import Router from 'koa-router';
import {getLogger} from './utils.js';

const log = getLogger('employee');

let employeesLastUpdateMillis = null;

export class EmployeeRouter extends Router {
    constructor(props) {
        super(props);
        this.employeeStore = props.employeeStore;
        this.io = props.io;
        this.get('/', async (ctx) => {
            let res = ctx.response;
            let lastModified = ctx.request.get(LAST_MODIFIED);
            if(lastModified && employeesLastUpdateMillis && employeesLastUpdateMillis <= new Date(lastModified).getTime()){
                log('search / - 304 Not Modified (the client can use the cached data)');
                res.status = NOT_MODIFIED;
            }else{
                res.body = await this.employee.find({});
                if(!employeesLastUpdateMillis){
                    employeesLastUpdateMillis = Date.now();
                }
                res.set({[LAST_MODIFIED]: new Date(employeesLastUpdateMillis)});
                log('serach / - 200 OK');
            }
        }).get('/:id', async (ctx) => {
            let employee = await this.employeeStore.findOne({_id: ctx.params.id});
            let res = ctx.response;
            if(employee){
                log('read /:id - 200 Ok');
                this.setEmployeeRes(res,OK,employee);
            }else{
                log('read /:id - 404 Not Found (if you know the resource was deleted, then you can return 410 Gone)');
                setIssueRes(res,NOT_FOUND,[{warning: 'Employee not found'}]);
            }
        }).post('/',async (ctx) =>{
            let employee = ctx.request.body;
            let res = ctx.response;
            if(employee.name && employee.position && employee.salary){
                await this.createEmployee(res,employee);
            }else{
                log(`create / - 400 Bad Request`);
                setIssueRes(res,BAD_REQUEST,[{error: 'Text is missing'}]);
            }
        }).put('/:id', async (ctx) => {
            let employee = ctx.request.body;
            let id = ctx.params.id;
            let employeeId=  employee._id;
            let res = ctx.response;
            if(employeeId && employeeId != id){
                log(`update /:id - 400 Bad Request (param id and body _id should be the same)`);
                setIssueRes(res,BAD_REQUEST,[{error: 'Params id and body._id should be the same'}]);
                return;
            }
            if(!employee.name || !employee.position || !employee.salary){
                log(`update /:id - 400 Bad Request (validation errors)`);
                setIssueRes(res,BAD_REQUEST,[{error: 'Name, position or salary is missing'}]);
                return;
            }
            if(!employeeId){
                await this.createEmployee(res,employee);
            }else{
                let persistedEmpoyee = await this.employeeStore.findOne({_id: id});
                if(persistedEmpoyee){
                    let employeeVersion = parseInt(ctx.request.get(ETAG)) || employee.version;
                    if(!employeeVersion){
                        log(`update /:id - 400 Bad Request (no version specified)`);
                        setIssueRes(res,BAD_REQUEST,[{error: 'No version specified'}]);
                    }else if(employeeVersion < persistedEmpoyee.version){
                        log(`update /:id - 409 Conflict`);
                        setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); 
                    }else{
                        employee.version = employeeVersion + 1;
                        employee.updated = Date.now();
                        let updatedCount = await this.employeeStore.update({_id: id}, employee);
                        employeesLastUpdateMillis = employee.updated;
                        if(updatedCount == 1){
                            this.setEmployeeRes(res,OK,employee);
                            this.io.emit('employee-updated',employee);
                        }else{
                            log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                            setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Employee no longer exists'}]); 
                        }
                    }
                }else{
                    log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                    setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Employee no longer exists'}]); 
                }
            }
        }).del('/:id', async(ctx) => {
            let id = ctx.params.id;
            await this.employeeStore.remove({_id: id});
            this.io.emit('employee-deleted', {_id:id});
            employeesLastUpdateMillis = Date.now();
            ctx.response.status = NO_CONTENT;
            log(`remove /:id - 204 No content (even if the resource was already deleted), or 200 Ok`);
        });
    }

    async createEmployee(res,employee){
        employee.version = 1;
        employee.updated = Date.now();
        let insertedEmployee = await this.employeeStore.insert(employee);
        employeesLastUpdateMillis = employee.updated;
        this.setEmployeeRes(res,CREATED,insertedEmployee);
        this.io.emit('employee-created',insertedEmployee);
    }

    setEmployeeRes(res,status,employee){
        res.body = employee;
        res.set({
            [ETAG]: employee.version,
            [LAST_MODIFIED]: new Date(employee.updated)
        });
        res.status = status;
    }
};
