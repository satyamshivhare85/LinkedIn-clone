import React, { createContext, useContext, useEffect, useState } from "react";
import { authDataContext } from "./AuthContext.jsx";
import axios from "axios";

export const UserDataContext = createContext();

function UserContext({ children }) {
  const [userData, setUserData] = useState(null);
  const [postData, setPostData] = useState([]);
  const { serverUrl } = useContext(authDataContext);
  const [edit,setEdit]= useState(false)

  const getCurrentUser = async () => {
    try {
      const result = await axios.get(
        serverUrl + "/api/user/currentuser",
        { withCredentials: true }
      );
      setUserData(result.data); 
    } catch (error) {
      console.log(error);
    }
  };

  const getPost=async()=>{
    try{
    let result= await axios.get(serverUrl+'/api/post/getpost', { withCredentials: true })
    console.log(result)
    setPostData(result.data)
    }
    catch(error){
 console.log(error);
    }
  }

  useEffect(() => {
    getCurrentUser();
    getPost();
  }, []);

  const value = {
    userData,
    setUserData,
    edit,
    setEdit,
    postData,
    setPostData,
    getPost
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}  
    </UserDataContext.Provider>
  );
}

export default UserContext;
