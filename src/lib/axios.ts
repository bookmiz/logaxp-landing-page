import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://api-logaxp.onrender.com/api',
});

export default instance;
