import { Hocuspocus } from '@hocuspocus/server';

const server = Hocuspocus.configure({
  async onAuthenticate(data) {
    const { token } = data;

    // Example test if a user is authenticated with a token passed from the client
    if (token !== "super-secret-token") {
      throw new Error("Not authorized!");
    }

    // You can set contextual data to use it in other hooks
    return {
      user: {
        id: 1234,
        name: "John",
      },
    };
  },
});

server.listen(4001);
