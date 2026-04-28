const admin = require('./firebase-admin');
const bcrypt = require('bcryptjs');

const db = admin.database();

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { username, email, password, birthdate } = req.body;
    if (!username || !email || !password || !birthdate) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    const usernameLower = username.toLowerCase();
    const snapshot = await db.ref('users').orderByChild('usernameLower').equalTo(usernameLower).once('value');
    if (snapshot.exists()) {
        return res.status(409).json({ error: 'Username sudah dipakai' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRef = db.ref('users').push();
    const uid = userRef.key;

    const userData = {
        username,
        usernameLower,
        email,
        password: hashedPassword,
        birthdate,
        displayName: username,
        bio: '',
        role: 'member',
        avatarUrl: '',
        bannerUrl: '',
        checkmarkType: 'blue',
        customCheckmarkUrl: '',
        postsCount: 0,
        followersCount: 0,
        followingCount: 0,
        createdAt: Date.now()
    };

    await userRef.set(userData);

    // Generate Firebase Custom Token — frontend tukar ke ID Token via signInWithCustomToken
    const customToken = await admin.auth().createCustomToken(uid, {
        role: 'member'
    });

    const userResponse = {
        uid,
        displayName: username,
        username: '@' + username,
        email,
        bio: '',
        role: 'member',
        avatarUrl: '',
        checkmarkType: 'blue',
        customCheckmarkUrl: '',
        postsCount: 0,
        followersCount: 0,
        followingCount: 0
    };

    res.status(201).json({ customToken, user: userResponse });
};
