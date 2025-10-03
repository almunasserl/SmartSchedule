const sql = require("../config/db");
const bcrypt = require("bcrypt");

const generateAuthRecord = async ({ email, phone, role }) => {
  try {
    const defaultPassword = phone.toString();
    const hashpassword = await bcrypt.hash(defaultPassword, 10);

    const result = await sql`
      INSERT INTO auth (email, hashpassword, role, status, phone)
      VALUES (${email}, ${hashpassword}, ${role}, 'active', ${phone})
      RETURNING id
    `;

    return result[0].id;
  } catch (err) {
    throw new Error("Failed to create auth record: " + err.message);
  }
};

module.exports = generateAuthRecord;
