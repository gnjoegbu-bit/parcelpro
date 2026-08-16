const http = require("http");
const fs = require("fs");
const path = require("path");
const querystring = require("querystring");
const crypto = require("crypto");
require("dotenv").config();

const mysql = require("mysql2");

const messagesFile = path.join(__dirname, "messages.txt");
const uploadsDirectory = path.join(__dirname, "uploads");
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const PRESENCE_TIMEOUT_SECONDS = 75;
const PORT = Number(process.env.PORT) || 3000;
const presenceSubscribers = new Set();

function publishPresence(event) {
    const payload = `event: presence\ndata: ${JSON.stringify(event)}\n\n`;
    presenceSubscribers.forEach(subscriber => {
        if (subscriber.res.writableEnded) return presenceSubscribers.delete(subscriber);
        if (subscriber.scope === "customer" && event.type !== "support") return;
        subscriber.res.write(payload);
    });
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
}

// ========================================
// MYSQL DATABASE CONNECTION
// ========================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {

    if (err) {

        console.error(
            "Database connection failed:",
            err
        );

        return;

    }

    console.log("Connected to MySQL!");

});

// ========================================
// JSON RESPONSE
// ========================================

function sendJSON(res, statusCode, data, headers = {}) {

    res.writeHead(statusCode, {

        "Content-Type":
            "application/json; charset=utf-8",

        "Cache-Control":
            "no-cache, no-store, must-revalidate",

        ...headers

    });

    res.end(
        JSON.stringify(data)
    );

}


// ========================================
// READ REQUEST BODY
// ========================================

function readRequestBody(req, callback) {

    let body = "";

    req.on("data", chunk => {

        body += chunk.toString();

    });

    req.on("end", () => {

        callback(body);

    });

}

// ========================================
// ADMIN ACCOUNT SECURITY
// ========================================

function hashAdminPassword(password, callback) {
    const salt = crypto.randomBytes(16).toString("hex");

    crypto.scrypt(
        String(password),
        salt,
        64,
        (err, derivedKey) => {
            if (err) return callback(err);

            callback(
                null,
                `${salt}:${derivedKey.toString("hex")}`
            );
        }
    );
}

function verifyAdminPassword(password, storedHash, callback) {
    const parts = String(storedHash || "").split(":");

    if (parts.length !== 2) {
        return callback(null, false);
    }

    const salt = parts[0];
    const storedKey = Buffer.from(parts[1], "hex");

    crypto.scrypt(
        String(password),
        salt,
        storedKey.length,
        (err, derivedKey) => {
            if (err) return callback(err, false);

            callback(
                null,
                crypto.timingSafeEqual(
                    storedKey,
                    derivedKey
                )
            );
        }
    );
}

