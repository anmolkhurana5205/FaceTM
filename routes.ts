/**
 * An array of routes that are accessible to the public.
 * These rotues do not require authentication.
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification"];

/**
 * An array of routes that are used for authentication.
 * These rotues will redirect logged in user to /settings.
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * The prefix for API authentication routes.
 * Routes that start with the prefix are user for API authentication purposes.
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * The defaut redirect path after logging in.
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/settings";
