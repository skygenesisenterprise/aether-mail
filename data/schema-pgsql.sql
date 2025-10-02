-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ================
-- Table: organizations
-- ================
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX organizations_domain_idx ON organizations (lower(domain));

-- ================
-- Table: users
-- ================
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  sge_uid text UNIQUE,
  username citext NOT NULL,
  primary_email citext NOT NULL,
  display_name text,
  locale text DEFAULT 'en_US',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  properties jsonb DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX users_org_username_idx ON users (organization_id, username);
CREATE UNIQUE INDEX users_org_email_idx ON users (organization_id, primary_email);

-- ================
-- Table: mailboxes
-- ================
CREATE TABLE mailboxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  address citext NOT NULL,
  type text NOT NULL DEFAULT 'user',
  owner_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  quota_bytes bigint DEFAULT 25*1024*1024*1024,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  properties jsonb DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX mailboxes_org_address_idx ON mailboxes (organization_id, address);

-- ================
-- Table: folders
-- ================
CREATE TABLE folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mailbox_id uuid REFERENCES mailboxes(id) ON DELETE CASCADE,
  parent_folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  name text NOT NULL,
  path text NOT NULL,
  delimiter text DEFAULT '/',
  created_at timestamptz NOT NULL DEFAULT now(),
  properties jsonb DEFAULT '{}'::jsonb
);
CREATE UNIQUE INDEX folders_mailbox_path_idx ON folders (mailbox_id, path);

-- ================
-- Table: conversations
-- ================
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  subject text,
  snippet text,
  participants jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversations_org_updated_idx ON conversations (organization_id, updated_at);

-- ================
-- Table: messages
-- ================
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  mailbox_id uuid REFERENCES mailboxes(id) ON DELETE CASCADE,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  message_uid bigint,
  message_id_header text,
  "in_reply_to" text,
  "references" text,
  subject text,
  from_address citext,
  to_addresses citext[],
  cc_addresses citext[],
  bcc_addresses citext[],
  date_sent timestamptz,
  date_received timestamptz DEFAULT now(),
  size_bytes bigint,
  is_seen boolean DEFAULT false,
  is_flagged boolean DEFAULT false,
  is_answered boolean DEFAULT false,
  is_forwarded boolean DEFAULT false,
  is_deleted boolean DEFAULT false,
  is_draft boolean DEFAULT false,
  is_spam boolean DEFAULT false,
  raw_headers text,
  body_snippet text,
  has_attachments boolean DEFAULT false,
  storage_backend text DEFAULT 'imap',
  storage_path text,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  tsv tsvector
);
CREATE UNIQUE INDEX messages_mailbox_uid_idx ON messages (mailbox_id, message_uid) WHERE message_uid IS NOT NULL;
CREATE INDEX messages_mailbox_folder_idx ON messages (mailbox_id, folder_id);
CREATE INDEX messages_org_date_idx ON messages (organization_id, date_received DESC);
CREATE INDEX messages_tsv_idx ON messages USING GIN(tsv);

-- Trigger function pour mise à jour tsvector
CREATE FUNCTION messages_tsv_trigger() RETURNS trigger AS $$
BEGIN
  NEW.tsv := to_tsvector('simple', coalesce(NEW.subject,'') || ' ' || coalesce(NEW.body_snippet,'') || ' ' || coalesce(NEW.raw_headers,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER messages_tsv_update BEFORE INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE PROCEDURE messages_tsv_trigger();

-- ================
-- Table: message_parts
-- ================
CREATE TABLE message_parts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  parent_part_id uuid REFERENCES message_parts(id) ON DELETE CASCADE,
  content_type text,
  content_disposition text,
  filename text,
  content_id text,
  is_inline boolean DEFAULT false,
  charset text,
  size_bytes bigint,
  storage_backend text DEFAULT 'aether-store',
  storage_path text,
  headers jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX message_parts_message_idx ON message_parts(message_id);

-- ================
-- Table: attachments
-- ================
CREATE TABLE attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_part_id uuid REFERENCES message_parts(id) ON DELETE CASCADE,
  mailbox_id uuid REFERENCES mailboxes(id) ON DELETE SET NULL,
  filename text,
  mime_type text,
  size_bytes bigint,
  sha256 bytea,
  storage_backend text,
  storage_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX attachments_sha_idx ON attachments(sha256);

-- ================
-- Table: recipients
-- ================
CREATE TABLE recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('to','cc','bcc','reply-to')),
  address citext NOT NULL,
  resolved_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  received boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX recipients_message_idx ON recipients(message_id);

-- ================
-- Table: message_flags
-- ================
CREATE TABLE message_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  flag text NOT NULL,
  value boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX message_flags_message_idx ON message_flags(message_id);

-- ================
-- Table: mailbox_uids
-- ================
CREATE TABLE mailbox_uids (
  mailbox_id uuid PRIMARY KEY REFERENCES mailboxes(id) ON DELETE CASCADE,
  last_uid bigint NOT NULL DEFAULT 0
);

-- Fonction concurrent-safe pour next_uid
CREATE FUNCTION next_mailbox_uid(mbox uuid) RETURNS bigint LANGUAGE plpgsql AS $$
DECLARE v bigint;
BEGIN
  LOOP
    UPDATE mailbox_uids SET last_uid = last_uid + 1 WHERE mailbox_id = mbox RETURNING last_uid INTO v;
    IF FOUND THEN
      RETURN v;
    ELSE
      BEGIN
        INSERT INTO mailbox_uids(mailbox_id,last_uid) VALUES (mbox,1);
        RETURN 1;
      EXCEPTION WHEN unique_violation THEN
      END;
    END IF;
  END LOOP;
END;
$$;

-- Trigger assign_message_uid
CREATE FUNCTION assign_message_uid() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.message_uid IS NULL THEN
    NEW.message_uid := next_mailbox_uid(NEW.mailbox_id);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER messages_assign_uid BEFORE INSERT ON messages
FOR EACH ROW EXECUTE PROCEDURE assign_message_uid();

-- ================
-- Vue: mailbox stats
-- ================
CREATE VIEW v_mailbox_stats AS
SELECT m.id AS mailbox_id,
       m.address,
       COUNT(msg.*) FILTER (WHERE msg.is_deleted = false) AS message_count,
       SUM(msg.size_bytes) AS total_bytes
FROM mailboxes m
LEFT JOIN messages msg ON msg.mailbox_id = m.id
GROUP BY m.id, m.address;
