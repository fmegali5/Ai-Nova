// lib/utils.js
// Helpers بسيطة لإدارة الجلسات (بديل عن JWT)
export const createSessionForUser = (req, user, sessionId) => {
  // احفظ بيانات المستخدم في الـ session
  req.session.user = {
    _id: user._id.toString ? user._id.toString() : user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic || "",
    sessionId,
  };
  // بمجرد حفظها، express-session سيخزنها في الـ store
  return req.session;
};

export const destroyUserSession = (req) => {
  return new Promise((resolve, reject) => {
    if (!req || !req.session) return resolve();
    req.session.destroy((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
};
