import fetch from "node-fetch";

export const signIn = (email, password) => {
  return dispatch => {
    fetch("/api/users/signIn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "SIGN_IN",
          payload: result
        });
      });
  };
};

export const signUp = (userName, email, password, confirmedPassword) => {
  return dispatch => {
    fetch("/api/users/signUp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userName, email, password, confirmedPassword })
    })
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "SIGN_UP",
          payload: result
        });
      });
  };
};

export const getUserById = userId => {
  return dispatch => {
    fetch(`/api/users/getUserById/${userId}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_USER_BY_ID",
          payload: result
        });
      });
  };
};

export const getFilmRatingByUserId = (movieId, userId) => {
  return dispatch => {
    fetch(`/api/users/getFilmRatingByUserId/${movieId}/${userId}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILM_RATING_BY_USER_ID",
          payload: result
        });
      });
  };
};

export const getUserRatingsByFilmId = movieId => {
  return dispatch => {
    fetch(`/api/users/getUserRatingsByFilmId/${movieId}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_USER_RATINGS_BY_FILM_ID",
          payload: result
        });
      });
  };
};

export const getFilmsByUserId = userId => {
  return dispatch => {
    fetch(`/api/users/getFilmsByUserId/${userId}`)
      .then(result => result.json())
      .then(result => {
        dispatch({
          type: "GET_FILM_BY_USER_ID",
          payload: result
        });
      });
  };
};

export const setUser = user => {
  return {
    type: "SET_USER",
    payload: user
  };
};

export const clearUsersFields = () => {
  return {
    type: "CLEAR_USERS_FIELDS"
  };
};
