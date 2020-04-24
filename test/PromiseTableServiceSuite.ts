import * as chai from 'chai'
import { createTableService, PromiseTableService } from '../index'

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
    tableService = createTableService(connectionString)
  })

  it('should be returned by function createTableService', () => {
    chai.expect(tableService instanceof PromiseTableService).to.equal(true)
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

  // Lacking Azurite support
  it('should get service stats', async () => {
    // const stats = await tableService.getServiceStats()
    
    chai.expect(typeof tableService.getServiceStats).to.equal('function')
  })
})
