import axios from 'axios';

export default axios.create({
    baseURL: `http://lvh.me:5000/`,
});
