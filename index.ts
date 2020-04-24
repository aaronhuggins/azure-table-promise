import azure = require('azure-storage')

export { azure }
export { PromiseTableService } from './src/PromiseTableService'
export { createPromiseTableService } from './src/CreateTableService'
export { createPromiseTableService as createTableService } from './src/CreateTableService'
