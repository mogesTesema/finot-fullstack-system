# Next Implementation Tasks: Social Authentication Polish

These are the technical debt items and improvements identified during the initial social authentication backend implementation. They should be addressed to ensure production-grade security and full feature integration.

- [ ] **Capture Google Profile Pictures**
  - Create a custom `SocialAccountAdapter` in `core/adapters.py`.
  - Override the `populate_user` method.
  - Automatically extract the `picture` parameter from the Google `extra_data` payload.
  - Save the image URL to the custom `User` or `StudentProfile` model.

- [ ] **Enforce Cross-Domain Cookie Security**
  - Add backend settings in `config/settings.py` for cross-origin security since the frontend (Vercel) and backend (Render) will live on different domains.
  - Required settings:
    - `JWT_AUTH_HTTPONLY = True`
    - `JWT_AUTH_SAMESITE = 'None'`
    - `JWT_AUTH_SECURE = True`

- [ ] **Migrate to Authorization Code Flow (Optional but Recommended)**
  - Transition the React frontend from standard `access_token` fetching to the more secure "Authorization Code" flow.
  - Reconfigure `dj-rest-auth` to automatically exchange the auth code for a token server-to-server.

- [ ] **Validate Production Site ID configurations**
  - Verify `Site ID = 1` matches the exact Render `PUBLIC_DOMAIN` when deployed.
  - Ensure the Render Django Admin visually maps the generated Google `SocialApp` to the active domain so tokens aren't rejected natively.
