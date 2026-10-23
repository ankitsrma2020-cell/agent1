# agent1 reviewer notes

## Architecture

This is a Vite React 19 frontend with a separate TypeScript/Express backend under `backend/`. The frontend uses Redux Toolkit/Saga-oriented state management and manually selected page components, while the backend exposes `/api/auth` endpoints backed by MongoDB/Mongoose. Authentication is JWT-based, with bcrypt password hashing and middleware-protected account operations.

## Conventions

- Backend TypeScript uses strict ES modules and explicit `.js` import extensions, as in `backend/src/server.ts` and `backend/src/routes/authRoutes.ts`; preserve this style for imports.
- Backend routes return JSON envelopes containing `success`, plus `message`, `user`, or collection fields. Follow the status/message patterns in `backend/src/routes/authRoutes.ts` rather than throwing raw errors to clients.
- Authenticated handlers use `AuthenticatedRequest` from `backend/src/middleware/authMiddleware.ts`; the middleware stores the verified JWT `userId` on `request.userId`.
- Passwords must be hashed with bcrypt (`saltRounds = 10`) and never returned in API responses. Existing queries use `.select("-password")` or explicit field selection in `backend/src/routes/authRoutes.ts`.
- Email input is normalized with `trim().toLowerCase()` during signup, login, and profile updates. User names are trimmed before persistence.
- Mongoose models live in `backend/src/models`; `User` uses timestamps and schema-level normalization/validation in `backend/src/models/User.ts`.
- Request input is checked at route boundaries with `typeof` guards and explicit validation. Query sorting is allowlisted by `userSortFields` in `backend/src/routes/authRoutes.ts`; do not interpolate arbitrary sort fields.
- Frontend page selection currently follows pathname checks in `src/App.tsx`; navigation uses ordinary anchors such as those in `src/components/DashboardNavbar.tsx`.
- Frontend components use typed Redux hooks (`AppDispatch`, `RootState`) and import action/request types from the Redux folders, as shown in `src/components/AccountDialogs.tsx`.
- Profile images are handled as validated base64 data URLs. Both `src/components/AccountDialogs.tsx` and `backend/src/routes/authRoutes.ts` restrict images to JPEG, PNG, or WebP and 2 MB.

## Intentional non-standard choices

- There is no client-side router: `src/App.tsx` directly maps `window.location.pathname` to page components, and `DashboardNavbar.tsx` uses `<a href>` navigation. Do not flag this as a missing React Router integration unless routing behavior is being changed.
- The backend explicitly overrides DNS servers with `dns.setServers(["8.8.8.8", "1.1.1.1"])` in `backend/src/server.ts`; treat this as an existing deployment/runtime choice, not accidental unused code.
- Redux slices are expected to grow under `src/redux/slices`; `src/redux/slices/README.md` documents this structure.

## Watch out for

- Never expose `password` or persist plaintext passwords; check all new user queries and response objects against the filtering patterns in `backend/src/routes/authRoutes.ts`.
- Protected routes must use `authenticateToken`, and destructive account operations must verify ownership (`request.userId !== request.params.id` pattern).
- Keep JWT configuration failure explicit: `JWT_SECRET` is checked before signing or verifying tokens. Do not add fallback secrets.
- Preserve payload limits: Express accepts 3 MB globally (`backend/src/server.ts`), while profile images are limited to 2 MB after base64 validation.
- Validate MongoDB IDs with `Types.ObjectId.isValid` before querying routes such as `DELETE /users/:id`.
- Avoid introducing arbitrary query-driven sort fields or unsanitized response data; sorting is intentionally restricted to `name`, `email`, and `createdAt`.
- Keep frontend and backend validation aligned for profile images and email/name fields; mismatches can make valid UI submissions fail at the API boundary.