const users = (state = {}, action) => {
  switch (action.type) {
    case "CLEAR_USERS_FIELDS":
      return {};
    case "SIGN_IN":
    case "SET_USER":
      return { ...state, userProfile: action.payload };
    case "SIGN_UP":
      return { ...state, signUpResult: action.payload };
    case "GET_USER_BY_ID":
      return { ...state, user: action.payload };
    case "GET_FILM_RATING_BY_USER_ID":
      return { ...state, movieRating: action.payload };
    case "GET_USER_RATINGS_BY_FILM_ID":
      return { ...state, userRatings: action.payload };
    case "GET_FILM_BY_USER_ID":
      return { ...state, movies: action.payload };
    default:
      return state;
  }
};

export default users;
