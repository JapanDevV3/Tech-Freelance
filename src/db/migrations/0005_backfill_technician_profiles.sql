-- Backfill: technicians who registered before sign-up started creating their profile.
-- Idempotent (ON CONFLICT on the unique user_id), so it is safe to re-run.
INSERT INTO "technician_profiles" ("user_id", "display_name")
SELECT u."id", u."name"
FROM "users" u
WHERE u."role" = 'technician'
ON CONFLICT ("user_id") DO NOTHING;
