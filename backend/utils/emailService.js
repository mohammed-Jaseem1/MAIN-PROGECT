const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Fix: allows self-signed certs in local/corporate networks
  },
});

/**
 * Sends a welcome email to a newly registered student with their login credentials.
 * @param {Object} student - The student object
 * @param {string} student.full_name - Student's full name
 * @param {string} student.email - Student's email address
 * @param {string} student.password - Student's initial plain-text password
 * @param {string} student.student_id - Student's ID
 */
const sendWelcomeEmail = async (student) => {
  const { full_name, email, password, student_id } = student;

  const mailOptions = {
    from: `"EduAdmin System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🎓 Welcome to EduAdmin – Your Account is Ready!',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to EduAdmin</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b 0%,#2563eb 100%);padding:40px 48px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span style="font-size:36px;">🎓</span>
              </div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">EduAdmin System</h1>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Your Gateway to Excellence</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Welcome, ${full_name}! 👋</h2>
              <p style="color:#475569;margin:0 0 28px;font-size:15px;line-height:1.7;">
                Your student account has been successfully created on the <strong>EduAdmin Portal</strong>. You can now log in and start your learning journey. Below are your login credentials.
              </p>

              <!-- Credentials Box -->
              <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
                <p style="color:#1e293b;margin:0 0 18px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                  🔑 Your Login Credentials
                </p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Student ID</td>
                    <td style="color:#1e293b;font-size:14px;padding:8px 0;font-weight:600;">${student_id}</td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;"></td>
                    <td style="border-top:1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</td>
                    <td style="color:#1e293b;font-size:14px;padding:8px 0;font-weight:600;">${email}</td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid #e2e8f0;"></td>
                    <td style="border-top:1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Password</td>
                    <td style="padding:8px 0;">
                      <span style="background:#dbeafe;color:#1d4ed8;font-family:monospace;font-size:15px;font-weight:700;padding:4px 12px;border-radius:6px;letter-spacing:1px;">${password}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Security Note -->
              <div style="background:#fef9c3;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
                <p style="color:#92400e;margin:0;font-size:13px;line-height:1.6;">
                  ⚠️ <strong>Security Tip:</strong> Please change your password after your first login to keep your account secure.
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="http://localhost:5173" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:0.3px;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                  Login to Your Portal →
                </a>
              </div>

              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
                If you have any trouble logging in or need support, please contact your administrator. We're here to help you succeed!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} EduAdmin System. All rights reserved.<br/>
                This is an automated email. Please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  console.log(`[Email] 📤 Attempting to send welcome email to: ${email}`);
  console.log(`[Email] 📧 Sending FROM: ${process.env.EMAIL_USER}`);

  const info = await transporter.sendMail(mailOptions);

  console.log(`[Email] ✅ Welcome email sent successfully!`);
  console.log(`[Email] 📬 Message ID: ${info.messageId}`);
  console.log(`[Email] 📨 Accepted by: ${info.accepted?.join(', ')}`);
};

/**
 * Sends a welcome email to a newly registered teacher with their login credentials.
 */
const sendTeacherWelcomeEmail = async (teacher) => {
  const { firstName, lastName, email, username, password, employeeId } = teacher;
  const fullName = `${firstName} ${lastName}`;

  const mailOptions = {
    from: `"EduAdmin System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '\uD83D\uDC68\u200D\uD83C\uDFEB Welcome to EduAdmin \u2013 Your Teacher Account is Ready!',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to EduAdmin</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e293b 0%,#2563eb 100%);padding:40px 48px;text-align:center;">
            <span style="font-size:36px;">\uD83C\uDF93</span>
            <h1 style="color:#ffffff;margin:8px 0 0;font-size:26px;font-weight:700;">EduAdmin System</h1>
            <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Teacher Portal \u2013 Account Created</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px 48px;">
            <h2 style="color:#1e293b;margin:0 0 8px;font-size:22px;">Welcome, ${fullName}! \uD83D\uDC4B</h2>
            <p style="color:#475569;margin:0 0 28px;font-size:15px;line-height:1.7;">
              Your teacher account has been created on the <strong>EduAdmin Portal</strong>.
              You can now log in and start managing your classes. Below are your credentials.
            </p>

            <!-- Credentials Box -->
            <div style="background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:28px 32px;margin-bottom:28px;">
              <p style="color:#1e293b;margin:0 0 18px;font-size:15px;font-weight:700;">\uD83D\uDD11 Your Login Credentials</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Employee ID</td>
                  <td style="color:#1e293b;font-size:14px;padding:8px 0;font-weight:600;">${employeeId}</td>
                </tr>
                <tr><td colspan="2" style="border-top:1px solid #e2e8f0;"></td></tr>
                <tr>
                  <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</td>
                  <td style="color:#1e293b;font-size:14px;padding:8px 0;font-weight:600;">${email}</td>
                </tr>
                <tr><td colspan="2" style="border-top:1px solid #e2e8f0;"></td></tr>
                <tr>
                  <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Username</td>
                  <td style="color:#1e293b;font-size:14px;padding:8px 0;font-weight:600;">${username}</td>
                </tr>
                <tr><td colspan="2" style="border-top:1px solid #e2e8f0;"></td></tr>
                <tr>
                  <td width="40%" style="color:#64748b;font-size:13px;padding:8px 0;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Password</td>
                  <td style="padding:8px 0;">
                    <span style="background:#dbeafe;color:#1d4ed8;font-family:monospace;font-size:15px;font-weight:700;padding:4px 12px;border-radius:6px;letter-spacing:1px;">${password}</span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Security Note -->
            <div style="background:#fef9c3;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 18px;margin-bottom:28px;">
              <p style="color:#92400e;margin:0;font-size:13px;line-height:1.6;">
                \u26A0\uFE0F <strong>Security Tip:</strong> Please change your password after your first login to keep your account secure.
              </p>
            </div>

            <!-- CTA -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="http://localhost:5173" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;text-decoration:none;padding:14px 40px;border-radius:10px;font-size:15px;font-weight:700;box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                Login to Teacher Portal \u2192
              </a>
            </div>

            <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0;">
              If you have trouble logging in, please contact your administrator.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              &copy; ${new Date().getFullYear()} EduAdmin System. All rights reserved.<br/>
              This is an automated email. Please do not reply.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
    `,
  };

  console.log(`[Email] \uD83D\uDCE4 Sending teacher welcome email to: ${email}`);
  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email] \u2705 Teacher welcome email sent! ID: ${info.messageId}`);
};

module.exports = { sendWelcomeEmail, sendTeacherWelcomeEmail };
