import axios from 'axios'

console.log("API URL: ", process.env.VUE_APP_ROOT_API)

export const axiosInstance = axios.create({
  baseURL: process.env.VUE_APP_ROOT_API,
  timeout: 2000,
})