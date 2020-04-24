# azure-table-promise

Since Midrosoft is dropping support for library `azure-storage`, they've been slow to provide an updated, promise-based library for tables. With Azure Storage Tables being widely used, a promise-wrapper seemed like a good idea to reduce code redundancy between projects. We were wrapping methods left and right, project by project, and sometimes not doing a great job of being consistent and re-using code. This module allows users to consistently access the TableService API without further dependencies beyond just `azure-storage`.

## Usage

1. Install from NPM: `npm install --save azure-table-promise`
2. Import it into your project using `require`
3. Profit

## API

### class `PromiseTableService`

Wraps class `TableService` and provides the exact same API with every callback-style function wrapped in a promise.

See [the docs](https://azure.github.io/azure-storage-node/TableService.html) for `azure-storage` for complete details of each function and its arguments. Always omit the callback, as the promise automatically will either resolve with the response of the callback, or reject with the callback error.

### function `createPromiseTableService`

Method which wraps `createTableService` for API completeness.

### function `createTableService` (alias of `createPromiseTableService`)

See function `createPromiseTableService`.

### Property `azure`

Exports the `azure` namespace for convenience, which includes all untouched functions, classes, and constants from library `azure-storage`.

## Contributors

- Aaron Huggins
