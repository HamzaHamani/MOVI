import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";
import StarRating from "./StartRating";
const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [movies, setMoives] = useState(tempMovieData);
  const [watched, setWatched] = useState(tempWatchedData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  async function Fetch() {
    try {
      setIsLoading(true); //? we make loading true at the begining
      setErrorMessage(""); //? we restart error to initial value after loadijng
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=dfbee097&s=${query}`
      );

      if (!res.ok)
        //! if !res.ok or res.status !==200 we gonna throw new error
        throw new Error("We couldnt fetch the data, CHECK YOUR CONNECTION");

      const data = await res.json();

      if (data.Response === "False") {
        // if user searched for not a movie
        throw new Error("we couldnt find ur movie");
      }
      if (res.ok) setMoives(data.Search); //! if res.ok or res.status ===200 we gotta setMovie to the data (always gotta be at the end of try block)
    } catch (err) {
      //? here we set error message to error that we throwed
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false); //!we make loading false so data can show up after everything
    }

    //? to check if length is small we dont need to render anything that what empty return for
    if (query.length < 3) {
      setMoives([]); // reset movie list
      setErrorMessage(""); //reset error if input smaller than 3
      return; // so function wont execute
    }
  }

  useEffect(() => {
    Fetch();
  }, [query]); //? we call useeffect when querry states update on change

  function onhandleClick(id) {
    setSelectedId((previous) => (previous === id ? null : id));
  }
  function onhandleRemove() {
    setSelectedId(null);
  }
  return (
    <>
      <NavBar>
        {" "}
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        {" "}
        <Box>
          {/*👇 if loading is true we gonna show loader component 👇*/}
          {isLoading && <Loader />}
          {errorMessage && <HandleError message={errorMessage} />}
          {/*👇 if loader is false and also errormessage(empty stringis falsy value) we gonna show movieList component 👇*/}
          {!isLoading && !errorMessage && (
            <MovieList movies={movies} onhandleClick={onhandleClick} />
          )}
          {/*👇 if we have an errorMessage we gonna show error component 👇*/}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDtails
              selectedId={selectedId}
              onhandleRemove={onhandleRemove}
            />
          ) : (
            <>
              {" "}
              <WatchedSummary watched={watched} />
              <WatchedMovieList watched={watched} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children, movies }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">📽️</span>
      <h1>Movi</h1>
    </div>
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ movies, children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function MovieDtails({ selectedId, onhandleRemove }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function getMovieDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=dfbee097&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    getMovieDetails();
  }, [selectedId]);
  return loading ? (
    <div className="center">
      <CircularProgress />
    </div>
  ) : (
    <MovieDetailsData
      movie={movie}
      onhandleRemove={onhandleRemove}
      key={movie.imdbID}
      loading={loading}
    />
  );
}

function MovieDetailsData({ movie, onhandleRemove }) {
  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onhandleRemove}>
          ⬅
        </button>

        <img src={movie.Poster} alt={`Poster of ${movie.Movie}`} />
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <div>
            <p>
              {movie.Released} &bull; {movie.Runtime}{" "}
            </p>
            <p>{movie.Genre}</p>
            <p>
              <span>⭐</span>
              {movie.imdbRating} IMDB rating
            </p>
          </div>
        </div>
      </header>
      <section>
        <StarRating maxRatings={10} size={25} />
        <div className="movie-more-details">
          <p>
            <em>{movie.Plot}</em>
          </p>
          <p>Starring {movie.Actors}</p>
          <p>directed by {movie.Director}</p>
        </div>
      </section>
    </div>
  );
}

function MovieList({ movies, onhandleClick, onhandleRemove }) {
  // const [movies, setMovies] = useState(tempMovieData);
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onhandleClick={onhandleClick} />
      ))}
    </ul>
  );
}
function Movie({ movie, onhandleClick }) {
  return (
    <li onClick={() => onhandleClick(movie.imdbID)}>
      {console.log(movie)}
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <div>
        <h3>{movie.Title}</h3>
        <p>{movie.imdbRating}</p>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched }) {
  return (
    <ul className="list" key={Date.now() + 10}>
      {watched.map((movie) => (
        <WatcheMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
function WatcheMovie({ movie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}

/*  
! handling errors components 
*/

function Loader() {
  return (
    <div className="loader">
      <CircularProgress />
    </div>
  );
}
function HandleError({ message }) {
  // always set error component to ErrorMessage to avoid an issue
  return (
    <div className="center">
      <Alert severity="error" style={{ fontSize: "1.5rem" }}>
        <AlertTitle>Error</AlertTitle>
        {message} <strong>check it out!</strong>
      </Alert>
    </div>
  );
}
