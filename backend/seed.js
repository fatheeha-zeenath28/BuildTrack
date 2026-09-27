const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const dotenv   = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Project = require('./models/Project');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Project.deleteMany({});

  const admin = await User.create({ name:'Admin User',  email:'admin@buildtrack.com',    password:'admin123',  role:'admin'    });
  const eng   = await User.create({ name:'Ali Engineer',email:'engineer@buildtrack.com', password:'eng123',    role:'engineer' });
  const client= await User.create({ name:'Sara Client', email:'client@buildtrack.com',   password:'client123', role:'client'   });

  await Project.create({
    title:'Highway Bridge Construction', description:'A major infrastructure project connecting two cities.',
    location:'Colombo, Sri Lanka', status:'active', progress:45,
    startDate: new Date('2024-01-15'), endDate: new Date('2025-06-30'),
    budget: 5000000, admin: admin._id, engineers:[eng._id], clients:[client._id]
  });

  await Project.create({
    title:'Commercial Tower – Phase 1', description:'20-floor commercial building in the city centre.',
    location:'Kandy, Sri Lanka', status:'planning', progress:10,
    startDate: new Date('2024-03-01'), endDate: new Date('2026-01-01'),
    budget: 12000000, admin: admin._id, engineers:[eng._id], clients:[client._id]
  });

  console.log('✅ Seed complete!');
  console.log('   admin@buildtrack.com    / admin123');
  console.log('   engineer@buildtrack.com / eng123');
  console.log('   client@buildtrack.com   / client123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
