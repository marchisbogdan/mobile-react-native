import Koa from 'koa';
import cors from 'koa-cors';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import http from 'http';
import socketIo from 'socket.io';
import dataStore from 'nedb-promise';
import {getLogger, timingLogger, errorHandler} from './utils';
import {EmployeeRouter} from './empl-router';
import {AuthRouter, jwtConfig} from './auth-router';
import koaJwt from 'koa-jwt';

const app = new Koa();
const router = new Router();
const server = http.createServer(app.callback());
const io = socketIo(server);
const log = getLogger('app');

app.use(timingLogger);
app.use(errorHandler);

app.use(bodyParser());
app.use(convert(cors));

const apiUrl = '/api';

log('config public routers');
const authApi = new Router({prefix: apiUrl});
const userStore = dataStore({filname: '../user.json', autoload: true});
authApi.use('/auth', new AuthRouter({userStore,io}).routes());
app.use(authApi.routes()).use(authApi.allowedMethods());

log('config protected routes');
app.use(convert(koaJwt(jwtConfig)));
const protectedApi = new Router({prefix: apiUrl});
const employeeStore = dataStore({filname: '../notes.json', autoload: true});
protectedApi.use('/employee', new EmployeeRouter({employeeStore, io}).routes());
app.use(protectedApi.routes()).use(protectedApi.allowedMethods());

log('config socket io');
io.on('connection', (socket) => {
    log('client connected');
    socket.on('disconnected', () => {
        log('client disconnected');
    })
});

(async() => {
    log('ensure defaul data');
    let admin = await userStore.findOne({username: 'a'});
    if(admin){
        log(`admin user was in the store`)
    }else{
        admin = await userStore.insert({username: 'a', password:'a'});
        log(`admin added: ${JSON.stringify(admin)}`);
    }
    let employees = await employeeStore.find({});
    if(employees.length > 0){
        log(`employee store has ${notes.length} employees`)
    }else{
        log(`employee store was empty, adding some employees`);
        for (let i = 0; i < 3; i++) {
            let salary = 3000 + i * 300;
            let note = await noteStore.insert({name: `Employee ${i}`, position: `senior dev`, salary: salary, status: "active", updated: Date.now(), user: admin._id, version: 1});
            log(`employee added ${JSON.stringify(note)}`);
        }
    }
})();

server.listen(3000)