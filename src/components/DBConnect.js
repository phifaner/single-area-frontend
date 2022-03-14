const Connector = require('@mapd/connector');

const hostname = process.env.HOSTNAME || '172.27.142.211';
const protocol = process.env.PROTOCOL || 'http';
const port = process.env.PORT || '6273';
const database = process.env.DATABASE || 'mapd';
const username = process.env.USERNAME || 'mapd';
const password = process.env.PASSWORD || 'HyperInteractive';

// const query = 'SELECT count(*) AS n, EXTRACT(HOUR FROM record_time)
//  AS h from wz_phone GROUP BY EXTRACT(HOUR FROM record_time)';

export default function getCellCount() {
  // const defaultQueryOptions = {};
  const connector = new Connector();

  connector
    .protocol(protocol)
    .host(hostname)
    .port(port)
    .dbName(database)
    .user(username)
    .password(password)
    // .connectAsync()
    .connect((err, con) => console.log(con.sessionId()));
  // .then((session) => {
  //   // now that we have a session open we can make some db calls:
  //   Promise.all([
  //     session.getDashboardsAsync(),
  //     session.getTablesAsync(),
  //     session.queryAsync(query, defaultQueryOptions)
  //   ]);
  // })
  // // values is an array of results from all the promises above
  // .then((values) => {
  //   // handle result of getDashboardsAsync
  //   console.log(
  //     `All dashboards available at ${hostname}:\n`,
  //     values[0].map((dash) => dash.dashboard_name)
  //   );

  //   // handle result of getTablesAsync
  //   console.log(
  //     `\nAll tables available at ${hostname}:\n\n`,
  //     values[1].map((x) => x.name)
  //   );

  //   // handle result of second query
  //   console.log(
  //     '\nQuery results:\n\n',
  //     values[2].reduce((o, x) => Object.assign(o, { [x.key0]: x.val }), {})
  //   );
  // })
  // .catch((error) => {
  //   console.error('Something bad happened: ', error);
  // });
}
