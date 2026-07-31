const { pool, transaction } = require('@/config/database.config');
const conversationModel = require('../model/conversation.model');
const messageModel = require('../model/message.model');

class ChatRepository {
    constructor() {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }

    createConversation = async (client, { conversationId, user1Id, user2Id, sosRequestId }) => {
        const query = `
            INSERT INTO ${this.conversationModel.table} (
                ${this.conversationModel.field.conversationId},
                ${this.conversationModel.field.user1Id},
                ${this.conversationModel.field.user2Id},
                ${this.conversationModel.field.sosRequestId}
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const executor = client || pool;
        const result = await executor.query(query, [conversationId, user1Id, user2Id, sosRequestId || null]);
        return result.rows[0];
    }

    findConversationBySosRequestId = async (sosRequestId) => {
        const query = `
            SELECT c.*, 
                   CASE WHEN c.is_closed = TRUE OR (s.status IN ('DONE', 'COMPLETED', 'CANCELLED') AND s.updated_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes') THEN TRUE ELSE FALSE END as is_closed,
                   s.status as sos_status,
                   s.updated_at as sos_updated_at,
                   u1.full_name as user1_name, u1.avatar_url as user1_avatar, u1.phone as user1_phone,
                   u2.full_name as user2_name, u2.avatar_url as user2_avatar, u2.phone as user2_phone
            FROM ${this.conversationModel.table} c
            JOIN users u1 ON c.${this.conversationModel.field.user1Id} = u1.user_id
            JOIN users u2 ON c.${this.conversationModel.field.user2Id} = u2.user_id
            LEFT JOIN sos_requests s ON c.${this.conversationModel.field.sosRequestId} = s.sos_request_id
            WHERE c.${this.conversationModel.field.sosRequestId} = $1
        `;
        const result = await pool.query(query, [sosRequestId]);
        return result.rows[0];
    }

    findConversationByUsers = async (user1Id, user2Id, sosRequestId = null) => {
        if (sosRequestId) {
            return await this.findConversationBySosRequestId(sosRequestId);
        }
        const query = `
            SELECT c.*, 
                   CASE WHEN c.is_closed = TRUE OR (s.status IN ('DONE', 'COMPLETED', 'CANCELLED') AND s.updated_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes') THEN TRUE ELSE FALSE END as is_closed,
                   s.status as sos_status,
                   s.updated_at as sos_updated_at,
                   u1.full_name as user1_name, u1.avatar_url as user1_avatar, u1.phone as user1_phone,
                   u2.full_name as user2_name, u2.avatar_url as user2_avatar, u2.phone as user2_phone
            FROM ${this.conversationModel.table} c
            JOIN users u1 ON c.${this.conversationModel.field.user1Id} = u1.user_id
            JOIN users u2 ON c.${this.conversationModel.field.user2Id} = u2.user_id
            LEFT JOIN sos_requests s ON c.${this.conversationModel.field.sosRequestId} = s.sos_request_id
            WHERE ((c.${this.conversationModel.field.user1Id} = $1 AND c.${this.conversationModel.field.user2Id} = $2)
               OR (c.${this.conversationModel.field.user1Id} = $2 AND c.${this.conversationModel.field.user2Id} = $1))
              AND c.${this.conversationModel.field.sosRequestId} IS NULL
        `;
        const result = await pool.query(query, [user1Id, user2Id]);
        return result.rows[0];
    }

    updateConversationSosRequestId = async (conversationId, sosRequestId) => {
        const query = `
            UPDATE ${this.conversationModel.table}
            SET ${this.conversationModel.field.sosRequestId} = $1,
                ${this.conversationModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.conversationModel.field.conversationId} = $2
            RETURNING *
        `;
        const result = await pool.query(query, [sosRequestId, conversationId]);
        return result.rows[0];
    }

    closeConversationBySosRequestId = async (client, sosRequestId) => {
        const query = `
            UPDATE ${this.conversationModel.table}
            SET ${this.conversationModel.field.isClosed} = TRUE,
                ${this.conversationModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.conversationModel.field.sosRequestId} = $1
            RETURNING *
        `;
        const executor = client || pool;
        const result = await executor.query(query, [sosRequestId]);
        return result.rows[0];
    }

    findConversationById = async (conversationId) => {
        const query = `
            SELECT c.*, 
                   CASE WHEN c.is_closed = TRUE OR (s.status IN ('DONE', 'COMPLETED', 'CANCELLED') AND s.updated_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes') THEN TRUE ELSE FALSE END as is_closed,
                   s.status as sos_status,
                   s.updated_at as sos_updated_at,
                   u1.full_name as user1_name, u1.avatar_url as user1_avatar, u1.phone as user1_phone,
                   u2.full_name as user2_name, u2.avatar_url as user2_avatar, u2.phone as user2_phone
            FROM ${this.conversationModel.table} c
            JOIN users u1 ON c.${this.conversationModel.field.user1Id} = u1.user_id
            JOIN users u2 ON c.${this.conversationModel.field.user2Id} = u2.user_id
            LEFT JOIN sos_requests s ON c.${this.conversationModel.field.sosRequestId} = s.sos_request_id
            WHERE c.${this.conversationModel.field.conversationId} = $1
        `;
        const result = await pool.query(query, [conversationId]);
        return result.rows[0];
    }

    getUserConversations = async (userId, isAdmin = false) => {
        let whereClause = `
            WHERE c.${this.conversationModel.field.user1Id} = $1 
               OR c.${this.conversationModel.field.user2Id} = $1
        `;
        if (isAdmin) {
            whereClause = `
                WHERE c.${this.conversationModel.field.user1Id} = $1 
                   OR c.${this.conversationModel.field.user2Id} = $1
                   OR u1.role = 'ADMIN' 
                   OR u2.role = 'ADMIN' 
                   OR c.sos_request_id IS NOT NULL
            `;
        }

        const query = `
            SELECT c.*,
                   CASE WHEN c.is_closed = TRUE OR (s.status IN ('DONE', 'COMPLETED', 'CANCELLED') AND s.updated_at < CURRENT_TIMESTAMP - INTERVAL '15 minutes') THEN TRUE ELSE FALSE END as is_closed,
                   s.status as sos_status,
                   s.updated_at as sos_updated_at,
                   CASE 
                       WHEN c.${this.conversationModel.field.user1Id} = $1 THEN u2.user_id
                       ELSE u1.user_id
                   END as partner_id,
                   CASE 
                       WHEN c.${this.conversationModel.field.user1Id} = $1 THEN u2.full_name
                       ELSE u1.full_name
                   END as partner_name,
                   CASE 
                       WHEN c.${this.conversationModel.field.user1Id} = $1 THEN u2.avatar_url
                       ELSE u1.avatar_url
                   END as partner_avatar,
                   CASE 
                       WHEN c.${this.conversationModel.field.user1Id} = $1 THEN u2.phone
                       ELSE u1.phone
                   END as partner_phone,
                   CASE 
                       WHEN c.${this.conversationModel.field.user1Id} = $1 THEN u2.role
                       ELSE u1.role
                   END as partner_role,
                   (SELECT COUNT(*) FROM messages m 
                    WHERE m.conversation_id = c.conversation_id 
                      AND m.sender_id != $1 
                      AND m.is_read = FALSE) as unread_count
            FROM ${this.conversationModel.table} c
            JOIN users u1 ON c.${this.conversationModel.field.user1Id} = u1.user_id
            JOIN users u2 ON c.${this.conversationModel.field.user2Id} = u2.user_id
            LEFT JOIN sos_requests s ON c.${this.conversationModel.field.sosRequestId} = s.sos_request_id
            ${whereClause}
            ORDER BY c.last_message_at DESC
        `;
        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    createMessage = async (client, { messageId, conversationId, senderId, content, messageType }) => {
        const query = `
            INSERT INTO ${this.messageModel.table} (
                ${this.messageModel.field.messageId},
                ${this.messageModel.field.conversationId},
                ${this.messageModel.field.senderId},
                ${this.messageModel.field.content},
                ${this.messageModel.field.messageType}
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const executor = client || pool;
        const result = await executor.query(query, [messageId, conversationId, senderId, content, messageType || 'TEXT']);
        return result.rows[0];
    }

    updateConversationLastMessage = async (client, { conversationId, lastMessage, lastMessageAt }) => {
        const query = `
            UPDATE ${this.conversationModel.table}
            SET ${this.conversationModel.field.lastMessage} = $1,
                ${this.conversationModel.field.lastMessageAt} = $2,
                ${this.conversationModel.field.updatedAt} = CURRENT_TIMESTAMP
            WHERE ${this.conversationModel.field.conversationId} = $3
            RETURNING *
        `;
        const executor = client || pool;
        const result = await executor.query(query, [lastMessage, lastMessageAt, conversationId]);
        return result.rows[0];
    }

    getMessagesByConversationId = async (conversationId, limit = 50, offset = 0) => {
        const query = `
            SELECT m.*, u.full_name as sender_name, u.avatar_url as sender_avatar
            FROM ${this.messageModel.table} m
            JOIN users u ON m.${this.messageModel.field.senderId} = u.user_id
            WHERE m.${this.messageModel.field.conversationId} = $1
            ORDER BY m.created_at ASC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [conversationId, limit, offset]);
        return result.rows;
    }

    markMessagesAsRead = async (conversationId, userId) => {
        const query = `
            UPDATE ${this.messageModel.table}
            SET ${this.messageModel.field.isRead} = TRUE
            WHERE ${this.messageModel.field.conversationId} = $1
              AND ${this.messageModel.field.senderId} != $2
              AND ${this.messageModel.field.isRead} = FALSE
        `;
        await pool.query(query, [conversationId, userId]);
    }
}

module.exports = new ChatRepository();
