-- Email OTP verification storage for signup (Neon / PostgreSQL).
-- Apply once in your Neon project: SQL Editor -> paste -> Run.
--
-- Only the server accesses this table via DATABASE_URL (service connection).
-- Rows are overwritten on resend and deleted on successful verification / expiry,
-- so no cron job is required.

create table if not exists email_otps (
  email             text primary key,
  otp_hash          text        not null,
  expires_at        timestamptz not null,
  created_at        timestamptz not null default now(),
  attempts          integer     not null default 0,
  send_count        integer     not null default 0,
  send_window_start timestamptz not null default now(),
  last_sent_at      timestamptz,
  verified          boolean     not null default false,
  verified_at       timestamptz
);

create index if not exists email_otps_expires_at_idx
  on email_otps (expires_at);
