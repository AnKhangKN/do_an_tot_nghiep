-- SQL Select Script for all 23 tables in do_an_tot_nghiep Database
SET timezone = 'Asia/Ho_Chi_Minh';

-- 1. users
SELECT * FROM users;

-- 2. user_auth
SELECT * FROM user_auth;

-- 3. incident_types
SELECT * FROM incident_types;

-- 4. rescuer_profiles
SELECT * FROM rescuer_profiles;

-- 5. rescue_incident_types
SELECT * FROM rescue_incident_types;

-- 6. sos_requests
SELECT * FROM sos_requests;

-- 7. rescuer_histories
SELECT * FROM rescuer_histories;

-- 8. images
SELECT * FROM images;

-- 9. notifications
SELECT * FROM notifications;

-- 10. device_tokens
SELECT * FROM device_tokens;

-- 11. conversations
SELECT * FROM conversations;

-- 12. messages
SELECT * FROM messages;

-- 13. dangerous_points
SELECT * FROM dangerous_points;

-- 14. rescuer_ratings
SELECT * FROM rescuer_ratings;

-- 15. amenity_categories
SELECT * FROM amenity_categories;

-- 16. emergency_amenities
SELECT * FROM emergency_amenities;

-- 17. amenity_feedbacks
SELECT * FROM amenity_feedbacks;

-- 18. emergency_contacts
SELECT * FROM emergency_contacts;

-- 19. ai_moderation_logs
SELECT * FROM ai_moderation_logs;

-- 20. blacklisted_phrases
SELECT * FROM blacklisted_phrases;

-- 21. admin_reports
SELECT * FROM admin_reports;

-- 22. post_rescue_followups
SELECT * FROM post_rescue_followups;

-- 23. dangerous_point_feedbacks
SELECT * FROM dangerous_point_feedbacks;
