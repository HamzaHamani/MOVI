import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Alert, AlertTitle, CircularProgress } from "@mui/material";
import StarRating from "./StartRating";
import logoS from "./logoS.png";
//!! flex start fo fix box 2 highet get longer with box1
//! add , button add to watched movie functionality
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
  const [movies, setMoives] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  //!local stroage
  //taking values from local storage and adding it to StoredValue
  const storedValue = JSON.parse(localStorage.getItem("watched")) || [];
  // we add storedvalue fo localStorage to watched to display it when we just render to website
  const [watched, setWatched] = useState(storedValue); // state when we store data that we recieve from api or user and the one we display

  useEffect(() => {
    // getting data from watched StateArray and storing it in localStorage
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]); //when ever watched change uef gonna reRender so each time Watched tzadt liha chi haja ra 3tzad ta flocal storafe

  //-----------

  const watchedLength = watched.length;
  const moviesLength = movies.length;

  useEffect(() => {
    const controller = new AbortController(); //abort for ignoring racing condition for fetching
    async function Fetch() {
      try {
        setIsLoading(true); //? we make loading true at the begining
        setErrorMessage(""); //? we restart error to initial value after loadijng
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=dfbee097&s=${query}`,
          { signal: controller.signal } // ignore racing condition for fetching
        );

        if (!res.ok)
          //! if !res.ok or res.status !==200 we gonna throw new error
          throw new Error("We couldnt fetch the data, CHECK YOUR CONNECTION");

        const data = await res.json();

        if (data.Response === "False") {
          // if user searched for not a movie
          throw new Error("we couldnt find ur movie");
        }
        setMoives(data.Search); //! (always gotta be at the end of try block)
      } catch (err) {
        // this to ignore abort for racing fetching do if statemtn only when having abortcontroler
        if (err.name != "AbortError") {
          //? here we set error message to error that we throwed
          setErrorMessage(err.message);
        }
      } finally {
        setIsLoading(false); //!we make loading false so data can show up after everything
      }
    }
    //? to check if length is small we dont need to render anything that what empty return for
    // should ne fo9 lasync function fch ghadi nkaliwha to stop calliing Fetch() with empty return if condition true
    if (query.length < 3) {
      setMoives([]); // reset movie list
      setErrorMessage(""); //reset error if input smaller than 3
      return; // so function wont execute
    }
    Fetch();
    return function () {
      controller.abort();
    };
  }, [query]); //? we call useeffect when querry states update on change

  function onhandleClick(id) {
    setSelectedId((previous) => (previous === id ? null : id));
  }
  function onhandleRemove() {
    setSelectedId(null);
  }
  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function hadleDeleteWatched(Title) {
    setWatched((m) => m.filter((movie) => movie.Title !== Title));
  }
  console.log(watched);
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
            <MovieList
              movies={movies}
              onhandleClick={onhandleClick}
              moviesLength={moviesLength}
            />
          )}
          {/*👇 if we have an errorMessage we gonna show error component 👇*/}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDtails
              onAddWatched={handleAddWatched}
              selectedId={selectedId}
              onhandleRemove={onhandleRemove}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatch={hadleDeleteWatched}
                watchedLength={watchedLength}
              />
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
      <span role="img"> {/* <img src={logoS} alt={"logo img"} />{" "} */}</span>
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
  return <div className="box">{children}</div>;
}

function MovieDtails({ selectedId, onhandleRemove, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    async function getMovieDetails() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://www.omdbapi.com/?apikey=dfbee097&i=${selectedId}`
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
      watched={watched}
      selectedId={selectedId}
      movie={movie}
      onAddWatched={onAddWatched}
      onhandleRemove={onhandleRemove}
      key={movie.imdbID}
      loading={loading}
    />
  );
}

function MovieDetailsData({
  movie,
  onhandleRemove,
  onAddWatched,
  selectedId,
  watched,
}) {
  const [rating, setUserRating] = useState("");
  const isWatched = watched.map((movies) => movies.Title).includes(movie.Title);

  function makeRatingStar(r) {
    setUserRating(r);
  }

  function handleAdd() {
    if (rating <= 0) {
      return;
    }
    const newWatchedMovie = {
      imdbId: selectedId,
      imdbRating: Number(movie.imdbRating),
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      runtime: Number(movie.Runtime.split(" ").at(0)),
      userRating: rating,
    };

    onAddWatched(newWatchedMovie);
    onhandleRemove();
  }
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
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                maxRatings={10}
                size={25}
                makeRatingStar={makeRatingStar}
              />
              {rating != 0 ? (
                <button className="btn-add" onClick={handleAdd}>
                  Add to list
                </button>
              ) : (
                ""
              )}
            </>
          ) : (
            <p>u rated this movie already</p>
          )}
        </div>
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

function MovieList({ movies, onhandleClick, onhandleRemove, moviesLength }) {
  return (
    <>
      <ul className="list list-movies">
        {movies?.map((movie) => (
          <Movie
            movie={movie}
            key={movie.imdbID}
            onhandleClick={onhandleClick}
          />
        ))}
      </ul>
      <div
        className="scroll-down-dude2 "
        style={{ opacity: moviesLength > 0 ? 0 : 0 }}
      ></div>
    </>
  );
}
function Movie({ movie, onhandleClick }) {
  return (
    <li onClick={() => onhandleClick(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <div>
        <h3>{movie.Title}</h3>
        <p>Type: {movie.Type}</p>
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
          <span>{+avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{+avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeleteWatch, watchedLength }) {
  return (
    <>
      <ul className="list list-watched" key={Date.now() + 10}>
        {watched.map((movie) => (
          <WatcheMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatch={onDeleteWatch}
          />
        ))}
      </ul>
      <div
        className="scroll-down-dude"
        style={{ opacity: watchedLength > 0 ? 0 : 0 }}
      ></div>
    </>
  );
}
function WatcheMovie({ movie, onDeleteWatch }) {
  return (
    <>
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
          <button
            className="btn-delete"
            onClick={() => onDeleteWatch(movie.Title)}
          >
            X
          </button>
        </div>
      </li>
    </>
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
