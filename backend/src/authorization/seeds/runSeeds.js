/**
 * runSeeds.js - Executes PBAC Seeds into UserModel and provides SQL payload
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { SEED_ADMINS } = require("./seedAdmins.js");
const { SEED_TRAINERS } = require("./seedTrainers.js");
const { DEFAULT_PERMISSIONS } = require("./seedPermissions.js");
const UserModel = require("../../models/User.js");

function runSeeds() {
  console.log("====================================================================");
  console.log("⚡ Executing PBAC Authorization & Identity Seeding for MoES LMS");
  console.log("====================================================================");

  let adminCount = 0;
  SEED_ADMINS.forEach(admin => {
    const existing = UserModel.findByEmail(admin.email);
    if (!existing) {
      UserModel.create(admin);
      adminCount++;
    } else {
      UserModel.update(existing.id, {
        role: "admin",
        customRoleId: admin.customRoleId,
        password: admin.password,
        name: admin.name,
        institute: admin.institute,
        designation: admin.designation
      });
    }
  });
  console.log(`✅ Loaded 5 Predefined Executive Admins (Synced: ${adminCount} new).`);

  let trainerCount = 0;
  SEED_TRAINERS.forEach(trainer => {
    const existing = UserModel.findByEmail(trainer.email);
    if (!existing) {
      UserModel.create(trainer);
      trainerCount++;
    } else {
      UserModel.update(existing.id, {
        role: "trainer",
        customRoleId: trainer.customRoleId,
        password: trainer.password,
        name: trainer.name,
        institute: trainer.institute,
        designation: trainer.designation
      });
    }
  });
  console.log(`✅ Loaded 10 Predefined Specialist Trainers (Synced: ${trainerCount} new).`);
  console.log(`✅ PBAC Permission Matrix ready with ${Object.keys(DEFAULT_PERMISSIONS).length} role configurations.`);
  console.log("====================================================================\n");

  return {
    admins: SEED_ADMINS.length,
    trainers: SEED_TRAINERS.length,
    totalPersonnel: UserModel.findAll().length
  };
}

module.exports = {
  runSeeds
};

if (require.main === module) {
  runSeeds();
}
