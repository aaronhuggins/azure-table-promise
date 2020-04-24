import { common, StorageHost, TableService, TableQuery, TableBatch } from 'azure-storage'
import { promisify } from 'util'
import { EnumFunctionsAsync, EnumFunctionsSync, EnumFunctionsTableService } from './EnumFunctions'

export interface PromiseTableService {
  getServiceStats (): Promise<common.models.ServiceStats>
  getServiceStats (options: common.RequestOptions): Promise<common.models.ServiceStats>

  getServiceProperties(): Promise<common.models.ServicePropertiesResult.ServiceProperties>
  getServiceProperties(options: common.RequestOptions): Promise<common.models.ServicePropertiesResult.ServiceProperties>

  setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties): Promise<void>
  setServiceProperties(serviceProperties: common.models.ServicePropertiesResult.ServiceProperties, options: common.RequestOptions): Promise<void>

  listTablesSegmented(currentToken: TableService.ListTablesContinuationToken): Promise<TableService.ListTablesResponse>
  listTablesSegmented(currentToken: TableService.ListTablesContinuationToken, options: TableService.ListTablesRequestOptions): Promise<TableService.ListTablesResponse>

  listTablesSegmentedWithPrefix(prefix: string, currentToken: TableService.ListTablesContinuationToken): Promise<TableService.ListTablesResponse>
  listTablesSegmentedWithPrefix(prefix: string, currentToken: TableService.ListTablesContinuationToken, options: TableService.ListTablesRequestOptions): Promise<TableService.ListTablesResponse>

  getTableAcl(table: string): Promise<TableService.GetTableAclResult>
  getTableAcl(table: string, options: common.RequestOptions): Promise<TableService.GetTableAclResult>

  setTableAcl(table: string, signedIdentifiers: {[key:string]: common.AccessPolicy}): Promise<{
    TableName: string
    signedIdentifiers: {[key:string]: common.AccessPolicy}
  }>
  setTableAcl(table: string, signedIdentifiers: {[key:string]: common.AccessPolicy}, options: common.RequestOptions): Promise<{
    TableName: string
    signedIdentifiers: {[key:string]: common.AccessPolicy}
  }>

  doesTableExist(table: string): Promise<TableService.TableResult>
  doesTableExist(table: string, options: common.RequestOptions): Promise<TableService.TableResult>

  createTable(table: string): Promise<TableService.TableResult>
  createTable(table: string, options: common.RequestOptions): Promise<TableService.TableResult>

  createTableIfNotExists(table: string): Promise<TableService.TableResult>
  createTableIfNotExists(table: string, options: common.RequestOptions): Promise<TableService.TableResult>

  deleteTable(table: string, options: common.RequestOptions): Promise<void>
  deleteTable(table: string): Promise<void>

  deleteTableIfExists(table: string, options: common.RequestOptions): Promise<boolean>
  deleteTableIfExists(table: string): Promise<boolean>

  queryEntities<T>(table: string, tableQuery: TableQuery, currentToken: TableService.TableContinuationToken, options: TableService.TableEntityRequestOptions): Promise<TableService.QueryEntitiesResult<T>>
  queryEntities<T>(table: string, tableQuery: TableQuery, currentToken: TableService.TableContinuationToken): Promise<TableService.QueryEntitiesResult<T>>

  retrieveEntity<T>(table: string, partitionKey: string, rowKey: string, options: TableService.TableEntityRequestOptions): Promise<T>
  retrieveEntity<T>(table: string, partitionKey: string, rowKey: string): Promise<T>

  insertEntity<T>(table: string, entityDescriptor: T, options: TableService.InsertEntityRequestOptions): Promise<T | TableService.EntityMetadata>
  insertEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<TableService.EntityMetadata>
  insertEntity<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>

  insertOrReplaceEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<TableService.EntityMetadata>
  insertOrReplaceEntity<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>

  replaceEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<TableService.EntityMetadata>
  replaceEntity<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>

  mergeEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<TableService.EntityMetadata>
  mergeEntity<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>

  insertOrMergeEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<TableService.EntityMetadata>
  insertOrMergeEntity<T>(table: string, entityDescriptor: T): Promise<TableService.EntityMetadata>

  deleteEntity<T>(table: string, entityDescriptor: T, options: common.RequestOptions): Promise<void>
  deleteEntity<T>(table: string, entityDescriptor: T): Promise<void>

  executeBatch(table: string, batch: TableBatch, options: TableService.TableEntityRequestOptions): Promise<TableService.BatchResult[]>
  executeBatch(table: string, batch: TableBatch): Promise<TableService.BatchResult[]>

  withFilter(newFilter: common.filters.IFilter): PromiseTableService

  generateSharedAccessSignature(table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy): string

  generateSharedAccessSignatureWithVersion(table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy, sasVersion: string): string

  getUrl(table: string, sasToken?: string, primary?: boolean): string
}

export class PromiseTableService {
  constructor (storageAccountOrConnectionString?: string|TableService, storageAccessKey?: string, host?: string|StorageHost, sasToken?: string, endpointSuffix?: string) {
    if (typeof storageAccountOrConnectionString === 'string' || storageAccountOrConnectionString === undefined) {
      this._tableService = new TableService(storageAccountOrConnectionString as string, storageAccessKey, host, sasToken, endpointSuffix)
    } else {
      this._tableService = storageAccountOrConnectionString
    }

    
    const self = this

    EnumFunctionsAsync.forEach(function assignAsyncFunction (funcName) {
      if (typeof self._tableService[funcName] === 'function') {
        self[funcName] = promisify(self._tableService[funcName].bind(self._tableService))
      }
    })

    EnumFunctionsSync.forEach(function assignSyncFunction (funcName) {
      if (typeof self._tableService[funcName] === 'function') {
        self[funcName] = self._tableService[funcName].bind(self._tableService)
      }
    })

    EnumFunctionsTableService.forEach(function assignTableServiceFunction (funcName) {
      if (typeof self._tableService[funcName] === 'function') {
        const func = self._tableService[funcName].bind(self._tableService)

        self[funcName] = function (...args: any[]) {
          return new PromiseTableService(func(...args))
        }
      }
    })
  }

  private readonly _tableService: TableService

  withFilter (newFilter: common.filters.IFilter): PromiseTableService {
    return new PromiseTableService(this._tableService.withFilter(newFilter))
  }

  generateSharedAccessSignature (table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy): string {
    return this._tableService.generateSharedAccessSignature(table, sharedAccessPolicy)
  }

  generateSharedAccessSignatureWithVersion (table: string, sharedAccessPolicy: TableService.TableSharedAccessPolicy, sasVersion: string): string {
    return this._tableService.generateSharedAccessSignatureWithVersion(table, sharedAccessPolicy, sasVersion)
  }

  getUrl (table: string, sasToken?: string, primary?: boolean): string {
    return this._tableService.getUrl(table, sasToken, primary)
  }
}
