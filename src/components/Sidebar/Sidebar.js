import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { map } from "lodash";
import logo from "../../logo.svg";
import "./style.css";
import { getGenres } from "../../actions";

class Sidebar extends Component {
  state = {};

  getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      if (decodeURIComponent(pair[0]) === variable) {
        return decodeURIComponent(pair[1]);
      }
    }
  }

  componentDidMount() {
    const { getGenres } = this.props;
    getGenres();
  }

  redirectToHome() {
    this.context.router.history.push(`/`);
  }

  render() {
    const { films } = this.props;
    const genreFromUrl = this.getQueryVariable("genre");

    return (
      <aside>
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="logo.svg" />
            <h1 className="title">FilmoPoisk</h1>
          </Link>
        </div>
        <p className="list-title">Genres:</p>
        <nav>
          <ul>
            {map(films.genres, (genre, key) => (
              <li
                className={
                  genreFromUrl && genreFromUrl === genre ? "active" : ""
                }
                key={key}
              >
                <Link
                  to={{
                    pathname: "/catalog",
                    search: `genre=${genre}`,
                    state: { genre }
                  }}
                >
                  {genre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }
}

const mapStateToProps = state => ({
  films: state.films
});

const mapDispatchToProps = dispatch => ({
  getGenres: () => {
    dispatch(getGenres());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
