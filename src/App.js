import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { setUser } from "./actions";
import "./App.css";

import Home from "./containers/Home";
import FilmsCatalog from "./containers/FilmsCatalog";
import FilmDescription from "./containers/FilmDescription";
import UserProfile from "./containers/UserProfile";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

class App extends Component {
  componentDidMount() {
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    if (lsUserProfile) {
      const { setUser } = this.props;
      setUser(lsUserProfile);
    }
  }

  render() {
    const { userProfile = null } = this.props.users;
    return (
      <Router>
        <div className="flex-container">
          <div className="flex-column left">
            <Sidebar />
          </div>
          <div className="flex-column right">
            <Header />
            <main className={userProfile ? "authorized" : "guest"}>
              <Switch>
                <Route exact path="/" component={Home} />
                <Route path="/catalog" component={FilmsCatalog} />
                <Route path="/film/:id" component={FilmDescription} />
                <Route path="/user/:id" component={UserProfile} />
              </Switch>
            </main>
            {userProfile && <Footer />}
          </div>
        </div>
      </Router>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
