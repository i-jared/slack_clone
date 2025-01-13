

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_permission" AS ENUM (
    'channels.delete',
    'messages.delete'
);


ALTER TYPE "public"."app_permission" OWNER TO "postgres";


CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'moderator'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'ONLINE',
    'OFFLINE'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
  declare
    bind_permissions int;
  begin
    select
      count(*)
    from public.role_permissions
    inner join public.user_roles on role_permissions.role = user_roles.role
    where
      role_permissions.permission = authorize.requested_permission and
      user_roles.user_id = authorize.user_id
    into bind_permissions;

    return bind_permissions > 0;
  end;
$$;


ALTER FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_set_offline"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE users 
  SET status = 'OFFLINE'
  WHERE updated_at < NOW() - INTERVAL '5 minutes'
    AND status = 'ONLINE';
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."auto_set_offline"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_storage_policy"("bucket_name" "text", "policy_name" "text", "policy_definition" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Create policy for INSERT
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS %I ON storage.objects FOR INSERT TO authenticated USING (%s)',
    policy_name || '_insert',
    policy_definition
  );
  
  -- Create policy for SELECT
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS %I ON storage.objects FOR SELECT TO authenticated USING (%s)',
    policy_name || '_select',
    policy_definition
  );
  
  -- Create policy for UPDATE
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS %I ON storage.objects FOR UPDATE TO authenticated USING (%s)',
    policy_name || '_update',
    policy_definition
  );
  
  -- Create policy for DELETE
  EXECUTE format(
    'CREATE POLICY IF NOT EXISTS %I ON storage.objects FOR DELETE TO authenticated USING (%s)',
    policy_name || '_delete',
    policy_definition
  );
END;
$$;


