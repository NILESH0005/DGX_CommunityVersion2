export async function queryAsync(conn, query, params) {
    return new Promise((resolve, reject) => {
        conn.query(query, params, (err, results) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(results);
        });
    });
};