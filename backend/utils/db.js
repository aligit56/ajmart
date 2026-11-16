const { createClient } = require('@libsql/client');
const path = require('path');

/**
 * Universal Database Adapter for AJMart
 * Seamlessly provides sqlite3 API (db.all, db.get, db.run, db.prepare, serialize)
 * backed by either Turso Cloud libSQL client or local SQLite file.
 */
function createDatabase() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // 1. If Turso credentials exist, create cloud adapter
  if (tursoUrl) {
    console.log('[DB] Connecting to Turso Cloud SQLite:', tursoUrl.split('@').pop());
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken
    });

    // Helper to sanitize parameters for Turso/Hrana
    // Converts undefined to null, ensures BigInt/Numbers are clean primitives
    const sanitizeParam = (val) => {
      if (val === undefined) return null;
      if (typeof val === 'bigint') return Number(val);
      return val;
    };

    const normalizeArgs = (params) => {
      if (!params) return [];
      if (Array.isArray(params)) {
        return params.map(sanitizeParam);
      }
      if (typeof params === 'object') {
        const cleanObj = {};
        for (const [k, v] of Object.entries(params)) {
          cleanObj[k] = sanitizeParam(v);
        }
        return cleanObj;
      }
      return [sanitizeParam(params)];
    };

    const executeWithRetry = async (stmt, maxRetries = 2) => {
      let lastErr = null;
      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await client.execute(stmt);
        } catch (err) {
          lastErr = err;
          const msg = (err && err.message) ? err.message.toLowerCase() : '';
          const isTransient = msg.includes('timeout') || msg.includes('socket') || msg.includes('fetch failed') || msg.includes('und_err');
          if (isTransient && i < maxRetries) {
            await new Promise(r => setTimeout(r, 400 * (i + 1)));
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    };

    const adapter = {
      type: 'turso',
      client,

      all(sql, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        executeWithRetry({ sql, args: normalizeArgs(params) })
          .then(rs => {
            if (callback) callback(null, rs.rows || []);
          })
          .catch(err => {
            console.error('[DB] Turso all error:', err.message, 'SQL:', sql);
            if (callback) callback(err);
          });
      },

      get(sql, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }
        executeWithRetry({ sql, args: normalizeArgs(params) })
          .then(rs => {
            const row = (rs.rows && rs.rows.length > 0) ? rs.rows[0] : undefined;
            if (callback) callback(null, row);
          })
          .catch(err => {
            console.error('[DB] Turso get error:', err.message, 'SQL:', sql);
            if (callback) callback(err);
          });
      },

      run(sql, params, callback) {
        if (typeof params === 'function') {
          callback = params;
          params = [];
        }

        // Handle transaction syntax cleanly
        const trimmed = sql.trim().toUpperCase();
        if (trimmed === 'BEGIN TRANSACTION' || trimmed === 'BEGIN') {
          if (callback) callback.call({ lastID: 0, changes: 0 }, null);
          return;
        }
        if (trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
          if (callback) callback.call({ lastID: 0, changes: 0 }, null);
          return;
        }

        executeWithRetry({ sql, args: normalizeArgs(params) })
          .then(rs => {
            const context = {
              lastID: rs.lastInsertRowid !== undefined && rs.lastInsertRowid !== null ? Number(rs.lastInsertRowid) : 0,
              changes: rs.rowsAffected || 0
            };
            if (callback) callback.call(context, null);
          })
          .catch(err => {
            console.error('[DB] Turso run error:', err.message, 'SQL:', sql);
            if (callback) callback(err);
          });
      },

      prepare(sql) {
        // Return a statement-like object with .run() and .finalize()
        const pending = [];
        return {
          run(...args) {
            let params = [];
            let cb = null;
            if (args.length === 1) {
              if (Array.isArray(args[0])) params = args[0];
              else if (typeof args[0] === 'function') cb = args[0];
              else params = [args[0]];
            } else if (args.length > 1) {
              if (Array.isArray(args[0])) {
                params = args[0];
                cb = args[1];
              } else if (typeof args[args.length - 1] === 'function') {
                cb = args.pop();
                params = args;
              } else {
                params = args;
              }
            }
            const p = client.execute({ sql, args: normalizeArgs(params) })
              .then(rs => {
                if (cb) cb(null);
                return rs;
              })
              .catch(err => {
                console.error('[DB] Turso prepared stmt error:', err.message);
                if (cb) cb(err);
                throw err;
              });
            pending.push(p);
          },
          finalize(callback) {
            Promise.all(pending)
              .then(() => { if (callback) callback(null); })
              .catch(err => { if (callback) callback(err); });
          }
        };
      },

      serialize(fn) {
        if (typeof fn === 'function') fn();
      },

      async transaction(fn) {
        let clientTx = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            clientTx = await client.transaction('write');
            break;
          } catch (e) {
            if (attempt === 3) throw e;
            await new Promise(r => setTimeout(r, 400 * attempt));
          }
        }
        try {
          const wrappedTx = {
            async execute(sql, args = []) {
              const rs = await clientTx.execute({ sql, args: normalizeArgs(args) });
              return {
                lastID: rs.lastInsertRowid !== undefined && rs.lastInsertRowid !== null ? Number(rs.lastInsertRowid) : 0,
                changes: rs.rowsAffected || 0,
                rows: rs.rows || []
              };
            }
          };
          const result = await fn(wrappedTx);
          await clientTx.commit();
          return result;
        } catch (err) {
          try {
            await clientTx.rollback();
          } catch (e) {
            // ignore rollback error
          }
          throw err;
        }
      },

      close(callback) {
        if (typeof client.close === 'function') client.close();
        if (callback) callback(null);
      }
    };

    return adapter;
  }

  // 2. Fallback to standard local SQLite file for development
  if (process.env.NODE_ENV === 'production' && !tursoUrl) {
    console.error('[DB FATAL] TURSO_DATABASE_URL is not set in production!');
    console.error('[DB FATAL] AJMart requires a persistent Turso database in production to ensure data persists across server restarts.');
    process.exit(1);
  }

  // Lazy-load sqlite3 only in local development fallback
  const sqlite3 = require('sqlite3').verbose();
  const localDbPath = path.resolve(__dirname, '../database.sqlite');
  console.log('[DB] Connecting to Local SQLite:', localDbPath);
  const localDb = new sqlite3.Database(localDbPath, (err) => {
    if (err) console.error('[DB] Local SQLite connection error:', err.message);
  });
  localDb.type = 'sqlite3';

  localDb.transaction = function(fn) {
    return new Promise((resolve, reject) => {
      localDb.serialize(() => {
        localDb.run('BEGIN TRANSACTION', async (beginErr) => {
          if (beginErr) return reject(beginErr);
          try {
            const wrappedTx = {
              execute(sql, args = []) {
                return new Promise((res, rej) => {
                  const trimmed = sql.trim().toUpperCase();
                  if (trimmed.startsWith('SELECT')) {
                    localDb.all(sql, args, (err, rows) => {
                      if (err) return rej(err);
                      res({ rows: rows || [], changes: 0, lastID: 0 });
                    });
                  } else {
                    localDb.run(sql, args, function(err) {
                      if (err) return rej(err);
                      res({ lastID: this.lastID, changes: this.changes, rows: [] });
                    });
                  }
                });
              }
            };
            const result = await fn(wrappedTx);
            localDb.run('COMMIT', (commitErr) => {
              if (commitErr) return reject(commitErr);
              resolve(result);
            });
          } catch (err) {
            localDb.run('ROLLBACK', () => {
              reject(err);
            });
          }
        });
      });
    });
  };

  return localDb;
}

module.exports = createDatabase;
