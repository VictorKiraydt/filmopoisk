const faker = require("faker");
const { check, validationResult } = require("express-validator");
const path = require("path");
const fs = require("fs");
const papa = require("papaparse");
const { find, last, reduce } = require("lodash");
const config = require("config");

const serverConfig = config.get("server");
const MAX_USERS_COUNT = serverConfig.constants.MAX_USERS_COUNT;

module.exports = users = {};

String.prototype.hashCode = function() {
  var hash = 0,
    i,
    chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = (hash << 2) - hash + chr;
    hash |= 0; // NOTE: Convert to 32bit integer
  }
  return hash;
};

const parseUser = user =>
  !user
    ? user
    : {
        id: user.userId,
        avatar: user.avatar,
        email: user.email,
        userName: user.userName
      };

const parseUserRatings = userRating => ({
  [userRating.userId]: {
    userId: userRating.userId,
    avatar: faker.internet.avatar(),
    email: faker.internet.email(),
    userName: faker.internet.userName(),
    movieId: userRating.movieId,
    rating: userRating.rating,
    comment: faker.lorem.paragraph()
  }
});

const parseUserFilms = userRating => ({
  [userRating.movieId]: {
    movieId: userRating.movieId,
    rating: userRating.rating
  }
});

const addUser = (user, resourceFile) => {
  try {
    const writeStream = fs.createWriteStream(
      path.join(__dirname, resourceFile),
      {
        flags: "a"
      }
    );

    const userProfile = papa.unparse([user], { header: false });

    writeStream.write("\n");
    writeStream.write(userProfile);

    writeStream.close();
  } catch (e) {
    console.log(e);
  }
};

const getParsedData = (parser, onComlete, resourceFile) => {
  const readStream = fs.createReadStream(path.join(__dirname, resourceFile));
  papa.parse(readStream, {
    header: true,
    preview: MAX_USERS_COUNT,
    skipEmptyLines: true,
    complete: result => {
      readStream.close();
      const parsedData = parser(result.data);
      lastUserId = last(result.data).userId;
      onComlete(parsedData, lastUserId);
    }
  });
};

users.initController = router => {
  /// api/users/signIn
  router.post(
    "/signIn",
    [
      check("email", "Incorrect email.").isEmail(),
      check("password", "The min password length is 6 characters.").isLength(
        (this.options = { min: 6 })
      )
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: "Incorrect singing data."
          });
        }

        const { email, password } = req.body;
        const hashedPassword = password.hashCode();

        const parser = users =>
          parseUser(
            find(users, {
              email,
              password: hashedPassword.toString()
            })
          );

        const onComlete = parsedUser =>
          parsedUser
            ? res.status(200).json(parsedUser)
            : res.status(204).json({ message: "This user can not be found." });

        getParsedData(parser, onComlete, serverConfig.resources.users);
      } catch (e) {
        res.status(500).json({ message: "Error: Something went wrong!" });
      }
    }
  );

  /// api/users/signUp
  router.post(
    "/signUp",
    [
      check("userName"),
      check("email", "Incorrect email.").isEmail(),
      check("password", "The min password length is 6 characters.").isLength(
        (this.options = { min: 6 })
      ),
      check("confirmedPassword")
    ],
    async (req, res) => {
      try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({
            errors: errors.array(),
            message: "Incorrect singing data."
          });
        }

        const { userName, email, password, confirmedPassword } = req.body;

        if (password !== confirmedPassword) {
          return res
            .status(400)
            .json({ message: "Incorrect confirmed password." });
        }

        const parser = users =>
          parseUser(
            find(users, {
              email
            })
          );

        const hashedPassword = password.hashCode();

        const onComlete = (parsedUser, lastUserId) => {
          if (parsedUser) {
            return res
              .status(200)
              .json({ message: "This user already exists." });
          }
          addUser(
            {
              id: ++lastUserId,
              avatar: faker.internet.avatar(),
              email,
              userName,
              password: hashedPassword.toString()
            },
            serverConfig.resources.users
          );
          return res
            .status(201)
            .json({ message: "The user has been created successfully." });
        };

        getParsedData(parser, onComlete, serverConfig.resources.users);
      } catch (e) {
        res.status(500).json({ message: "Error: Something went wrong!" });
      }
    }
  );

  /// api/users/getUserById/:userId
  router.get("/getUserById/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const users = {
        userId,
        avatar: faker.internet.avatar(),
        email: faker.internet.email(),
        userName: faker.internet.userName()
      };
      res.json(users);
    } catch (e) {
      res.status(500).json({ message: "Error: Something went wrong!" });
    }
  });

  /// api/users/getFilmRatingByUserId/:movieId/:userId
  router.get("/getFilmRatingByUserId/:movieId/:userId", async (req, res) => {
    try {
      const movieId = req.params.movieId;
      const userId = req.params.userId;
      const parser = ratings => find(ratings, { userId, movieId }).rating;
      const onComlete = rating => res.json(rating);
      getParsedData(parser, onComlete, serverConfig.resources.ratings);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/users/getUserRatingsByFilmId/:movieId
  router.get("/getUserRatingsByFilmId/:movieId", async (req, res) => {
    try {
      const movieId = req.params.movieId;
      const parser = userRatings =>
        reduce(
          userRatings,
          (result, userRating) => {
            if (userRating.movieId === movieId) {
              result = {
                ...result,
                ...parseUserRatings(userRating)
              };
            }
            return result;
          },
          {}
        );
      const onComlete = userRatings => res.json(userRatings);
      getParsedData(parser, onComlete, serverConfig.resources.ratings);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/users/getFilmsByUserId/:userId
  router.get("/getFilmsByUserId/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;

      const parser = userRatings =>
        reduce(
          userRatings,
          (result, userRating) => {
            if (userRating.userId === userId) {
              result = {
                ...result,
                ...parseUserFilms(userRating)
              };
            }
            return result;
          },
          {}
        );

      const onComlete = userRatings => res.json(userRatings);
      getParsedData(parser, onComlete, serverConfig.resources.ratings);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/users/getFilmRatingsByUserId/:userId
  router.get("/getFilmRatingsByUserId/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const parser = userRatings => {
        const films = reduce(
          userRatings,
          (result, userRating) => {
            if (userId === userRating.userId) {
              result = {
                ...result,
                [userRating.movieId]: {
                  movieId: userRating.movieId,
                  rating: userRating.rating
                }
              };
            }
            return result;
          },
          {}
        );
        const similarFilms = reduce(
          userRatings,
          (result, userRating) => {
            forEach(films, film => {
              if (
                film.movieId === userRating.movieId &&
                film.rating === userRating.rating
              ) {
                result.push({
                  movieId: userRating.movieId,
                  userId: userRating.userId,
                  rating: userRating.rating
                });
              }
            });
            return result;
          },
          []
        );
        return similarFilms;
      };
      const onComlete = rating => res.json(rating);
      getParsedData(parser, onComlete, serverConfig.resources.ratings);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/users/getFilmByUserRatings
  router.post("/getSimilarFilmsByUserFilms", async (req, res) => {
    try {
      const { films } = req.body;
      const parser = userRatings =>
        reduce(
          userRatings,
          (result, userRating) => {
            forEach(films, (film, key) => {
              if (
                film.movieId === userRating.movieId &&
                film.rating === userRating.rating
              ) {
                result.push({
                  movieId: userRating.movieId,
                  userId: userRating.userId,
                  rating: userRating.rating
                });
              }
            });
            return result;
          },
          []
        );
      const onComlete = rating => res.json(rating);
      getParsedData(parser, onComlete, serverConfig.resources.ratings);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });
};
