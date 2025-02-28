import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import Navbar from "./component/Navbar";
import Movies from "./component/Movies";
import Watchlist from "./component/Watchlist";
import History from "./component/History";
import Banner from "./component/Banner";
import LoginPage from "./component/LoginPage";
import CreateAccountPage from "./component/CreateAccountPage";
import MovieDetailPage from "./component/MovieDetailPage";
import Support from "./component/Support";
import AdminDashboard from "./component/AdminDashboard";
import { FeedbackProvider } from "./component/FeedbackContext";

function App() {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("userEmail") || "";
  });

  useEffect(() => {
    if (userEmail) {
      const savedWatchlist = localStorage.getItem(`watchlist_${userEmail}`);
      setWatchlist(savedWatchlist ? JSON.parse(savedWatchlist) : []);
    }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem(`watchlist_${userEmail}`, JSON.stringify(watchlist));
    }
  }, [watchlist, userEmail]);

  const handleAddWatchlist = (movieObj) => {
    if (!watchlist.some((movie) => movie.id === movieObj.id)) {
      setWatchlist((prev) => [...prev, movieObj]);
    }
  };

  const handleRemoveFromWatchList = (movieObj) => {
    const updatedWatchlist = watchlist.filter(
      (movie) => movie.id !== movieObj.id
    );
    setWatchlist(updatedWatchlist);

    let deletedHistory =
      JSON.parse(localStorage.getItem("deletedHistory")) || [];
    if (!deletedHistory.some((movie) => movie.id === movieObj.id)) {
      deletedHistory.push(movieObj);
      localStorage.setItem("deletedHistory", JSON.stringify(deletedHistory));
    }
  };

  const handleLogin = (email) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setWatchlist([]);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
  };

  return (
    <FeedbackProvider>
      <Router>
        {isLoggedIn ? (
          <AuthenticatedApp
            watchlist={watchlist}
            handleAddWatchlist={handleAddWatchlist}
            handleRemoveFromWatchList={handleRemoveFromWatchList}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onLogout={handleLogout}
            userEmail={userEmail}
          />
        ) : (
          <UnauthenticatedApp onLogin={handleLogin} />
        )}
      </Router>
    </FeedbackProvider>
  );
}

function AuthenticatedApp({
  watchlist,
  handleAddWatchlist,
  handleRemoveFromWatchList,
  searchQuery,
  setSearchQuery,
  onLogout,
  userEmail,
}) {
  const location = useLocation();
  const hideNavbar = location.pathname === "/admindashboard";

  return (
    <>
      {!hideNavbar && (
        <Navbar
          setSearchQuery={setSearchQuery}
          onLogout={onLogout}
          userEmail={userEmail}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Banner />
              <Movies
                handleAddWatchlist={handleAddWatchlist}
                handleRemoveFromWatchList={handleRemoveFromWatchList}
                watchlist={watchlist}
                searchQuery={searchQuery}
              />
            </>
          }
        />
        <Route
          path="/watchlist"
          element={
            <Watchlist
              watchlist={watchlist}
              handleRemoveFromWatchList={handleRemoveFromWatchList}
            />
          }
        />
        <Route path="/admindashboard" element={<AdminDashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
//hitting wrong

function UnauthenticatedApp({ onLogin }) {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
      <Route path="/create-account" element={<CreateAccountPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
