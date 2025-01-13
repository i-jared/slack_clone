-- Drop existing tables to recreate them with correct relationships
DROP TABLE IF EXISTS "public"."dm_rooms" CASCADE;
DROP TABLE IF EXISTS "public"."workspace_members" CASCADE;
DROP TABLE IF EXISTS "public"."channel_members" CASCADE;

-- Create workspace_members table
CREATE TABLE "public"."workspace_members" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "workspace_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL DEFAULT 'member',
    "permissions" jsonb,
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE CASCADE,
    CONSTRAINT "workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

-- Create channel_members table
CREATE TABLE "public"."channel_members" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "channel_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "role" text NOT NULL DEFAULT 'member',
    "metadata" jsonb,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "channel_members_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."channels"("id") ON DELETE CASCADE,
    CONSTRAINT "channel_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

-- Create dm_rooms table
CREATE TABLE "public"."dm_rooms" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "member1_id" uuid NOT NULL,
    "member2_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now(),
    "updated_at" timestamp with time zone DEFAULT now(),
    CONSTRAINT "dm_rooms_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dm_rooms_member1_id_fkey" FOREIGN KEY ("member1_id") REFERENCES "public"."users"("id") ON DELETE CASCADE,
    CONSTRAINT "dm_rooms_member2_id_fkey" FOREIGN KEY ("member2_id") REFERENCES "public"."users"("id") ON DELETE CASCADE
);

-- Add indexes for better performance
CREATE INDEX "workspace_members_workspace_id_idx" ON "public"."workspace_members" ("workspace_id");
CREATE INDEX "workspace_members_user_id_idx" ON "public"."workspace_members" ("user_id");
CREATE INDEX "channel_members_channel_id_idx" ON "public"."channel_members" ("channel_id");
CREATE INDEX "channel_members_user_id_idx" ON "public"."channel_members" ("user_id");
CREATE INDEX "dm_rooms_member1_id_idx" ON "public"."dm_rooms" ("member1_id");
CREATE INDEX "dm_rooms_member2_id_idx" ON "public"."dm_rooms" ("member2_id");

-- Enable RLS
ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."channel_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."dm_rooms" ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Allow users to view their workspace memberships"
ON "public"."workspace_members"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to view their channel memberships"
ON "public"."channel_members"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to view their DM rooms"
ON "public"."dm_rooms"
FOR SELECT
TO authenticated
USING (auth.uid() = member1_id OR auth.uid() = member2_id);

CREATE POLICY "Allow users to create DM rooms"
ON "public"."dm_rooms"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = member1_id OR auth.uid() = member2_id); 