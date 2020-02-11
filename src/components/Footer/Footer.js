import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEqual } from "lodash";
import {
  collaborativeFilteringByUserId,
  getRecommendationPostersByTmdbIds,
  clearFilmsFields,
  setUser
} from "../../actions";
import "./style.css";

class Footer extends Component {
  state = {};

  getPosters(tmdbKeys) {
    const { getPostersByTmdbIds } = this.props;
    getPostersByTmdbIds(tmdbKeys);
  }

  componentDidMount() {
    const {
      collaborativeFilteringByUserId,
      users: { userProfile }
    } = this.props;

    collaborativeFilteringByUserId(userProfile.id, 5, 5);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { collabFilms } = nextProps.films;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    if (
      lsUserProfile &&
      !isEqual(lsUserProfile, this.props.users.userProfile)
    ) {
      const { collaborativeFilteringByUserId, setUser } = nextProps;
      setUser(lsUserProfile);
      return collaborativeFilteringByUserId(lsUserProfile.id, 5, 5);
    }

    if (collabFilms && !isEqual(collabFilms, this.props.films.collabFilms)) {
      const { getRecommendationPostersByTmdbIds } = nextProps;
      return getRecommendationPostersByTmdbIds(Object.values(collabFilms));
    }
  }

  componentWillUnmount() {
    const { clearFilmsFields } = this.props;
    clearFilmsFields();
  }

  render() {
    const { collabFilms, recommendationPosters } = this.props.films;

    if (recommendationPosters) {
      return (
        <footer>
          <div className="recommended-films">
            <p>Recommended for You</p>
            {map(collabFilms, (tmdbId, filmId) => (
              <div key={tmdbId}>
                <Link to={`/film/${filmId}`}>
                  <img alt={tmdbId} src={recommendationPosters[tmdbId]} />
                </Link>
              </div>
            ))}
          </div>
        </footer>
      );
    }

    return (
      <footer>
        <p>Recommended for You</p>
      </footer>
    );
  }
}

const mapStateToProps = state => ({
  films: state.films,
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  collaborativeFilteringByUserId: (userId, usersCount, moviesCount) => {
    dispatch(collaborativeFilteringByUserId(userId, usersCount, moviesCount));
  },
  getRecommendationPostersByTmdbIds: tmdbIds => {
    dispatch(getRecommendationPostersByTmdbIds(tmdbIds));
  },
  setUser: user => {
    dispatch(setUser(user));
  },
  clearFilmsFields: () => {
    dispatch(clearFilmsFields());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
