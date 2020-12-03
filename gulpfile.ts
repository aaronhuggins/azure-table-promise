import * as gulp from 'gulp'
import * as shell from 'gulp-shell'
import * as fs from 'fs'
import * as path from 'path'
import { Service } from 'managed-service-daemon'
const azuriteDir = './.azurite'
const azurite = new Service({
  name: 'azurite',
  command: 'node',
  args: [path.normalize('./node_modules/azurite/bin/table'), '-l', azuriteDir],
  onStop: () => fs.rmdirSync(azuriteDir, { recursive: true })
})

exports.mocha = async function mocha () {
  return shell.task(['mocha'], { ignoreErrors: true })()
}
exports.nyc = async function nyc () {
  return shell.task(['nyc mocha'], { ignoreErrors: true })()
}
exports.test = gulp.series(azurite.start, exports.mocha, azurite.stop)
exports.coverage = gulp.series(azurite.start, exports.nyc, azurite.stop)
exports.compile = async function compile () {
  return shell.task(['tsc'])()
}
