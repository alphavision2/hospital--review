import axios from "axios";
import { API_BASE } from "./config";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "content-type": "application/json",
  },
});

export default api;
