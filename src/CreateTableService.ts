import { createTableService, StorageHost } from 'azure-storage'
import { PromiseTableService } from './PromiseTableService'

export function createPromiseTableService (): PromiseTableService
export function createPromiseTableService (
  connectionString: string
): PromiseTableService
export function createPromiseTableService (
  storageAccountOrConnectionString: string,
  storageAccessKey: string,
  host?: StorageHost
): PromiseTableService
export function createPromiseTableService (
  storageAccountOrConnectionString?: string,
  storageAccessKey?: string,
  host?: StorageHost
) {
  const tableService = createTableService(
    storageAccountOrConnectionString,
    storageAccessKey,
    host
  )

  return new PromiseTableService(tableService)
}
