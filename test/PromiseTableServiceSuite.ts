import * as chai from 'chai'
import { azure, createTableService, PromiseTableService } from '../index'

interface TestTableRow {
  PartitionKey: string
  RowKey: string
  prop: string
}

const connectionArray = [
  'DefaultEndpointsProtocol=http',
  'AccountName=devstoreaccount1',
  'AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==',
  'TableEndpoint=http://127.0.0.1:10002/devstoreaccount1'
]
const connectionString = `${connectionArray.join(';')};`
let tableService: PromiseTableService

describe('class PromiseTableService', () => {
  before(() => {
    tableService = new PromiseTableService(connectionString)
  })

  it('should construct new PromiseTableService', () => {
    const result = new PromiseTableService(connectionString)

    chai.expect(result instanceof PromiseTableService).to.equal(true)
  })

  it('should be returned by function createTableService', () => {
    const result = createTableService(connectionString)

    chai.expect(result instanceof PromiseTableService).to.equal(true)
  })

  it('should create and delete tables', async () => {
    const tableName = 'NewTable'
    const table2Name = tableName + '2'
    let result = await tableService.createTable(tableName)

    chai.expect(result.TableName).to.equal(tableName)

    result = await tableService.createTableIfNotExists(tableName)

    chai.expect(result.created).to.equal(false)

    result = await tableService.createTableIfNotExists(table2Name)

    chai.expect(result.created).to.equal(true)

    await tableService.deleteTable(table2Name)

    let resultBool = await tableService.deleteTableIfExists(table2Name)

    chai.expect(resultBool).to.equal(false)

    await tableService.createTable(table2Name)

    resultBool = await tableService.deleteTableIfExists(table2Name)

    chai.expect(resultBool).to.equal(true)
  })

  it('should return instance with filter', () => {
    const filter = new azure.LinearRetryPolicyFilter()
    const result = tableService.withFilter(filter)

    chai.expect(result instanceof PromiseTableService).to.equal(true)
  })

  // Lacking Azurite support
  it('should get service stats', async () => {
    // const stats = await tableService.getServiceStats()

    chai.expect(typeof tableService.getServiceStats).to.equal('function')
  })

  it('should create and query entities', async () => {
    const INSERT_COUNT = 5
    const tableName = 'Entities'
    const partitionKey = 'test'
    const rowKey = 'some_key'
    const result = await tableService.createTable(tableName)

    chai.expect(result.TableName).to.equal(tableName)

    for (let i = 0; i < INSERT_COUNT; i += 1) {
      await tableService.insertOrMergeEntity<TestTableRow>(
        tableName,
        { PartitionKey: partitionKey, RowKey: rowKey + i.toString(), prop: rowKey + i.toString() }
      )
    }

    const { entries } = await tableService.queryEntitiesAll<TestTableRow>(tableName, null, { resolveEntity: true })
    const { entries: typedEntries } = await tableService.queryEntitiesAll<TestTableRow>(tableName, null, { resolveEntity: false })

    chai.expect(typeof entries[0].PartitionKey).to.equal('string')
    chai.expect(typeof typedEntries[0].PartitionKey).to.equal('object')

    // Only for test purposes; do not use this mock in production.
    let continuation = true
    const queryEntities = tableService.queryEntities
    tableService.queryEntities = async function<T> (...args: any[]): Promise<azure.TableService.QueryEntitiesResult<T>> {
      if (continuation) {
        const res = await queryEntities<T>(args[0], args[1], args[2], args[3])

        continuation = false

        return {
          ...res,
          continuationToken: {
            nextPartitionKey: 'string',
            nextRowKey: 'string',
            targetLocation: 0
          }
        }
      }

      return await queryEntities<T>(args[0], args[1], args[2], args[3])
    }

    const { entries: continuedEntries } = await tableService.queryEntitiesAll<TestTableRow>(tableName, null, { resolveEntity: true })

    chai.expect(continuedEntries.length).to.equal(INSERT_COUNT * 2)
  })
})
