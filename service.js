const cp = require('child_process')
const noop = () => {}
const STATE = {
  READY: 'READY',
  STARTED: 'STARTED',
  STOPPED: 'STOPPED',
  RESTARTING: 'RESTARTING'
}
const EVENT = {
  ONREADY: 'onReady',
  ONSTART: 'onStart',
  ONSTOP: 'onStop',
  ONRESTART: 'onRestart'
}
Object.seal(this.STATE)
Object.seal(this.EVENT)

class Service {
  constructor (command, args, options) {
    this.command = command
    this.args = args
    this.options = { ...options }
    this.pid = null
    this.events = new Map([
      [EVENT.ONREADY, noop],
      [EVENT.ONSTART, noop],
      [EVENT.ONSTOP, noop],
      [EVENT.ONRESTART, noop]
    ])

    for (let key of this.events.keys()) {
      if (typeof this.options[key] === 'function') {
        this.events.set(key, this.options[key])
        delete this.options[key]
      }
    }

    this.state = STATE.READY
    this.events.get(EVENT.ONREADY)()
  }

  async start () {
    this.events.get(EVENT.ONSTART)()
    const spawn = cp.spawn(this.command, this.args, {
      stdio: 'ignore',
      ...this.options
    })
    spawn.unref()
    this.pid = spawn.pid
    this.state = STATE.STARTED
    return this
  }

  async stop () {
    this.kill()
    this.state = STATE.STOPPED
    this.events.get(EVENT.ONSTOP)()
    return this
  }

  async restart () {
    this.state = STATE.RESTARTING
    this.kill()
    this.events.get(EVENT.ONRESTART)()
    await this.start()
    return this
  }

  kill (signal = 'SIGINT') {
    if (this.pid !== null) {
      process.kill(this.pid, signal)
      this.pid = null
    }
  }
}

module.exports = { Service }
