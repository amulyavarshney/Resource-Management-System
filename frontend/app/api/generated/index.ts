/**
 * Convenient aliases over the generated OpenAPI schema.
 *
 * Regenerate with: `npm run generate:api` (from frontend/, backend venv active).
 * Do not edit `openapi.ts` by hand.
 */
import type { components, paths } from "./openapi";

export type { components, paths };

export type Schemas = components["schemas"];

export type ApiRole = Schemas["Role"];
export type ApiDepartment = Schemas["Department"];
export type ApiRegion = Schemas["Region"];

export type ApiUser = Schemas["UserResponse"];
export type ApiUserCreate = Schemas["UserCreate"];
export type ApiUserUpdate = Schemas["UserUpdate"];
export type ApiProject = Schemas["ProjectResponse"];
export type ApiProjectCreate = Schemas["ProjectCreate"];
export type ApiFavourites = Schemas["FavouritesResponse"];
export type ApiFavouritesReplace = Schemas["FavouritesReplace"];
export type ApiUserDashboard = Schemas["UserDashboardResponse"];
export type ApiDashboard = Schemas["DashboardResponse"];
export type ApiMessage = Schemas["MessageResponse"];
