require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Profile = require('./src/models/Profile');
const HireProfile = require('./src/models/HireProfile');
const Team = require('./src/models/Team');
const TeamMember = require('./src/models/TeamMember');
const Project = require('./src/models/Project');
const slugify = require('./src/utils/slugify');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    HireProfile.deleteMany({}),
    Team.deleteMany({}),
    TeamMember.deleteMany({}),
    Project.deleteMany({}),
  ]);
  // Create sample users
  const user1 = new User({ email: 'alice@example.com', username: 'alice' });
  await user1.setPassword('password123');
  await user1.save();
  const user2 = new User({ email: 'bob@example.com', username: 'bob' });
  await user2.setPassword('password123');
  await user2.save();
  // Profiles
  const profile1 = new Profile({ userId: user1._id, displayName: 'Alice', bio: 'Software developer and gamer' });
  const profile2 = new Profile({ userId: user2._id, displayName: 'Bob', bio: 'Esports enthusiast' });
  await profile1.save();
  await profile2.save();
  // Hire Profiles
  const hire1 = new HireProfile({ userId: user1._id, isActive: true, skills: ['JavaScript', 'Node.js'], categories: ['Web Development'], pricing: '$50/hr', availability: 'Weekdays' });
  await hire1.save();
  // Teams
  const team1 = new Team({ creator: user2._id, slug: slugify('Team Alpha'), name: 'Team Alpha', description: 'Pro gaming team' });
  await team1.save();
  const member1 = new TeamMember({ team: team1._id, user: user2._id, role: 'captain' });
  await member1.save();
  // Projects
  const project1 = new Project({ owner: user1._id, slug: slugify('Sample Project'), name: 'Sample Project', description: 'Demo project imported from GitHub', repoUrl: 'https://github.com/alice/sample' });
  await project1.save();
  console.log('Seeding complete');
  mongoose.disconnect();
}
seed().catch((err) => {
  console.error(err);
  mongoose.disconnect();
});