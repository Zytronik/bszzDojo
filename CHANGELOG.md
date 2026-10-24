# Changelog

## [3.7.1](https://github.com/Zytronik/bszzDojo/compare/v3.7.0...v3.7.1) (2026-10-24)


### Bug Fixes

* **web:** make toasts stand out and show the update notice as one ([#56](https://github.com/Zytronik/bszzDojo/issues/56)) ([cdccf17](https://github.com/Zytronik/bszzDojo/commit/cdccf17f56e9c66e803a4efe2e02680f67449af4))

## [3.7.0](https://github.com/Zytronik/bszzDojo/compare/v3.6.0...v3.7.0) (2026-10-24)


### Features

* **web:** show messages as toasts ([#54](https://github.com/Zytronik/bszzDojo/issues/54)) ([2a516c8](https://github.com/Zytronik/bszzDojo/commit/2a516c8613d795baf6a95b99bf59d9b5d7b51980))

## [3.6.0](https://github.com/Zytronik/bszzDojo/compare/v3.5.0...v3.6.0) (2026-10-24)


### Features

* add a 30m leaderboard and show one skeleton row per list ([#51](https://github.com/Zytronik/bszzDojo/issues/51)) ([57bea09](https://github.com/Zytronik/bszzDojo/commit/57bea09e9cc4bf750f5b4d710ed8c55e109f87a1))


### Bug Fixes

* **web:** build the shared package before storybook ([#52](https://github.com/Zytronik/bszzDojo/issues/52)) ([43f0348](https://github.com/Zytronik/bszzDojo/commit/43f0348fc76367479af9845bbaf0edfe8d2f2987))

## [3.5.0](https://github.com/Zytronik/bszzDojo/compare/v3.4.0...v3.5.0) (2026-10-24)


### Features

* **web:** add storybook as the design system ([#49](https://github.com/Zytronik/bszzDojo/issues/49)) ([7006ba4](https://github.com/Zytronik/bszzDojo/commit/7006ba42f20c57985979acca1953825ec07ec635))

## [3.4.0](https://github.com/Zytronik/bszzDojo/compare/v3.3.0...v3.4.0) (2026-10-23)


### Features

* **web:** record auszeichnungen in a dialog ([#45](https://github.com/Zytronik/bszzDojo/issues/45)) ([5d1964d](https://github.com/Zytronik/bszzDojo/commit/5d1964dc5f492719241cbc965e92e8620e6dc50b))


### Bug Fixes

* drop the team type from national tournaments ([#42](https://github.com/Zytronik/bszzDojo/issues/42)) ([b10c82c](https://github.com/Zytronik/bszzDojo/commit/b10c82cf29093e60e0bbd05e833e0b928bbad62b))

## [3.3.0](https://github.com/Zytronik/bszzDojo/compare/v3.2.0...v3.3.0) (2026-10-23)


### Features

* give sm and national tournaments a tournament type ([#40](https://github.com/Zytronik/bszzDojo/issues/40)) ([59a9f1a](https://github.com/Zytronik/bszzDojo/commit/59a9f1ad73bb8213b24ee584565f8f2fda97309f))

## [3.2.0](https://github.com/Zytronik/bszzDojo/compare/v3.1.1...v3.2.0) (2026-10-23)


### Features

* **web:** show empty lists as a centered panel ([#37](https://github.com/Zytronik/bszzDojo/issues/37)) ([04fa94c](https://github.com/Zytronik/bszzDojo/commit/04fa94c7861233121d8c232b34114c532765ec7f))

## [3.1.1](https://github.com/Zytronik/bszzDojo/compare/v3.1.0...v3.1.1) (2026-10-23)


### Bug Fixes

* **api:** show the app version in the swagger docs ([#34](https://github.com/Zytronik/bszzDojo/issues/34)) ([3f987c3](https://github.com/Zytronik/bszzDojo/commit/3f987c382209b5added63f2e07e19fc8d76de793))
* **web:** keep list areas as tall as their skeletons ([#35](https://github.com/Zytronik/bszzDojo/issues/35)) ([91ccb52](https://github.com/Zytronik/bszzDojo/commit/91ccb524cd2c3a6a4f7c29a5c47e6a8db3ee65fe))
* **web:** run the panda lint rules on every file ([#33](https://github.com/Zytronik/bszzDojo/issues/33)) ([6844197](https://github.com/Zytronik/bszzDojo/commit/6844197aa0c8cfcaa2ddf91676df5bd789b42b64))

## [3.1.0](https://github.com/Zytronik/bszzDojo/compare/v3.0.0...v3.1.0) (2026-10-23)


### Features

* list placings on the profile and require the age category ([#29](https://github.com/Zytronik/bszzDojo/issues/29)) ([3d60b52](https://github.com/Zytronik/bszzDojo/commit/3d60b52331cfd1ca1604b1debe07b76ecf722418))
* **web:** show skeletons while lists load ([#31](https://github.com/Zytronik/bszzDojo/issues/31)) ([4854a4b](https://github.com/Zytronik/bszzDojo/commit/4854a4bf7b24a06fb21cc7a9f9aa5ebe8e30b39e))


### Bug Fixes

* **web:** set the update banner apart from the footer ([#30](https://github.com/Zytronik/bszzDojo/issues/30)) ([018d212](https://github.com/Zytronik/bszzDojo/commit/018d2125a50ff1dda7280fa831749a639ef69ebe))

## [3.0.0](https://github.com/Zytronik/bszzDojo/compare/v2.0.0...v3.0.0) (2026-10-23)


### ⚠ BREAKING CHANGES

* /api/badge-requests, /api/admin/badge-requests, /api/admin/badges and /api/admin/users/rank are removed, Profile has no badges and Rankings no medals; existing placings and requests are deleted by the migration.

### Features

* let users record their own auszeichnungen and abzeichen ([#27](https://github.com/Zytronik/bszzDojo/issues/27)) ([24e9932](https://github.com/Zytronik/bszzDojo/commit/24e9932e7420f9ec2a6f08006fb19103c29b653f))

## [2.0.0](https://github.com/Zytronik/bszzDojo/compare/v1.1.0...v2.0.0) (2026-10-23)


### ⚠ BREAKING CHANGES

* the email field and the forgot/reset password endpoints are gone; every user payload has a displayName.

### Features

* identify users by username only, add optional display name ([#21](https://github.com/Zytronik/bszzDojo/issues/21)) ([9db3411](https://github.com/Zytronik/bszzDojo/commit/9db34116522f1694c4f9ab7729ef8400737ad51d))
* **web:** add field errors, form messages and loading buttons ([#26](https://github.com/Zytronik/bszzDojo/issues/26)) ([f0425ac](https://github.com/Zytronik/bszzDojo/commit/f0425ac4d8eb206f5db8a83f7a5a6700dc672c6a))


### Bug Fixes

* **api:** restore the swagger metadata on turbo cache hits ([#25](https://github.com/Zytronik/bszzDojo/issues/25)) ([41c19e9](https://github.com/Zytronik/bszzDojo/commit/41c19e9f137b50dd06bccbefb6bc36284a4f549d))
* **web:** let /api and /api-json bypass the service worker ([#24](https://github.com/Zytronik/bszzDojo/issues/24)) ([ee47803](https://github.com/Zytronik/bszzDojo/commit/ee47803d87d168c026748ccfbfe27b8b85314a5a))

## [1.1.0](https://github.com/Zytronik/bszzDojo/compare/v1.0.0...v1.1.0) (2026-10-23)


### Features

* **api:** serve swagger docs at /api ([#16](https://github.com/Zytronik/bszzDojo/issues/16)) ([77abc8d](https://github.com/Zytronik/bszzDojo/commit/77abc8dc7b36125c47b38c69a2219f2acaae596a))


### Bug Fixes

* **api:** make the swagger setup bundle on vercel ([#20](https://github.com/Zytronik/bszzDojo/issues/20)) ([fbbbc38](https://github.com/Zytronik/bszzDojo/commit/fbbbc381375e922930d65bd7351d28db6251cb3a))

## [1.0.0](https://github.com/Zytronik/bszzDojo/compare/v1.0.0...v1.0.0) (2026-10-23)


### Features

* rewrite as turborepo with nestjs api and angular pwa ([#14](https://github.com/Zytronik/bszzDojo/issues/14)) ([98d3ad2](https://github.com/Zytronik/bszzDojo/commit/98d3ad268c531f1b3b949634d8c2011c665720b5))
