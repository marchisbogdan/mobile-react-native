import {getLogger, ResourceError} from "../core/utils";
import {apiUrl, headers} from "../core/api";

const log = getLogger('auth/resource');

export async function getToken(user) {
  log(`getToken ${apiUrl}/auth/session`)
  let ok;
  let json = await fetch(`${apiUrl}/auth/session`, {method: 'POST',headers, body: JSON.stringify(user)})
    .then(res => {
      ok = res.ok;
      return res.json();
    });
  if(ok){
    return json.token;
  }else{
    throw new ResourceError('Authentication failed', json.issue);
  }
};
