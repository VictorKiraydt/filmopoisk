import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEqual, isEmpty } from "lodash";
import {
  getFeaturedFilms,
  getTmdbKeysByFilmIds,
  getPostersByTmdbIds
} from "../../actions";
import "./style.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

class Home extends Component {
  state = {};

  responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
      slidesToSlide: 2
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
      slidesToSlide: 2
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
      slidesToSlide: 1
    }
  };

  componentDidMount() {
    const { getFeaturedFilms } = this.props;
    getFeaturedFilms();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { featuredFilms, tmdbKeys } = nextProps.films;

    if (!isEqual(featuredFilms, this.props.films.featuredFilms)) {
      return this.getTmdbKeys(featuredFilms);
    }
    if (!isEqual(tmdbKeys, this.props.films.tmdbKeys)) {
      return this.getPosters(tmdbKeys);
    }
  }

  componentWillUnmount() {
    // NOTE: It's just a draft for testing! There are also clear methods in actions.
    this.props.films.featuredFilms = null;
    this.props.films.tmdbKeys = null;
    this.props.films.posters = null;
  }

  getTmdbKeys(films) {
    const { getTmdbKeysByFilmIds } = this.props;
    let filmIds = [];
    map(films, film => filmIds.push(film.id));
    getTmdbKeysByFilmIds(filmIds);
  }

  getPosters(tmdbKeys) {
    const { getPostersByTmdbIds } = this.props;
    getPostersByTmdbIds(Object.values(tmdbKeys));
  }

  carouselRender(data) {
    return (
      <Carousel
        swipeable={false}
        draggable={false}
        showDots={true}
        responsive={this.responsive}
        infinite={true}
        autoPlay={this.props.deviceType !== "mobile" ? true : false}
        autoPlaySpeed={3000}
        keyBoardControl={true}
        customTransition="all 0.5s"
        transitionDuration={1000}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        deviceType={this.props.deviceType}
        itemClass="carousel-items"
      >
        {data}
      </Carousel>
    );
  }

  defaultDataRender() {
    const { featuredFilms } = this.props.films;

    return (
      <React.Fragment>
        <h3>Featured</h3>
        {this.carouselRender(
          map(featuredFilms, (film, key) => {
            return (
              <Link to={`/film/${film.id}`} key={key}>
                <div className="carousel-img">
                  <p className="carousel-img-caption">{film.title}</p>
                </div>
              </Link>
            );
          })
        )}
      </React.Fragment>
    );
  }

  fullDataRender() {
    const { featuredFilms, tmdbKeys, posters } = this.props.films;

    return (
      <React.Fragment>
        <h3>Featured</h3>
        {this.carouselRender(
          map(featuredFilms, (film, key) => {
            const tmdbKey = tmdbKeys[film.id];
            const poster = posters[tmdbKey] ? posters[tmdbKey] : "";
            return (
              <Link to={`/film/${film.id}`} key={key}>
                <div
                  className="carousel-img"
                  style={{ background: "url(" + poster + ")" }}
                >
                  <p className="carousel-img-caption">{film.title}</p>
                </div>
              </Link>
            );
          })
        )}
      </React.Fragment>
    );
  }

  render() {
    const { films } = this.props;
    if (isEmpty(films.featuredFilms)) {
      return (
        <h3>
          <b>Loading...</b>
        </h3>
      );
    }

    const { posters } = this.props.films;
    if (isEmpty(posters)) {
      return this.defaultDataRender();
    }

    return this.fullDataRender();
  }
}

const mapStateToProps = state => ({
  films: state.films
});

const mapDispatchToProps = dispatch => ({
  getFeaturedFilms: () => {
    dispatch(getFeaturedFilms());
  },
  getTmdbKeysByFilmIds: filmIds => {
    dispatch(getTmdbKeysByFilmIds(filmIds));
  },
  getPostersByTmdbIds: tmdbIds => {
    dispatch(getPostersByTmdbIds(tmdbIds));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
