module.exports = (globalVariables) => {
  Object.keys(globalVariables).map(variable => {
    global[variable] = globalVariables[variable];
  });
  
  async function command(slash){
    console.log(slash.content);
    slash.send("test ok");
  }
  
  command.options = {
    name: ["test"],
    enable: true
  };
  
  return command;
}