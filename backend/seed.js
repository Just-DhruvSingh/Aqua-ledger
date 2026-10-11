// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Ward = require('./models/Ward');
const Pipeline = require('./models/Pipeline');
const Complaint = require('./models/Complaint');
const User = require('./models/User');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[+] Connected to MongoDB Atlas for seeding...');

    // Clean existing collections to avoid duplicates
    await Promise.all([
      Ward.deleteMany({}),
      Pipeline.deleteMany({}),
      Complaint.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('[-] Cleared existing collections.');

    // 1. Seed Ward Alpha (Delhi coordinates: [lng, lat] for GeoJSON)
    const wardAlpha = await Ward.create({
      name: 'Ward Alpha - Rohini Sector 14',
      base_equity_score: 82.0,
      boundary: {
        type: 'Polygon',
        coordinates: [[
          [77.1000, 28.7000],
          [77.1300, 28.7000],
          [77.1300, 28.7300],
          [77.1000, 28.7300],
          [77.1000, 28.7000]
        ]]
      }
    });
    console.log(`[+] Created Ward: ${wardAlpha.name}`);

    // 2. Seed Default Admin & Operator Users
    const operator = await User.create({
      operator_id: 'OP-1042',
      password: 'admin123',
      role: 'operator',
      assigned_ward: wardAlpha._id
    });
    console.log(`[+] Created User: ${operator.operator_id} (Password: admin123)`);

    // 3. Seed Pipelines
    const pipelines = await Pipeline.create([
      {
        ward_id: wardAlpha._id,
        name: 'Trunk Feeder Alpha-1',
        max_capacity_lps: 500,
        status: 'normal',
        location: {
          type: 'LineString',
          coordinates: [
            [77.1050, 28.7050],
            [77.1120, 28.7120],
            [77.1180, 28.7180]
          ]
        }
      },
      {
        ward_id: wardAlpha._id,
        name: 'Sector 4 Distribution Loop',
        max_capacity_lps: 250,
        status: 'normal',
        location: {
          type: 'LineString',
          coordinates: [
            [77.1120, 28.7120],
            [77.1140, 28.7160],
            [77.1160, 28.7200]
          ]
        }
      },
      {
        ward_id: wardAlpha._id,
        name: 'Sector 7 Residential Branch',
        max_capacity_lps: 200,
        status: 'normal',
        location: {
          type: 'LineString',
          coordinates: [
            [77.1180, 28.7180],
            [77.1220, 28.7220]
          ]
        }
      }
    ]);
    console.log(`[+] Seeded ${pipelines.length} pipeline branches.`);

    // 4. Seed Baseline Citizen Complaints (Close to Sector 4 Loop)
    const complaints = await Complaint.create([
      {
        ward_id: wardAlpha._id,
        type: 'low_pressure',
        status: 'open',
        details: 'Low water pressure on second floor apartments.',
        location: {
          type: 'Point',
          coordinates: [77.1130, 28.7140] // [lng, lat]
        }
      },
      {
        ward_id: wardAlpha._id,
        type: 'low_pressure',
        status: 'open',
        details: 'Taps running dry during peak morning hours.',
        location: {
          type: 'Point',
          coordinates: [77.1135, 28.7148]
        }
      }
    ]);
    console.log(`[+] Seeded ${complaints.length} initial citizen complaints.`);

    console.log('\nDatabase seeding finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();