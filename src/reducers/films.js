const films = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR_FILMS_FIELDS":
      return { genres: state.genres };
    case "GET_FILMS":
      return { ...state, filmsById: action.payload };
    case "GET_FEATURED_FILMS":
      return { ...state, featuredFilms: action.payload };
    case "GET_FILM_BY_ID":
      return { ...state, filmById: action.payload };
    case "GET_FILMS_BY_GENRE":
      return { ...state, filmsByGenre: action.payload };
    case "GET_FILMS_BY_TITLE":
      return { ...state, filmsByTitle: action.payload };
    case "GET_GENRES":
      return { ...state, genres: action.payload };
    case "GET_TMDB_KEYS_BY_FILM_IDS":
    case "SET_TMDB_IDS":
      return { ...state, tmdbKeys: action.payload };
    case "GET_POSTERS_BY_TMDB_IDS":
    case "SET_POSTERS":
      return { ...state, posters: action.payload };
    case "GET_RECOMMENDATIONS_POSTERS_BY_TMDB_IDS":
      return { ...state, recommendationPosters: action.payload };
    case "GET_FILM_DETAILS_BY_TMDB_ID":
      return { ...state, details: action.payload };
    case "GET_COLLAB_FILMS_BY_USER_ID":
      return { ...state, collabFilms: action.payload };
    default:
      return state;
  }
};

export default films;
