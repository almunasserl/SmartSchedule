const sql = require("../config/db");
const generateAuthRecord = require("../middlewares/generateAuthRecord");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../middlewares/emailMiddleware");

exports.signUp = async (req, res) => {
  try {
    const { email, role, name, level_id, dept_id, password } = req.body;

    if (!email || !role || !password) {
      return res
        .status(400)
        .json({ error: "Email, role, and password are required" });
    }

    // نستخدم الدالة الوسيطة
    const authId = await generateAuthRecord({ email, role, password });

    // لو طالب
    if (role === "student") {
      const studentResult = await sql`
        INSERT INTO student (id,name, level_id, dept_id)
        VALUES (${authId},${name}, ${level_id}, ${dept_id})
        RETURNING *
      `;
      return res.status(201).json({ user: studentResult[0], role });
    }

    // لو أستاذ
    if (role === "faculty") {
      const facultyResult = await sql`
        INSERT INTO faculty (id,name, dept_id)
        VALUES (${authId},${name}, ${dept_id})
        RETURNING *
      `;
      return res.status(201).json({ user: facultyResult[0], role });
    }

    // لو دور إداري أو لجنة
    return res.status(201).json({ message: "User created", authId, role });
  } catch (err) {
    console.error("❌ Error in signUp:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const userResult = await sql`
      SELECT * FROM auth WHERE email = ${email}
    `;

    if (userResult.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult[0];

    // تحقق من حالة الحساب
    if (user.status !== "active") {
      return res
        .status(403)
        .json({ error: "Account is inactive or suspended" });
    }

    // تحقق من كلمة المرور
    const isMatch = await bcrypt.compare(password, user.hashpassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // توليد JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("❌ Error in login:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await sql`SELECT * FROM auth WHERE email = ${email}`;
    if (userResult.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // توليد رمز عشوائي
    const resetToken = crypto.randomBytes(32).toString("hex");

    await sql`
      UPDATE auth SET reset_token = ${resetToken}
      WHERE email = ${email}
    `;

    // إرسال الرمز إلى الإيميل
    const emailSent = await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: `لقد طلبت إعادة تعيين كلمة المرور. استخدم هذا الكود: ${resetToken}`,
      html: `<p>لقد طلبت إعادة تعيين كلمة المرور.</p>
             <p>استخدم هذا الكود:</p>
             <h3>${resetToken}</h3>`,
    });

    if (!emailSent) {
      return res.status(500).json({ error: "Failed to send reset email" });
    }

    res.json({ message: "Reset instructions sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const userResult = await sql`
      SELECT * FROM auth WHERE reset_token = ${resetToken}
    `;
    if (userResult.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const user = userResult[0];
    const hashpassword = await bcrypt.hash(newPassword, 10);

    await sql`
      UPDATE auth 
      SET hashpassword = ${hashpassword}, reset_token = NULL
      WHERE id = ${user.id}
    `;

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, role, status
      FROM auth
      ORDER BY id ASC
    `;
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// تحديث حالة الحساب
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await sql`
  UPDATE auth 
  SET status = ${status} 
  WHERE id = ${userId}
  RETURNING id, email, role, status
`;

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User status updated", user: result[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
