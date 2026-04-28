const admin = require('./firebase-admin');

const db = admin.database();

module.exports = async (req, res) => {
    const snapshot = await db.ref('posts').orderByChild('timestamp').once('value');
    const posts = [];
    snapshot.forEach(child => {
        posts.push({ id: child.key, ...child.val() });
    });
    posts.reverse();
    res.status(200).json({ posts });
};
