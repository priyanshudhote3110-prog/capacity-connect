/**
 * policies/index.js - Unified Policy Exports
 * Ministry of Earth Sciences (MoES) — Capacity Connect LMS
 */

const { ROLES } = require("../config/roles.js");
const adminPolicy = require("./adminPolicy.js");
const trainerPolicy = require("./trainerPolicy.js");
const employeePolicy = require("./employeePolicy.js");

const POLICIES = {
  [ROLES.ADMIN]: adminPolicy,
  [ROLES.TRAINER]: trainerPolicy,
  [ROLES.EMPLOYEE]: employeePolicy
};

function getPolicyForRole(role) {
  return POLICIES[role] || employeePolicy;
}

module.exports = {
  adminPolicy,
  trainerPolicy,
  employeePolicy,
  getPolicyForRole
};
