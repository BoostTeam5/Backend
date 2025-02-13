import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); 

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default pool;