import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import './styles.scss';

export function ErrorBoundary() {
  const error = useRouteError();

  let message = 'Unknown error';
  if (isRouteErrorResponse(error)) {
    message = error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }

  return (
    <div className="error-container">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p><i>{message}</i></p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
}
