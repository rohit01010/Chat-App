import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import ListGroup from "react-bootstrap/ListGroup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import firebase from "firebase";
import { db, auth, provider } from "./firebase";
import { useEffect, useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import { actionTypes } from "./reducer";
import useStateValue from "./StateProvider";
import Particles from "react-particles-js";

function App() {
  const [messages, setMessages] = useState([""]);
  const [input, setInput] = useState("");
  const [showSignUp, setSignUpShow] = useState(false);
  const [showSignIn, setSignInShow] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
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
    db.collection("users")
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
  }, []);

  useEffect(() => {
    scrollTheDisp();
  }, [messages]);

  //add new todo to database
  const addMessages = (event) => {
    event.preventDefault();
    // setTodos([...todos, input]);
    db.collection("users")
      .add({
        username: user?.displayName,
        message: input,
        localtime: giveMeTime(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .catch((err) => alert(err.message));

    setInput("");
  };

  //Modal Opening and Closing functions
  const handleSignUpClose = () => setSignUpShow(false);
  const handleSignInClose = () => setSignInShow(false);

  //Sign Up function
  const signUp = (event) => {
    event.preventDefault();
    // console.log("email: " + email + " password: " + password + " sign up");
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
    handleSignUpClose();
  };

  //Sign In function
  const signIn = (event) => {
    event.preventDefault();
    // console.log("email: " + email + " password: " + password + " sign in");
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

  return (
    <div className="App">
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
      <Modal centered show={showSignUp} onHide={handleSignUpClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sign Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicText">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="off"
              />
            </Form.Group>
            <Button
              disabled={!(email && password)}
              variant="primary"
              type="submit"
              onClick={signUp}
            >
              Sign Up
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal centered show={showSignIn} onHide={handleSignInClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sign In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="off"
              />
            </Form.Group>
            <Button
              disabled={!(email && password)}
              variant="primary"
              type="submit"
              onClick={signIn}
            >
              Sign In
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {user ? (
        <div className="App__loggedin">
          <div className="App__header">
            <h1>Chat Room App</h1>
            <Button onClick={() => auth.signOut()}>Log out</Button>
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
                  <span className="App__display__user">{message.username}</span>
                  <span style={{ display: "flex" }}>
                    <span className="App__display__msg">{message.message}</span>
                    <span className="App__display__time">
                      {message.time ? message.time : null}
                    </span>
                  </span>
                  {/* <Button
                    onClick={(event) =>
                      db.collection("users").doc(message.id).delete()
                    }
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button> */}
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
          <div className="App__input">
            <form>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message"
                autoComplete="off"
              />
              <button disabled={!input} type="submit" onClick={addMessages}>
                Submit
              </button>
            </form>
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
        </div>
      ) : (
        <div className="Appp__Start">
          <div className="App__Start__sign">
            <Button
              style={{ float: "none", margin: "20px" }}
              onClick={() => setSignUpShow(true)}
            >
              Sign Up
            </Button>
            <Button
              style={{ float: "none", margin: "20px" }}
              onClick={() => setSignInShow(true)}
            >
              Sign In
            </Button>
            <Button
              style={{
                float: "none",
                margin: "20px",
              }}
              onClick={signInWithGoogle}
            >
              Sign In with google
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
