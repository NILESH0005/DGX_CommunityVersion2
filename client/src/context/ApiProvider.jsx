// // src/context/ApiProvider.js
// import ApiContext from "./ApiContext.jsx";
// import apiRequest from "../api/api.jsx";
// import PropTypes from "prop-types";
// import { useEffect, useState, useCallback } from "react";
// import Cookies from "js-cookie";
// import { useNavigate } from "react-router-dom";

// const ApiProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [userToken, setUserToken] = useState(null);

//   const navigate = useNavigate();
//   const logOut = () => {
//     setUser(null);
//     setUserToken(null);
//     Cookies.remove("userToken");
//     navigate("/login"); // or your login route
//   };

//   // const fetchData = useCallback(async (endpoint, method, body, headers = {}) => {
//   //   try {
//   //     const finalHeaders = {
//   //       ...headers,
//   //       'auth-token': userToken || headers['auth-token'] || '',
//   //       'Content-Type': 'application/json'
//   //     };

//   //     // console.log("API call:", { endpoint, method, body, headers: finalHeaders });
//   //     const result = await apiRequest(endpoint, method, body, finalHeaders);
//   //     if (result?.message?.includes('expired') || result?.message?.includes('invalid')) {
//   //       logOut();
//   //       throw new Error('Session expired. Please login again.');
//   //     }
//   //     return result;
//   //   } catch (error) {
//   //     // console.error("API error:", error);
//   //     throw error;
//   //   }
//   // }, [userToken, logOut]);



//  const fetchData = async (endpoint, method, body, headers) => {
//     try {
//       const result = await apiRequest(endpoint, method, body, headers);
//       // console.log(result);

//       return result;
//     } catch (error) {
//       // // console.log("This is some error: ", error);

//       // console.error("Error fetching data:", error);
//     }
//   };



//   // const _fetchWithToken = async (endpoint, method, body, token, headers = {}) => {
//   //   return fetchData(endpoint, method, body, {
//   //     ...headers,
//   //     'auth-token': token
//   //   });
//   // };

//   const getUserData = async (token) => {
//     try {
//       const data = await _fetchWithToken("user/getuser", "POST", {}, token);
//       if (!data.success) throw new Error(data.message);
//       return data;
//     } catch (error) {
//       // console.error("Failed to fetch user:", error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     const token = Cookies.get("userToken");
//     if (token) {
//       try {
//         // const parsedToken = JSON.parse(token);
//         setUserToken(parsedToken);
//         getUserData(parsedToken)
//           .then(data => setUser(data.data))
//           .catch(error => {
//             // console.error("Token invalid or expired:", error.message);
//             // logOut(); 
//             if (error.message.includes('expired') || error.message.includes('invalid')) {
//               logOut();
//             }
//           });
//       } catch (e) {
//         // console.error("Token handling error:", e);
//         // logOut();
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const token = Cookies.get("userToken");
//     if (token) {
//       try {
//         setUserToken(token); // Use token directly without parsing
//         getUserData(token)
//           .then(data => setUser(data.data))
//           .catch(error => {
//             // console.error("Token invalid or expired:", error.message);
//             if (error.message.includes('expired') || error.message.includes('invalid')) {
//               logOut();
//             }
//           });
//       } catch (e) {
//         // console.error("Token handling error:", e);
//       }
//     }
//   }, []);



//   const logIn = async (token) => {
//     try {
//       const userData = await getUserData(token);
//       setUser(userData.data);
//       setUserToken(token);
//       Cookies.set("userToken", token, {
//         expires: 7,
//         secure: true,
//         sameSite: 'strict'
//       });
//     } catch (error) {
//       // console.error("Login failed:", error);
//       throw error;
//     }
//   };

//   return (
//     <ApiContext.Provider value={{
//       fetchData,
//       logIn,
//       logOut, // Add logout to context
//       user,
//       userToken,
//       setUserToken
//     }}>
//       {children}
//     </ApiContext.Provider>
//   );
// };

// export default ApiProvider;

// // ApiProvider.propTypes = {
// //   children: PropTypes.node.isRequired,
// // };




// // src/context/ApiProvider.js
// // import ApiContext from "./ApiContext.jsx";
// // import apiRequest from "../api/api.jsx";
// // import PropTypes from "prop-types";
// // import { useEffect, useState } from "react";
// // import Cookies from "js-cookie";

// // const ApiProvider = ({ children }) => {
// //   const [user, setUser] = useState(null);
// //   const [userToken, setUserToken] = useState(null)