ALTER FUNCTION "public"."create_storage_policy"("bucket_name" "text", "policy_name" "text", "policy_definition" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email, username, display_name, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'OFFLINE'
  );
  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_documents" (
    "id" "uuid" NOT NULL,
    "owner_user_id" "uuid" NOT NULL,
    "title" "text",
    "description" "text",
    "source_type" "text",
    "content_url" "text",
    "embedding_refs" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."call_sessions" (
    "id" "uuid" NOT NULL,
    "call_type" "text" DEFAULT 'user_to_user'::"text",
    "channel_id" "uuid",
    "dm_room_id" "uuid",
    "initiator_id" "uuid" NOT NULL,
    "participants" "jsonb",
    "started_at" timestamp without time zone DEFAULT "now"(),
    "ended_at" timestamp without time zone,
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."call_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."channel_members" (
    "id" "uuid" NOT NULL,
    "channel_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."channel_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."channels" (
    "id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "channel_type" "text" DEFAULT 'text'::"text",
    "slug" "text" NOT NULL,
    "name" "text",
    "description" "text",
    "is_private" boolean DEFAULT false,
    "metadata" "jsonb",
    "placeholder_1" "text",
    "placeholder_2" "jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."channels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_emojis" (
    "id" "uuid" NOT NULL,
    "emoji_name" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "is_global" boolean DEFAULT true,
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_emojis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."direct_messages" (
    "id" "uuid" NOT NULL,
    "dm_room_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "message_text" "text",
    "attachments" "jsonb",
    "mentions" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "placeholder_1" "text"
);


ALTER TABLE "public"."direct_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dm_room_members" (
    "id" "uuid" NOT NULL,
    "dm_room_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."dm_room_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."dm_rooms" (
    "id" "uuid" NOT NULL,
    "room_name" "text",
    "is_group" boolean DEFAULT false,
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."dm_rooms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."message_reactions" (
    "id" "uuid" NOT NULL,
    "message_type" "text",
    "message_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "emoji" "text",
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."message_reactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "channel_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "message_text" "text",
    "attachments" "jsonb",
    "mentions" "jsonb",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "placeholder_2" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "workspace_id" "uuid",
    "thread_id" "uuid",
    "edited_at" timestamp without time zone,
    "edited_by" "uuid",
    "is_pinned" boolean DEFAULT false,
    "reactions" "jsonb" DEFAULT '[]'::"jsonb",
    "reply_count" integer DEFAULT 0,
    "is_announcement" boolean DEFAULT false,
    "is_ai_generated" boolean DEFAULT false,
    "ai_model" "text",
    "ai_prompt" "text",
    "ai_response_metadata" "jsonb",
    "read_by" "jsonb" DEFAULT '[]'::"jsonb",
    "delivery_status" "text" DEFAULT 'sent'::"text",
    "scheduled_for" timestamp without time zone,
    "expires_at" timestamp without time zone
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moderation_actions" (
    "id" "uuid" NOT NULL,
    "workspace_id" "uuid",
    "channel_id" "uuid",
    "acted_upon_id" "uuid" NOT NULL,
    "acted_by_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "reason" "text",
    "expires_at" timestamp without time zone,
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."moderation_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "notification_type" "text",
    "title" "text",
    "body" "text",
    "link" "text",
    "is_read" boolean DEFAULT false,
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pinned_messages" (
    "id" "uuid" NOT NULL,
    "message_type" "text" NOT NULL,
    "message_id" "uuid" NOT NULL,
    "pinned_by" "uuid" NOT NULL,
    "pinned_at" timestamp without time zone DEFAULT "now"(),
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."pinned_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "public"."app_permission" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."role_permissions" IS 'Application permissions for each role.';



ALTER TABLE "public"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."slash_commands" (
    "id" "uuid" NOT NULL,
    "command" "text" NOT NULL,
    "description" "text",
    "permissions" "jsonb",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."slash_commands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."thread_summaries" (
    "id" "uuid" NOT NULL,
    "channel_id" "uuid",
    "parent_message_id" "uuid",
    "summary_text" "text" NOT NULL,
    "pinned" boolean DEFAULT false,
    "metadata" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."thread_summaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "username" "text" NOT NULL,
    "display_name" "text",
    "phone_number" "text",
    "avatar_url" "text",
    "description" "text",
    "status" "text",
    "faction" "text",
    "last_seen" timestamp without time zone,
    "is_bot" boolean DEFAULT false,
    "preferences" "jsonb",
    "ai_persona" "jsonb",
    "gamification" "jsonb",
    "metadata" "jsonb",
    "placeholder_col_1" "text",
    "placeholder_col_2" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspace_members" (
    "id" "uuid" NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text",
    "permissions" "jsonb",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."workspace_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workspaces" (
    "id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "workspace_type" "text" DEFAULT 'standard'::"text",
    "metadata" "jsonb",
    "placeholder_1" "text",
    "placeholder_2" "jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."workspaces" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_documents"
    ADD CONSTRAINT "ai_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."call_sessions"
    ADD CONSTRAINT "call_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."channel_members"
    ADD CONSTRAINT "channel_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."channels"
    ADD CONSTRAINT "channels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_emojis"
    ADD CONSTRAINT "custom_emojis_emoji_name_key" UNIQUE ("emoji_name");



ALTER TABLE ONLY "public"."custom_emojis"
    ADD CONSTRAINT "custom_emojis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."direct_messages"
    ADD CONSTRAINT "direct_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dm_room_members"
    ADD CONSTRAINT "dm_room_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."dm_rooms"
    ADD CONSTRAINT "dm_rooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."message_reactions"
    ADD CONSTRAINT "message_reactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moderation_actions"
    ADD CONSTRAINT "moderation_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pinned_messages"
    ADD CONSTRAINT "pinned_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "public"."slash_commands"
    ADD CONSTRAINT "slash_commands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."thread_summaries"
    ADD CONSTRAINT "thread_summaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."workspace_members"
    ADD CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workspaces"
    ADD CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_edited_by_fkey" FOREIGN KEY ("edited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id");



CREATE POLICY "Allow individual read access" ON "public"."user_roles" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow signup insert" ON "public"."users" FOR INSERT WITH CHECK ((("auth"."role"() = 'anon'::"text") OR ("auth"."uid"() = "id")));



CREATE POLICY "Delete call_sessions open" ON "public"."call_sessions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Delete channel if creator" ON "public"."channels" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Delete channel membership if self" ON "public"."channel_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Delete custom_emojis open" ON "public"."custom_emojis" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Delete dm_room open" ON "public"."dm_rooms" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Delete dm_room_members if self" ON "public"."dm_room_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Delete if workspace owner" ON "public"."workspaces" FOR DELETE TO "authenticated" USING (("owner_id" = "auth"."uid"()));



CREATE POLICY "Delete moderation actions open" ON "public"."moderation_actions" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Delete notifications if user is recipient" ON "public"."notifications" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Delete own DM" ON "public"."direct_messages" FOR DELETE TO "authenticated" USING (("sender_id" = "auth"."uid"()));



CREATE POLICY "Delete own message" ON "public"."messages" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Delete own reaction" ON "public"."message_reactions" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Delete pinned_messages if pinned_by self" ON "public"."pinned_messages" FOR DELETE TO "authenticated" USING (("pinned_by" = "auth"."uid"()));



CREATE POLICY "Delete self" ON "public"."users" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Delete thread_summaries open" ON "public"."thread_summaries" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Delete your own ai_docs" ON "public"."ai_documents" FOR DELETE TO "authenticated" USING (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "Delete your own membership" ON "public"."workspace_members" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Insert DM if user is sender" ON "public"."direct_messages" FOR INSERT TO "authenticated" WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "Insert authenticated user" ON "public"."users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Insert call_sessions" ON "public"."call_sessions" FOR INSERT TO "authenticated" WITH CHECK (("initiator_id" = "auth"."uid"()));



CREATE POLICY "Insert channel" ON "public"."channels" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Insert channel membership" ON "public"."channel_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Insert custom_emojis" ON "public"."custom_emojis" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert dm_room" ON "public"."dm_rooms" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert dm_room_members" ON "public"."dm_room_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."dm_room_members" "dm_room_members_1"
  WHERE (("dm_room_members_1"."dm_room_id" = "dm_room_members_1"."dm_room_id") AND ("dm_room_members_1"."user_id" = "auth"."uid"())))) OR (NOT (EXISTS ( SELECT 1
   FROM "public"."dm_room_members" "dm_room_members_1"
  WHERE ("dm_room_members_1"."dm_room_id" = "dm_room_members_1"."dm_room_id"))))));



CREATE POLICY "Insert membership" ON "public"."workspace_members" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Insert message if user is sender" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Insert moderation actions" ON "public"."moderation_actions" FOR INSERT TO "authenticated" WITH CHECK (("acted_by_id" = "auth"."uid"()));



CREATE POLICY "Insert notifications" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Insert pinned_messages" ON "public"."pinned_messages" FOR INSERT TO "authenticated" WITH CHECK (("pinned_by" = "auth"."uid"()));



CREATE POLICY "Insert reaction" ON "public"."message_reactions" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Insert thread_summaries" ON "public"."thread_summaries" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Insert workspace" ON "public"."workspaces" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "Insert your own ai_docs" ON "public"."ai_documents" FOR INSERT TO "authenticated" WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "Manage slash_commands" ON "public"."slash_commands" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Public read of all users" ON "public"."users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public read of all workspaces" ON "public"."workspaces" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Public read of workspace_members" ON "public"."workspace_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select ai_documents if owner" ON "public"."ai_documents" FOR SELECT TO "authenticated" USING (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "Select all channel messages" ON "public"."messages" FOR SELECT USING (true);



CREATE POLICY "Select all channel_members" ON "public"."channel_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all channels" ON "public"."channels" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all custom_emojis" ON "public"."custom_emojis" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all dm_room_members" ON "public"."dm_room_members" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all dm_rooms" ON "public"."dm_rooms" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all message_reactions" ON "public"."message_reactions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select all moderation_actions" ON "public"."moderation_actions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select call_sessions" ON "public"."call_sessions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select direct messages open" ON "public"."direct_messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select notifications if user is recipient" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Select pinned_messages all" ON "public"."pinned_messages" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select slash_commands" ON "public"."slash_commands" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Select thread_summaries" ON "public"."thread_summaries" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Update call_sessions open" ON "public"."call_sessions" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Update channel if creator" ON "public"."channels" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Update channel membership if self" ON "public"."channel_members" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Update custom_emojis open" ON "public"."custom_emojis" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Update dm_room open" ON "public"."dm_rooms" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Update dm_room_members if self" ON "public"."dm_room_members" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Update if workspace owner" ON "public"."workspaces" FOR UPDATE TO "authenticated" USING (("owner_id" = "auth"."uid"())) WITH CHECK (("owner_id" = "auth"."uid"()));



CREATE POLICY "Update moderation actions open" ON "public"."moderation_actions" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Update notifications if user is recipient" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Update own DM" ON "public"."direct_messages" FOR UPDATE TO "authenticated" USING (("sender_id" = "auth"."uid"())) WITH CHECK (("sender_id" = "auth"."uid"()));



CREATE POLICY "Update own message" ON "public"."messages" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Update own reaction" ON "public"."message_reactions" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Update pinned_messages if pinned_by self" ON "public"."pinned_messages" FOR UPDATE TO "authenticated" USING (("pinned_by" = "auth"."uid"())) WITH CHECK (("pinned_by" = "auth"."uid"()));



CREATE POLICY "Update self" ON "public"."users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Update thread_summaries open" ON "public"."thread_summaries" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Update your own ai_docs" ON "public"."ai_documents" FOR UPDATE TO "authenticated" USING (("owner_user_id" = "auth"."uid"())) WITH CHECK (("owner_user_id" = "auth"."uid"()));



CREATE POLICY "Update your own membership" ON "public"."workspace_members" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."ai_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."call_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."channel_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."channels" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_emojis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."direct_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dm_room_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."dm_rooms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."message_reactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moderation_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pinned_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."slash_commands" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."thread_summaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspace_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workspaces" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."users";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."authorize"("requested_permission" "public"."app_permission", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_set_offline"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_set_offline"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_set_offline"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_storage_policy"("bucket_name" "text", "policy_name" "text", "policy_definition" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_storage_policy"("bucket_name" "text", "policy_name" "text", "policy_definition" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_storage_policy"("bucket_name" "text", "policy_name" "text", "policy_definition" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";


















GRANT ALL ON TABLE "public"."ai_documents" TO "anon";
GRANT ALL ON TABLE "public"."ai_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_documents" TO "service_role";



GRANT ALL ON TABLE "public"."call_sessions" TO "anon";
GRANT ALL ON TABLE "public"."call_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."call_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."channel_members" TO "anon";
GRANT ALL ON TABLE "public"."channel_members" TO "authenticated";
GRANT ALL ON TABLE "public"."channel_members" TO "service_role";



GRANT ALL ON TABLE "public"."channels" TO "anon";
GRANT ALL ON TABLE "public"."channels" TO "authenticated";
GRANT ALL ON TABLE "public"."channels" TO "service_role";



GRANT ALL ON TABLE "public"."custom_emojis" TO "anon";
GRANT ALL ON TABLE "public"."custom_emojis" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_emojis" TO "service_role";



GRANT ALL ON TABLE "public"."direct_messages" TO "anon";
GRANT ALL ON TABLE "public"."direct_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."direct_messages" TO "service_role";



GRANT ALL ON TABLE "public"."dm_room_members" TO "anon";
GRANT ALL ON TABLE "public"."dm_room_members" TO "authenticated";
GRANT ALL ON TABLE "public"."dm_room_members" TO "service_role";



GRANT ALL ON TABLE "public"."dm_rooms" TO "anon";
GRANT ALL ON TABLE "public"."dm_rooms" TO "authenticated";
GRANT ALL ON TABLE "public"."dm_rooms" TO "service_role";



GRANT ALL ON TABLE "public"."message_reactions" TO "anon";
GRANT ALL ON TABLE "public"."message_reactions" TO "authenticated";
GRANT ALL ON TABLE "public"."message_reactions" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."moderation_actions" TO "anon";
GRANT ALL ON TABLE "public"."moderation_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."moderation_actions" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."pinned_messages" TO "anon";
GRANT ALL ON TABLE "public"."pinned_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."pinned_messages" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."role_permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."slash_commands" TO "anon";
GRANT ALL ON TABLE "public"."slash_commands" TO "authenticated";
GRANT ALL ON TABLE "public"."slash_commands" TO "service_role";



GRANT ALL ON TABLE "public"."thread_summaries" TO "anon";
GRANT ALL ON TABLE "public"."thread_summaries" TO "authenticated";
GRANT ALL ON TABLE "public"."thread_summaries" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workspace_members" TO "anon";
GRANT ALL ON TABLE "public"."workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."workspace_members" TO "service_role";



GRANT ALL ON TABLE "public"."workspaces" TO "anon";
GRANT ALL ON TABLE "public"."workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."workspaces" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
