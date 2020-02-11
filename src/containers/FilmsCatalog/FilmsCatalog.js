import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { map, isEqual, isEmpty } from "lodash";
import {
  getFilmsByGenre,
  getFilmsByTitle,
  getTmdbKeysByFilmIds,
  getPostersByTmdbIds,
  setTmdbKeys,
  setPosters,
  clearFilmsFields
} from "../../actions";
import Pagination from "../../components/Pagination";
import "./style.css";

class FilmsCatalog extends Component {
  state = {
    genre: this.getQueryVariable("genre"),
    searchedTitle: this.getQueryVariable("search"),
    pageOfItems: []
  };

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

  getTmdbKeys(films) {
    const { getTmdbKeysByFilmIds } = this.props;
    getTmdbKeysByFilmIds(map(films, film => film.id));
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
    const { genre, searchedTitle } = this.state;
    const { getFilmsByGenre, getFilmsByTitle } = this.props;

    if (searchedTitle) {
      getFilmsByTitle(searchedTitle);
    } else if (genre) {
      getFilmsByGenre(genre);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { tmdbKeys } = nextProps.films;

    const prevGenre = this.state.genre;
    const nextGenre = this.getQueryVariable("genre");

    const prevSearchedTitle = this.state.searchedTitle;
    const nextSearchedTitle = this.getQueryVariable("search");

    if (!isEqual(nextSearchedTitle, prevSearchedTitle)) {
      const { getFilmsByTitle, setTmdbKeys, setPosters } = nextProps;
      setTmdbKeys(null);
      setPosters(null);
      this.setState({
        genre: prevGenre,
        searchedTitle: nextSearchedTitle
      });

      return getFilmsByTitle(nextSearchedTitle);
    } else if (!isEqual(nextGenre, prevGenre)) {
      const { getFilmsByGenre, setTmdbKeys, setPosters } = nextProps;
      setTmdbKeys(null);
      setPosters(null);
      this.setState({
        genre: nextGenre,
        searchedTitle: prevSearchedTitle
      });

      return getFilmsByGenre(nextGenre);
    }

    if (tmdbKeys && !isEqual(tmdbKeys, this.props.films.tmdbKeys)) {
      return this.getPosters(tmdbKeys);
    }
  }

  componentWillUnmount() {
    
  }

  filmsByGenreRender(films) {
    const { tmdbKeys, posters } = this.props.films;
    const { genre, pageOfItems } = this.state;

    return (
      <React.Fragment>
        <h3>{genre}</h3>
        <div className="catalog">
          {map(pageOfItems, (film, key) => {
            const tmdbKey = tmdbKeys ? tmdbKeys[film.id] : "";
            const poster = posters[tmdbKey] ? posters[tmdbKey] : "";
            return (
              <Link to={`/film/${film.id}`} key={key}>
                <div
                  className="catalog-img"
                  style={{ background: "url(" + poster + ")" }}
                >
                  <p className="catalog-img-caption">{film.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <Pagination
          items={Object.values(films)}
          onChangePage={this.onChangePage.bind(this)}
        />
      </React.Fragment>
    );
  }

  filmsByTitleRender(films) {
    const { tmdbKeys, posters } = this.props.films;
    const { searchedTitle, pageOfItems } = this.state;

    return (
      <React.Fragment>
        <h3>
          Films by search: <i>"{searchedTitle}"</i>
        </h3>
        <div className="catalog">
          {map(pageOfItems, (film, key) => {
            const tmdbKey = tmdbKeys ? tmdbKeys[film.id] : "";
            const poster = posters[tmdbKey] ? posters[tmdbKey] : "";
            return (
              <Link to={`/film/${film.id}`} key={key}>
                <div
                  className="catalog-img"
                  style={{ background: "url(" + poster + ")" }}
                >
                  <p className="catalog-img-caption">{film.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <Pagination
          items={Object.values(films)}
          onChangePage={this.onChangePage.bind(this)}
        />
      </React.Fragment>
    );
  }

  defaultDataRender(films) {
    const { genre, searchedTitle, pageOfItems } = this.state;
    const title = genre ? (
      <h3>{genre}</h3>
    ) : (
      <h3>
        Films by search: <i>"{searchedTitle}"</i>
      </h3>
    );

    if (isEmpty(films)) {
      return title;
    }

    return (
      <React.Fragment>
        {title}
        <div className="catalog">
          {map(pageOfItems, (film, key) => (
            <Link to={`/film/${film.id}`} key={key}>
              <div className="catalog-img">
                <p className="catalog-img-caption">{film.title}</p>
              </div>
            </Link>
          ))}
        </div>
        <Pagination
          items={Object.values(films)}
          onChangePage={this.onChangePage.bind(this)}
        />
      </React.Fragment>
    );
  }

  render() {
    const { genre, searchedTitle } = this.state;
    const { filmsByTitle, filmsByGenre, posters } = this.props.films;

    if (
      (!genre && !searchedTitle) ||
      (searchedTitle && !filmsByTitle) ||
      (genre && !filmsByGenre)
    ) {
      return (
        <h3>
          <b>Loading...</b>
        </h3>
      );
    }

    if (searchedTitle) {
      if (isEmpty(posters)) {
        return this.defaultDataRender(filmsByTitle);
      }
      return this.filmsByTitleRender(filmsByTitle);
    } else if (genre) {
      if (isEmpty(posters)) {
        return this.defaultDataRender(filmsByGenre);
      }
      return this.filmsByGenreRender(filmsByGenre);
    }
  }
}

const mapStateToProps = state => ({
  films: state.films
});

const mapDispatchToProps = dispatch => ({
  getFilmsByGenre: genre => {
    dispatch(getFilmsByGenre(genre));
  },
  getFilmsByTitle: title => {
    dispatch(getFilmsByTitle(title));
  },
  getTmdbKeysByFilmIds: filmIds => {
    dispatch(getTmdbKeysByFilmIds(filmIds));
  },
  getPostersByTmdbIds: tmdbIds => {
    dispatch(getPostersByTmdbIds(tmdbIds));
  },
  setTmdbKeys: tmdbIds => {
    dispatch(setTmdbKeys(tmdbIds));
  },
  setPosters: posters => {
    dispatch(setPosters(posters));
  },
  clearFilmsFields: () => {
    dispatch(clearFilmsFields());
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(FilmsCatalog);
