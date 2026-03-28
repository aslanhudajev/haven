# Changelog


## [3.0.0](https://github.com/nativelaunch/expolaunch-template/compare/native-launch-v2.1.0...native-launch-v3.0.0) (2025-11-21)


### ⚠ BREAKING CHANGES

* Expo SDK 54 introduces updates to React Native and requires adjustments in dependencies (e.g., NativeWind, UI primitives, safe-area context). Older Expo SDK versions are no longer supported.

### Miscellaneous Chores

* upgrade to Expo SDK 54 and update related dependencies ([9df3495](https://github.com/nativelaunch/expolaunch-template/commit/9df3495bf11b49ac3dc5c49d892c4e8121002bd9))

## [2.1.0](https://github.com/nativelaunch/expolaunch-template/compare/native-launch-v2.0.0...native-launch-v2.1.0) (2025-10-15)


### Features

* **env:** centralize environment config and add consistent feature logs ([9d3eb08](https://github.com/nativelaunch/expolaunch-template/commit/9d3eb0808cb11449fb08dc65d08ecd01f2b4ada3))
* **paywall:** add interval check and last shown date tracking ([aa8ace1](https://github.com/nativelaunch/expolaunch-template/commit/aa8ace1a9d6ae567ff004b81c709114edfefcc1c))


### Bug Fixes

* **ci:** set runner to macos-15 ([20ff2e0](https://github.com/nativelaunch/expolaunch-template/commit/20ff2e0505dc3b94008b3c8cf3dfde19f1cb9f58))
* **ios:** adjust paywall padding for iOS 26+ ([38e6bc5](https://github.com/nativelaunch/expolaunch-template/commit/38e6bc5c01d453ed28467a71588095d0616ef25f))
* remove unnecessary css variables from global.css ([63a7c33](https://github.com/nativelaunch/expolaunch-template/commit/63a7c33bd4a24cf3de97a369cbb92e71f229bd67))
* update supabase/migrations with current schema ([a61230a](https://github.com/nativelaunch/expolaunch-template/commit/a61230a4a8507d9f42361dd52334edde2e048617))

## [2.0.0](https://github.com/nativelaunch/expolaunch-template/compare/native-launch-v1.0.0...native-launch-v2.0.0) (2025-09-16)


### ⚠ BREAKING CHANGES

* Expo SDK 53 requires migration steps and drops support for older Expo SDKs.

### Features

* rename project name from `expolaunch` to `nativelaunch` ([695b51e](https://github.com/nativelaunch/expolaunch-template/commit/695b51e2ecaf578c1350df0151ba1683313540a4))
* update privacy-policy and terms page ([bca3b04](https://github.com/nativelaunch/expolaunch-template/commit/bca3b04212a9e8b772d481e6378a5f3ba8f5faca))
* update README.md ([3f7b749](https://github.com/nativelaunch/expolaunch-template/commit/3f7b7495ad408dfbda526307b902407a88d8bf69))


### Miscellaneous Chores

* upgrade to Expo SDK 53 and migrate to New Architecture ([c112abf](https://github.com/nativelaunch/expolaunch-template/commit/c112abf89b672c6c5d508b535c52aebbb1d77f9e))

## [0.2.0](https://github.com/jonypopov/moneyplus-app/compare/money-plus-v0.1.0...money-plus-v0.2.0) (2025-02-08)


### Features

* add ".expo/types/**/*.ts" to tsconfig.json ([bdfc077](https://github.com/jonypopov/moneyplus-app/commit/bdfc077807e6f46ab52f053df4c1bd09ea2cd866))
* add `EXPO_PUBLIC_REVENUECAT_PROJECT_IOS_API_KEY` env ([08de9a2](https://github.com/jonypopov/moneyplus-app/commit/08de9a20a9d8d7e377e7e02f1c84775981374439))


### Bug Fixes

* add delay for opening paywall screen ([89be1dc](https://github.com/jonypopov/moneyplus-app/commit/89be1dcb158c3572d2ef95d4815f36d547c80144))
* change google scope ([4cfe555](https://github.com/jonypopov/moneyplus-app/commit/4cfe55584b6980ffb00656e201ae243f3cf9079d))
