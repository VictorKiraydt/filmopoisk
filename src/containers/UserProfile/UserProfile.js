import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import {
  getUserById,
  getFilmsByUserId,
  getTmdbKeysByFilmIds,
  getPostersByTmdbIds,
  clearFilmsFields,
  clearUsersFields
} from "../../actions";
import { map, isEqual, isEmpty } from "lodash";
import Pagination from "../../components/Pagination";
import "./style.css";

class UserProfile extends Component {
  state = {
    pageOfItems: []
  };

  getTmdbKeys(movies) {
    const { getTmdbKeysByFilmIds } = this.props;
    getTmdbKeysByFilmIds(map(movies, movie => movie.movieId));
  }

  getPosters(tmdbKeys) {
    const { getPostersByTmdbIds } = this.props;
    getPostersByTmdbIds(Object.values(tmdbKeys));
  }

  onChangePage(pageOfItems) {
    this.getTmdbKeys(pageOfItems);
    this.setState({ pageOfItems });
    this.scrollToTop();
  }

  scrollToTop() {
    document.getElementsByTagName("main")[0].scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  componentDidMount() {
    const { getUserById, getFilmsByUserId, match } = this.props;
    const id = match.params.id;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    getUserById(id);
    getFilmsByUserId(id);

    if (lsUserProfile) {
      this.props.users.userProfile = lsUserProfile;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { tmdbKeys } = nextProps.films;
    const filmId = nextProps.match.params.id;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    if (
      lsUserProfile &&
      !isEqual(lsUserProfile, this.props.users.userProfile)
    ) {
      this.props.users.userProfile = lsUserProfile;
      if (filmId === lsUserProfile.id) {
        this.props.users.user.userName = lsUserProfile.userName;
      }
    }

    if (filmId && !isEqual(filmId, this.props.match.params.id)) {
      const { getUserById, getFilmsByUserId } = this.props;
      getUserById(filmId);
      return getFilmsByUserId(filmId);
    }

    if (tmdbKeys && !isEqual(tmdbKeys, this.props.films.tmdbKeys)) {
      return this.getPosters(Object.values(tmdbKeys));
    }
  }

  componentWillUnmount() {}

  raitingRander(rating) {
    const deficient = 5 - rating;
    let result = [];
    for (let i = 0; i < rating; i++) {
      result.push(<span key={`rating_${i}`} className="rating"></span>);
    }
    for (let i = 0; i < deficient; i++) {
      result.push(<span key={`deficient_${i}`} className="deficient"></span>);
    }
    return result;
  }

  defaultDataRender() {
    const { user, movies, userProfile } = this.props.users;
    const { pageOfItems } = this.state;
    let userName = user.userName;
    if (userProfile && userProfile.id === this.props.match.params.id) {
      userName = userProfile.userName;
    }

    return (
      <React.Fragment>
        <div className="user-data">
          <h3>User info</h3>
          <div className="avatar">
            <img alt={user.userId} src={user.avatar} />
          </div>
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p>
              <i>{user.email}</i>
            </p>
          </div>
        </div>
        <div className="user-films">
          <h3>User rated films</h3>
          {map(pageOfItems, (movie, key) => (
            <div className="film" key={key}>
              <Link to={`/film/${movie.movieId}`}>
                <div className="film-poster"></div>
              </Link>
              <div className="film-info">
                <p>
                  <Link to={`/film/${movie.movieId}`}>
                    <b>FILM ID: {movie.movieId}</b>
                  </Link>
                </p>
                <div className="popularity">
                  {this.raitingRander(parseInt(movie.rating))}
                </div>
              </div>
            </div>
          ))}
          <Pagination
            items={Object.values(movies)}
            onChangePage={this.onChangePage.bind(this)}
          />
        </div>
      </React.Fragment>
    );
  }

  fullDataRander() {
    const { user, movies, userProfile } = this.props.users;
    const { tmdbKeys, posters } = this.props.films;
    const { pageOfItems } = this.state;
    let userName = user.userName;
    if (userProfile && userProfile.id === this.props.match.params.id) {
      userName = userProfile.userName;
    }

    return (
      <React.Fragment>
        <div className="user-data">
          <h3>User info</h3>
          <div className="avatar">
            <img alt={user.userId} src={user.avatar} />
          </div>
          <div className="user-info">
            <p className="user-name">{userName}</p>
            <p>
              <i>{user.email}</i>
            </p>
          </div>
        </div>
        <div className="user-films">
          <h3>User rated films</h3>
          {map(pageOfItems, (movie, key) => (
            <div className="film" key={key}>
              <Link to={`/film/${movie.movieId}`}>
                <div className="film-poster">
                  <img
                    alt={movie.movieId}
                    src={posters[tmdbKeys[movie.movieId]]}
                  />
                </div>
              </Link>
              <div className="film-info">
                <p>
                  <Link to={`/film/${movie.movieId}`}>
                    <b>TMDB ID: {tmdbKeys[movie.movieId]}</b>
                  </Link>
                </p>
                <div className="popularity">
                  {this.raitingRander(parseInt(movie.rating))}
                </div>
              </div>
            </div>
          ))}
          <Pagination
            items={Object.values(movies)}
            onChangePage={this.onChangePage.bind(this)}
          />
        </div>
      </React.Fragment>
    );
  }

  render() {
    const { user, movies } = this.props.users;
    const { posters } = this.props.films;

    if (!user || !movies) {
      return (
        <h3>
          <b>Loading...</b>
        </h3>
      );
    }

    if (!isEmpty(posters)) {
      return this.fullDataRander();
    }

    return this.defaultDataRender();
  }
}

const mapStateToProps = state => ({
  films: state.films,
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  getUserById: userId => {
    dispatch(getUserById(userId));
  },
  getFilmsByUserId: userId => {
    dispatch(getFilmsByUserId(userId));
  },
  getTmdbKeysByFilmIds: filmIds => {
    dispatch(getTmdbKeysByFilmIds(filmIds));
  },
  getPostersByTmdbIds: tmdbIds => {
    dispatch(getPostersByTmdbIds(tmdbIds));
  },
  clearFilmsFields: () => {
    dispatch(clearFilmsFields());
  },
  clearUsersFields: () => {
    dispatch(clearUsersFields());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(UserProfile);
