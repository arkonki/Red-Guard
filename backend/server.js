require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Imap = require('node-imap');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { simpleParser } = require('mailparser');
const webpush = require('web-push');

const app = express();
const PORT = process.env.PORT || 3001;

// --- Push Notification Setup ---
const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
        'mailto:admin@your-domain.com', // You should replace this with a valid admin email
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
    console.log("VAPID keys configured for web-push.");
} else {
    console.error("VAPID keys not found in .env file. Push notifications will not work.");
}

// In-memory storage for subscriptions (for demo purposes)
const subscriptions = {};


app.use(cors());
app.use(bodyParser.json());

// --- Helper to create IMAP connection ---
const getImapConnection = (user) => {
    return new Imap({
        user: user.email,
        password: user.password,
        host: process.env.IMAP_HOST,
        port: process.env.IMAP_PORT,
        tls: process.env.IMAP_TLS === 'true',
    });
};

// --- JWT Verification Middleware ---
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'A token is required for authentication' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // This will contain { email, password }
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Token' });
    }
    return next();
};


// --- Authentication Endpoint ---
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const imap = getImapConnection({ email, password });

    imap.once('ready', () => {
        console.log(`IMAP connection successful for ${email}`);
        imap.end();

        // Create JWT
        const token = jwt.sign(
            { email, password }, // Storing password for subsequent connections
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Login successful',
            user: { email: email, name: email.split('@')[0] },
            token: token,
        });
    });

    imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        res.status(401).json({ message: 'Invalid credentials or IMAP connection failed' });
    });

    imap.connect();
});

// --- Push Notification Endpoints ---
app.get('/api/notifications/vapid-public-key', verifyToken, (req, res) => {
    if (!vapidKeys.publicKey) {
        return res.status(500).json({ message: 'VAPID public key not configured on server.' });
    }
    res.json({ publicKey: vapidKeys.publicKey });
});

app.post('/api/notifications/subscribe', verifyToken, (req, res) => {
    const subscription = req.body;
    const userEmail = req.user.email;
    subscriptions[userEmail] = subscription;
    console.log(`User ${userEmail} subscribed to notifications.`);
    res.status(201).json({ message: 'Subscription saved.' });
});

app.post('/api/notifications/notify-me', verifyToken, (req, res) => {
    const userEmail = req.user.email;
    const subscription = subscriptions[userEmail];
    
    if (!subscription) {
        return res.status(404).json({ message: 'User subscription not found.' });
    }
    
    const payload = JSON.stringify({
        title: 'Test Notification',
        body: 'This is a test from Veebimajutus Mail!',
        icon: '/pwa-icon-192x192.png'
    });
    
    webpush.sendNotification(subscription, payload)
        .then(() => res.status(200).json({ message: 'Test notification sent.' }))
        .catch(err => {
            console.error('Error sending notification:', err);
            res.status(500).json({ message: 'Could not send notification.' });
        });
});


// --- Protected Mail Endpoints ---

// Fetch Mailboxes (Folders)
app.get('/api/mail/mailboxes', verifyToken, (req, res) => {
    const imap = getImapConnection(req.user);
    
    imap.once('ready', () => {
        imap.getBoxes((err, boxes) => {
            if (err) {
                console.error('getBoxes error:', err);
                imap.end();
                return res.status(500).json({ message: 'Failed to get mailboxes' });
            }

            const formatMailboxes = (boxes, prefix = '') => {
                let mailboxList = [];
                for (const name in boxes) {
                    const mailbox = boxes[name];
                    const fullName = prefix ? `${prefix}${mailbox.delimiter}${name}` : name;
                    
                    if (mailbox.attribs.includes('\\HasChildren')) {
                         if (mailbox.children) {
                            mailboxList = mailboxList.concat(formatMailboxes(mailbox.children, fullName));
                        }
                    } else {
                         let id = fullName;
                         // Standardize common names for easier icon mapping on frontend
                         if (fullName.toLowerCase() === 'sent items') id = 'sent';
                         if (fullName.toLowerCase() === 'inbox') id = 'inbox';
                         if (fullName.toLowerCase() === 'junk') id = 'trash';

                         mailboxList.push({ id: fullName, name: name });
                    }
                }
                return mailboxList;
            }

            const formatted = formatMailboxes(boxes);
            res.json(formatted);
            imap.end();
        });
    });

    imap.once('error', (err) => {
        console.error('IMAP connection error:', err);
        return res.status(500).json({ message: 'IMAP connection failed' });
    });

    imap.connect();
});

