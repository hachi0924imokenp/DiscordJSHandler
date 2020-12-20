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
    slash = true;

    async init(interaction){
      this.interaction = interaction;
      this.command = interaction.data.name;
      this.options = interaction.data.options;
      this.guild = client.guilds.cache.get(interaction.guild_id);
      this.channel = this.guild.channels.cache.get(interaction.channel_id);
      this.member = await this.guild.members.fetch(interaction.member.user.id);
      this.author = this.member.user;
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

    async callMessageEvent(){
      let send = this.channel.send;
      let self = this;
      this.channel.send = async (...args) => {
        let msg = await self.send(...args);
        this.channel.send = send;
        return msg;
      }
      client.emit("message", this);
    }

    async send(content = "\u200B", embeds = [], allowed_mentions = {}, tts = false){
      let data = {content,embeds,allowed_mentions,tts};
      if(embeds instanceof Discord.MessageEmbed){
        data.embeds = [embeds];
      } if(content instanceof Discord.MessageEmbed){
        if(Array.isArray(data.embeds)) data.embeds.push(content);
        else data.embeds = [content];
        data.content = "\u200B";
      } if(typeof content == "object"){
        if(content.tts) data.tts = content.tts
        if(content.allowed_mentions) data.allowed_mentions = content.allowed_mentions
        if(content.embeds) data.embeds = content.embeds
        if(content.embed){
          if(Array.isArray(data.embeds)) data.embeds.push(content.embed);
          else data.embeds = [content.embed];
        }
        if(content.content) data.content = content.content
        else data.content = "\u200B";
      } else if(typeof embeds == "object"){
        if(content.tts) data.tts = content.tts
        if(content.allowed_mentions) data.allowed_mentions = content.allowed_mentions
        if(content.embeds) data.embeds = content.embeds
        else data.embeds = [];
        if(content.embed){
          if(Array.isArray(data.embeds)) data.embeds.push(content.embed);
          else data.embeds = [content.embed];
        }
      } if(data.embeds instanceof Discord.MessageEmbed){
        data.embeds = [data.embeds];
      } if(data.content instanceof Discord.MessageEmbed){
        if(Array.isArray(data.embeds)) data.embeds.push(data.content);
        else data.embeds = [data.content];
        data.content = "\u200B";
      }
      client.api.interactions(this.interaction.id, this.interaction.token).callback.post({data: {
        type: 4,
        data
      }});
      return this.channel.awaitMessages(m => m.author.id == client.user.id, {max: 1}).then(m => m.first());
    }
  }
}
