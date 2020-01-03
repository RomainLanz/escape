import { join } from 'path'
import { readdirSync } from 'fs'
import Client from './Client'
import ErrorEmbed from '../embeds/ErrorEmbed'
import Database from './Database'
import { BaseCommandConstructor } from './BaseCommand'
import { BaseHandlerConstructor } from './BaseHandler'

interface KernelOption {
  prefix: string
}

class Kernel {
  private $commands: Map<String, BaseCommandConstructor> = new Map()

  private $client: Client

  /**
   * Options used by the bot.
   */
  private $options: KernelOption

  constructor (client: Client, options?: Partial<KernelOption>) {
    this.$client = client
    this.$setOptions(options)
  }

  public loadHandlers (paths: string[]) {
    const handlers = paths.map((path) => {
      const resolvedPath = join(__dirname, '..', path)
      return require(resolvedPath).default
    })

    this.registerHandlers(handlers)
  }

  public autoloadCommands (path: string) {
    const resolvedPath = join(__dirname, '..', path)
    const files = readdirSync(resolvedPath).filter(file => file.endsWith('.js'))
    const commands = files.map((file) => require(`${resolvedPath}/${file}`).default)

    this.register(commands)
  }

  public registerHandlers (handlers: BaseHandlerConstructor[]): this {
    handlers.forEach(handler => {
      handler.listenOn.forEach(listenTo => {
        this.$client.on(listenTo, (message) => {
          const instance = new handler(Database, message)
          instance.handle()
        })
      })
    })

    return this
  }

  public register (commands: BaseCommandConstructor[]): this {
    commands.forEach(command => {
      if (this.$commands.has(command.commandName)) {
        throw new Error(`The command ${command.commandName} has already been added to the registry.`)
      }

      command.$boot()
      this.$commands.set(command.commandName, command)
    })

    return this
  }

  public listen (): this {
    this.$client.on('message', (message) => {
      if (!message.content.startsWith(this.$options.prefix)) {
        return
      }

      const args = message.content.slice(this.$options.prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();

      if (!this.$commands.has(commandName)) {
        const embed = new ErrorEmbed(`La command ${commandName} n'a pas été trouvée!`)
        message.channel.send(embed)
        return
      }

      const CommandConstructor = this.$commands.get(commandName)
      const commandInstance = new CommandConstructor(Database, message)

      const parsedArgs = args.join(' ').match(/[^\s"]+|"([^"]*)"/g)

      for (let i = 0; i < CommandConstructor.args.length; i++) {
        const arg = CommandConstructor.args[i]
        if (arg.type === 'spread') {
          commandInstance[arg.propertyName] = parsedArgs.slice(i)
          break
        } else if (arg.type === 'number') {
          commandInstance[arg.propertyName] = Number(parsedArgs[i])
        } else if (arg.type === 'mention') {
          let mention = parsedArgs[i].slice(2, -1)

          if (mention.startsWith('!')) {
            mention = mention.slice(1);
          }

          commandInstance[arg.propertyName] = message.client.users.get(mention)
        } else {
          commandInstance[arg.propertyName] = parsedArgs[i]
        }
      }

      commandInstance.handle()
    })
    return this
  }

  private $setOptions(options?: Partial<KernelOption>) {
    const defaultOptions: KernelOption = {
      prefix: '!',
    }

    this.$options = { ...defaultOptions, ...options }
  }
}

export default Kernel
