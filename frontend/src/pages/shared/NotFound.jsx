import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="panel max-w-md p-8 text-center">
        <p className="label">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Page not found</h1>
        <Link className="mt-6 inline-block" to="/profile">
          <Button>Go to profile</Button>
        </Link>
      </div>
    </main>
  );
}
