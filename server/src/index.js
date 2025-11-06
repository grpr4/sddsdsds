import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import db from './database.js';
import { generateToken, verifyToken, requireAdmin } from './auth.js';

const app = express();
const PORT = 3000;

const ADMIN_EMAILS = ['admin@r4academy.com', 'seu@email.com'];

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ).run(name, email, passwordHash, role);

    db.prepare(
      'INSERT INTO user_profiles (user_id) VALUES (?)'
    ).run(result.lastInsertRowid);

    const user = { id: result.lastInsertRowid, name, email, role };
    const token = generateToken(user);

    res.json({ user: { ...user, password: undefined }, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const { password_hash, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

app.get('/api/profile', verifyToken, (req, res) => {
  const profile = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, up.profile_image_url, up.bio
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    WHERE u.id = ?
  `).get(req.user.id);
  
  res.json(profile);
});

app.put('/api/profile', verifyToken, (req, res) => {
  const { name, bio, profile_image_url } = req.body;
  
  db.prepare('UPDATE users SET name = ? WHERE id = ?').run(name, req.user.id);
  db.prepare('UPDATE user_profiles SET bio = ?, profile_image_url = ? WHERE user_id = ?')
    .run(bio || null, profile_image_url || null, req.user.id);
  
  res.json({ success: true });
});

app.get('/api/subscription/status', verifyToken, (req, res) => {
  const subscription = db.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).get(req.user.id);
  
  res.json({
    hasSubscription: subscription?.status === 'active',
    subscription: subscription || null
  });
});

app.get('/api/courses', verifyToken, (req, res) => {
  const courses = db.prepare(`
    SELECT c.*, COUNT(l.id) as lesson_count
    FROM courses c
    LEFT JOIN lessons l ON c.id = l.course_id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();
  
  res.json(courses);
});

app.post('/api/courses', verifyToken, requireAdmin, (req, res) => {
  const { title, description, thumbnail_url } = req.body;
  
  const result = db.prepare(
    'INSERT INTO courses (title, description, thumbnail_url) VALUES (?, ?, ?)'
  ).run(title, description || null, thumbnail_url || null);
  
  res.json({ id: result.lastInsertRowid, title, description, thumbnail_url });
});

app.put('/api/courses/:id', verifyToken, requireAdmin, (req, res) => {
  const { title, description, thumbnail_url } = req.body;
  
  db.prepare(
    'UPDATE courses SET title = ?, description = ?, thumbnail_url = ? WHERE id = ?'
  ).run(title, description, thumbnail_url, req.params.id);
  
  res.json({ success: true });
});

app.delete('/api/courses/:id', verifyToken, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.get('/api/courses/:courseId/lessons', verifyToken, (req, res) => {
  const lessons = db.prepare(`
    SELECT l.*, 
           COALESCE(lp.completed, 0) as completed
    FROM lessons l
    LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.user_id = ?
    WHERE l.course_id = ?
    ORDER BY l.order_index, l.id
  `).all(req.user.id, req.params.courseId);
  
  res.json(lessons);
});

app.post('/api/lessons', verifyToken, requireAdmin, (req, res) => {
  const { course_id, title, description, youtube_video_id, order_index } = req.body;
  
  const result = db.prepare(
    'INSERT INTO lessons (course_id, title, description, youtube_video_id, order_index) VALUES (?, ?, ?, ?, ?)'
  ).run(course_id, title, description || null, youtube_video_id, order_index || 0);
  
  res.json({ id: result.lastInsertRowid, course_id, title, description, youtube_video_id, order_index });
});

app.put('/api/lessons/:id', verifyToken, requireAdmin, (req, res) => {
  const { title, description, youtube_video_id, order_index } = req.body;
  
  db.prepare(
    'UPDATE lessons SET title = ?, description = ?, youtube_video_id = ?, order_index = ? WHERE id = ?'
  ).run(title, description, youtube_video_id, order_index, req.params.id);
  
  res.json({ success: true });
});

app.delete('/api/lessons/:id', verifyToken, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

app.post('/api/lessons/:id/complete', verifyToken, (req, res) => {
  const { completed } = req.body;
  
  const existing = db.prepare(
    'SELECT * FROM lesson_progress WHERE user_id = ? AND lesson_id = ?'
  ).get(req.user.id, req.params.id);
  
  if (existing) {
    db.prepare(
      'UPDATE lesson_progress SET completed = ?, completed_at = ? WHERE user_id = ? AND lesson_id = ?'
    ).run(completed ? 1 : 0, completed ? new Date().toISOString() : null, req.user.id, req.params.id);
  } else {
    db.prepare(
      'INSERT INTO lesson_progress (user_id, lesson_id, completed, completed_at) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, req.params.id, completed ? 1 : 0, completed ? new Date().toISOString() : null);
  }
  
  res.json({ success: true });
});

app.get('/api/chat/history/:agentType', verifyToken, (req, res) => {
  const history = db.prepare(
    'SELECT * FROM ai_chat_history WHERE user_id = ? AND agent_type = ? ORDER BY created_at ASC'
  ).all(req.user.id, req.params.agentType);
  
  res.json(history);
});

app.post('/api/chat/history', verifyToken, (req, res) => {
  const { agent_type, role, content, image_url } = req.body;
  
  const result = db.prepare(
    'INSERT INTO ai_chat_history (user_id, agent_type, role, content, image_url) VALUES (?, ?, ?, ?, ?)'
  ).run(req.user.id, agent_type, role, content, image_url || null);
  
  res.json({ id: result.lastInsertRowid });
});

app.listen(PORT, 'localhost', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
