const admin = require('./firebase-admin');

const db = admin.database();

module.exports = async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username diperlukan' });
    const snapshot = await db.ref('users').orderByChild('usernameLower').equalTo(username.toLowerCase()).once('value');
    res.status(200).json({ exists: snapshot.exists() });
};
