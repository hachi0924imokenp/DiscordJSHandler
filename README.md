# Pharuxtan Discord Bot System 

## How to launch

```console
> git clone https://github.com/Pharuxtan/discordbot.git
> cd discordbot
> npm install
```

Replace `BOT_TOKEN` at [index.js](https://github.com/Pharuxtan/discordbot/blob/master/index.js#L23) \
Replace `OWNER_ID` at [commands/restart.js](https://github.com/Pharuxtan/discordbot/blob/master/commands/restart.js#L7)

```console
> node index.js
```

## Commands

!test => send `test ok` \
!reboot :
 - exit => exit the program (restart if running on `pm2` or `forever`)
 - events => reload all `events` folder
 - globalvar => reinit `initGlobalVariable.js`
 - _ => reload all bot commands
