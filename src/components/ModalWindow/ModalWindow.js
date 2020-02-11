import React, { Component } from "react";
import { connect } from "react-redux";
import { signIn, signUp } from "../../actions";
import "./style.css";

class ModalWindow extends Component {
  state = {};

  onSignIn(event) {
    if (event.key && event.key !== "Enter") {
      return;
    }

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if ([email, password].some(value => value.length < 1)) {
      return alert("Enter the all fields, please!");
    }

    const { signIn } = this.props;
    signIn(email, password);
    this.props.displayModalWindow();
  }

  onSignUp(event) {
    if (event.key && event.key !== "Enter") {
      return;
    }

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmedPassword = document.getElementById("confirmedPassword")
      .value;

    if (
      [username, email, password, confirmedPassword].some(
        value => value.length < 1
      )
    ) {
      return alert("Enter the all fields, please!");
    }

    const { signUp } = this.props;
    signUp(username, email, password, confirmedPassword);
    this.props.displayModalWindow();
  }

  checkValidation(fieldname, value, regex) {
    if (value.length > 0 && !regex.test(value.toLowerCase())) {
      document.getElementById(`${fieldname}Validation`).style.display = "block";
      document.querySelector('button[type="submit"]').classList.add("disabled");
    } else {
      document.getElementById(`${fieldname}Validation`).style.display = "none";
      document
        .querySelector('button[type="submit"]')
        .classList.remove("disabled");
    }
  }

  validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.checkValidation("email", email, re);
  }

  validateUsername(username) {
    const re = /^([^)([\]\\\s,;:$%^&*\/]+)+$/;
    this.checkValidation("username", username, re);
  }

  validatePassword(password) {
    const re = /^([^\\\s&\/]+){6,}$/;
    this.checkValidation("password", password, re);
  }

  validateConfirmedPassword(confirmedPassword) {
    const re = /^([^\\\s&\/]+){6,}$/;
    this.checkValidation("confirmedPassword", confirmedPassword, re);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.displayModalWindow();
    }
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener(
      "mousedown",
      this.handleClickOutside.bind(this)
    );
  }

  signInModalWindow() {
    return (
      <div className="modal">
        <div className="modal-content" ref={this.setWrapperRef.bind(this)}>
          <div className="modal-header">
            <span className="close" onClick={this.props.displayModalWindow}>
              &times;
            </span>
            <h2>Sign In</h2>
          </div>
          <div className="modal-body">
            <form>
              <label htmlFor="email">Email</label>
              <span id="emailValidation">Incorrect email</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email"
                autoComplete="email"
                onBlur={e => this.validateEmail(e.target.value)}
                onKeyPress={e => this.onSignIn(e)}
              />

              <label htmlFor="password">Password</label>
              <span id="passwordValidation">
                The min password length is 6 characters
              </span>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Your Password"
                autoComplete="current-password"
                onBlur={e => this.validatePassword(e.target.value)}
                onKeyPress={e => this.onSignIn(e)}
              />
            </form>
          </div>
          <div className="modal-footer">
            <button type="submit" onClick={this.onSignIn.bind(this)}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  singUpModalWindow() {
    return (
      <div className="modal">
        <div className="modal-content" ref={this.setWrapperRef.bind(this)}>
          <div className="modal-header">
            <span className="close" onClick={this.props.displayModalWindow}>
              &times;
            </span>
            <h2>Sign Up</h2>
          </div>
          <div className="modal-body">
            <form>
              <label htmlFor="email">User Name</label>
              <span id="usernameValidation">Incorrect user name</span>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Your User Name"
                autoComplete="username"
                onBlur={e => this.validateUsername(e.target.value)}
                onKeyPress={e => this.onSignUp(e)}
              />

              <label htmlFor="email">Email</label>
              <span id="emailValidation">Incorrect email</span>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your Email"
                autoComplete="email"
                onBlur={e => this.validateEmail(e.target.value)}
                onKeyPress={e => this.onSignUp(e)}
              />

              <label htmlFor="password">Password</label>
              <span id="passwordValidation">
                The min password length is 6 characters
              </span>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Your Password"
                autoComplete="current-password"
                onBlur={e => this.validatePassword(e.target.value)}
                onKeyPress={e => this.onSignUp(e)}
              />

              <label htmlFor="confirmedPassword">Confirm Your Password</label>
              <span id="confirmedPasswordValidation">
                Incorrect confirmed password
              </span>
              <input
                type="password"
                id="confirmedPassword"
                name="confirmedPassword"
                placeholder="Confirm Your Password"
                autoComplete="current-password"
                onBlur={e => this.validateConfirmedPassword(e.target.value)}
                onKeyPress={e => this.onSignUp(e)}
              />
            </form>
          </div>
          <div className="modal-footer">
            <button type="submit" onClick={this.onSignUp.bind(this)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  defaultModalWindow() {
    return (
      <div className="modal">
        <div className="modal-content" ref={this.setWrapperRef.bind(this)}>
          <div className="modal-header">
            <span className="close" onClick={this.props.displayModalWindow}>
              &times;
            </span>
            <h2>Error!</h2>
          </div>
          <div className="modal-body">
            <p>Something went wrong.</p>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { typeModalWindow } = this.props;
    switch (typeModalWindow) {
      case "SIGN_IN":
        return this.signInModalWindow();
      case "SIGN_UP":
        return this.singUpModalWindow();
      default:
        return this.defaultModalWindow();
    }
  }
}

const mapStateToProps = state => ({
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  signIn: (email, password) => {
    dispatch(signIn(email, password));
  },
  signUp: (username, email, password, confirmedPassword) => {
    dispatch(signUp(username, email, password, confirmedPassword));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ModalWindow);
