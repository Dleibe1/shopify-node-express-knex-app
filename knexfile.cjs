module.exports = {
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "L0vemarie",
    database: "shopify-express-app",
  },
  migrations: {
    directory: "./migrations",
  },
};
