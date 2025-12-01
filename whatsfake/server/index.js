const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for MVP
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage });

// --- In-Memory Data Store ---

const users = [
  { id: 'u1', username: 'ProGamer22', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ProGamer22' },
  { id: 'u2', username: 'NoobSlayer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NoobSlayer' },
  { id: 'u3', username: 'HealerGirl', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HealerGirl' },
];

const chats = [
  {
    id: 'c1',
    type: 'direct',
    participants: ['u1', 'u2'],
    messages: []
  }
];

// Helper to find chat by ID
const getChat = (chatId) => chats.find(c => c.id === chatId);

// --- API Endpoints ---

// Register new user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const existing = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Username taken' });
  }

  const newUser = {
    id: 'u' + Date.now(),
    username,
    password, // In a real app, hash this!
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    friends: [], // List of user IDs
    friendRequests: [] // List of { from: userId, to: userId, status: 'pending' }
  };

  users.push(newUser);
  // Don't return password
  const { password: _, ...userWithoutPassword } = newUser;
  res.json(userWithoutPassword);
});

// Login user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Friend Request Endpoints

// Send Friend Request
app.post('/api/friends/request', (req, res) => {
  const { fromUserId, toUsername } = req.body;

  const fromUser = users.find(u => u.id === fromUserId);
  const toUser = users.find(u => u.username.toLowerCase() === toUsername.toLowerCase());

  if (!fromUser || !toUser) return res.status(404).json({ error: 'User not found' });
  if (fromUser.id === toUser.id) return res.status(400).json({ error: "Can't add yourself" });

  // Check if already friends or pending
  if (fromUser.friends.includes(toUser.id)) return res.status(400).json({ error: 'Already friends' });

  const existingReq = toUser.friendRequests.find(r => r.from === fromUserId);
  if (existingReq) return res.status(400).json({ error: 'Request already sent' });

  // Add request
  toUser.friendRequests.push({ from: fromUserId, to: toUser.id, status: 'pending' });

  // Notify recipient
  io.to(`user_${toUser.id}`).emit('friend_request', { from: fromUser.username });

  res.json({ success: true });
});

// Accept Friend Request
app.post('/api/friends/accept', (req, res) => {
  const { userId, fromUserId } = req.body;

  const user = users.find(u => u.id === userId);
  const fromUser = users.find(u => u.id === fromUserId);

  if (!user || !fromUser) return res.status(404).json({ error: 'User not found' });

  // Remove request
  user.friendRequests = user.friendRequests.filter(r => r.from !== fromUserId);

  // Add to friends list (bidirectional)
  if (!user.friends.includes(fromUserId)) user.friends.push(fromUserId);
  if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);

  res.json({ success: true });
});

// Get Friends and Requests
app.get('/api/friends', (req, res) => {
  const userId = req.query.userId;
  const user = users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const friendsList = user.friends.map(fid => {
    const f = users.find(u => u.id === fid);
    return {
      id: f.id,
      username: f.username,
      avatar: f.avatar,
      status: f.status,
      // In a real app, we'd track online status properly
      isOnline: true // Mock for now, or hook into socket
    };
  });

  const pendingRequests = user.friendRequests.map(r => {
    const f = users.find(u => u.id === r.from);
    return { id: f.id, username: f.username, avatar: f.avatar };
  });

  res.json({ friends: friendsList, requests: pendingRequests });
});

// Search user by username
app.post('/api/users/search', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Update user profile (updated to include game activity)
app.put('/api/users/:userId', (req, res) => {
  const { userId } = req.params;
  const { avatar, status, gameActivity } = req.body;

  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });

  if (avatar) users[userIndex].avatar = avatar;
  if (status) users[userIndex].status = status;
  if (gameActivity !== undefined) users[userIndex].gameActivity = gameActivity;

  const { password: _, ...userWithoutPassword } = users[userIndex];

  // Broadcast update to friends
  // In a real app, we'd optimize this
  io.emit('user_update', userWithoutPassword);

  res.json(userWithoutPassword);
});

// Get chats for a user
app.get('/api/chats', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const userChats = chats.filter(c => c.participants.includes(userId)).map(c => {
    // Enrich chat object with basic info
    if (c.type === 'direct') {
      const otherId = c.participants.find(p => p !== userId);
      const otherUser = users.find(u => u.id === otherId);
      return { ...c, name: otherUser ? otherUser.username : 'Unknown', avatar: otherUser ? otherUser.avatar : '' };
    }
    return { ...c, avatar: `https://ui-avatars.com/api/?name=${c.name}` };
  });

  res.json(userChats);
});

// Create a new chat (Direct or Group)
app.post('/api/chats', (req, res) => {
  const { type, participants, name } = req.body; // participants includes creator

  if (type === 'direct') {
    // Check if exists
    const existing = chats.find(c =>
      c.type === 'direct' &&
      c.participants.length === 2 &&
      c.participants.every(p => participants.includes(p))
    );
    if (existing) return res.json(existing);
  }

  const newChat = {
    id: 'c' + (chats.length + 1) + Date.now(),
    type,
    participants,
    name: name || '',
    messages: []
  };

  chats.push(newChat);

  // Notify participants
  participants.forEach(userId => {
    // In a real app we'd look up socket IDs, but for now we broadcast to room 'user_<id>'
    io.to(`user_${userId}`).emit('chat_new', newChat);
  });

  res.json(newChat);
});

// Get messages for a chat
app.get('/api/chats/:chatId/messages', (req, res) => {
  const chat = getChat(req.params.chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat.messages);
});

// Send a message
app.post('/api/chats/:chatId/messages', (req, res) => {
  const { chatId } = req.params;
  const { senderId, type, content } = req.body;

  const chat = getChat(chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const newMessage = {
    id: 'm' + Date.now(),
    chatId,
    senderId,
    type, // 'text', 'image', 'audio', 'video'
    content,
    timestamp: new Date().toISOString()
  };

  chat.messages.push(newMessage);

  // Broadcast to all participants in the chat
  io.to(chatId).emit('message_new', newMessage);

  res.json(newMessage);
});

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl, type: req.file.mimetype });
});

// --- Socket.IO ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined user_${userId}`);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`Socket ${socket.id} joined chat ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