// Fetch Message List for a Mailbox
app.get('/api/mail/messages', verifyToken, (req, res) => {
    const mailbox = req.query.mailbox || 'INBOX';
    const imap = getImapConnection(req.user);

    imap.once('ready', () => {
        imap.openBox(mailbox, true, (err, box) => {
            if (err) {
                imap.end();
                return res.status(500).json({ message: `Failed to open mailbox: ${mailbox}` });
            }
            if (box.messages.total === 0) {
                imap.end();
                return res.json([]);
            }
            // Fetch the last 30 messages
            const fetchStart = Math.max(1, box.messages.total - 29);
            const f = imap.seq.fetch(`${fetchStart}:${box.messages.total}`, {
                bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)',
                struct: true,
            });
            const messages = [];
            f.on('message', (msg, seqno) => {
                let header = {};
                let uid = '';
                msg.on('body', (stream, info) => {
                    let buffer = '';
                    stream.on('data', (chunk) => {
                        buffer += chunk.toString('utf8');
                    });
                    stream.once('end', () => {
                        header = Imap.parseHeader(buffer);
                    });
                });
                msg.once('attributes', (attrs) => {
                    uid = attrs.uid;
                });
                msg.once('end', () => {
                    messages.push({
                        id: uid.toString(),
                        sender: header.from ? header.from[0] : 'N/A',
                        subject: header.subject ? header.subject[0] : 'No Subject',
                        snippet: header.subject ? header.subject[0].substring(0, 100) + '...' : '',
                        timestamp: header.date ? new Date(header.date[0]).toISOString() : new Date().toISOString(),
                        read: false, // For simplicity, we can't easily get read status from headers alone
                    });
                });
            });
            f.once('error', (err) => {
                console.log('Fetch error: ' + err);
                 // Don't send response here as it might have already been sent.
            });
            f.once('end', () => {
                // Sort messages by UID descending (newest first)
                messages.sort((a, b) => b.id - a.id);
                res.json(messages);
                imap.end();
            });
        });
    });

    imap.once('error', (err) => {
        console.error(`IMAP connection error for messages in ${mailbox}:`, err);
        return res.status(500).json({ message: 'IMAP connection failed' });
    });

    imap.connect();
});

// Fetch a single message
app.get('/api/mail/message/:messageId', verifyToken, (req, res) => {
    const { messageId } = req.params;
    const { mailbox } = req.query;

    if (!mailbox) {
        return res.status(400).json({ message: 'Mailbox query parameter is required' });
    }

    const imap = getImapConnection(req.user);

    imap.once('ready', () => {
        imap.openBox(mailbox, true, (err, box) => {
            if (err) {
                imap.end();
                return res.status(500).json({ message: `Failed to open mailbox: ${mailbox}` });
            }
            const f = imap.fetch([messageId], { bodies: '' });
            f.on('message', (msg, seqno) => {
                msg.on('body', (stream, info) => {
                    simpleParser(stream, (err, parsed) => {
                        if (err) {
                            console.error('Parsing error:', err);
                            return; // Don't crash server on one bad email
                        }

                        res.json({
                            id: messageId,
                            sender: parsed.from?.text || 'N/A',
                            recipient: parsed.to?.text || 'N/A',
                            subject: parsed.subject || 'No Subject',
                            body: parsed.html || parsed.textAsHtml || '<p>No content</p>',
                            timestamp: parsed.date?.toISOString() || new Date().toISOString(),
                        });
                    });
                });
            });
            f.once('error', (err) => {
                console.log('Fetch error: ' + err);
                res.status(500).json({ message: 'Failed to fetch the message' });
            });
            f.once('end', () => {
                imap.end();
            });
        });
    });

    imap.once('error', (err) => {
        console.error(`IMAP connection error for message ${messageId}:`, err);
        return res.status(500).json({ message: 'IMAP connection failed' });
    });

    imap.connect();
});


// Send Mail
app.post('/api/mail/send', verifyToken, (req, res) => {
    const { email, password } = req.user;
    const { to, subject, body } = req.body;

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: email,
            pass: password,
        },
    });

    const mailOptions = {
        from: email,
        to: to,
        subject: subject,
        html: body,
        text: body.replace(/<[^>]*>?/gm, ''), // A simple conversion from HTML to text
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Failed to send email' });
        }
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully!' });
    });
});


app.listen(PORT, () => {
    console.log(`Live server running on http://localhost:${PORT}`);
});
