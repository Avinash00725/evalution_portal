import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';
import Judge from './models/Judge.js';
import Team from './models/Team.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aisummit');
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await Admin.deleteMany({});
    await Judge.deleteMany({});
    await Team.deleteMany({});
    console.log('Cleared existing data');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('admin123', salt);
    const hashedJudgePassword = await bcrypt.hash('judge123', salt);

    // Seed Admins
    const admins = await Admin.insertMany([
      {
        name: 'Super Admin',
        email: 'admin1@aisummit.com',
        password: hashedAdminPassword,
        isSuper: true
      },
      {
        name: 'John Smith',
        email: 'john1@aisummit.com',
        password: hashedAdminPassword,
        isSuper: false
      }
    ]);
    console.log('✓ Admins seeded:', admins.length);

    // Seed Judges
    const judges = await Judge.insertMany([
      {
        name: 'Dr. Sarah Johnson',
        email: 'judge1@aisummit.com',
        password: hashedJudgePassword,
        assignedEvent: 'poster-presentation',
        isActive: true
      },
      {
        name: 'Prof. Michael Chen',
        email: 'judge2@aisummit.com',
        password: hashedJudgePassword,
        assignedEvent: 'paper-presentation',
        isActive: true
      },
      {
        name: 'Dr. Emily Williams',
        email: 'judge3@aisummit.com',
        password: hashedJudgePassword,
        assignedEvent: 'startup-expo',
        isActive: true
      },
      {
        name: 'Dr. Robert Brown',
        email: 'judge4@aisummit.com',
        password: hashedJudgePassword,
        assignedEvent: 'poster-presentation',
        isActive: true
      }
    ]);
    console.log('✓ Judges seeded:', judges.length);
    // Seed Teams

    // Seed Teams
    const teams = await Team.insertMany([
      {
        name: 'AI Innovators',
        eventType: 'poster-presentation',
        members: [
          { name: 'Alice Kumar', email: 'alice@team.com', role: 'Team Lead' },
          { name: 'Bob Smith', email: 'bob@team.com', role: 'Developer' },
          { name: 'Carol White', email: 'carol@team.com', role: 'Designer' }
        ],
        description: 'Exploring novel AI algorithms for image recognition'
      },
      {
        name: 'Neural Networks United',
        eventType: 'poster-presentation',
        members: [
          { name: 'David Lee', email: 'david@team.com', role: 'Team Lead' },
          { name: 'Emma Davis', email: 'emma@team.com', role: 'Researcher' }
        ],
        description: 'Deep learning applications in healthcare'
      },
      {
        name: 'ML Masters',
        eventType: 'paper-presentation',
        members: [
          { name: 'Frank Zhang', email: 'frank@team.com', role: 'Team Lead' },
          { name: 'Grace Martinez', email: 'grace@team.com', role: 'Data Scientist' },
          { name: 'Henry Wilson', email: 'henry@team.com', role: 'Engineer' },
          { name: 'Ivy Chen', email: 'ivy@team.com', role: 'Analyst' }
        ],
        description: 'Research on reinforcement learning for robotics'
      },
      {
        name: 'Data Wizards',
        eventType: 'paper-presentation',
        members: [
          { name: 'Jack Taylor', email: 'jack@team.com', role: 'Team Lead' },
          { name: 'Kelly Brown', email: 'kelly@team.com', role: 'Researcher' },
          { name: 'Liam Anderson', email: 'liam@team.com', role: 'Developer' }
        ],
        description: 'Natural language processing advancements'
      },
      {
        name: 'Tech Titans',
        eventType: 'startup-expo',
        members: [
          { name: 'Maya Patel', email: 'maya@team.com', role: 'CEO' },
          { name: 'Nathan Green', email: 'nathan@team.com', role: 'CTO' },
          { name: 'Olivia Scott', email: 'olivia@team.com', role: 'COO' }
        ],
        description: 'AI-powered customer service platform'
      },
      {
        name: 'Smart Solutions',
        eventType: 'startup-expo',
        members: [
          { name: 'Peter Johnson', email: 'peter@team.com', role: 'Founder' },
          { name: 'Quinn Roberts', email: 'quinn@team.com', role: 'Co-founder' }
        ],
        description: 'Automated financial advisory using AI'
      },
      {
        name: 'Future Coders',
        eventType: 'poster-presentation',
        members: [
          { name: 'Rachel Kim', email: 'rachel@team.com', role: 'Team Lead' },
          { name: 'Sam Thomas', email: 'sam@team.com', role: 'Developer' },
          { name: 'Tina Lewis', email: 'tina@team.com', role: 'Designer' }
        ],
        description: 'Computer vision for autonomous vehicles'
      },
      {
        name: 'Code Warriors',
        eventType: 'startup-expo',
        members: [
          { name: 'Uma Singh', email: 'uma@team.com', role: 'Team Lead' },
          { name: 'Victor Moore', email: 'victor@team.com', role: 'Engineer' },
          { name: 'Wendy Clark', email: 'wendy@team.com', role: 'Marketing' },
          { name: 'Xavier Hall', email: 'xavier@team.com', role: 'Sales' }
        ],
        description: 'AI-driven educational platform for personalized learning'
      }
    ]);
    console.log('✓ Teams seeded:', teams.length);

    console.log('\n=== Seeding Complete ===');
    console.log('\nLogin Credentials:');
    console.log('\nAdmin:');
    console.log('  Email: admin@aisummit.com');
    console.log('  Password: admin123');
    console.log('\nJudge Examples:');
    console.log('  Email: sarah.judge@aisummit.com (Poster Presentation)');
    console.log('  Email: michael.judge@aisummit.com (Paper Presentation)');
    console.log('  Email: emily.judge@aisummit.com (Startup Expo)');
    console.log('  Password: judge123 (for all judges)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
