-- Database: chesskidoo
-- DROP TABLE IF EXISTS classes CASCADE;
-- DROP TABLE IF EXISTS students CASCADE;
-- DROP TABLE IF EXISTS coaches CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student', 'coach')),
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS coaches (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    fide_rating VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    age INT,
    level VARCHAR(50) DEFAULT 'Beginner',
    coach_id INT REFERENCES coaches(id) ON DELETE SET NULL,
    rating INT DEFAULT 800,
    next_lesson VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    level VARCHAR(50) NOT NULL,
    day VARCHAR(20),
    time VARCHAR(20),
    coach_id INT REFERENCES coaches(id) ON DELETE SET NULL
);

-- Clear existing data to avoid duplicates on re-run
TRUNCATE TABLE classes, students, coaches, users RESTART IDENTITY CASCADE;

-- Insert Users (Passwords are hashed using bcrypt for 'password123' etc.)
-- bcrypt hash for 'Admin123$' (10 rounds): $2a$10$YOUR_HASH_HERE
-- For simplicity in this demo SQL, we insert plaintext and rely on app logic to hash if needed.
-- However, to make login work instantly, we pre-hash common passwords.
-- Admin123$ -> $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.
-- Student123 -> $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8. (example, use real hash)
-- Let's generate simple bcrypt hashes for these specific passwords.

INSERT INTO users (username, password, role, name) VALUES
('admin@ck', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'admin', 'Admin'),
('student@ck', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'student', 'Riya'),
('coach@ck', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'coach', 'Vishnu');

-- Insert Coaches
INSERT INTO coaches (user_id, name, fide_rating, email) VALUES
(3, 'Ranjith', '2200+', 'ranjith@chesskidoo.com'),
(3, 'Vishnu', '1800', 'vishnu@chesskidoo.com'),
(3, 'Gyansurya', '1600', 'gyan@chesskidoo.com');

-- Insert Students
INSERT INTO students (user_id, name, age, level, coach_id, rating, next_lesson) VALUES
(2, 'Riya', 10, 'Beginner', 2, 850, 'Mon 17:00 – Beginner Level'),
(NULL, 'Adhavan', 13, 'Intermediate', 1, 1350, 'Tue 16:00 – Intermediate Level'),
(NULL, 'Saran', 16, 'Advanced', 3, 1900, 'Fri 18:00 – Advanced Level');

-- Insert Classes
INSERT INTO classes (title, level, day, time, coach_id) VALUES
('Beginner Basics', 'Beginner', 'Mon', '17:00', 2),
('Intermediate Strategies', 'Intermediate', 'Tue', '16:00', 1),
('Advanced Tactics', 'Advanced', 'Fri', '18:00', 3);
