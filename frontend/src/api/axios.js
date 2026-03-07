import axios from "axios";

const API = axios.create({
    baseURL: "https://jobapplytracker-v2.onrender.com",
    withCredentials: true,
});

export default API;