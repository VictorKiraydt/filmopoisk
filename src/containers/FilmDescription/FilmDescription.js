import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEqual, isEmpty } from "lodash";
import {
  getFilmById,
  getFilmDetailsByTmdbId,
  getTmdbKeysByFilmIds,
  getFilmRatingByUserId,
  getUserRatingsByFilmId,
  clearFilmsFields,
  clearUsersFields,
  setUser
} from "../../actions";
import "./style.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

class FilmDescription extends Component {
  state = {};

  responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 1,
      slidesToSlide: 1
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
      slidesToSlide: 1
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0
  });

  componentDidMount() {
    const {
      getFilmById,
      getTmdbKeysByFilmIds,
      getFilmRatingByUserId,
      getUserRatingsByFilmId,
      setUser,
      match
    } = this.props;
    const id = match.params.id;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    getFilmById(id);
    getTmdbKeysByFilmIds([id]);
    getUserRatingsByFilmId(id);

    if (lsUserProfile) {
      setUser(lsUserProfile);
      getFilmRatingByUserId(lsUserProfile.id, id);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { tmdbKeys } = nextProps.films;
    const lsUserProfile = localStorage.getItem("userProfile")
      ? JSON.parse(localStorage.getItem("userProfile"))
      : null;

    if (!isEqual(nextProps.match.params.id, this.props.match.params.id)) {
      window.location.reload();
    }

    if (tmdbKeys && !isEqual(tmdbKeys, this.props.films.tmdbKeys)) {
      const { match, getFilmDetailsByTmdbId } = this.props;
      const id = match.params.id;
      return getFilmDetailsByTmdbId(tmdbKeys[id]);
    }
    if (
      lsUserProfile &&
      !isEqual(lsUserProfile, this.props.users.userProfile)
    ) {
      const { match, getFilmRatingByUserId, setUser } = nextProps;
      const id = match.params.id;
      setUser(lsUserProfile);
      return getFilmRatingByUserId(lsUserProfile.id, id);
    }
  }

  componentWillUnmount() {}

  carouselRender(data) {
    return (
      <Carousel
        swipeable={false}
        draggable={false}
        showDots={false}
        responsive={this.responsive}
        infinite={false}
        autoPlay={false}
        keyBoardControl={true}
        customTransition="all 0.5s"
        transitionDuration={1000}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        deviceType={this.props.deviceType}
        // dotListClass="carousel-dots"
        itemClass="carousel-items"
      >
        {data}
      </Carousel>
    );
  }

  filmDetailsTableRender() {
    const { details } = this.props.films;
    return (
      <table>
        <tbody>
          <tr>
            <td>TMDB ID</td>
            <td>{details.tmdbId}</td>
          </tr>
          <tr>
            <td>Genres</td>
            <td>{map(details.genres, (genre, key) => `${genre.name} `)}</td>
          </tr>
          <tr>
            <td>Description</td>
            <td>{details.overview}</td>
          </tr>
          <tr>
            <td>Release date</td>
            <td>{new Date(details.release_date).toDateString()}</td>
          </tr>
          <tr>
            <td>Worldwide Gross</td>
            <td>{this.formatter.format(details.revenue)}</td>
          </tr>
          <tr>
            <td>Runtime</td>
            <td>{`${details.runtime} min`}</td>
          </tr>
          <tr>
            <td>Movie status</td>
            <td>{details.status}</td>
          </tr>
        </tbody>
      </table>
    );
  }

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

  usersReviewRender() {
    const { userRatings } = this.props.users;

    return map(userRatings, (userRating, key) => {
      return (
        <div className="review" key={key}>
          <div className="avatar">
            <Link to={`/user/${userRating.userId}`}>
              <img alt={userRating.userId} src={userRating.avatar} />
            </Link>
          </div>
          <div className="user-info">
            <p className="user-name">
              <Link to={`/user/${userRating.userId}`}>
                {userRating.userName}
              </Link>
            </p>
            <p>
              <i>{userRating.email}</i>
            </p>
            <div className="popularity">
              {this.raitingRander(parseInt(userRating.rating))}
            </div>
            <p>{userRating.comment}</p>
          </div>
        </div>
      );
    });
  }

  defaultDataRender() {
    const { films, match } = this.props;
    const { movieRating } = this.props.users;
    const rating = movieRating ? parseInt(movieRating) : 0;
    const id = match.params.id;

    return (
      <div className="details">
        <div className="posters">
          <div className="popularity">{this.raitingRander(rating)}</div>
        </div>
        <div className="description">
          <h3>{films.filmById[id].title}</h3>
        </div>
        <div className="users-review">
          <h3>User reviews</h3>
          {this.usersReviewRender()}
        </div>
      </div>
    );
  }

  fullDataRender() {
    const { details } = this.props.films;
    const { movieRating } = this.props.users;
    const rating = movieRating ? parseInt(movieRating) : 0;
    const posters = details.poster2
      ? [
          <img alt={details.id} src={details.poster1} key="1" />,
          <img
            alt={details.id}
            src={details.poster2}
            key="2"
            className="horizontal-poster"
          />
        ]
      : [<img alt={details.id} src={details.poster1} key="1" />];

    return (
      <div className="details">
        <div className="posters">
          {this.carouselRender(posters)}
          <div className="popularity">{this.raitingRander(rating)}</div>
        </div>
        <div className="description">
          <h3>{details.title}</h3>
          {this.filmDetailsTableRender()}
        </div>
        <div className="users-review">
          <h3>User reviews</h3>
          {this.usersReviewRender()}
        </div>
      </div>
    );
  }

  render() {
    const { filmById, details } = this.props.films;

    if (isEmpty(filmById)) {
      return (
        <h3>
          <b>Loading...</b>
        </h3>
      );
    }

    if (details) {
      return this.fullDataRender();
    }

    return this.defaultDataRender();
  }
}

const mapStateToProps = state => ({
  films: state.films,
  users: state.users
});

const mapDispatchToProps = dispatch => ({
  getFilmById: id => {
    dispatch(getFilmById(id));
  },
  getTmdbKeysByFilmIds: filmIds => {
    dispatch(getTmdbKeysByFilmIds(filmIds));
  },
  getFilmDetailsByTmdbId: tmdbId => {
    dispatch(getFilmDetailsByTmdbId(tmdbId));
  },
  getFilmRatingByUserId: (movieId, userId) => {
    dispatch(getFilmRatingByUserId(movieId, userId));
  },
  getUserRatingsByFilmId: movieId => {
    dispatch(getUserRatingsByFilmId(movieId));
  },
  setUser: user => {
    dispatch(setUser(user));
  },
  clearFilmsFields: () => {
    dispatch(clearFilmsFields());
  },
  clearUsersFields: () => {
    dispatch(clearUsersFields());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilmDescription);
