module.exports = (globalVariables) => {
  Object.keys(globalVariables).map(variable => {
    global[variable] = globalVariables[variable];
  });

  //preload commands
  if(fs.existsSync(__dirname+"/commands")){
    let commands = getFiles(__dirname+"/commands").filter(f => f.endsWith(".js"));
    for(let i=0; i<commands.length; i++) require(commands[i]);
  }
  
  client.ws.on('INTERACTION_CREATE', async interaction => {
    let slash = await new SlashAPI().init(interaction);
    let commands = getFiles(__dirname+"/commands").filter(f => f.endsWith(".js"));
    for(let i=0; i<commands.length; i++){
      let command = require(commands[i])(globalVariables);
      for(let n=0; n<command.options.name.length; n++){
        if(slash.content.toLowerCase().startsWith(command.options.name[n].toLowerCase()) && command.options.enable) return command(slash);
      }
    }
  });

  class SlashAPI {
    async init(interaction){
      this.interaction = interaction;
      this.command = interaction.data.name;
      this.options = interaction.options;
      this.guild = client.guilds.cache.get(interaction.guild_id);
      this.channel = this.guild.channels.cache.get(interaction.channel_id);
      this.member = await this.guild.members.fetch(interaction.member.user.id);
      let content = this.command;
      function fetchOptions(options){
        for(let option of options){
          if(option.value) content += ` ${option.value}`;
          else content += ` ${option.name}`;
          if(option.options) fetchOptions(option.options);
        }
      }
      if(interaction.data.options) fetchOptions(interaction.data.options);
      this.content = content;
      return this;
    }

    send(content = "", embeds = [], allowed_mentions = {}, tts = false){
      if(embeds instanceof Discord.MessageEmbed){
        embeds = [embeds];
      } if(typeof content == "object"){
        if(content.tts) tts = content.tts
        if(content.allowed_mentions) allowed_mentions = content.allowed_mentions
        if(content.embeds) embeds = content.embeds
        if(content.content) content = content.content
        else content = "";
      } else if(typeof embeds == "object"){
        if(content.tts) tts = content.tts
        if(content.allowed_mentions) allowed_mentions = content.allowed_mentions
        if(content.embeds) embeds = content.embeds
        else embeds = [];
      } if(embeds instanceof Discord.MessageEmbed){
        embeds = [embeds];
      } 
      client.api.interactions(this.interaction.id, this.interaction.token).callback.post({data: {
        type: 4,
        data: {
          content,
          embeds,
          allowed_mentions,
          tts
        }
      }});
    }
  }
}