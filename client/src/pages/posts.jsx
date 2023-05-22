import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Posts = () => {
  const [response, setResponse] = useState("");
  const navigate = useNavigate();

  let user = localStorage.getItem("accessToken");
  // console.log("user", user);
  let headers = { Authorization: `Bearer ${user}` };
  /**
   * Wrap the interceptor in a function, so that i can be re-instantiated
   */

  function createAxiosResponseInterceptor() {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Reject promise if usual error
        if (error.response.status !== 403) {
          return Promise.reject(error);
        }

        /*
         * When response code is 401, try to refresh the token.
         * Eject the interceptor so it doesn't loop in case
         * token refresh causes the 401 response.
         *
         * Must be re-attached later on or the token refresh will only happen once
         */
        axios.interceptors.response.eject(interceptor);

        return axios
          .post("http://localhost:4000/nrtoken", {
            token: localStorage.getItem("refreshToken"),
          })
          .then((response) => {
            user = localStorage.setItem(
              "accessToken",
              response.data.accessToken
            );
            headers = { Authorization: `Bearer ${user}` };
            console.log("newAccessTokenSet", response.data.accessToken);
            error.response.config.headers["Authorization"] =
              "Bearer " + response.data.accessToken;
            // Retry the initial call, but with the updated token in the headers.
            // Resolves the promise if successful

            //initial request
            console.log(
              "this is error.response.config --",
              error.response.config
            );
            return axios(error.response.config);
          })
          .catch((error2) => {
            // Retry failed, clean up and reject the promise

            return Promise.reject(error2);
          })
          .finally(createAxiosResponseInterceptor); // Re-attach the interceptor by running the method
      }
    );
  }

  useEffect(() => {
    // Execute the method once during start
    createAxiosResponseInterceptor();
    axios
      .get("http://localhost:3000/posts", { headers })
      .then((response) => {
        console.log("im here");
        setResponse(response.data[0].title + response.data[0].username);
      })
      .catch((e) => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");

        console.log("I'm in the get catch");
        console.log(e + "22222222222");
      });
  }, []);

  return (
    <div>
      Posts
      <br />
      <br />
      <p>{response}</p>
    </div>
  );
};
