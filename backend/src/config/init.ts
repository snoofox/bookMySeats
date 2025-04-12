import pool from './db';

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        row_number INT NOT NULL,
        seat_number INT NOT NULL,
        UNIQUE(row_number, seat_number)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        seat_id INT REFERENCES seats(id),
        booked_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(seat_id)
      );
    `);

    // Check if seats are already populated
    const { rows } = await pool.query(`SELECT COUNT(*) FROM seats`);
    const count = parseInt(rows[0].count);

    if (count === 0) {
      const insertSeat = `INSERT INTO seats (row_number, seat_number) VALUES ($1, $2)`;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');
        for (let row = 1; row <= 12; row++) {
          const seatCount = row === 12 ? 3 : 7;
          for (let seat = 1; seat <= seatCount; seat++) {
            await client.query(insertSeat, [row, seat]);
          }
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }
  } catch (err) {
    console.error('Error initializing DB:', err);
    process.exit(1);
  }
};

export default initDB;
