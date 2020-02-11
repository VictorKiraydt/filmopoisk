import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Redirect } from "react-router-dom";
import ModalWindow from "../ModalWindow";
import { setUser } from "../../actions";
import "./style.css";

class Header extends Component {
  modalWindowTypes = {
    none: "NONE",
    signIn: "SIGN_IN",
    signUp: "SIGN_UP"
  };

  state = {
    searchedTitle: "",
    displayModalWindow: false,
    typeModalWindow: this.modalWindowTypes.none
  };

  displayModalWindow(typeModalWindow) {
    this.setState({
      displayModalWindow: !this.state.displayModalWindow,
      typeModalWindow
    });
  }

  onSignOut() {
    const { setUser } = this.props;
    localStorage.setItem("userProfile", null);
    setUser(null);
    window.location.reload();
  }

  onSearchSubmit(event) {
    if (event.key !== "Enter") {
      return;
    }

    const searchedTitle = document.getElementById("search").value.toLowerCase();
    document.getElementById("search").value = "";
    if (searchedTitle === "") {
      return alert("Empty!");
    }

    this.setState({ searchedTitle });
  }

  searchField() {
    return (
      <div className="search">
        <input
          id="search"
          type="search"
          placeholder="Search for..."
          ref={input => (this.search = input)}
          onKeyPress={e => this.onSearchSubmit(e)}
        />
      </div>
    );
  }

  signInUpButtons() {
    return (
      <div className="auth-btn">
        <button
          onClick={this.displayModalWindow.bind(
            this,
            this.modalWindowTypes.signIn
          )}
        >
          Sign In
        </button>
        <button
          onClick={this.displayModalWindow.bind(
            this,
            this.modalWindowTypes.signUp
          )}
        >
          Sign Up
        </button>
      </div>
    );
  }

  signOutUserProfileButtons(userProfile) {
    return (
      <div className="auth-btn">
        <Link to={`/user/${userProfile.id}`}>{userProfile.userName}</Link>
        <button onClick={this.onSignOut.bind(this)}>Sign Out</button>
      </div>
    );
  }

  modalWindow() {
    const { displayModalWindow, typeModalWindow } = this.state;
    return displayModalWindow ? (
      <ModalWindow
        displayModalWindow={this.displayModalWindow.bind(this)}
        typeModalWindow={typeModalWindow}
      />
    ) : (
      ""
    );
  }

  searchFilm() {
    const { searchedTitle } = this.state;

    if (searchedTitle && searchedTitle !== "") {
      return (
        <Redirect
          push
          to={{
            pathname: "/catalog",
            search: `search=${searchedTitle}`,
            state: { searchedTitle }
          }}
        />
      );
    }
  }

  header(isSignedIn) {
    const { userProfile } = this.props.users;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    const modalWindow = this.modalWindow();
    const searchFilm = this.searchFilm();

    return (
      <React.Fragment>
        <header>
          {this.searchField()}
          {isSignedIn
            ? this.signOutUserProfileButtons(lsUserProfile || userProfile)
            : this.signInUpButtons()}
        </header>
        {modalWindow}
        {searchFilm}
      </React.Fragment>
    );
  }

  render() {
    const { userProfile, signUpResult } = this.props.users;
    const { setUser } = this.props;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    if (lsUserProfile || (userProfile && userProfile.id)) {
      if (userProfile) {
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
      }

      return this.header(true);
    } else if (userProfile && userProfile.message) {
      alert(
        `${userProfile.message}\n${
          userProfile.errors ? userProfile.errors[0].msg : ""
        }`
      );
      setUser(null);
    } else if (signUpResult) {
      alert(`${signUpResult.message}`);
      window.location.reload();
    }

    return this.header(false);
  }
}

const mapStateToProps = state => ({
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  setUser: user => {
    dispatch(setUser(user));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
