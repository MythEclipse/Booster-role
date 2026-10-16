## [1.0.4](https://github.com/asepharyana/Booster-role/compare/v1.0.3...v1.0.4) (2026-10-16)


### Bug Fixes

* auto-fix code quality [skip ci] ([41c7602](https://github.com/asepharyana/Booster-role/commit/41c7602461a46c9c998c627adb6f91602adf3802))
* auto-fix code quality [skip ci] ([0cbc114](https://github.com/asepharyana/Booster-role/commit/0cbc114ad2617c7bfc23d452589ad399e2014454))

## [1.0.3](https://github.com/asepharyana/Booster-role/compare/v1.0.2...v1.0.3) (2026-10-14)

## [1.0.2](https://github.com/asepharyana/Booster-role/compare/v1.0.1...v1.0.2) (2026-10-14)


### Bug Fixes

* **ci:** cap the release body, which GitHub limits to 125,000 chars ([3e7fa7e](https://github.com/asepharyana/Booster-role/commit/3e7fa7e0eda44a782aa2ad0cf776b55f3b1848a7))

## [1.0.1](https://github.com/asepharyana/Booster-role/compare/v1.0.0...v1.0.1) (2026-10-14)


### Bug Fixes

* **ci:** stop embedding the release notes in the release commit ([3a16e04](https://github.com/asepharyana/Booster-role/commit/3a16e046f45738dfe75d5b76384776396fcf0b16))

# 1.0.0 (2026-10-14)


### Bug Fixes

* change restart policy to always for booster-role service in docker-compose ([4a47855](https://github.com/asepharyana/Booster-role/commit/4a47855ad4f64c9ae9d2efa0f6c718e7a32661ca))
* **ci:** use deployment environment secrets ([ec9f27e](https://github.com/asepharyana/Booster-role/commit/ec9f27ee26396a544d06c5cd1d16f062f4d6b0c9))
* correct role position calculation in resolvePosition method ([4a50463](https://github.com/asepharyana/Booster-role/commit/4a504639cdafa9d9ca4f9cbe75bd460883b94ca9))
* **dependabot:** use "bun" package-ecosystem for "/" ([e73353b](https://github.com/asepharyana/Booster-role/commit/e73353b989da762939d5642920c90d9099e9ec66))
* **discord:** migrate deprecated Zod `error.errors` to `error.issues` and add CI quality gates ([a796034](https://github.com/asepharyana/Booster-role/commit/a796034241f4f16ad4c8a2b4cdb36c6fc092538d))
* **dockerfile:** prevent crash loop when migration fails ([016eddc](https://github.com/asepharyana/Booster-role/commit/016eddcce743d5753bcadd9e0037043e5b65e459))
* **dockerfile:** run db migration before bot startup ([03c5f73](https://github.com/asepharyana/Booster-role/commit/03c5f73891990c05fabdea8f3d74704e57ebdaae))
* **index:** adjust comment formatting for clarity ([0eec0af](https://github.com/asepharyana/Booster-role/commit/0eec0affbea36e59d82c765418d41ead98a6a0f3))
* **nix:** restrict flake to x86_64-linux (nixpkgs 26.11 dropped darwin) ([e1b8411](https://github.com/asepharyana/Booster-role/commit/e1b84112b658a963dc473a2753a5300c69c85b96))


### Features

* add booster eligibility role and logging functionality ([cc69758](https://github.com/asepharyana/Booster-role/commit/cc6975825fbf057e405bac7bef43f113b8af3ae3))
* add color2 gradient color support and defer interactions for slow commands ([bf03af5](https://github.com/asepharyana/Booster-role/commit/bf03af53affb280583ce407e41a419cab72c8a23))
* add dependabot auto-merge workflow ([fcf29dd](https://github.com/asepharyana/Booster-role/commit/fcf29dda670ef1bd1409c8fa2ec4460751bd3173))
* add dependabot config (npm auto-deps) ([b7c5fbc](https://github.com/asepharyana/Booster-role/commit/b7c5fbcc5ecdc193102c5702ddaab71f7bc0935d))
* add Docker configuration files for deployment and containerization ([dd22f0b](https://github.com/asepharyana/Booster-role/commit/dd22f0bb1fe0468aa02ec49a3ceaca01b1398e25))
* add optional role icon support and validation for booster roles ([9d0322b](https://github.com/asepharyana/Booster-role/commit/9d0322b1183d8892b1934157d9d610c853135600))
* **boost-greeting:** implement randomized greeting messages ([8ff4610](https://github.com/asepharyana/Booster-role/commit/8ff46104f1701820a86a01c73f4e4552043c8ff2))
* **boost-greeting:** integrate greeting into guild member update and clean up handler ([9c193c3](https://github.com/asepharyana/Booster-role/commit/9c193c35300bdd00861c2ee51fef37a452f806e2))
* **config:** add BOOSTER_GREETING_CHANNEL_ID environment variable ([898ae2d](https://github.com/asepharyana/Booster-role/commit/898ae2dd56b90b5c42cfebf35ec8795a2a3ff26b))
* **discord:** add Zod schema validation for booster-role command inputs ([917714f](https://github.com/asepharyana/Booster-role/commit/917714f2377cd1d7342bb0441363d67b02411cfc))
* **domain:** introduce typed error classes and replace fragile string-based error handling ([03e2a28](https://github.com/asepharyana/Booster-role/commit/03e2a28e97e1fb52fc29fe0b9c205937cddba326))
* enhance booster role functionality with error handling and database migration ([c155c94](https://github.com/asepharyana/Booster-role/commit/c155c94ea2fdd4ac1506fd05910dfdc7f51d8d5d))
* enhance role handling by updating reply structure and adding role assignment functionality ([41c6b56](https://github.com/asepharyana/Booster-role/commit/41c6b567a612f5fe817114c07cf23d6faa8b1c88))
* implement command registration for booster role bot and add tests ([972400e](https://github.com/asepharyana/Booster-role/commit/972400e4e46a03502991c16365807ed96cf8a87e))
* implement prepareSqlitePath function and add tests for database path handling ([c6ee7bb](https://github.com/asepharyana/Booster-role/commit/c6ee7bb8c6d2cdb4db66a83af136fdad5f69f473))
* initialize booster role bot with database and Discord integration ([c6b1087](https://github.com/asepharyana/Booster-role/commit/c6b1087eb365e12cb756f88ac9b4f303e8a4b433))
* migrate from SQLite to PostgreSQL and update database handling ([bfa9106](https://github.com/asepharyana/Booster-role/commit/bfa91063ff543fcd87c418e4ec3b32a241990b48))
* **services:** implement periodic booster role cleanup ([57699d6](https://github.com/asepharyana/Booster-role/commit/57699d60a8d721b30c40533db38ee00dda6314ca))
* update booster role eligibility logic and refactor related services ([acd4648](https://github.com/asepharyana/Booster-role/commit/acd4648d4914fc378608e1c8a1b7d6c5eb81d647))
* update dependabot config ([fbf242e](https://github.com/asepharyana/Booster-role/commit/fbf242e6786fbc76e5f12c1a0418399ad7af24ec))
* update dependabot config ([0792c75](https://github.com/asepharyana/Booster-role/commit/0792c7503166785289d6f797f5796d701d37e4bf))

# Changelog

All notable changes to booster-role-bot are documented here.
Versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
and are derived automatically from
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
