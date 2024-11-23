import database from "infra/database.js";

async function status(request, response) {
  // Controller
  const updatedAt = new Date().toISOString();

  // max connections
  const maxConnectionsResult = await database.query("SHOW max_connections;");
  const maxConnections = parseInt(maxConnectionsResult.rows[0].max_connections);

  // activeConnections
  const databaseName = process.env.POSTGRES_DB;
  const activeConnectionsResult = await database.query({
    text: "SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1;",
    values: [databaseName],
  });

  //"SELECT COUNT(*) FROM pg_stat_activity WHERE datname = 'local_db';"
  const activeConnections = parseInt(activeConnectionsResult.rows[0].count);

  // postgres version
  const postgresVersionResult = await database.query("SHOW server_version;");
  const postgresVersion = postgresVersionResult.rows[0].server_version;

  // View
  response.status(200).json({
    updated_at: updatedAt,
    dependencies: {
      database: {
        max_connections: maxConnections,
        active_connections: activeConnections,
        postgres_version: postgresVersion,
      },
    },
  });
}

export default status;