function ensureAdminAccount(callback) {
    const createSql = `
        CREATE TABLE IF NOT EXISTS admin_accounts (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(100) NOT NULL,
            password_hash VARCHAR(300) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_admin_username (username)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;

    db.query(createSql, err => {
        if (err) {
            console.error(
                "Admin account table setup failed:",
                err
            );
            return callback(err);
        }

        db.query(
            "SELECT id FROM admin_accounts ORDER BY id ASC LIMIT 1",
            (selectErr, rows) => {
                if (selectErr) {
                    console.error(
                        "Admin account lookup failed:",
                        selectErr
                    );
                    return callback(selectErr);
                }

                if (rows.length > 0) {
                    console.log("Admin account table ready!");
                    return callback(null);
                }

                const username =
                    String(
                        process.env.ADMIN_USERNAME || "admin"
                    ).trim();

                const password =
                    String(
                        process.env.ADMIN_PASSWORD || "admin123"
                    );

                hashAdminPassword(
                    password,
                    (hashErr, passwordHash) => {
                        if (hashErr) {
                            console.error(
                                "Admin password hashing failed:",
                                hashErr
                            );
                            return callback(hashErr);
                        }

                        db.query(
                            `
                            INSERT INTO admin_accounts
                            (username, password_hash)
                            VALUES (?, ?)
                            `,
                            [
                                username || "admin",
                                passwordHash
                            ],
                            insertErr => {
                                if (insertErr) {
                                    console.error(
                                        "Admin account creation failed:",
                                        insertErr
                                    );
                                    return callback(insertErr);
                                }

                                console.log(
                                    "Admin account created successfully!"
                                );

                                callback(null);
                            }
                        );
                    }
                );
            }
        );
    });
}

function ensureConversationTables(callback) {

    const conversationsSql = `
        CREATE TABLE IF NOT EXISTS conversations (
            id INT NOT NULL AUTO_INCREMENT,
            customer_email VARCHAR(255) NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_customer_email
                (customer_email)
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    const messagesSql = `
        CREATE TABLE IF NOT EXISTS conversation_messages (
            id INT NOT NULL AUTO_INCREMENT,
            conversation_id INT NOT NULL,
            sender ENUM(
                'customer',
                'admin'
            ) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),

            KEY conversation_messages_conversation_id
            (
                conversation_id,
                created_at,
                id
            ),

            CONSTRAINT fk_conversation_messages_conversation
                FOREIGN KEY (conversation_id)
                REFERENCES conversations(id)
                ON DELETE CASCADE
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    const presenceSql = `
        CREATE TABLE IF NOT EXISTS customer_presence (
            id INT NOT NULL AUTO_INCREMENT,
            customer_email VARCHAR(255) NOT NULL,
            customer_name VARCHAR(100) NOT NULL,
            is_online BOOLEAN NOT NULL DEFAULT FALSE,
            login_at DATETIME NULL,
            last_seen DATETIME NULL,
            logout_at DATETIME NULL,
            PRIMARY KEY (id),
            UNIQUE KEY unique_presence_email
                (customer_email)
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    const presenceSessionsSql = `
        CREATE TABLE IF NOT EXISTS presence_sessions (
            id INT NOT NULL AUTO_INCREMENT,
            principal_type ENUM('customer', 'admin') NOT NULL,
            principal_id VARCHAR(255) NOT NULL,
            session_id VARCHAR(100) NOT NULL,
            token_hash CHAR(64) NULL,
            last_seen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY unique_presence_session
                (principal_type, principal_id, session_id),
            KEY presence_sessions_activity
                (principal_type, principal_id, last_seen)
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    const attachmentsSql = `
        CREATE TABLE IF NOT EXISTS conversation_attachments (
            id INT NOT NULL AUTO_INCREMENT,
            message_id INT NOT NULL,
            image_url VARCHAR(255) NOT NULL,
            image_mime VARCHAR(50) NOT NULL,
            original_name VARCHAR(180) NULL,
            file_size INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),

            UNIQUE KEY unique_attachment_message
                (message_id),

            CONSTRAINT fk_conversation_attachments_message
                FOREIGN KEY (message_id)
                REFERENCES conversation_messages(id)
                ON DELETE CASCADE
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    // ========================================
    // SHIPMENTS TABLE
    // ========================================

    const shipmentsSql = `
        CREATE TABLE IF NOT EXISTS shipments (
            id INT NOT NULL AUTO_INCREMENT,
            tracking_number VARCHAR(100) NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            destination VARCHAR(255) NOT NULL,
            status VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL
                DEFAULT CURRENT_TIMESTAMP,

            PRIMARY KEY (id),

            UNIQUE KEY unique_tracking_number
                (tracking_number)
        )
        ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
    `;


    const tables = [
        {
            name: "Conversations table",
            sql: conversationsSql
        },
        {
            name: "Conversation messages table",
            sql: messagesSql
        },
        {
            name: "Customer presence table",
            sql: presenceSql
        },
        {
            name: "Presence sessions table",
            sql: presenceSessionsSql
        },
        {
            name: "Conversation attachments table",
            sql: attachmentsSql
        },
        {
            name: "Shipments table",
            sql: shipmentsSql
        }
    ];


    function createNextTable(index) {

        if (index >= tables.length) {

            console.log(
                "All database tables are ready!"
            );

            return callback();
        }


        const table = tables[index];


        db.query(
            table.sql,
            err => {

                if (err) {

                    console.error(
                        table.name + " setup failed:",
                        err
                    );

                    return callback(err);
                }


                console.log(
                    table.name + " ready!"
                );


                createNextTable(
                    index + 1
                );

            }
        );

    }


    createNextTable(0);

}

// ========================================
// CREATE OR GET CONVERSATION
// ========================================

function getOrCreateConversation(
    name,
    email,
    callback
) {

    const sql = `

        INSERT INTO conversations
        (
            customer_email,
            customer_name
        )

        VALUES (?, ?)

        ON DUPLICATE KEY UPDATE

            id = LAST_INSERT_ID(id),

            customer_name = VALUES(customer_name),

            updated_at = CURRENT_TIMESTAMP

    `;


    db.query(
        sql,
        [email, name],
        (err, result) => {

            if (err) {

                return callback(err);

            }

            callback(
                null,
                result.insertId
            );

        }
    );

}


// ========================================
// SAVE CUSTOMER CONVERSATION MESSAGE
// ========================================

function saveCustomerConversationMessage(
    name,
    email,
    message,
    callback
) {

    getOrCreateConversation(
        name,
        email,
        (err, conversationId) => {

            if (err) {

                return callback(err);

            }


            const sql = `

                INSERT INTO conversation_messages
                (
                    conversation_id,
                    sender,
                    message
                )

                VALUES (
                    ?,
                    'customer',
                    ?
                )

            `;


            db.query(
                sql,
                [
                    conversationId,
                    message
                ],
                messageErr => {

                    if (messageErr) {

                        return callback(
                            messageErr
                        );

                    }


                    db.query(
                        `

                            UPDATE conversations

                            SET updated_at =
                                CURRENT_TIMESTAMP

                            WHERE id = ?

                        `,
                        [conversationId],
                        updateErr => {

                            callback(
                                updateErr || null,
                                conversationId
                            );

                        }
                    );

                }
            );

        }
    );

}


// ========================================
// SAVE ADMIN MESSAGE
// ========================================

function saveAdminConversationMessage(
    customerEmail,
    message,
    callback
) {

    db.query(
        `

            SELECT id

            FROM conversations

            WHERE customer_email = ?

            LIMIT 1

        `,
        [customerEmail],
        (err, conversations) => {

            if (err) {

                return callback(err);

            }


            if (
                conversations.length === 0
            ) {

                return callback(
                    new Error(
                        "Conversation not found."
                    )
                );

            }


            const conversationId =
                conversations[0].id;


            db.query(
                `

                    INSERT INTO conversation_messages
                    (
                        conversation_id,
                        sender,
                        message
                    )

                    VALUES (
                        ?,
                        'admin',
                        ?
                    )

                `,
                [
                    conversationId,
                    message
                ],
                insertErr => {

                    if (insertErr) {

                        return callback(
                            insertErr
                        );

                    }


                    db.query(
                        `

                            UPDATE conversations

                            SET updated_at =
                                CURRENT_TIMESTAMP

                            WHERE id = ?

                        `,
                        [conversationId],
                        updateErr => {

                            callback(
                                updateErr || null
                            );

                        }
                    );

                }
            );

        }
    );

}


// ========================================
// SAVE IMAGE CONVERSATION MESSAGE
// ========================================

function saveImageConversationMessage(sender, name, email, text, attachment, callback) {
    const getConversation = sender === "customer"
        ? done => getOrCreateConversation(name, email, done)
        : done => db.query("SELECT id FROM conversations WHERE customer_email = ? LIMIT 1", [email], (err, rows) => done(err, rows[0] && rows[0].id));

    getConversation((err, conversationId) => {
        if (err) return callback(err);
        if (!conversationId) return callback(new Error("Conversation not found."));
        db.query(
            "INSERT INTO conversation_messages (conversation_id, sender, message) VALUES (?, ?, ?)",
            [conversationId, sender, text || ""],
            (messageErr, result) => {
                if (messageErr) return callback(messageErr);
                db.query(
                    "INSERT INTO conversation_attachments (message_id, image_url, image_mime, original_name, file_size) VALUES (?, ?, ?, ?, ?)",
                    [result.insertId, attachment.url, attachment.mime, attachment.name, attachment.size],
                    attachmentErr => {
                        if (attachmentErr) return callback(attachmentErr);
                        db.query("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [conversationId], updateErr => callback(updateErr || null));
                    }
                );
            }
        );
    });
}

function verifyCustomerPresenceSession(email, sessionId, callback) {
    if (!isValidEmail(email) || !sessionId) {
        return callback(null, false);
    }

    db.query(
        `SELECT id
         FROM presence_sessions
         WHERE principal_type = 'customer'
           AND principal_id = ?
           AND session_id = ?
           AND last_seen >= DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND)
         LIMIT 1`,
        [email, sessionId],
        (err, rows) => callback(err, !err && rows.length > 0)
    );
}

function removeConversationImageFiles(imageUrls) {
    (imageUrls || []).forEach(imageUrl => {
        const prefix = "/uploads/";
        const value = String(imageUrl || "");

        if (!value.startsWith(prefix)) {
            return;
        }

        let fileName;

        try {
            fileName = decodeURIComponent(value.slice(prefix.length));
        } catch {
            return;
        }

        if (!fileName || fileName !== path.basename(fileName)) {
            return;
        }

        fs.unlink(
            path.join(uploadsDirectory, fileName),
            err => {
                if (err && err.code !== "ENOENT") {
                    console.error("Conversation image cleanup error:", err);
                }
            }
        );
    });
}

function deleteConversationMessage(messageId, customerEmail, customerOnly, callback) {
    const conditions = ["message.id = ?"];
    const params = [messageId];

    if (customerEmail) {
        conditions.push("conversation.customer_email = ?");
        params.push(customerEmail);
    }

    if (customerOnly) {
        conditions.push("message.sender = 'customer'");
    }

    db.query(
        `SELECT message.id, attachment.image_url
         FROM conversation_messages message
         INNER JOIN conversations conversation
             ON conversation.id = message.conversation_id
         LEFT JOIN conversation_attachments attachment
             ON attachment.message_id = message.id
         WHERE ${conditions.join(" AND ")}
         LIMIT 1`,
        params,
        (lookupErr, rows) => {
            if (lookupErr) return callback(lookupErr);
            if (!rows.length) return callback(null, false);

            db.query(
                "DELETE FROM conversation_messages WHERE id = ?",
                [messageId],
                deleteErr => {
                    if (deleteErr) return callback(deleteErr);

                    removeConversationImageFiles(
                        rows[0].image_url ? [rows[0].image_url] : []
                    );
                    callback(null, true);
                }
            );
        }
    );
}

function deleteEntireConversation(customerEmail, callback) {
    db.query(
        `SELECT attachment.image_url
         FROM conversations conversation
         INNER JOIN conversation_messages message
             ON message.conversation_id = conversation.id
         LEFT JOIN conversation_attachments attachment
             ON attachment.message_id = message.id
         WHERE conversation.customer_email = ?
           AND attachment.image_url IS NOT NULL`,
        [customerEmail],
        (lookupErr, attachments) => {
            if (lookupErr) return callback(lookupErr);

            db.query(
                "DELETE FROM conversations WHERE customer_email = ?",
                [customerEmail],
                (deleteErr, result) => {
                    if (deleteErr) return callback(deleteErr);
                    if (!result.affectedRows) return callback(null, false);

                    removeConversationImageFiles(
                        attachments.map(attachment => attachment.image_url)
                    );
                    callback(null, true);
                }
            );
        }
    );
}

// ========================================
// CUSTOMER ONLINE
// ========================================

function customerLogin(
    name,
    email,
    callback
) {

    const sql = `

        INSERT INTO customer_presence
        (
            customer_email,
            customer_name,
            is_online,
            login_at,
            last_seen,
            logout_at
        )

        VALUES (
            ?,
            ?,
            TRUE,
            NOW(),
            NOW(),
            NULL
        )

        ON DUPLICATE KEY UPDATE

            customer_name = VALUES(customer_name),

            is_online = TRUE,

            login_at = NOW(),

            last_seen = NOW(),

            logout_at = NULL

    `;


    db.query(
        sql,
        [email, name],
        callback
    );

}


// ========================================
// CUSTOMER HEARTBEAT
// ========================================

function customerHeartbeat(
    email,
    callback
) {

    db.query(
        `

            UPDATE customer_presence

            SET
                is_online = TRUE,
                last_seen = NOW()

            WHERE customer_email = ?

        `,
        [email],
        callback
    );

}


// ========================================
// CUSTOMER LOGOUT
// ========================================

function customerLogout(
    email,
    callback
) {

    db.query(
        `

            UPDATE customer_presence

            SET

                is_online = FALSE,

                logout_at = NOW(),

                last_seen = NOW()

            WHERE customer_email = ?

        `,
        [email],
        callback
    );

}

function readUploadRequestBody(req, callback) {
    let size = 0;
    const chunks = [];
    let rejected = false;
    req.on("data", chunk => {
        size += chunk.length;
        if (size > MAX_IMAGE_BYTES * 1.4) {
            rejected = true;
            return;
        }
        if (!rejected) chunks.push(chunk);
    });
    req.on("end", () => callback(rejected ? null : Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => callback(null));
}

function detectImage(buffer) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
    if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
    if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
    return null;
}

function saveUploadedImage(base64Data, originalName, callback) {
    if (typeof base64Data !== "string" || !base64Data.length) return callback(new Error("An image is required."));
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64Data)) return callback(new Error("Invalid image data."));
    const buffer = Buffer.from(base64Data, "base64");
    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return callback(new Error("Images must be 5 MB or smaller."));
    const image = detectImage(buffer);
    if (!image) return callback(new Error("Only JPG, PNG, and WEBP images are supported."));
    const filename = `${crypto.randomUUID()}.${image.ext}`;
    fs.mkdir(uploadsDirectory, { recursive: true }, mkdirErr => {
        if (mkdirErr) return callback(mkdirErr);
        fs.writeFile(path.join(uploadsDirectory, filename), buffer, { flag: "wx" }, writeErr => {
            if (writeErr) return callback(writeErr);
            callback(null, { url: `/uploads/${filename}`, diskPath: path.join(uploadsDirectory, filename), mime: image.mime, name: path.basename(String(originalName || "image")).slice(0, 180), size: buffer.length });
        });
    });
}

// ========================================
// SESSION-BASED PRESENCE
// ========================================

function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

function refreshCustomerSummary(email, name, callback) {
    db.query(
        `SELECT COUNT(*) AS active FROM presence_sessions
         WHERE principal_type = 'customer' AND principal_id = ?
         AND last_seen >= DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND)`,
        [email],
        (err, rows) => {
            if (err) return callback(err);
            const online = Number(rows[0].active) > 0;
            db.query(
                `INSERT INTO customer_presence (customer_email, customer_name, is_online, login_at, last_seen, logout_at)
                 VALUES (?, ?, ?, NOW(), NOW(), IF(?, NULL, NOW()))
                 ON DUPLICATE KEY UPDATE customer_name = VALUES(customer_name), is_online = VALUES(is_online),
                 last_seen = NOW(), logout_at = IF(VALUES(is_online), NULL, NOW())`,
                [email, name || email, online, online],
                updateErr => {
                    if (!updateErr) publishPresence({ type: "customer", email, online, lastSeen: new Date().toISOString() });
                    callback(updateErr, online);
                }
            );
        }
    );
}

function getSupportPresence(callback) {
    db.query(
        `SELECT MAX(last_seen) AS last_seen, COUNT(*) AS active FROM presence_sessions
         WHERE principal_type = 'admin' AND last_seen >= DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND)`,
        (err, rows) => {
            if (err) return callback(err);
            const row = rows[0] || {};
            callback(null, { online: Number(row.active) > 0, last_seen: row.last_seen || null });
        }
    );
}

function publishSupportPresence() {
    getSupportPresence((err, status) => {
        if (!err) publishPresence({ type: "support", ...status });
    });
}

function removeStalePresenceSessions() {
    db.query(
        `SELECT DISTINCT principal_id FROM presence_sessions WHERE principal_type = 'customer'
         AND last_seen < DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND)`,
        (err, rows) => {
            if (err) return;
            db.query(`DELETE FROM presence_sessions WHERE last_seen < DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND)`, () => {
                rows.forEach(row => refreshCustomerSummary(row.principal_id, row.principal_id, () => {}));
                publishSupportPresence();
            });
        }
    );
}

function upsertPresenceSession(type, principalId, sessionId, token, callback) {
    const tokenHash = token ? hashToken(token) : null;
    db.query(
        `INSERT INTO presence_sessions (principal_type, principal_id, session_id, token_hash, last_seen)
         VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE token_hash = COALESCE(VALUES(token_hash), token_hash), last_seen = NOW()`,
        [type, principalId, sessionId, tokenHash],
        callback
    );
}

function verifyAdminSession(sessionId, token, callback) {
    if (!sessionId || !token) return callback(null, false);
    db.query(
        `SELECT id FROM presence_sessions WHERE principal_type = 'admin' AND principal_id = 'support'
         AND session_id = ? AND token_hash = ? AND last_seen >= DATE_SUB(NOW(), INTERVAL ${PRESENCE_TIMEOUT_SECONDS} SECOND) LIMIT 1`,
        [sessionId, hashToken(token)],
        (err, rows) => callback(err, !err && rows.length > 0)
    );
}

// ========================================
// ADMIN COOKIE AUTHENTICATION
// ========================================

function getAdminCookieSession(req) {
    const cookieHeader = req.headers.cookie || "";

    const cookies = {};

    cookieHeader.split(";").forEach(cookie => {
        const separatorIndex = cookie.indexOf("=");

        if (separatorIndex === -1) {
            return;
        }

        const name = cookie
            .slice(0, separatorIndex)
            .trim();

        const value = cookie
            .slice(separatorIndex + 1)
            .trim();

        try {
            cookies[name] = decodeURIComponent(value);
        } catch {
            cookies[name] = "";
        }
    });

    return {
        sessionId:
            cookies.parcelProAdminSessionId || "",

        token:
            cookies.parcelProAdminToken || ""
    };
}

function requireAdminSession(req, res, callback, options = {}) {
    const auth =
        getAdminCookieSession(req);

    verifyAdminSession(
        auth.sessionId,
        auth.token,
        (err, valid) => {

            if (err || !valid) {
                if (options.redirectTo) {
                    res.writeHead(302, {
                        "Location": options.redirectTo,
                        "Cache-Control": "no-cache, no-store, must-revalidate"
                    });

                    return res.end();
                }

                return sendJSON(
                    res,
                    401,
                    {
                        success: false,
                        message:
                            "Unauthorized. Admin login required."
                    }
                );
            }

            callback(auth);
        }
    );
}

// ========================================
// ADMIN API ROUTE PROTECTION
// ========================================

function isAdminApiRoute(req, urlPath) {

    if (
        req.method === "GET" &&
        (
            urlPath === "/customer-presence" ||
            urlPath === "/dashboard-stats" ||
            urlPath === "/shipments" ||
            urlPath === "/messages" ||
            urlPath === "/conversations" ||
            urlPath.startsWith("/conversations/") ||
            urlPath === "/admin-account"
        )
    ) {
        return true;
    }

    if (
        req.method === "POST" &&
        (
            urlPath === "/add-shipment" ||
            urlPath === "/update-shipment-status" ||
            urlPath === "/admin-account/update" ||
            urlPath === "/admin/messages/delete" ||
            urlPath === "/admin/conversations/delete" ||
            urlPath === "/presence/admin/heartbeat" ||
            urlPath === "/presence/admin/disconnect"
        )
    ) {
        return true;
    }

    if (
        req.method === "POST" &&
        urlPath.startsWith("/conversations/") &&
        urlPath.endsWith("/reply")
    ) {
        return true;
    }

    return false;
}

// ========================================
// CREATE SERVER
// ========================================

const server = http.createServer(
    (req, res) => {

        const requestUrl = new URL(req.url, "http://localhost:3000");
        const urlPath = requestUrl.pathname;

        // ========================================
        // PROCESS NORMAL REQUESTS
        // ========================================

        const processRequest = () => {

        // Server-sent events keep the UI current without polling for status.
        if (req.method === "GET" && urlPath === "/presence/events") {
            const scope = requestUrl.searchParams.get("scope") === "admin" ? "admin" : "customer";
            const sessionId = requestUrl.searchParams.get("sessionId");
            const token = requestUrl.searchParams.get("token");
            const openStream = () => {
                res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", "Connection": "keep-alive" });
                res.write("retry: 5000\n\n");
                const subscriber = { res, scope };
                presenceSubscribers.add(subscriber);
                getSupportPresence((err, status) => { if (!err) res.write(`event: presence\ndata: ${JSON.stringify({ type: "support", ...status })}\n\n`); });
                req.on("close", () => presenceSubscribers.delete(subscriber));
            };
            if (scope === "admin") {
                return verifyAdminSession(sessionId, token, (err, valid) => valid ? openStream() : sendJSON(res, 401, { success: false, message: "Unauthorized presence stream." }));
            }
            return openStream();
        }

        if (req.method === "GET" && urlPath === "/support-status") {
            return getSupportPresence((err, status) => err ? sendJSON(res, 500, { success: false }) : sendJSON(res, 200, { success: true, ...status }));
        }

        if (req.method === "POST" && urlPath === "/presence/admin/login") {
            return readRequestBody(req, body => {
                let data; try { data = JSON.parse(body); } catch { return sendJSON(res, 400, { success: false, message: "Invalid login data." }); }
                const username = String(data.username || "").trim();
                const password = String(data.password || "");
                const sessionId = String(data.sessionId || "").trim();
                db.query(
    "SELECT username, password_hash FROM admin_accounts WHERE username = ? LIMIT 1",
    [username],
    (dbErr, rows) => {
        if (dbErr) {
            console.error("Admin login database error:", dbErr);
            return sendJSON(res, 500, {
                success: false,
                message: "Unable to verify login."
            });
        }

        if (rows.length === 0) {
            return sendJSON(res, 401, {
                success: false,
                message: "Incorrect username or password."
            });
        }

        verifyAdminPassword(
            password,
            rows[0].password_hash,
            (verifyErr, valid) => {
                if (verifyErr || !valid) {
                    return sendJSON(res, 401, {
                        success: false,
                        message: "Incorrect username or password."
                    });
                }

                const token = crypto.randomBytes(32).toString("hex");

                upsertPresenceSession(
                    "admin",
                    "support",
                    sessionId,
                    token,
                    err => {
                        if (err) {
                            return sendJSON(res, 500, {
                                success: false,
                                message: "Unable to start support presence."
                            });
                        }

                        publishSupportPresence();

                        sendJSON(
                            res,
                            200,
                            {
                                success: true,
                                presenceToken: token
                            },
                            {
                                "Set-Cookie": [
                                    `parcelProAdminSessionId=${encodeURIComponent(sessionId)}; HttpOnly; SameSite=Strict; Path=/`,
                                    `parcelProAdminToken=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/`
                                ]
                            }
                        );
                    }
                );
            }
        );
    }
);
            });
        }

        // ========================================
        // ADMIN ACCOUNT SETTINGS
        // GET /admin-account
        // POST /admin-account/update
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/admin-account"
        ) {
            const sessionId =
                requestUrl.searchParams.get("sessionId");

            const token =
                requestUrl.searchParams.get("token");

            return verifyAdminSession(
                sessionId,
                token,
                (authErr, valid) => {
                    if (authErr || !valid) {
                        return sendJSON(res, 401, {
                            success: false,
                            message: "Unauthorized."
                        });
                    }

                    db.query(
                        `
                        SELECT id, username
                        FROM admin_accounts
                        ORDER BY id ASC
                        LIMIT 1
                        `,
                        (dbErr, rows) => {
                            if (dbErr) {
                                console.error(
                                    "Admin account lookup error:",
                                    dbErr
                                );

                                return sendJSON(res, 500, {
                                    success: false,
                                    message:
                                        "Unable to load admin account."
                                });
                            }

                            if (!rows.length) {
                                return sendJSON(res, 404, {
                                    success: false,
                                    message:
                                        "Admin account not found."
                                });
                            }

                            sendJSON(res, 200, {
                                success: true,
                                username: rows[0].username
                            });
                        }
                    );
                }
            );
        }

        if (
            req.method === "POST" &&
            urlPath === "/admin-account/update"
        ) {
            return readRequestBody(
                req,
                body => {
                    let data;

                    try {
                        data = JSON.parse(body);
                    } catch {
                        return sendJSON(res, 400, {
                            success: false,
                            message:
                                "Invalid account data."
                        });
                    }

                    const sessionId =
                        String(
                            data.sessionId || ""
                        ).trim();

                    const token =
                        String(
                            data.token || ""
                        ).trim();

                    const currentPassword =
                        String(
                            data.currentPassword || ""
                        );

                    const username =
                        String(
                            data.username || ""
                        ).trim();

                    const newPassword =
                        String(
                            data.newPassword || ""
                        );

                    if (
                        !sessionId ||
                        !token ||
                        !currentPassword ||
                        !username
                    ) {
                        return sendJSON(res, 400, {
                            success: false,
                            message:
                                "Username and current password are required."
                        });
                    }

                    if (
                        username.length < 3 ||
                        username.length > 100
                    ) {
                        return sendJSON(res, 400, {
                            success: false,
                            message:
                                "Username must be between 3 and 100 characters."
                        });
                    }

                    if (
                        newPassword &&
                        newPassword.length < 6
                    ) {
                        return sendJSON(res, 400, {
                            success: false,
                            message:
                                "New password must be at least 6 characters."
                        });
                    }

                    verifyAdminSession(
                        sessionId,
                        token,
                        (authErr, valid) => {
                            if (authErr || !valid) {
                                return sendJSON(res, 401, {
                                    success: false,
                                    message:
                                        "Your admin session has expired. Please log in again."
                                });
                            }

                            db.query(
                                `
                                SELECT id, username, password_hash
                                FROM admin_accounts
                                ORDER BY id ASC
                                LIMIT 1
                                `,
                                (dbErr, rows) => {
                                    if (dbErr) {
                                        console.error(
                                            "Admin account lookup error:",
                                            dbErr
                                        );

                                        return sendJSON(res, 500, {
                                            success: false,
                                            message:
                                                "Unable to update admin account."
                                        });
                                    }

                                    if (!rows.length) {
                                        return sendJSON(res, 404, {
                                            success: false,
                                            message:
                                                "Admin account not found."
                                        });
                                    }

                                    const admin =
                                        rows[0];

                                    verifyAdminPassword(
                                        currentPassword,
                                        admin.password_hash,
                                        (verifyErr, passwordValid) => {
                                            if (
                                                verifyErr ||
                                                !passwordValid
                                            ) {
                                                return sendJSON(res, 401, {
                                                    success: false,
                                                    message:
                                                        "Current password is incorrect."
                                                });
                                            }

                                            const updateAccount = (
                                                passwordHash
                                            ) => {
                                                const sql =
                                                    passwordHash
                                                        ? `
                                                            UPDATE admin_accounts
                                                            SET username = ?,
                                                                password_hash = ?
                                                            WHERE id = ?
                                                        `
                                                        : `
                                                            UPDATE admin_accounts
                                                            SET username = ?
                                                            WHERE id = ?
                                                        `;

                                                const values =
                                                    passwordHash
                                                        ? [
                                                            username,
                                                            passwordHash,
                                                            admin.id
                                                        ]
                                                        : [
                                                            username,
                                                            admin.id
                                                        ];

                                                db.query(
                                                    sql,
                                                    values,
                                                    updateErr => {
                                                        if (updateErr) {
                                                            console.error(
                                                                "Admin account update error:",
                                                                updateErr
                                                            );

                                                            return sendJSON(
                                                                res,
                                                                500,
                                                                {
                                                                    success: false,
                                                                    message:
                                                                        "Unable to save admin account changes."
                                                                }
                                                            );
                                                        }

                                                        sendJSON(
                                                            res,
                                                            200,
                                                            {
                                                                success: true,
                                                                message:
                                                                    "Admin account updated successfully.",
                                                                username
                                                            }
                                                        );
                                                    }
                                                );
                                            };

                                            if (!newPassword) {
                                                return updateAccount(
                                                    null
                                                );
                                            }

                                            hashAdminPassword(
                                                newPassword,
                                                (hashErr, passwordHash) => {
                                                    if (hashErr) {
                                                        console.error(
                                                            "New admin password hashing failed:",
                                                            hashErr
                                                        );

                                                        return sendJSON(
                                                            res,
                                                            500,
                                                            {
                                                                success: false,
                                                                message:
                                                                    "Unable to secure the new password."
                                                            }
                                                        );
                                                    }

                                                    updateAccount(
                                                        passwordHash
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }

        if (req.method === "POST" && (urlPath === "/presence/admin/heartbeat" || urlPath === "/presence/admin/disconnect")) {
            return readRequestBody(req, body => {
                let data; try { data = JSON.parse(body); } catch { return sendJSON(res, 400, { success: false }); }
                verifyAdminSession(data.sessionId, data.token, (err, valid) => {
                    if (err || !valid) return sendJSON(res, 401, { success: false, message: "Unauthorized presence update." });
                    const sql = urlPath.endsWith("disconnect") ? "DELETE FROM presence_sessions WHERE principal_type = 'admin' AND principal_id = 'support' AND session_id = ?" : "UPDATE presence_sessions SET last_seen = NOW() WHERE principal_type = 'admin' AND principal_id = 'support' AND session_id = ?";
                    db.query(sql, [data.sessionId], queryErr => {
                        if (!queryErr) publishSupportPresence();

                        const headers = urlPath.endsWith("disconnect")
                            ? {
                                "Set-Cookie": [
                                    "parcelProAdminSessionId=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
                                    "parcelProAdminToken=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0"
                                ]
                            }
                            : {};

                        sendJSON(
                            res,
                            queryErr ? 500 : 200,
                            { success: !queryErr },
                            headers
                        );
                    });
                });
            });
        }

        if (req.method === "POST" && (urlPath === "/presence/customer/connect" || urlPath === "/presence/customer/heartbeat" || urlPath === "/presence/customer/disconnect")) {
            return readRequestBody(req, body => {
                let data; try { data = JSON.parse(body); } catch { return sendJSON(res, 400, { success: false, message: "Invalid presence data." }); }
                const email = String(data.email || "").trim().toLowerCase();
                const name = String(data.name || "").trim();
                const sessionId = String(data.sessionId || "").trim();
                if (!isValidEmail(email) || !sessionId || sessionId.length > 100) return sendJSON(res, 400, { success: false, message: "Valid customer presence details are required." });
                if (urlPath.endsWith("disconnect")) {
                    return db.query("DELETE FROM presence_sessions WHERE principal_type = 'customer' AND principal_id = ? AND session_id = ?", [email, sessionId], err => refreshCustomerSummary(email, name, summaryErr => sendJSON(res, err || summaryErr ? 500 : 200, { success: !(err || summaryErr) })));
                }
                if (urlPath.endsWith("connect") && !name) return sendJSON(res, 400, { success: false, message: "Customer name is required." });
                upsertPresenceSession("customer", email, sessionId, null, err => refreshCustomerSummary(email, name, summaryErr => sendJSON(res, err || summaryErr ? 500 : 200, { success: !(err || summaryErr), online: !(err || summaryErr) })));
            });
        }


        // ========================================
        // CUSTOMER LOGIN / ONLINE
        // POST /customer-login
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/customer-login"
        ) {

            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid login data."
                            }
                        );

                    }


                    const name =
                        String(
                            data.name || ""
                        ).trim();


                    const email =
                        String(
                            data.email || ""
                        ).trim()
                        .toLowerCase();


                    if (
                        !name ||
                        !email
                    ) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Name and email are required."
                            }
                        );

                    }


                    customerLogin(
                        name,
                        email,
                        err => {

                            if (err) {

                                console.error(
                                    "Customer login error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to record customer login."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    online: true,
                                    message:
                                        "Customer is now online."
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // CUSTOMER HEARTBEAT
        // POST /customer-heartbeat
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/customer-heartbeat"
        ) {

            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid heartbeat data."
                            }
                        );

                    }


                    const email =
                        String(
                            data.email || ""
                        ).trim()
                        .toLowerCase();


                    if (!email) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Customer email is required."
                            }
                        );

                    }


                    customerHeartbeat(
                        email,
                        err => {

                            if (err) {

                                console.error(
                                    "Heartbeat error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to update online status."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    online: true
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // CUSTOMER LOGOUT
        // POST /customer-logout
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/customer-logout"
        ) {

            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid logout data."
                            }
                        );

                    }


                    const email =
                        String(
                            data.email || ""
                        ).trim()
                        .toLowerCase();


                    if (!email) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Customer email is required."
                            }
                        );

                    }


                    customerLogout(
                        email,
                        err => {

                            if (err) {

                                console.error(
                                    "Customer logout error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to record logout."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    online: false,
                                    message:
                                        "Customer is now offline."
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // GET CUSTOMER ONLINE STATUS
        // GET /customer-status/:email
        // ========================================

        if (
            req.method === "GET" &&
            urlPath.startsWith(
                "/customer-status/"
            )
        ) {

            const email =
                decodeURIComponent(
                    urlPath.slice(
                        "/customer-status/".length
                    )
                )
                .trim()
                .toLowerCase();


            db.query(
                `

                    SELECT

                        customer_name,

                        customer_email,

                        is_online,

                        login_at,

                        last_seen,

                        logout_at

                    FROM customer_presence

                    WHERE customer_email = ?

                    LIMIT 1

                `,
                [email],
                (err, results) => {

                    if (err) {

                        console.error(
                            "Customer status error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to get customer status."
                            }
                        );

                    }


                    if (
                        results.length === 0
                    ) {

                        return sendJSON(
                            res,
                            200,
                            {
                                success: true,
                                exists: false,
                                online: false
                            }
                        );

                    }


                    const customer =
                        results[0];


                    // ========================================
                    // AUTO-OFFLINE
                    //
                    // If heartbeat has stopped for more
                    // than 60 seconds, consider customer
                    // offline.
                    // ========================================

                    if (
                        customer.is_online &&
                        customer.last_seen
                    ) {

                        const lastSeen =
                            new Date(
                                customer.last_seen
                            ).getTime();


                        const now =
                            Date.now();


                        const secondsOffline =
                            (
                                now -
                                lastSeen
                            ) / 1000;


                        if (
                            secondsOffline >
                            60
                        ) {

                            customer.is_online =
                                0;


                            db.query(
                                `

                                    UPDATE customer_presence

                                    SET

                                        is_online = FALSE,

                                        logout_at = NOW()

                                    WHERE customer_email = ?

                                `,
                                [email]
                            );

                        }

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            exists: true,
                            customer
                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // GET ALL ONLINE CUSTOMERS
        // ADMIN DASHBOARD
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/customer-presence"
        ) {

            db.query(
                `

                    SELECT

                        customer_name,

                        customer_email,

                        is_online,

                        login_at,

                        last_seen,

                        logout_at

                    FROM customer_presence

                    ORDER BY

                        is_online DESC,

                        last_seen DESC

                `,
                (err, customers) => {

                    if (err) {

                        console.error(
                            "Customer presence list error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to load customer presence."
                            }
                        );

                    }


                    // ========================================
                    // AUTOMATICALLY MARK STALE USERS OFFLINE
                    // ========================================

                    const now =
                        Date.now();


                    const updatedCustomers =
                        customers.map(
                            customer => {

                                if (
                                    customer.is_online &&
                                    customer.last_seen
                                ) {

                                    const lastSeen =
                                        new Date(
                                            customer.last_seen
                                        ).getTime();


                                    const seconds =
                                        (
                                            now -
                                            lastSeen
                                        ) / 1000;


                                    if (
                                        seconds >
                                        60
                                    ) {

                                        customer.is_online =
                                            0;

                                    }

                                }


                                return customer;

                            }
                        );


                    // Update stale users in database

                    customers.forEach(
                        customer => {

                            if (
                                customer.is_online &&
                                customer.last_seen
                            ) {

                                const lastSeen =
                                    new Date(
                                        customer.last_seen
                                    ).getTime();


                                const seconds =
                                    (
                                        now -
                                        lastSeen
                                    ) / 1000;


                                if (
                                    seconds >
                                    60
                                ) {

                                    db.query(
                                        `

                                            UPDATE customer_presence

                                            SET

                                                is_online = FALSE,

                                                logout_at = NOW()

                                            WHERE customer_email = ?

                                        `,
                                        [
                                            customer.customer_email
                                        ]
                                    );

                                }

                            }

                        }
                    );


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            customers:
                                updatedCustomers
                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // DASHBOARD STATISTICS
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/dashboard-stats"
        ) {

            const sql = `

                SELECT

                    COUNT(*) AS total,

                    COALESCE(
                        SUM(status = 'In Transit'),
                        0
                    ) AS inTransit,

                    COALESCE(
                        SUM(status = 'Delivered'),
                        0
                    ) AS delivered,

                    COALESCE(
                        SUM(status = 'Pending'),
                        0
                    ) AS pending

                FROM shipments

            `;


            db.query(
                sql,
                (err, results) => {

                    if (err) {

                        console.error(
                            "Dashboard database error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Database error"
                            }
                        );

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            stats:
                                results[0]
                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // CONTACT FORM
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/contact"
        ) {

            readRequestBody(
                req,
                body => {

                    const formData =
                        querystring.parse(body);


                    const name =
                        String(
                            formData.name || ""
                        ).trim();


                    const email =
                        String(
                            formData.email || ""
                        ).trim();


                    const message =
                        String(
                            formData.message || ""
                        ).trim();


                    if (
                        !name ||
                        !email ||
                        !message
                    ) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Name, email, and message are required."
                            }
                        );

                    }


                    saveCustomerConversationMessage(
                        name,
                        email,
                        message,
                        databaseErr => {

                            if (databaseErr) {

                                console.error(
                                    "Conversation save error:",
                                    databaseErr
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to save message."
                                    }
                                );

                            }


                            // Make customer online when
                            // they contact support.

                            customerLogin(
                                name,
                                email,
                                () => {}
                            );


                            fs.appendFile(
                                messagesFile,

                                `Name: ${name}
Email: ${email}
Message: ${message}
--------------
`,

                                err => {

                                    if (err) {

                                        console.error(
                                            "Error saving message:",
                                            err
                                        );

                                    }


                                    sendJSON(
                                        res,
                                        200,
                                        {
                                            success: true,
                                            message:
                                                "Message received!"
                                        }
                                    );

                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // IMAGE MESSAGE UPLOAD
        // POST /conversation-image
        // ========================================

        if (req.method === "POST" && urlPath === "/conversation-image") {
            return readUploadRequestBody(req, body => {
                if (!body) return sendJSON(res, 413, { success: false, message: "Image upload is too large." });
                let data;
                try { data = JSON.parse(body); } catch { return sendJSON(res, 400, { success: false, message: "Invalid image upload." }); }
                const sender = data.sender === "admin" ? "admin" : "customer";
                const name = String(data.name || "").trim();
                const email = String(data.email || "").trim().toLowerCase();
                const text = String(data.message || "").trim().slice(0, 4000);
                if (!isValidEmail(email) || (sender === "customer" && !name)) return sendJSON(res, 400, { success: false, message: "Valid sender details are required." });

                const continueUpload = () => saveUploadedImage(data.imageData, data.imageName, (imageErr, attachment) => {
                    if (imageErr) return sendJSON(res, 400, { success: false, message: imageErr.message });
                    saveImageConversationMessage(sender, name, email, text, attachment, saveErr => {
                        if (saveErr) {
                            fs.unlink(attachment.diskPath, () => {});
                            return sendJSON(res, 500, { success: false, message: "Unable to save image message." });
                        }
                        if (sender === "customer") customerLogin(name, email, () => {});
                        sendJSON(res, 200, { success: true, imageUrl: attachment.url });
                    });
                });

                if (sender !== "admin") return continueUpload();
                verifyAdminSession(data.sessionId, data.token, (authErr, valid) => {
                    if (authErr || !valid) return sendJSON(res, 401, { success: false, message: "Unauthorized image upload." });
                    continueUpload();
                });
            });
        }

        if (
            req.method === "POST" &&
            urlPath === "/customer-conversation/delete-message"
        ) {
            return readRequestBody(req, body => {
                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "Invalid delete request."
                    });
                }

                const email = String(data.email || "").trim().toLowerCase();
                const sessionId = String(data.sessionId || "").trim();
                const messageId = Number(data.messageId);

                if (
                    !isValidEmail(email) ||
                    !sessionId ||
                    sessionId.length > 100 ||
                    !Number.isSafeInteger(messageId) ||
                    messageId < 1
                ) {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "Valid message details are required."
                    });
                }

                verifyCustomerPresenceSession(
                    email,
                    sessionId,
                    (authErr, valid) => {
                        if (authErr || !valid) {
                            return sendJSON(res, 401, {
                                success: false,
                                message: "Your customer session has expired."
                            });
                        }

                        deleteConversationMessage(
                            messageId,
                            email,
                            true,
                            (deleteErr, deleted) => {
                                if (deleteErr) {
                                    console.error(
                                        "Customer message deletion error:",
                                        deleteErr
                                    );
                                    return sendJSON(res, 500, {
                                        success: false,
                                        message: "Unable to delete message."
                                    });
                                }

                                if (!deleted) {
                                    return sendJSON(res, 404, {
                                        success: false,
                                        message: "Customer message not found."
                                    });
                                }

                                sendJSON(res, 200, { success: true });
                            }
                        );
                    }
                );
            });
        }

        if (
            req.method === "POST" &&
            urlPath === "/admin/messages/delete"
        ) {
            return readRequestBody(req, body => {
                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "Invalid delete request."
                    });
                }

                const messageId = Number(data.messageId);

                if (!Number.isSafeInteger(messageId) || messageId < 1) {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "A valid message is required."
                    });
                }

                deleteConversationMessage(
                    messageId,
                    "",
                    false,
                    (deleteErr, deleted) => {
                        if (deleteErr) {
                            console.error(
                                "Admin message deletion error:",
                                deleteErr
                            );
                            return sendJSON(res, 500, {
                                success: false,
                                message: "Unable to delete message."
                            });
                        }

                        if (!deleted) {
                            return sendJSON(res, 404, {
                                success: false,
                                message: "Message not found."
                            });
                        }

                        sendJSON(res, 200, { success: true });
                    }
                );
            });
        }

        if (
            req.method === "POST" &&
            urlPath === "/admin/conversations/delete"
        ) {
            return readRequestBody(req, body => {
                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "Invalid delete request."
                    });
                }

                const email = String(data.email || "").trim().toLowerCase();

                if (!isValidEmail(email)) {
                    return sendJSON(res, 400, {
                        success: false,
                        message: "A valid conversation is required."
                    });
                }

                deleteEntireConversation(
                    email,
                    (deleteErr, deleted) => {
                        if (deleteErr) {
                            console.error(
                                "Admin conversation deletion error:",
                                deleteErr
                            );
                            return sendJSON(res, 500, {
                                success: false,
                                message: "Unable to delete conversation."
                            });
                        }

                        if (!deleted) {
                            return sendJSON(res, 404, {
                                success: false,
                                message: "Conversation not found."
                            });
                        }

                        sendJSON(res, 200, { success: true });
                    }
                );
            });
        }

        // ========================================
        // CUSTOMER CHAT
        // POST /customer-chat
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/customer-chat"
        ) {

            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid message data."
                            }
                        );

                    }


                    const name =
                        String(
                            data.name || ""
                        ).trim();


                    const email =
                        String(
                            data.email || ""
                        ).trim();


                    const message =
                        String(
                            data.message || ""
                        ).trim();


                    if (
                        !name ||
                        !email ||
                        !message
                    ) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Name, email, and message are required."
                            }
                        );

                    }


                    saveCustomerConversationMessage(
                        name,
                        email,
                        message,
                        err => {

                            if (err) {

                                console.error(
                                    "Customer chat save error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to send message."
                                    }
                                );

                            }


                            // Customer is active

                            customerLogin(
                                name,
                                email,
                                () => {}
                            );


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    message:
                                        "Message sent."
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // CUSTOMER CHAT
        // GET CONVERSATION
        // ========================================

        if (
            req.method === "GET" &&
            urlPath.startsWith(
                "/customer-conversation/"
            )
        ) {

            const customerEmail =
                decodeURIComponent(
                    urlPath.slice(
                        "/customer-conversation/"
                            .length
                    )
                );


            db.query(
                `

                    SELECT

                        id,

                        customer_name,

                        customer_email,

                        created_at,

                        updated_at

                    FROM conversations

                    WHERE customer_email = ?

                    LIMIT 1

                `,
                [customerEmail],
                (err, conversations) => {

                    if (err) {

                        console.error(
                            "Customer conversation lookup error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to load conversation."
                            }
                        );

                    }


                    if (
                        conversations.length === 0
                    ) {

                        return sendJSON(
                            res,
                            200,
                            {
                                success: true,
                                conversation: null,
                                messages: []
                            }
                        );

                    }


                    const conversation =
                        conversations[0];


                    db.query(
                        `
SELECT
    conversation_messages.id AS id,
    conversation_messages.sender,
    conversation_messages.message,
    conversation_messages.created_at,
    attachment.image_url,
    attachment.image_mime,
    attachment.original_name

FROM conversation_messages

LEFT JOIN conversation_attachments attachment
    ON attachment.message_id = conversation_messages.id

WHERE conversation_messages.conversation_id = ?

ORDER BY
    conversation_messages.created_at ASC,
    conversation_messages.id ASC     
                        `,
                        [conversation.id],
                        (
                            messageErr,
                            messages
                        ) => {

                            if (messageErr) {

                                console.error(
                                    "Customer chat messages error:",
                                    messageErr
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to load messages."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    conversation,
                                    messages
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // CONVERSATION LIST
        // ADMIN
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/conversations"
        ) {

            const sql = `

                SELECT

                    c.id,

                    c.customer_name,

                    c.customer_email,

                    c.created_at,

                    c.updated_at,

                    last_message.message
                        AS last_message,

                    last_message.sender
                        AS last_sender,

                    last_message.created_at
                        AS last_message_at

                FROM conversations c

                INNER JOIN conversation_messages
                    last_message

                    ON last_message.id = (

                        SELECT cm.id

                        FROM conversation_messages cm

                        WHERE cm.conversation_id =
                            c.id

                        ORDER BY

                            cm.created_at DESC,
                            cm.id DESC

                        LIMIT 1

                    )

                ORDER BY

                    c.updated_at DESC,
                    c.id DESC

            `;


            db.query(
                sql,
                (err, conversations) => {

                    if (err) {

                        console.error(
                            "Conversation list error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to load conversations."
                            }
                        );

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            conversations
                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // GET ONE ADMIN CONVERSATION
        // ========================================

        if (
            req.method === "GET" &&
            urlPath.startsWith(
                "/conversations/"
            ) &&
            !urlPath.endsWith("/reply")
        ) {

            const customerEmail =
                decodeURIComponent(
                    urlPath.slice(
                        "/conversations/"
                            .length
                    )
                );


            db.query(
                `

                    SELECT

                        id,

                        customer_name,

                        customer_email,

                        created_at,

                        updated_at

                    FROM conversations

                    WHERE customer_email = ?

                    LIMIT 1

                `,
                [customerEmail],
                (err, conversations) => {

                    if (err) {

                        console.error(
                            "Conversation lookup error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to load conversation."
                            }
                        );

                    }


                    if (
                        conversations.length === 0
                    ) {

                        return sendJSON(
                            res,
                            404,
                            {
                                success: false,
                                message:
                                    "Conversation not found."
                            }
                        );

                    }


                    const conversation =
                        conversations[0];


                    db.query(
                        `
SELECT
    conversation_messages.id AS id,
    conversation_messages.sender,
    conversation_messages.message,
    conversation_messages.created_at,
    attachment.image_url,
    attachment.image_mime,
    attachment.original_name

FROM conversation_messages

LEFT JOIN conversation_attachments attachment
    ON attachment.message_id = conversation_messages.id

WHERE conversation_messages.conversation_id = ?

ORDER BY
    conversation_messages.created_at ASC,
    conversation_messages.id ASC

                        `,
                        [conversation.id],
                        (
                            messageErr,
                            messages
                        ) => {

                            if (messageErr) {

                                console.error(
                                    "Conversation messages error:",
                                    messageErr
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to load conversation."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    conversation,
                                    messages
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // ADMIN REPLY
        // ========================================

        if (
            req.method === "POST" &&
            urlPath.startsWith(
                "/conversations/"
            ) &&
            urlPath.endsWith("/reply")
        ) {

            const customerEmail =
                decodeURIComponent(
                    urlPath.slice(
                        "/conversations/"
                            .length,
                        -"/reply".length
                    )
                );


            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid reply data."
                            }
                        );

                    }


                    const message =
                        String(
                            data.message || ""
                        ).trim();


                    if (!message) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "A reply is required."
                            }
                        );

                    }


                    saveAdminConversationMessage(
                        customerEmail,
                        message,
                        err => {

                            if (err) {

                                console.error(
                                    "Reply save error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to send reply."
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    message:
                                        "Reply sent."
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // GET ALL SHIPMENTS
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/shipments"
        ) {

            const sql = `

                SELECT

                    id,

                    tracking_number,

                    customer_name,

                    destination,

                    status

                FROM shipments

                ORDER BY id DESC

            `;


            db.query(
                sql,
                (err, results) => {

                    if (err) {

                        console.error(
                            "Shipments database error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Database error"
                            }
                        );

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            shipments: results
                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // TRACK SHIPMENT
        // ========================================

        if (
            req.method === "GET" &&
            urlPath.startsWith(
                "/track-shipment/"
            )
        ) {

            const trackingNumber =
                decodeURIComponent(
                    urlPath.split(
                        "/track-shipment/"
                    )[1]
                );


            const sql = `

                SELECT

                    tracking_number,

                    customer_name,

                    destination,

                    status

                FROM shipments

                WHERE tracking_number = ?

                LIMIT 1

            `;


            db.query(
                sql,
                [trackingNumber],
                (err, results) => {

                    if (err) {

                        console.error(
                            "Tracking database error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Database error"
                            }
                        );

                    }


                    if (
                        results.length === 0
                    ) {

                        return sendJSON(
                            res,
                            404,
                            {
                                success: false,
                                message:
                                    "Shipment not found"
                            }
                        );

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            shipment:
                                results[0]
                        }
                    );

                }
            );

            return;

        }

// ========================================
// UPDATE SHIPMENT STATUS
// ========================================

if (
    req.method === "POST" &&
    urlPath === "/update-shipment-status"
) {

    readRequestBody(
        req,
        body => {

            let data;

            try {

                data = JSON.parse(body);

            } catch (error) {

                return sendJSON(
                    res,
                    400,
                    {
                        success: false,
                        message:
                            "Invalid update data."
                    }
                );

            }


            const trackingNumber =
                String(
                    data.trackingNumber || ""
                ).trim();

            const status =
                String(
                    data.status || ""
                ).trim();


            if (
                !trackingNumber ||
                !status
            ) {

                return sendJSON(
                    res,
                    400,
                    {
                        success: false,
                        message:
                            "Tracking number and status are required."
                    }
                );

            }


            const allowedStatuses = [
                "Pending",
                "Preparing",
                "Picked Up",
                "In Transit",
                "Out for Delivery",
                "Delivered"
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return sendJSON(
                    res,
                    400,
                    {
                        success: false,
                        message:
                            "Invalid shipment status."
                    }
                );

            }


            const sql = `
                UPDATE shipments
                SET status = ?
                WHERE tracking_number = ?
            `;


            db.query(
                sql,
                [
                    status,
                    trackingNumber
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Shipment status update error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Database error."
                            }
                        );

                    }


                    if (
                        result.affectedRows === 0
                    ) {

                        return sendJSON(
                            res,
                            404,
                            {
                                success: false,
                                message:
                                    "Shipment not found."
                            }
                        );

                    }


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            message:
                                "Shipment status updated successfully."
                        }
                    );

                }
            );

        }
    );

    return;
}

        // ========================================
        // ADD SHIPMENT
        // ========================================

        if (
            req.method === "POST" &&
            urlPath === "/add-shipment"
        ) {

            readRequestBody(
                req,
                body => {

                    let data;

                    try {

                        data =
                            JSON.parse(body);

                    } catch (error) {

                        return sendJSON(
                            res,
                            400,
                            {
                                success: false,
                                message:
                                    "Invalid shipment data"
                            }
                        );

                    }


                    const sql = `

                        INSERT INTO shipments
                        (
                            tracking_number,
                            customer_name,
                            destination,
                            status
                        )

                        VALUES (?, ?, ?, ?)

                    `;


                    db.query(
                        sql,
                        [
                            data.trackingNumber,
                            data.customerName,
                            data.destination,
                            data.status
                        ],
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Shipment database error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Database error"
                                    }
                                );

                            }


                            sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    message:
                                        "Shipment saved successfully!",
                                    shipmentId:
                                        result.insertId
                                }
                            );

                        }
                    );

                }
            );

            return;

        }


        // ========================================
        // GET LEGACY MESSAGES
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/messages"
        ) {

            fs.readFile(
                messagesFile,
                "utf8",
                (err, data) => {

                    if (err) {

                        if (
                            err.code ===
                            "ENOENT"
                        ) {

                            return sendJSON(
                                res,
                                200,
                                {
                                    success: true,
                                    messages: []
                                }
                            );

                        }


                        console.error(
                            "Messages error:",
                            err
                        );

                        return sendJSON(
                            res,
                            500,
                            {
                                success: false,
                                message:
                                    "Unable to load messages"
                            }
                        );

                    }


                    const blocks =
                        data
                            .split(
                                "--------------"
                            )
                            .map(
                                message =>
                                    message.trim()
                            )
                            .filter(
                                message =>
                                    message.length >
                                    0
                            );


                    const messages =
                        blocks.map(
                            message => {

                                const name =
                                    message.match(
                                        /^Name:[ \t]*(.*)$/m
                                    )?.[1] ||
                                    "";


                                const email =
                                    message.match(
                                        /^Email:[ \t]*(.*)$/m
                                    )?.[1] ||
                                    "";


                                const text =
                                    message.match(
                                        /^Message:[ \t]*([\s\S]*)/m
                                    )?.[1] ||
                                    "";


                                return {

                                    name,

                                    email,

                                    message:
                                        text.trim()

                                };

                            }
                        );


                    sendJSON(
                        res,
                        200,
                        {
                            success: true,
                            messages
                        }
                    );

                }
            );

            return;

        }

        // ========================================
        // PROTECT ADMIN DASHBOARD PAGE
        // ========================================

        if (
            req.method === "GET" &&
            urlPath === "/dashboard.html"
        ) {
            return requireAdminSession(
                req,
                res,
                () => {
                    const dashboardPath = path.join(
                        __dirname,
                        "dashboard.html"
                    );

                    fs.readFile(
                        dashboardPath,
                        "utf8",
                        (err, dashboardHTML) => {

                            if (err) {
                                console.error(
                                    "Dashboard file error:",
                                    err
                                );

                                return sendJSON(
                                    res,
                                    500,
                                    {
                                        success: false,
                                        message:
                                            "Unable to load dashboard."
                                    }
                                );
                            }

                            res.writeHead(
                                200,
                                {
                                    "Content-Type":
                                        "text/html; charset=utf-8",

                                    "Cache-Control":
                                        "no-cache, no-store, must-revalidate"
                                }
                            );

                            res.end(
                                dashboardHTML
                            );
                        }
                    );
                },
                { redirectTo: "/login.html" }
            );
        }

        // ========================================
        // SERVE WEBSITE FILES
        // ========================================

        const requestedFile = urlPath === "/" ? "/index.html" : urlPath;
        const filePath = path.resolve(__dirname, "." + requestedFile);


        const ext =
            path.extname(filePath);


        const contentTypes = {

            ".html":
                "text/html; charset=utf-8",

            ".css":
                "text/css; charset=utf-8",

            ".js":
                "application/javascript; charset=utf-8",

            ".json":
                "application/json",

            ".png":
                "image/png",

            ".webp":
                "image/webp",

            ".jpg":
                "image/jpeg",

            ".jpeg":
                "image/jpeg",

            ".gif":
                "image/gif",

            ".svg":
                "image/svg+xml",

            ".ico":
                "image/x-icon"

        };


        const contentType =
            contentTypes[ext] ||
            "application/octet-stream";

        // Only web assets and validated image uploads are publicly readable.
        if (
            !filePath.startsWith(__dirname + path.sep) ||
            !Object.prototype.hasOwnProperty.call(contentTypes, ext)
        ) {
            return res.end("Not found");
        }


        fs.readFile(
            filePath,
            (err, content) => {

                if (err) {

                    console.error(
                        "File not found:",
                        filePath
                    );


                    res.writeHead(
                        404,
                        {
                            "Content-Type":
                                "text/plain"
                        }
                    );


                    return res.end(
                        "File not found"
                    );

                }


                res.writeHead(
                    200,
                    {
                        "Content-Type":
                            contentType
                    }
                );


                res.end(content);

            }
        );

        }; // End request processing.

        // ========================================
        // ADMIN API AUTHENTICATION
        // ========================================

        if (isAdminApiRoute(req, urlPath)) {
            return requireAdminSession(
                req,
                res,
                () => {
                    processRequest();
                }
            );
        }

        // ========================================
        // PUBLIC REQUEST
        // ========================================

        return processRequest();
    }
);

/////////////////////
///START SERVER/////
///////////////////
ensureConversationTables(
    () => {
        ensureAdminAccount(
            adminErr => {
                if (adminErr) {
                    console.error(
                        "Admin account setup failed. Server will not start."
                    );
                    return;
                }

                server.listen(
                    PORT,
                    () => {
                        console.log(
                            "================================="
                        );

                        console.log(
                            "Parcel Pro server is running!"
                        );

                        console.log(
                            `http://localhost:${PORT}`
                        );

                        console.log(
                            "================================="
                        );

                        // A missed unload (power loss/network drop)
                        // is cleaned up server-side.
                        setInterval(
                            removeStalePresenceSessions,
                            15000
                        );

                        removeStalePresenceSessions();
                    }
                );
            }
        );
    }
);
