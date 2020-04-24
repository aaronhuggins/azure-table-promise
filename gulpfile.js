const gulp = require('gulp')
const shell = require('gulp-shell')
const fs = require('fs')
const path = require('path')
const { Service } = require('./service')
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
