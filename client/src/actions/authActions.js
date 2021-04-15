import axios from "axios";
import { GET_ERRORS, SET_CURRENT_USER } from "./types";
import setAuthToken from "../utils/setAuthToken";
import jwtDecode from "jwt-decode";

// Register User
export const registerUser = (userData, history) => (dispatch) => {
  axios
    .post("/api/users/register", userData)
    .then((res) => history.push("/login"))
    .catch((err) => dispatch({ type: GET_ERRORS, payload: err.response.data }));
};

// Login - Get user token
export const loginUser = (userData) => (dispatch) => {
  axios
    .post("/api/users/login", userData)
    .then((res) => {
      // save token to localstorage
      const { token } = res.data;
      // Set token to locastorage
      localStorage.setItem("jwtToken", token);
      // Set token to Auth headers
      setAuthToken(token);
      // Decode token to get user data
      const decoded = jwtDecode(token);
      // Set currentUser
      dispatch(setCurrentUser(decoded));
    })
    .catch((err) => dispatch({ type: GET_ERRORS, payload: err.response.data }));
};

// Set loggedin user
export const setCurrentUser = (decoded) => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// Log user out
export const logoutUser = () => (dispatch) => {
  // Remove token from localstorage
  localStorage.removeItem("jwtToken");
  // Remove auth header from future requests
  setAuthToken(false);
  // Set the current user to empty {} which will isauthenticated to false
  dispatch(setCurrentUser({}));
};
