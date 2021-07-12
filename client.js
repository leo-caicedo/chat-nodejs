const { Socket } = require("net");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const errorHandler = (err) => {
  console.error(err);
  process.exit(1);
};

const connect = (host, port) => {
  const socket = new Socket();
  socket.connect({ host, port });
  socket.setEncoding("utf-8");
  socket.on("error", (err) => errorHandler(err.message));
  const END = "end";

  socket.on("connect", () => {
    console.log(`Connected to ${host}:${port}`);

    readline.question("Choose your username: ", (username) => {
      socket.write(username);
      console.log(`Type any message to send it or type '${END}' to finish`);
    });

    readline.on("line", (message) => {
      socket.write(message);
      if (message === END) {
        socket.end();
        console.log("Disconnected");
        process.exit(0);
      }
    });
  });

  socket.on("data", (data) => {
    console.log(data);
  });

  socket.on("close", () => process.exit(0));
};

const main = () => {
  if (process.argv.length !== 4) {
    errorHandler(`USAGE: node ${__filename} host port`);
  }

  let [, , host, port] = process.argv;
  if (isNaN(port)) {
    errorHandler(`Invalid port ${port}`);
  }

  port = Number(port);

  connect(host, port);
};

if (require.main === module) {
  main();
}
