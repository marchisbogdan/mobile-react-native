import {getLogger, ResourceError} from '../core/utils';
import {apiUrl, authHeaders} from '../core/api';

const log = getLogger(`employee/resource`);

export const search = async (token) => {
  const url = `${apiUrl}/employee`;
  log(`GET ${url}`);
  let ok;
  let json = await fetch(url, {method: 'GET', headers: authHeaders(token)})
    .then(res => {
      ok = res.ok;
      return res.json();
    })

  return interpretResult('GET', url,ok,json);
}


export const save = async(token,employee) => {
  const body = JSON.stringify(employee);
  const url = employee._id ? `${apiUrl}/employee/${employee._id}` : `${apiUrl}/employee`;
  const method = employee._id ? 'PUT' : 'POST';
  log(`${method} ${url}`);
  let ok;
  return fetch(url,{method, headers: authHeaders(token), body})
    .then(res => {
      ok = res.ok;
      return res.json();
    })
  return interpretResult(method,url,ok,json);
};

function interpretResult(method,url,ok,json) {
  if(ok){
    log(`${method} ${url} succeeded`);
    return json;  
  }else{
    log(`${method} ${url} failed`);
    throw new ResourceError('Fetch failed', json.issue);
  }
}
