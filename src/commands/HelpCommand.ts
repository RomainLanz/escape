import { RichEmbed } from 'discord.js'
import BaseCommand from '../core/BaseCommand'

class HelpCommand extends BaseCommand {
  static commandName = 'help'

  handle () {
    const embed = new RichEmbed()

    embed.setTitle('Liste des commandes')
      .setColor('#63b3ed')
      .addBlankField()
      .addField('!quote <messageId>', '- Cite le message demandé')
      .addField('!avatar @user', "- Affiche l'avatar de l'utilisateur")

    this.send(embed)
  }
}

export default HelpCommand
