import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [hasLoginFailed, setHasLoginFailed] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:3001/login", {
      username: e.target[0].value,
      password: e.target[1].value
    }).then((response) => {
      if (response.status === 200) {
        navigate("/list");
      }
    }).catch((error) => {
      if (error.response.status === 401) {
        setHasLoginFailed(true);
      }
    });
  }

  return (
    <div>
      <h1>PNSUK</h1>
      <h2>Admin Login</h2>
      {hasLoginFailed && <p>Invalid username or password</p>}
      <form onSubmit={login}>
        <div>
          <label>Username</label>
          <input type="text" />
        </div>
        <div>
          <label>Password</label>
          <input type="password" />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;