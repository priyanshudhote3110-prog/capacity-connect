/**
 * employeeController.js - Directory Management & Channel Preferences
 * Capacity Connect LMS — Ministry of Earth Sciences (MoES), Govt. of India
 */

const db = require("../database.js");
const notificationService = require("../services/notificationService.js");

class EmployeeController {
  /**
   * GET /api/admin/employees
   */
  async getEmployees(req, res) {
    try {
      const list = db.data.employees || [];
      const institute = req.query.institute;
      const search = (req.query.search || "").toLowerCase().trim();

      let filtered = [...list];
      if (institute && institute !== "ALL") {
        filtered = filtered.filter(e => e.institute === institute);
      }
      if (search) {
        filtered = filtered.filter(e =>
          e.name.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search) ||
          e.phone.includes(search) ||
          e.customRoleId.toLowerCase().includes(search) ||
          e.department.toLowerCase().includes(search)
        );
      }

      return res.status(200).json({
        success: true,
        count: filtered.length,
        total: list.length,
        employees: filtered
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * POST /api/admin/employees
   */
  async createEmployee(req, res) {
    try {
      const { name, email, phone, department, institute, designation } = req.body;

      if (!name || !email || !phone || !department) {
        return res.status(400).json({
          success: false,
          error: "Mandatory fields required: name, email, phone, department."
        });
      }

      // 1. Validate Email
      if (!notificationService.validateEmail(email)) {
        return res.status(400).json({
          success: false,
          error: `Invalid email address format: '${email}'`
        });
      }

      // 2. Sanitize & Validate Phone (E.164)
      const sanitizedPhone = notificationService.sanitizeIndianPhone(phone);
      if (!sanitizedPhone) {
        return res.status(400).json({
          success: false,
          error: `Invalid Indian phone number: '${phone}'. Must be valid 10 digits.`
        });
      }

      // 3. Duplicate Check
      const list = db.data.employees || [];
      const cleanEmail = email.toLowerCase().trim();
      const existing = list.find(e => e.email.toLowerCase() === cleanEmail || e.phone === sanitizedPhone);

      if (existing) {
        return res.status(409).json({
          success: false,
          error: `Conflict: An officer with email '${email}' or phone '${phone}' is already registered.`
        });
      }

      // 4. Generate New Record
      const newId = `emp_${Date.now().toString(36)}`;
      const inst = institute || "IMD";
      const customRoleId = `EMP-${inst}-${Math.floor(100 + Math.random() * 900)}`;

      const newEmployee = {
        id: newId,
        customRoleId,
        name: name.trim(),
        email: cleanEmail,
        phone: sanitizedPhone,
        department: department.trim(),
        institute: inst,
        designation: designation || "Scientist",
        email_notify: true,
        whatsapp_notify: true,
        status: "active",
        created_at: new Date().toISOString()
      };

      if (!db.data.employees) db.data.employees = [];
      db.data.employees.unshift(newEmployee);
      db.save();

      return res.status(201).json({
        success: true,
        message: `Officer '${name}' successfully registered with notifications enabled.`,
        employee: newEmployee
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PUT /api/admin/employees/:id
   */
  async updateEmployee(req, res) {
    try {
      const id = req.params.id;
      const { name, email, phone, department, institute, designation } = req.body;

      const list = db.data.employees || [];
      const employee = list.find(e => e.id === id);

      if (!employee) {
        return res.status(404).json({ success: false, error: `Employee '${id}' not found.` });
      }

      if (email) {
        if (!notificationService.validateEmail(email)) {
          return res.status(400).json({ success: false, error: `Invalid email address: '${email}'` });
        }
        const cleanEmail = email.toLowerCase().trim();
        const dup = list.find(e => e.email.toLowerCase() === cleanEmail && e.id !== id);
        if (dup) {
          return res.status(409).json({ success: false, error: `Email '${email}' is already in use by another officer.` });
        }
        employee.email = cleanEmail;
      }

      if (phone) {
        const sanitized = notificationService.sanitizeIndianPhone(phone);
        if (!sanitized) {
          return res.status(400).json({ success: false, error: `Invalid Indian mobile number: '${phone}'.` });
        }
        const dup = list.find(e => e.phone === sanitized && e.id !== id);
        if (dup) {
          return res.status(409).json({ success: false, error: `Phone number '${phone}' is already in use by another officer.` });
        }
        employee.phone = sanitized;
      }

      if (name) employee.name = name.trim();
      if (department) employee.department = department.trim();
      if (institute) employee.institute = institute;
      if (designation) employee.designation = designation.trim();
      employee.updated_at = new Date().toISOString();

      db.save();

      return res.status(200).json({
        success: true,
        message: `Employee '${employee.name}' updated successfully.`,
        employee
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * PATCH /api/admin/employees/:id/toggle
   * Instantly toggle email_notify or whatsapp_notify flag
   */
  async toggleChannel(req, res) {
    try {
      const id = req.params.id;
      const { channel, enabled } = req.body;

      if (!["email", "whatsapp"].includes(channel)) {
        return res.status(400).json({
          success: false,
          error: "Channel must be either 'email' or 'whatsapp'."
        });
      }

      const list = db.data.employees || [];
      const employee = list.find(e => e.id === id);

      if (!employee) {
        return res.status(404).json({ success: false, error: `Employee '${id}' not found.` });
      }

      if (channel === "email") {
        employee.email_notify = typeof enabled === "boolean" ? enabled : !employee.email_notify;
      } else if (channel === "whatsapp") {
        employee.whatsapp_notify = typeof enabled === "boolean" ? enabled : !employee.whatsapp_notify;
      }

      employee.updated_at = new Date().toISOString();
      db.save();

      const channelName = channel === "email" ? "Email 📧" : "WhatsApp 📱";
      const statusText = (channel === "email" ? employee.email_notify : employee.whatsapp_notify) ? "ENABLED" : "DISABLED";

      return res.status(200).json({
        success: true,
        message: `${channelName} notifications ${statusText} for ${employee.name}.`,
        employee
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * DELETE /api/admin/employees/:id
   */
  async deleteEmployee(req, res) {
    try {
      const id = req.params.id;
      const list = db.data.employees || [];
      const idx = list.findIndex(e => e.id === id);

      if (idx === -1) {
        return res.status(404).json({ success: false, error: `Employee '${id}' not found.` });
      }

      const removed = list.splice(idx, 1)[0];
      db.save();

      return res.status(200).json({
        success: true,
        message: `Employee '${removed.name}' removed from active directory.`
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = new EmployeeController();