// //   const fetchData = async (endpoint, method, body, headers) => {
// //     try {
// //       const result = await apiRequest(endpoint, method, body, headers);
// //       // console.log(result);

// //       return result;
// //     } catch (error) {
// //       // // console.log("This is some error: ", error);

// //       // console.error("Error fetching data:", error);
// //     }
// //   };

// //   const getUserData = async (token) => {
// //     const endpoint = "user/getuser";
// //     const method = "POST";
// //     const headers = {
// //       "Content-Type": "application/json",
// //       "auth-token": token,
// //     };
// //     const body = {};
// //     try {
// //       const data = await fetchData(endpoint, method, body, headers);
// //       if (!data.success) {
// //         // console.log(data.message);
// //       } else if (data.success) {
// //         return data;
// //       }
// //     } catch (error) {
// //       // console.log(error);
// //     }
// //   };
// //   useEffect(() => {
// //     const token = Cookies.get("userToken");
// //     if (token) {
// //       try {
// //         const parseToken = JSON.parse(token);
// //         setUserToken(parseToken)
// //         getUserData(parseToken)
// //           .then((userData) => {
// //             if (userData) {
// //               setUser(userData.data);
// //             }
// //           })
// //           .catch((e) => {
// //             // console.log("Failed to fetch the user data:", e);
// //           });
// //       } catch (e) {
// //         // console.log("Failed to parse token:", e);
// //       }
// //     }
// //   }, []);

// //   const logIn = async (authtoken) => {
// //     try {
// //       setUserToken(authtoken)
// //       getUserData(authtoken)
// //         .then((userData) => {
// //           if (userData) {
// //             setUser(userData.data);
// //             Cookies.set("userToken", JSON.stringify(authtoken), { expires: 7 });
// //           }
// //         })
// //         .catch((e) => {
// //           // console.log("Failed to fetch the user data:", e);
// //         });
// //     } catch (error) {
// //       // console.log("Login error:", error);
// //     }
// //   };

// //   return (
// //     <ApiContext.Provider value={{ fetchData, logIn, user, userToken, setUserToken }}>
// //       {children}
// //     </ApiContext.Provider>
// //   );
// // };

// // export default ApiProvider;

// // ApiProvider.propTypes = {
// //   children: PropTypes.node.isRequired,
// // };




// src/context/ApiProvider.js
import ApiContext from "./ApiContext.jsx";
import apiRequest from "../api/api.jsx";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const ApiProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true);


  const fetchData = async (endpoint, method, body, headers) => {
    try {
      const result = await apiRequest(endpoint, method, body, headers);
      // console.log(result);

      return result;
    } catch (error) {
      // // console.log("This is some error: ", error);

      // console.error("Error fetching data:", error);
    }
  };

  const getUserData = async (token) => {
    const endpoint = "user/getuser";
    const method = "POST";
    const headers = {
      "Content-Type": "application/json",
      "auth-token": token,
    };
    const body = {};
    try {
      const data = await fetchData(endpoint, method, body, headers);
      // console.log(data);
      if (!data.success) {
        // console.log(data.message);
      } else if (data.success) {
        return data;
      }
    } catch (error) {
      // console.log(error);
    }
  };
  useEffect(() => {
        const token = Cookies.get('userToken');
        if (token) {
            const parsedToken = JSON.parse(token);
            setUserToken(parsedToken);

            // Fetch user from API
            getUserData(parsedToken)
                .then((res) => {
                    if (res?.data) setUser(res.data);
                })
                .catch((err) => console.error(err))
                .finally(() => setLoadingUser(false)); // SET TO FALSE AFTER FETCH
        } else {
            setLoadingUser(false);
        }
    }, []);

const logIn = async (authtoken) => {
  try {
    setUserToken(authtoken)
    getUserData(authtoken)
      .then((userData) => {
        if (userData) {
          setUser(userData.data);
          Cookies.set("userToken", JSON.stringify(authtoken), { expires: 1 / 12 });
        }
      })
      .catch((e) => {
        // console.log("Failed to fetch the user data:", e);
      });
  } catch (error) {
    // console.log("Login error:", error);
  }
};

return (
  <ApiContext.Provider value={{ fetchData, logIn, user, userToken, setUserToken }}>
    {children}
  </ApiContext.Provider>
);
};

export default ApiProvider;

ApiProvider.propTypes = {
  children: PropTypes.node.isRequired,
};