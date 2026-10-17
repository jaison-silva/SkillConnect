import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { UserRole } from '../constants/enums.js';

dotenv.config();

const seedAdmin = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@skillconnect.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_NAME || 'SkillConnect Admin';

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    if (existingAdmin) {
      existingAdmin.role = UserRole.ADMIN;
      existingAdmin.isVerified = true;
      existingAdmin.passwordHash = passwordHash;
      await existingAdmin.save();
      console.log(`✅ Existing user updated to ADMIN: ${adminEmail}`);
    } else {
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: UserRole.ADMIN,
        isVerified: true,
      });
      console.log(`✅ Admin user created successfully: ${adminEmail}`);
    }

    console.log(`\n--- Admin Credentials ---`);
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${UserRole.ADMIN}`);
    console.log(`Verified: true\n`);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seedAdmin();
