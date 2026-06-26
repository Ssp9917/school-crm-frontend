import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "../../routes/routepath";
import "./styles.scss";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="error-code">404</div>

        <img
          src="https://media.giphy.com/media/3o7aCSPqXE5C6T8tBC/giphy.gif"
          alt="Lost in the gym"
          className="not-found-gif"
        />

        <h2 className="not-found-title">Looks like this page skipped leg day!</h2>
        <p className="not-found-subtitle">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <button className="go-home-btn" onClick={() => navigate(Home)}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
