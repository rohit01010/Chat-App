import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import ListGroup from "react-bootstrap/ListGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faTrash,
  faBars,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import { db, auth, provider } from "./firebase";
import { useEffect, useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { actionTypes } from "./reducer";
import useStateValue from "./StateProvider";
import Particles from "react-particles-js";

function App() {
  const [messages, setMessages] = useState([""]);
  const [message_input, set_message_input] = useState("");
  const [join_room_name_input, set_join_room_name_input] = useState("");
  const [join_room_name_password, set_join_room_password_input] = useState("");
  const [create_room_name_input, set_create_room_name_input] = useState("");
  const [create_room_name_password, set_create_room_password_input] =
    useState("");
  const [error, setError] = useState(false);
  const [ModalSignIn, setModalSignIn] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [room, setRoom] = useState({
    isRoom: false,
    key: "",
    password: "",
    room_name: "",
  });
  const [{ userGoogle }, dispatch] = useStateValue();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        //already logged in
        setUser(authUser);
      } else {
        //user log out
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, username]);

  //fetch and use Todo data from database
  useEffect(() => {
    if (room.isRoom) {
      db.collection("users")
        .doc(room.key)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          setMessages(
            snapshot.docs.map((doc) => ({
              id: doc.id,
              username: doc.data().username,
              message: doc.data().message,
              time: doc.data().localtime,
            }))
          );
        });
      localStorage.setItem("room", JSON.stringify(room));
    }
  }, [room.isRoom]);

  useEffect(() => {
    if (localStorage.getItem("room") !== null) {
      setRoom(JSON.parse(localStorage.getItem("room")));
    }
  }, []);

  const handleJoinRoom = () => {
    db.collection("users")
      .doc(join_room_name_input)
      .get()
      .then((doc) => {
        if (!doc.exists) alert("No such room exits!!");
        else {
          if (doc.data().password !== join_room_name_password) {
            alert("Password Incorrect!!");
          } else {
            setRoom({
              isRoom: true,
              key: join_room_name_input,
              room_name: doc.data().name,
              password: join_room_name_password,
            });
          }
        }
      });
    set_join_room_name_input("");
    set_join_room_password_input("");
  };

  const handleCreateRoom = () => {
    db.collection("users")
      .add({
        name: create_room_name_input,
        password: create_room_name_password,
      })
      .then((doc) => {
        setRoom({
          isRoom: true,
          key: doc.id,
          room_name: create_room_name_input,
          password: create_room_name_password,
        });
      })
      .catch((err) => alert(err.message));
    set_create_room_name_input("");
    set_create_room_password_input("");
  };

  useEffect(() => {
    scrollTheDisp();
  }, [messages]);

  //add new todo to database
  const addMessages = (event) => {
    event.preventDefault();
    // setTodos([...todos, input]);
    db.collection("users")
      .doc(room.key)
      .collection("messages")
      .add({
        username: user?.displayName,
        message: message_input,
        localtime: giveMeTime(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => alert(err.message));

    set_message_input("");
  };

  //Modal Opening and Closing functions
  const handleSignInOpen = () => setModalSignIn(true);
  const handleSignInClose = () => setModalSignIn(false);

  //Sign Up function
  const signUp = (event) => {
    event.preventDefault();
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        return authUser.user.updateProfile({
          displayName: username,
        });
      })
      .catch((err) => alert(err.message));
    setEmail("");
    setPassword("");
    handleSignInOpen();
  };

  //Sign In function
  const signIn = (event) => {
    event.preventDefault();
    auth
      .signInWithEmailAndPassword(email, password)
      .catch((err) => alert(err.message));
    setEmail("");
    setPassword("");
    handleSignInClose();
  };

  //Google Sign In
  const signInWithGoogle = (event) => {
    event.preventDefault();
    auth
      .signInWithPopup(provider)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_USER,
          userGoogle: result.user,
        });
        setUser(result.user);
      })
      .catch((err) => alert(err.message));
    setEmail("");
    setPassword("");
  };

  function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

  function giveMeTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    m = checkTime(m);
    return h + ":" + m;
  }

  let Disp = React.createRef();

  function scrollTheDisp() {
    if (Disp.current != null) Disp.current.scrollIntoView();
  }

  const handleExitRoom = () => {
    localStorage.removeItem("room");
    setRoom({ isRoom: false, key: "", password: "", room_name: "" });
  };

  const handleSignOut = () => {
    if (localStorage.getItem("room")) {
      localStorage.removeItem("room");
    }
    auth.signOut();
  };

  return (
    <div className="App">
      {user ? (
        <>
          <Particles
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: "1",
            }}
            params={{
              particles: {
                number: {
                  value: 80,
                  density: {
                    enable: true,
                    value_area: 800,
                  },
                },
                color: {
                  value: "#fff",
                },
                shape: {
                  type: "circle",
                  stroke: {
                    width: 1,
                    color: "#fff",
                  },
                  polygon: {
                    nb_sides: 6,
                  },
                  image: {
                    src: "",
                    width: 100,
                    height: 100,
                  },
                },
                opacity: {
                  value: 1,
                  random: false,
                  anim: {
                    enable: false,
                    speed: 3,
                    opacity_min: 0,
                    sync: false,
                  },
                },
              },
            }}
          />
          <div className="App__loggedin">
            <div className="App__header">
              <h1>Chat Room App</h1>
              <Button onClick={handleSignOut}>Log out</Button>
            </div>
            {room.isRoom ? (
              <>
                <div className="Room_details">
                  <p>Room Id : {room.key}</p>
                  <p>Password : {room.password}</p>
                  <button onClick={handleExitRoom} title="Exit">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                  </button>
                </div>
                <div className="App__display">
                  {messages.map((message) => {
                    return (
                      <div
                        className={
                          message.username === user?.displayName
                            ? "App__sendmessage"
                            : "App__message"
                        }
                      >
                        <span className="App__display__user">
                          {message.username}
                        </span>
                        <span style={{ display: "flex" }}>
                          <span className="App__display__msg">
                            {message.message}
                          </span>
                          <span className="App__display__time">
                            {message.time ? message.time : null}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                  <div className="App__message" className="space" ref={Disp}>
                    <br />
                    <br />
                    <br />
                    <br />
                    <br />
                  </div>
                </div>
                <div onClick={() => scrollTheDisp()} className="App__downarrow">
                  <FontAwesomeIcon
                    style={{
                      width: "25px",
                      height: "25px",
                      position: "relative",
                      top: "2px",
                      color: "#797c7e",
                    }}
                    icon={faAngleDown}
                  />
                </div>
                <div className="App__input">
                  <form>
                    <input
                      type="text"
                      value={message_input}
                      onChange={(e) => {
                        set_message_input(e.target.value);
                      }}
                      placeholder="Type a message"
                      autoComplete="off"
                    />
                    <button
                      disabled={!message_input}
                      type="submit"
                      onClick={addMessages}
                    >
                      Submit
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <>
                <div className="Room_login">
                  <div className="Room_form">
                    <h2>JOIN ROOM</h2>
                    <input
                      type="text"
                      value={join_room_name_input}
                      onChange={(e) => set_join_room_name_input(e.target.value)}
                      placeholder="Room Id"
                    />
                    <input
                      type="password"
                      value={join_room_name_password}
                      onChange={(e) =>
                        set_join_room_password_input(e.target.value)
                      }
                      placeholder="Password"
                    />
                    <button onClick={handleJoinRoom}>JOIN</button>
                  </div>
                  <div className="Room_form">
                    <h2>CREATE ROOM</h2>
                    <input
                      type="text"
                      value={create_room_name_input}
                      onChange={(e) =>
                        set_create_room_name_input(e.target.value)
                      }
                      placeholder="Room Name"
                    />
                    <input
                      type="password"
                      value={create_room_name_password}
                      onChange={(e) =>
                        set_create_room_password_input(e.target.value)
                      }
                      placeholder="Password"
                    />
                    <input
                      type="password"
                      style={{
                        border: error ? "2px solid crimson" : "none",
                      }}
                      onChange={(e) => {
                        create_room_name_password != e.target.value
                          ? setError(true)
                          : setError(false);
                      }}
                      placeholder="Confirm Password"
                    />
                    <button onClick={handleCreateRoom}>CREATE</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="App__Start">
            <div
              className="login"
              style={{
                display: ModalSignIn ? "flex" : "none",
              }}
            >
              <form>
                <h1>LOG IN</h1>
                <br />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="off"
                />
                <br />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="off"
                />
                <br />
                <input
                  type="submit"
                  disabled={!(email && password)}
                  onClick={signIn}
                  value="Login"
                />
                <br />
                <p>
                  DON'T HAVE AN ACCOUNT ?{" "}
                  <button type="button" onClick={handleSignInClose}>
                    SIGNUP
                  </button>
                </p>
                <button onClick={signInWithGoogle} class="google-btn">
                  <div class="google-icon-wrapper">
                    <img
                      class="google-icon"
                      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    />
                  </div>
                  <p class="btn-text">Sign in with google</p>
                </button>
              </form>
            </div>
            <div
              className="signup"
              style={{
                display: ModalSignIn ? "none" : "flex",
              }}
            >
              <form>
                <h1>SIGN UP</h1>
                <br />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  autoComplete="off"
                />
                <br />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="off"
                />
                <br />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="off"
                />
                <br />
                <input
                  type="submit"
                  disabled={!(email && password)}
                  onClick={signUp}
                  value="Signup"
                />
                <br />
                <p>
                  ALREADY HAVE AN ACCOUNT ?{" "}
                  <button type="buttton" onClick={handleSignInOpen}>
                    LOGIN
                  </button>
                </p>
                <button onClick={signInWithGoogle} class="google-btn">
                  <div class="google-icon-wrapper">
                    <img
                      class="google-icon"
                      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    />
                  </div>
                  <p class="btn-text">
                    <b>Sign in with google</b>
                  </p>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
