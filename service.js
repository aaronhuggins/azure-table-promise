const cp = require('child_process')
const noop = () => {}
const BIND_FUNCTIONS = ['start', 'stop', 'restart', 'kill']
const SERVICE_STATE = {
  READY: 'READY',
  STARTED: 'STARTED',
  STOPPED: 'STOPPED',
  RESTARTING: 'RESTARTING',
  UNDEFINED: 'UNDEFINED'
}
const SERVICE_EVENT = {
  ONREADY: 'onReady',
  ONSTART: 'onStart',
  ONSTOP: 'onStop',
  ONRESTART: 'onRestart'
}
Object.seal(SERVICE_STATE)
Object.seal(SERVICE_EVENT)

class Service {
  constructor (options) {
    const { name, command, args } = options

    if (command === undefined || command === null) {
      this.state = SERVICE_STATE.UNDEFINED
      this.pid = null
    } else {
      this.pid = null
      this.events = new Map([
        [SERVICE_EVENT.ONREADY, noop],
        [SERVICE_EVENT.ONSTART, noop],
        [SERVICE_EVENT.ONSTOP, noop],
        [SERVICE_EVENT.ONRESTART, noop]
      ])
      this.options = { ...options }
      this.name = name || command
      this.command = command
      this.args = args

      delete this.options.name
      delete this.options.command
      delete this.options.args

      for (let key of this.events.keys()) {
        if (typeof this.options[key] === 'function') {
          this.events.set(key, this.options[key])
          delete this.options[key]
        }
      }

      for (let func of BIND_FUNCTIONS) {
        this[func] = this[func].bind(this)

        Object.defineProperty(this[func], 'name', {
          value: `${this.name || this.command} ${func}`
        })
      }

      this.state = SERVICE_STATE.READY
      this.events.get(SERVICE_EVENT.ONREADY)()
    }
  }

  async start () {
    if (this.state === SERVICE_STATE.UNDEFINED) return
    this.events.get(SERVICE_EVENT.ONSTART)()
    const spawn = cp.spawn(this.command, this.args, {
      stdio: 'ignore',
      ...this.options
    })
    spawn.unref()
    this.pid = spawn.pid
    this.state = SERVICE_STATE.STARTED
  }

  async stop () {
    if (this.state === SERVICE_STATE.UNDEFINED) return
    this.kill()
    this.state = SERVICE_STATE.STOPPED
    this.events.get(SERVICE_EVENT.ONSTOP)()
  }

  async restart () {
    if (this.state === SERVICE_STATE.UNDEFINED) return
    this.state = SERVICE_STATE.RESTARTING
    this.kill()
    this.events.get(SERVICE_EVENT.ONRESTART)()
    await this.start()
  }

  kill (signal = 'SIGINT') {
    if (this.state === SERVICE_STATE.UNDEFINED) return
    if (this.pid !== null) {
      process.kill(this.pid, signal)
      this.pid = null
    }
  }
}

module.exports = { Service, SERVICE_EVENT, SERVICE_STATE }
