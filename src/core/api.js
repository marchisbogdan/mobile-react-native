// export const apiUrl = 'http://192.168.0.103:3000/api'; //iw
export const apiUrl = 'http://172.30.3.41:3000/api'; //cs
// export const apiUrl = 'http://192.168.1.10:3000/api';
export const headers = {'Accept': 'application/json', 'Content-Type': 'application/json'};
export const authHeaders = (token) => ({...headers, 'Authorization': `Bearer ${token}`});
