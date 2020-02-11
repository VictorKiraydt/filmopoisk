const path = require("path");
const fs = require("fs");
const papa = require("papaparse");
const { find, reduce, map } = require("lodash");
const config = require("config");

const { PythonShell } = require("python-shell");

const serverConfig = config.get("server");
const MAX_FILMS_COUNT = serverConfig.constants.MAX_FILMS_COUNT;

module.exports = films = {};

const parseMovie = movie => {
  return {
    [movie.movieId]: {
      id: movie.movieId,
      tmdbId: movie.tmdbId,
      title: movie.title,
      genres: movie.genres.split("|")
    }
  };
};

const getParsedData = (parser, onComlete, resourceFile) => {
  const readStream = fs.createReadStream(path.join(__dirname, resourceFile));
  papa.parse(readStream, {
    header: true,
    preview: MAX_FILMS_COUNT,
    skipEmptyLines: true,
    complete: result => {
      readStream.close();
      const parsedData = parser(result.data);
      onComlete(parsedData);
    }
  });
};

films.initController = router => {
  /// api/films/getFilms
  router.get("/getFilms", async (req, res) => {
    try {
      const parser = movies =>
        reduce(
          movies,
          (result, movie) => {
            result = {
              ...result,
              ...parseMovie(movie)
            };
            return result;
          },
          {}
        );
      const onComlete = parsedMovies => res.json(parsedMovies);
      getParsedData(parser, onComlete, serverConfig.resources.movies);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/getFeaturedFilms
  router.get("/getFeaturedFilms", async (req, res) => {
    try {
      const parser = movies =>
        reduce(
          movies,
          (result, movie) => {
            // NOTE: Every 42'd film is featured
            if (movie.movieId % 42 === 0) {
              result = {
                ...result,
                ...parseMovie(movie)
              };
            }
            return result;
          },
          {}
        );
      const onComlete = parsedMovies => res.json(parsedMovies);
      getParsedData(parser, onComlete, serverConfig.resources.movies);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/film:id
  router.get("/film/:id", async (req, res) => {
    try {
      const searchedId = req.params.id;
      const parser = movies =>
        parseMovie(find(movies, movie => movie.movieId === searchedId));
      const onComlete = parsedMovie => res.json(parsedMovie);
      getParsedData(parser, onComlete, serverConfig.resources.movies);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/getFilmsByGenre
  router.get("/getFilmsByGenre/:genre", async (req, res) => {
    try {
      const searchedGenre = req.params.genre;
      const parser = movies =>
        reduce(
          movies,
          (result, movie) => {
            if (movie.genres.includes(searchedGenre)) {
              result = {
                ...result,
                ...parseMovie(movie)
              };
            }
            return result;
          },
          {}
        );
      const onComlete = parsedMovies => res.json(parsedMovies);
      getParsedData(parser, onComlete, serverConfig.resources.movies);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/getFilmsByTitle
  router.get("/getFilmsByTitle/:title", async (req, res) => {
    try {
      const searchedTitle = req.params.title.toLowerCase();
      const parser = movies =>
        reduce(
          movies,
          (result, movie) => {
            if (movie.title.toLowerCase().includes(searchedTitle)) {
              result = {
                ...result,
                ...parseMovie(movie)
              };
            }
            return result;
          },
          {}
        );
      const onComlete = parsedMovies => res.json(parsedMovies);
      getParsedData(parser, onComlete, serverConfig.resources.movies);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/getGenres
  router.get("/getGenres", async (req, res) => {
    try {
      const genres = config.get("server.filmGenres");
      res.json(genres);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  /// api/films/getTmdbKeysByFilmIds
  router.post("/getTmdbKeysByFilmIds", async (req, res) => {
    try {
      const { filmIds } = req.body;
      const parser = links =>
        reduce(
          filmIds,
          (result, filmId) => {
            result = {
              ...result,
              [filmId]: find(links, { movieId: filmId.toString() }).tmdbId
            };
            return result;
          },
          {}
        );

      const onComlete = tmdbIds => res.json(tmdbIds);
      getParsedData(parser, onComlete, serverConfig.resources.links);
    } catch (e) {
      res.status(500).json({ message: `Error: ${e.message}` });
    }
  });

  ///api/films/collaborativeFilteringByUserId/:userId/:usersCount/:moviesCount
  router.get(
    "/collaborativeFilteringByUserId/:userId/:usersCount/:moviesCount",
    async (req, res) => {
      try {
        const userId = req.params.userId;
        const usersCount = req.params.usersCount;
        const moviesCount = req.params.moviesCount;

        const options = {
          mode: "json",
          scriptPath: path.join(__dirname, "../../python"),
          args: [userId, usersCount, moviesCount]
        };
        const file = "collaborativeFiltering.py";

        PythonShell.run(file, options, function(err, data) {
          if (err) {
            throw err;
          }

          const filmIds = map(data, data => data.movieId.trim());
          const parser = links =>
            reduce(
              filmIds,
              (result, filmId) => {
                result = {
                  ...result,
                  [filmId]: find(links, { movieId: filmId }).tmdbId
                };
                return result;
              },
              {}
            );
          const onComlete = tmdbIds => {
            return res.json(tmdbIds);
          };
          getParsedData(parser, onComlete, serverConfig.resources.links);
        });
      } catch (e) {
        res.status(500).json({ message: `Error: ${e.message}` });
      }
    }
  );
};
