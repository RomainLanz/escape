require('dotenv').config()
import Client from './core/Client'
import Kernel from './core/Kernel'
import Database from './core/Database'
import schema from '../database/schema.json'

const client = new Client(process.env.DISCORD_TOKEN)
const kernel = new Kernel(client)

kernel.autoloadCommands('./commands')
kernel.loadHandlers([
  './handlers/VerifyUser'
])
kernel.listen()

Database.defaults(schema).write()

client.connect()
