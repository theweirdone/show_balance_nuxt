import axios from 'axios';

export default axios.create({
    baseURL: `http://192.168.1.169:8989/api/`,
});
