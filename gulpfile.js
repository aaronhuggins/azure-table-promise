const gulp = require('gulp')
const shell = require('gulp-shell')
const fs = require('fs')
const path = require('path')
const { Service } = require('./service')
let azurite = null

gulp.task('azurite:start', async (done) => {
  const azuriteDir = './.azurite'
  const serviceOpts = { onStop: () => fs.rmdirSync(azuriteDir, { recursive: true }) }
  azurite = new Service('node', [
    path.normalize('./node_modules/azurite/bin/table'),
    '-l',
    azuriteDir
  ], serviceOpts)
  await azurite.start()
  done()
})

gulp.task('azurite:stop', async (done) => {
  if (azurite !== null) {
    azurite.stop()
    azurite = null
  }
  done()
})

gulp.task('mocha', shell.task([
  'mocha'
], { ignoreErrors: true }))

gulp.task('nyc', shell.task([
  'nyc mocha'
], { ignoreErrors: true }))

gulp.task('test', gulp.series(
  'azurite:start',
  'mocha',
  'azurite:stop'
))

gulp.task('coverage', gulp.series(
  'azurite:start',
  'nyc',
  'azurite:stop'
))

gulp.task('compile', shell.task([
  'tsc'
]))
