import fetch from "node-fetch";
import { map, reduce } from "lodash";
import posterNotFound from "../images/posterNotFound.svg";

// NOTE: Can be add to .env
const TMDB_API_KEY = "4d1f6403951de145e299130edf97532a";
const TMDB_IMG_URL = "https://image.tmdb.org/t/p/w500";

const getPosters = async tmdbIds => {
  const result = await Promise.all(
    map(
      tmdbIds,
      id =>
        new Promise(async resolve => {
          const result = await fetch(
            `https://api.themoviedb.org/3/movie/${id}/images?api_key=${TMDB_API_KEY}`
          ).then(response => response.json());
          resolve({
            [id]: result.backdrops[0]
              ? `${TMDB_IMG_URL}${result.backdrops[0].file_path}`
              : posterNotFound
          });
        })
    )
  );

  return reduce(result, (posters, poster) => ({ ...posters, ...poster }), {});
};

export const getFilms = () => {
  return dispatch => {
    fetch("/api/films/getFilms")
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILMS",
          payload: result
        });
      });
  };
};

export const getFeaturedFilms = () => {
  return dispatch => {
    fetch("/api/films/getFeaturedFilms")
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FEATURED_FILMS",
          payload: result
        });
      });
  };
};

export const getFilmById = id => {
  return dispatch => {
    fetch(`/api/films/film/${id}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILM_BY_ID",
          payload: result
        });
      });
  };
};

export const getFilmsByGenre = genre => {
  return dispatch => {
    fetch(`/api/films/getFilmsByGenre/${genre}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILMS_BY_GENRE",
          payload: result
        });
      });
  };
};

export const getFilmsByTitle = title => {
  return dispatch => {
    fetch(`/api/films/getFilmsByTitle/${title}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILMS_BY_TITLE",
          payload: result
        });
      });
  };
};

export const getGenres = () => {
  return dispatch => {
    fetch("/api/films/getGenres")
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_GENRES",
          payload: result
        });
      });
  };
};

export const getTmdbKeysByFilmIds = filmIds => {
  return dispatch => {
    fetch("/api/films/getTmdbKeysByFilmIds/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ filmIds })
    })
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_TMDB_KEYS_BY_FILM_IDS",
          payload: result
        });
      });
  };
};

export const getPostersByTmdbIds = tmdbIds => {
  return async dispatch => {
    dispatch({
      type: "GET_POSTERS_BY_TMDB_IDS",
      payload: await getPosters(tmdbIds)
    });
  };
};

export const getRecommendationPostersByTmdbIds = tmdbIds => {
  return async dispatch => {
    dispatch({
      type: "GET_RECOMMENDATIONS_POSTERS_BY_TMDB_IDS",
      payload: await getPosters(tmdbIds)
    });
  };
};

export const getFilmDetailsByTmdbId = tmdbId => {
  return dispatch => {
    fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
    )
      .then(result => result.json())
      .then(result => {
        const { backdrop_path, poster_path } = result;
        const poster1 = poster_path
          ? `${TMDB_IMG_URL}${poster_path}`
          : posterNotFound;
        const poster2 = backdrop_path
          ? `${TMDB_IMG_URL}${backdrop_path}`
          : undefined;
        dispatch({
          type: "GET_FILM_DETAILS_BY_TMDB_ID",
          payload: {
            tmdbId,
            title: result.title,
            poster1,
            poster2,
            genres: result.genres,
            overview: result.overview,
            popularity: result.popularity,
            release_date: result.release_date,
            revenue: result.revenue,
            runtime: result.runtime,
            status: result.status
          }
        });
      });
  };
};

export const collaborativeFilteringByUserId = (
  userId,
  usersCount,
  moviesCount
) => {
  return dispatch => {
    fetch(
      `/api/films/collaborativeFilteringByUserId/${userId}/${usersCount}/${moviesCount}`
    )
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_COLLAB_FILMS_BY_USER_ID",
          payload: result
        });
      });
  };
};

export const setTmdbKeys = tmdbKeys => {
  return {
    type: "SET_TMDB_IDS",
    payload: tmdbKeys
  };
};

export const setPosters = posters => {
  return {
    type: "SET_POSTERS",
    payload: posters
  };
};

export const clearFilmsFields = () => {
  return {
    type: "CLEAR_FILMS_FIELDS"
  };
};
