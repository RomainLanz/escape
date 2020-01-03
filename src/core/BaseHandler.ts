import { Message } from 'discord.js'
import { LowdbSync } from 'lowdb'

interface BaseHandlerConstructor {
  listenOn: string[]
  new (database: LowdbSync<any>, message: Message): BaseHandler
}

class BaseHandler {
  /**
   * The database instance.
   */
  protected db: LowdbSync<any>

  /**
   * The context of the message sent.
   */
  protected context: Message

  constructor (database: LowdbSync<any>, context: Message) {
    this.db = database
    this.context = context
  }

  public handle () {
  }
}

export default BaseHandler
export { BaseHandlerConstructor }
