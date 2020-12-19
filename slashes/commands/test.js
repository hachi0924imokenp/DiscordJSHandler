module.exports = (globalVariables) => {
  Object.keys(globalVariables).map(variable => {
    global[variable] = globalVariables[variable];
  });
  
  async function command(slash){
    slash.send("test ok");
  }
  
  command.options = {
    name: ["test"],
    enable: true
  };
  
  return command;
}