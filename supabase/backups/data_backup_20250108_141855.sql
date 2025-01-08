SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

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

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '3716fd0c-a3be-4897-b380-15903e50d410', '{"action":"user_confirmation_requested","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:00:54.083956+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea4113fb-40ee-4019-8106-5d5d91317a67', '{"action":"user_signedup","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:01:09.188097+00', ''),
	('00000000-0000-0000-0000-000000000000', '0fa4ab25-efde-46b2-a5f3-6d9ddb12c3f2', '{"action":"login","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-24 17:02:30.045018+00', ''),
	('00000000-0000-0000-0000-000000000000', '85483f70-a419-4349-b7c8-5c002b9edc3a', '{"action":"user_repeated_signup","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:02:44.523199+00', ''),
	('00000000-0000-0000-0000-000000000000', '40497251-3a9a-4f90-bcd5-9e7a8cda1c78', '{"action":"login","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-24 17:05:19.220421+00', ''),
	('00000000-0000-0000-0000-000000000000', '5c9f5153-2aa8-436d-8c69-d4f27153fbee', '{"action":"login","actor_id":"7ba2724c-a20e-44d8-9fe2-c29208641c62","actor_username":"reeceharding@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-24 17:05:24.154219+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8232211-fcbc-439e-b661-b87662b0869a', '{"action":"user_confirmation_requested","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:05:36.116247+00', ''),
	('00000000-0000-0000-0000-000000000000', '05703dc8-d98d-423b-bd44-8977538812d3', '{"action":"user_signedup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:06:30.555356+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a2f52e3e-6332-490a-aa46-4e39d4235780', '{"action":"login","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2024-12-24 17:08:51.288217+00', ''),
	('00000000-0000-0000-0000-000000000000', '4bd7b63b-8652-4f12-8dc0-6c048ddd69ff', '{"action":"user_confirmation_requested","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:09:02.266795+00', ''),
	('00000000-0000-0000-0000-000000000000', '43b8c90b-0a85-406c-84ae-60b7a7505115', '{"action":"user_signedup","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:09:19.897784+00', ''),
	('00000000-0000-0000-0000-000000000000', '75122669-7fc7-439b-b53f-a00cf04fab76', '{"action":"user_confirmation_requested","actor_id":"5e537171-e309-44f7-93cd-343842befc28","actor_username":"rharding2@wisc.edu","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:11:12.487015+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c8bbf26-21c0-44e8-afae-589d487ee663', '{"action":"user_signedup","actor_id":"5e537171-e309-44f7-93cd-343842befc28","actor_username":"rharding2@wisc.edu","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:11:45.029425+00', ''),
	('00000000-0000-0000-0000-000000000000', '81e32878-d109-42e3-8536-fb86a6af58c4', '{"action":"user_confirmation_requested","actor_id":"7563ac33-3752-4c3f-b1f2-3b31aba75a90","actor_username":"foodresque@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:11:46.444329+00', ''),
	('00000000-0000-0000-0000-000000000000', '61b3017a-d28d-44c0-bb88-d2493f0230c5', '{"action":"user_signedup","actor_id":"7563ac33-3752-4c3f-b1f2-3b31aba75a90","actor_username":"foodresque@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:12:08.942175+00', ''),
	('00000000-0000-0000-0000-000000000000', '83086048-3e2e-44a9-8f6f-bbf5e852c024', '{"action":"user_confirmation_requested","actor_id":"93756889-6c68-4cc5-bca7-068b15475bf3","actor_username":"onesecrepo@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:14:20.183281+00', ''),
	('00000000-0000-0000-0000-000000000000', '971eb3f0-fcd3-4e08-9d32-1c4a2a13a48d', '{"action":"user_signedup","actor_id":"93756889-6c68-4cc5-bca7-068b15475bf3","actor_username":"onesecrepo@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:14:31.168682+00', ''),
	('00000000-0000-0000-0000-000000000000', '8241dd43-e674-47c1-9b16-c7885b04198d', '{"action":"user_confirmation_requested","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2024-12-24 17:15:54.714164+00', ''),
	('00000000-0000-0000-0000-000000000000', '283493b3-1f8e-4eef-88b1-d8074d74bb9c', '{"action":"user_signedup","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"team"}', '2024-12-24 17:16:09.832957+00', ''),
	('00000000-0000-0000-0000-000000000000', '8b1551e6-4e8b-43af-8faf-b501f71d976b', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:23.961569+00', ''),
	('00000000-0000-0000-0000-000000000000', '0f0de770-2388-4938-9a84-801385e7e6b7', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:32.539535+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a3892076-39d8-4076-abf4-81b32461a886', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:41.984843+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd4a1e29a-d991-4c9f-9fa1-1f570589be0a', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:44.061209+00', ''),
	('00000000-0000-0000-0000-000000000000', '47610c85-eef2-49e9-8c2c-b06926ba9398', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:44.333855+00', ''),
	('00000000-0000-0000-0000-000000000000', '6391642a-2e03-446c-92ea-f4eb909ea837', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:44.537355+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f310e77c-58ed-4241-9b35-848dc40440bd', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:45.601187+00', ''),
	('00000000-0000-0000-0000-000000000000', '039ed2a0-8631-4e18-aced-0c819ce0ec63', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:51.413349+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da3766c6-26cc-49ee-b878-ab577ca33aa4', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:48:52.35157+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cb62161f-c1a1-4593-b65d-e34ec2e9ad04', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:50:13.332779+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd34e0264-19da-4908-903a-1c3cddf685a1', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:50:22.209434+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e5d49ea-3091-4b5e-9dcd-93b04c7a15e3', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:54:55.322266+00', ''),
	('00000000-0000-0000-0000-000000000000', '10d6e1c8-d68d-46bc-82bf-ad39115faaa8', '{"action":"user_repeated_signup","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 04:58:10.612086+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd9594b16-0465-452d-abdb-2b740f7e604a', '{"action":"user_signedup","actor_id":"87330b5e-0fcd-4d59-a479-3369a9e6dedd","actor_username":"collegeforreece@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 04:58:56.88767+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fd6449a4-f477-4176-b0d2-3fc2f7948ebe', '{"action":"login","actor_id":"87330b5e-0fcd-4d59-a479-3369a9e6dedd","actor_username":"collegeforreece@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 04:58:56.893151+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e15f744-5c18-4f08-ac1c-74f1d073d0bb', '{"action":"logout","actor_id":"87330b5e-0fcd-4d59-a479-3369a9e6dedd","actor_username":"collegeforreece@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 05:03:16.460683+00', ''),
	('00000000-0000-0000-0000-000000000000', '7e940808-e06e-46c6-8285-21b0caad195d', '{"action":"user_repeated_signup","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 05:03:31.945312+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f6efad24-943f-485b-9e33-82d63532ccab', '{"action":"login","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 05:03:37.680358+00', ''),
	('00000000-0000-0000-0000-000000000000', '617329ce-4e69-41f0-a1ed-6c3139037855', '{"action":"login","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 05:27:43.032521+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9817834-41d4-4c75-bbee-d2a0ec94acae', '{"action":"user_signedup","actor_id":"6a8df463-5019-4b0f-b7a6-c856a88a1b02","actor_username":"test@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 05:32:35.079846+00', ''),
	('00000000-0000-0000-0000-000000000000', '4d54c15c-7ecc-4282-bd5b-bab57ae68d14', '{"action":"login","actor_id":"6a8df463-5019-4b0f-b7a6-c856a88a1b02","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 05:32:35.088477+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b493ee9c-b69f-4ce6-8c80-a0588eeab7fe', '{"action":"user_repeated_signup","actor_id":"6a8df463-5019-4b0f-b7a6-c856a88a1b02","actor_username":"test@example.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 05:32:35.237626+00', ''),
	('00000000-0000-0000-0000-000000000000', '65a355cb-a8d8-434d-ad5c-96ef554ff82d', '{"action":"user_signedup","actor_id":"5967063f-3ff0-4db0-8277-8100dd805273","actor_username":"newuser@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 05:32:35.480406+00', ''),
	('00000000-0000-0000-0000-000000000000', '2e9e0ce9-a080-48ab-94b6-c407dcd2cca6', '{"action":"login","actor_id":"5967063f-3ff0-4db0-8277-8100dd805273","actor_username":"newuser@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 05:32:35.483506+00', ''),
	('00000000-0000-0000-0000-000000000000', '70da03f0-b1ac-442e-948e-e4ae3830d1ae', '{"action":"login","actor_id":"6a8df463-5019-4b0f-b7a6-c856a88a1b02","actor_username":"test@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 05:32:35.79657+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6faddc4-7dad-4786-9769-7946aa8b8cc8', '{"action":"token_refreshed","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 06:00:02.87618+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd77ca216-c0e3-48d4-9c9d-4991852bf7a3', '{"action":"token_revoked","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 06:00:02.878287+00', ''),
	('00000000-0000-0000-0000-000000000000', '86ca4119-7952-4f98-a876-a825cb402549', '{"action":"user_signedup","actor_id":"786a527e-7ade-4d89-95e3-158d9ede52bf","actor_username":"rharding1123333@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 06:10:55.036602+00', ''),
	('00000000-0000-0000-0000-000000000000', '43ece472-3454-4b7a-869f-c296a98a2bcf', '{"action":"login","actor_id":"786a527e-7ade-4d89-95e3-158d9ede52bf","actor_username":"rharding1123333@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 06:10:55.043442+00', ''),
	('00000000-0000-0000-0000-000000000000', '0792b059-0d1b-4081-968e-08798a1d3539', '{"action":"user_repeated_signup","actor_id":"786a527e-7ade-4d89-95e3-158d9ede52bf","actor_username":"rharding1123333@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 06:10:59.048143+00', ''),
	('00000000-0000-0000-0000-000000000000', '0b96b3d9-54b1-47b0-9c8d-5555713c74ad', '{"action":"login","actor_id":"786a527e-7ade-4d89-95e3-158d9ede52bf","actor_username":"rharding1123333@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 06:11:45.524433+00', ''),
	('00000000-0000-0000-0000-000000000000', '64acea85-5c4c-4d82-950b-f0867b2c37bd', '{"action":"login","actor_id":"786a527e-7ade-4d89-95e3-158d9ede52bf","actor_username":"rharding1123333@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 06:11:49.009446+00', ''),
	('00000000-0000-0000-0000-000000000000', '3a4a94ea-f617-4e76-9bfb-000011323650', '{"action":"user_signedup","actor_id":"fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99","actor_username":"rharding112ss3@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 06:12:36.285802+00', ''),
	('00000000-0000-0000-0000-000000000000', '79172421-1941-4cb0-8184-5ea27d0195a5', '{"action":"login","actor_id":"fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99","actor_username":"rharding112ss3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 06:12:36.289244+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a42933f7-ae1d-4978-be65-8c8e599e9a92', '{"action":"logout","actor_id":"fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99","actor_username":"rharding112ss3@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 06:14:14.5823+00', ''),
	('00000000-0000-0000-0000-000000000000', '3d29ae0b-356c-41b5-8d6a-179277c45ba3', '{"action":"user_signedup","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 06:14:18.352298+00', ''),
	('00000000-0000-0000-0000-000000000000', '0db9d364-661f-440f-9cc4-3e9a5e7612d8', '{"action":"login","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 06:14:18.356154+00', ''),
	('00000000-0000-0000-0000-000000000000', '911e7a99-a6f9-4c26-b1e9-60ba6574cd38', '{"action":"login","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 16:36:20.962534+00', ''),
	('00000000-0000-0000-0000-000000000000', '1f94934c-a8fa-4bcc-bffc-a247385806a7', '{"action":"logout","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 16:38:33.252677+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a702579b-9e6a-48ec-8c02-adbd24a9ad44', '{"action":"login","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 16:38:50.434547+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f4505089-a22a-434e-9574-97806be306ce', '{"action":"logout","actor_id":"b43e63f7-9a88-4b75-847c-225dac39d613","actor_username":"rharding112zz3@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 16:38:57.865145+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd20159f-4184-4eff-86f2-b2884685d3e1', '{"action":"user_signedup","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 16:39:06.306227+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7c574df-fa35-45c4-94e7-3ce79a6b4990', '{"action":"login","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 16:39:06.315065+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ee70b4c8-a2bd-42f1-b3ad-7a53e1c487a1', '{"action":"token_refreshed","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 17:31:56.449846+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fcdf0744-ca70-4960-a29b-4c388442482b', '{"action":"token_revoked","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 17:31:56.459201+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd6b3be73-487c-4f1b-be85-24f40e7909c0', '{"action":"token_refreshed","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 17:59:49.326137+00', ''),
	('00000000-0000-0000-0000-000000000000', '628fac01-e129-487d-897b-be6528144355', '{"action":"token_revoked","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 17:59:49.330925+00', ''),
	('00000000-0000-0000-0000-000000000000', '6aa36ad9-875d-4696-acca-f8b57cafcbce', '{"action":"login","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 17:59:53.226395+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cefebd35-dc00-462e-8356-d63b4685f4e9', '{"action":"login","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:02:13.336639+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd09ac75-7c0d-4384-a149-626942ac67f2', '{"action":"user_signedup","actor_id":"e29fda9e-9e1e-44b0-8a59-c4e8b54e0333","actor_username":"john@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:05:00.82442+00', ''),
	('00000000-0000-0000-0000-000000000000', '7f728bac-462e-47a5-a8d0-10c9693de94f', '{"action":"login","actor_id":"e29fda9e-9e1e-44b0-8a59-c4e8b54e0333","actor_username":"john@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:05:00.834259+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b752aba2-38be-4f3a-bc4c-d3a8b33afaf6', '{"action":"login","actor_id":"e29fda9e-9e1e-44b0-8a59-c4e8b54e0333","actor_username":"john@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:09:14.7374+00', ''),
	('00000000-0000-0000-0000-000000000000', '31c8843e-f3f9-4d57-8731-a05a669c17b2', '{"action":"user_signedup","actor_id":"82dbba6b-68f8-4b8a-87c2-5fc29f117dd1","actor_username":"23e@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:16:13.568977+00', ''),
	('00000000-0000-0000-0000-000000000000', '5a13430c-3ace-49b4-a0f5-2ed3081e7104', '{"action":"login","actor_id":"82dbba6b-68f8-4b8a-87c2-5fc29f117dd1","actor_username":"23e@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:16:13.573931+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9709db8-240e-414d-9d82-c5f29e2e47cd', '{"action":"user_signedup","actor_id":"94564ad5-98f8-4005-b35f-84974bf9cb77","actor_username":"1235@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:18:25.114644+00', ''),
	('00000000-0000-0000-0000-000000000000', '54cb9d18-5902-485b-8cad-993cd4e111d5', '{"action":"login","actor_id":"94564ad5-98f8-4005-b35f-84974bf9cb77","actor_username":"1235@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:18:25.120412+00', ''),
	('00000000-0000-0000-0000-000000000000', '69fb2964-58e8-4574-880c-8421dc7b53ec', '{"action":"user_signedup","actor_id":"41bc6dad-db73-46d4-a98a-4b259a18711c","actor_username":"11@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:19:55.93102+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c0c5c7a-3ba6-4077-a9fc-c3053db2878a', '{"action":"login","actor_id":"41bc6dad-db73-46d4-a98a-4b259a18711c","actor_username":"11@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:19:55.937192+00', ''),
	('00000000-0000-0000-0000-000000000000', '3c27f45e-fc67-44d1-876a-57e026686bc4', '{"action":"token_refreshed","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 18:32:33.008326+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fc47c7bd-75b6-43cf-8251-57fc422b8de4', '{"action":"token_revoked","actor_id":"6edc9c5a-b9d2-4e6b-9904-2dd141878213","actor_username":"rharding1123aaaaa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 18:32:33.010754+00', ''),
	('00000000-0000-0000-0000-000000000000', '06ca4a42-40fe-4269-978f-3a9b33b9f83a', '{"action":"user_signedup","actor_id":"60f7a927-3f13-4e05-ab6e-42103399d5ff","actor_username":"rharding1123aaa7aa@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:32:38.34046+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b6de45be-deec-4cd8-a8a8-703c2739203e', '{"action":"login","actor_id":"60f7a927-3f13-4e05-ab6e-42103399d5ff","actor_username":"rharding1123aaa7aa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:32:38.344766+00', ''),
	('00000000-0000-0000-0000-000000000000', '20ce79ca-1c7f-4093-b967-a018fb3338d9', '{"action":"user_signedup","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 18:33:42.329716+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a5e1e0f3-7815-475b-ad1a-9fecda4e8dab', '{"action":"login","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 18:33:42.334058+00', ''),
	('00000000-0000-0000-0000-000000000000', '6970445c-7e62-4d25-8014-f84434cf87a3', '{"action":"token_refreshed","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 19:31:28.715774+00', ''),
	('00000000-0000-0000-0000-000000000000', '8f971fbd-fec4-491b-8807-f3da97a65601', '{"action":"token_revoked","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 19:31:28.719949+00', ''),
	('00000000-0000-0000-0000-000000000000', '87f22e67-9552-4b68-92b0-868bcc18312c', '{"action":"user_repeated_signup","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 19:31:31.225577+00', ''),
	('00000000-0000-0000-0000-000000000000', '6056805b-99f0-4053-af9a-618ca4f58871', '{"action":"login","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 19:31:34.211406+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd73e687e-e261-4c54-942b-56ca53866cdd', '{"action":"logout","actor_id":"76071b4e-168a-4de6-80c1-3a8e91140cc6","actor_username":"rharding1123a2aa7aa@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 19:48:55.501153+00', ''),
	('00000000-0000-0000-0000-000000000000', 'dd221d20-05b5-4d6f-92bd-99d0032ac7c9', '{"action":"user_signedup","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 19:49:05.62685+00', ''),
	('00000000-0000-0000-0000-000000000000', 'eab23328-9b40-455a-b6b8-d6dec269c17a', '{"action":"login","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 19:49:05.631758+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ec86d1d7-6fbe-4ca0-8cdf-7192f37919ca', '{"action":"token_refreshed","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:09:47.944197+00', ''),
	('00000000-0000-0000-0000-000000000000', '5beda0f5-e557-47d5-b260-8ea42d935ca3', '{"action":"token_revoked","actor_id":"5f944b5a-31bc-4905-a021-76c59f88f275","actor_username":"thegreatestregretofthedying@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:09:47.946254+00', ''),
	('00000000-0000-0000-0000-000000000000', '72b22dc5-cce1-45ba-9f47-f01ab9f7726c', '{"action":"user_signedup","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:09:58.739236+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd8c5cdac-b55c-45ef-a7af-cb4a1a9b5823', '{"action":"login","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:09:58.743783+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cf3cc31c-9103-45a6-8ce6-aa86f78862b2', '{"action":"token_refreshed","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:11:49.791561+00', ''),
	('00000000-0000-0000-0000-000000000000', '2ded0daf-5511-4deb-abc7-3ba32d88088a', '{"action":"token_revoked","actor_id":"9004c2e6-259f-48ea-ba08-87ccf30a3d8e","actor_username":"rieboysspam@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:11:49.792441+00', ''),
	('00000000-0000-0000-0000-000000000000', '5f111919-8fb2-45de-954c-001523b01545', '{"action":"user_signedup","actor_id":"4a1f3a43-1012-44ee-9c40-6a22bc1a63d2","actor_username":"rieboysspa22m@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:12:16.386384+00', ''),
	('00000000-0000-0000-0000-000000000000', '45b6a838-1cef-41fa-ad5d-385a8d8a4a2e', '{"action":"login","actor_id":"4a1f3a43-1012-44ee-9c40-6a22bc1a63d2","actor_username":"rieboysspa22m@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:12:16.390912+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b560d6af-9ca8-4286-81b5-41e7b55ae6db', '{"action":"user_signedup","actor_id":"53c879ef-cd9f-40ed-ae0b-bca72abc5d0f","actor_username":"rieboysspaa22m@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:15:05.807165+00', ''),
	('00000000-0000-0000-0000-000000000000', '9260ad54-14d2-4b22-a4fc-863ce9fe7f21', '{"action":"login","actor_id":"53c879ef-cd9f-40ed-ae0b-bca72abc5d0f","actor_username":"rieboysspaa22m@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:15:05.812049+00', ''),
	('00000000-0000-0000-0000-000000000000', '0026e18d-2a80-422f-ba3a-cc8b2aa7b961', '{"action":"user_repeated_signup","actor_id":"53c879ef-cd9f-40ed-ae0b-bca72abc5d0f","actor_username":"rieboysspaa22m@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 20:17:56.126851+00', ''),
	('00000000-0000-0000-0000-000000000000', '974a62d9-2cff-49ad-8424-4155159f855b', '{"action":"user_signedup","actor_id":"19c75dbd-1dad-478a-b053-fe0319d2b23d","actor_username":"rieboysspaa22am@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:18:02.604029+00', ''),
	('00000000-0000-0000-0000-000000000000', '063e0f0a-26cd-4fd2-a3a3-7724438a1ea9', '{"action":"login","actor_id":"19c75dbd-1dad-478a-b053-fe0319d2b23d","actor_username":"rieboysspaa22am@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:18:02.607953+00', ''),
	('00000000-0000-0000-0000-000000000000', '17a46675-4639-404c-9b66-29912a2985ae', '{"action":"user_signedup","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:19:34.537666+00', ''),
	('00000000-0000-0000-0000-000000000000', '71127216-aff4-46ed-8aff-3d4a6d45a4e7', '{"action":"login","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:19:34.542539+00', ''),
	('00000000-0000-0000-0000-000000000000', '277c1f51-2da1-4b1f-bae1-54b4a9633158', '{"action":"token_refreshed","actor_id":"e29fda9e-9e1e-44b0-8a59-c4e8b54e0333","actor_username":"john@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:21:20.940386+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f786974d-6d97-40c5-8870-d2c4c9ce1f9a', '{"action":"token_revoked","actor_id":"e29fda9e-9e1e-44b0-8a59-c4e8b54e0333","actor_username":"john@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:21:20.941294+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b0818a7a-83f2-48b3-b29b-279b95df12d6', '{"action":"user_signedup","actor_id":"577a8927-0fb6-41fe-9685-026228c35f2a","actor_username":"johnnew1@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:21:30.931726+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ff91749b-719f-4f91-b0d1-c69a10e6518c', '{"action":"login","actor_id":"577a8927-0fb6-41fe-9685-026228c35f2a","actor_username":"johnnew1@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:21:30.9366+00', ''),
	('00000000-0000-0000-0000-000000000000', '7c7c44b3-db9d-4e9b-b0b3-d36aa266bc56', '{"action":"user_signedup","actor_id":"45957215-03ac-4607-8fa4-10814c200b79","actor_username":"john22@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:24:06.835179+00', ''),
	('00000000-0000-0000-0000-000000000000', '06bf0caa-0f23-4d4c-b4ce-0bcb8a344c9e', '{"action":"login","actor_id":"45957215-03ac-4607-8fa4-10814c200b79","actor_username":"john22@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:24:06.841077+00', ''),
	('00000000-0000-0000-0000-000000000000', '7cbc77b9-3d7e-4f82-8c0b-bfc6e36fe316', '{"action":"user_signedup","actor_id":"a8404d1f-dcd0-42ac-9eac-7ef4db4643d6","actor_username":"123nwe@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 20:26:42.361497+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd1e01fe-60cd-497c-ae44-4acc6282b659', '{"action":"login","actor_id":"a8404d1f-dcd0-42ac-9eac-7ef4db4643d6","actor_username":"123nwe@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 20:26:42.366783+00', ''),
	('00000000-0000-0000-0000-000000000000', '4e13eb96-a1a8-4710-b7ae-4003665cdcc3', '{"action":"token_refreshed","actor_id":"94564ad5-98f8-4005-b35f-84974bf9cb77","actor_username":"1235@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:31:30.224953+00', ''),
	('00000000-0000-0000-0000-000000000000', '04361e99-1d9c-45e2-aee3-fada7ba47969', '{"action":"token_revoked","actor_id":"94564ad5-98f8-4005-b35f-84974bf9cb77","actor_username":"1235@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:31:30.227238+00', ''),
	('00000000-0000-0000-0000-000000000000', '277a9a4c-7187-4f52-beef-fdbe226e0154', '{"action":"token_refreshed","actor_id":"41bc6dad-db73-46d4-a98a-4b259a18711c","actor_username":"11@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:33:59.907679+00', ''),
	('00000000-0000-0000-0000-000000000000', '89815512-fd42-438e-9a37-95e09103ebdb', '{"action":"token_revoked","actor_id":"41bc6dad-db73-46d4-a98a-4b259a18711c","actor_username":"11@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:33:59.909459+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd655132c-8ed6-40e8-9394-7adc9e0780d2', '{"action":"token_refreshed","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:43:28.336645+00', ''),
	('00000000-0000-0000-0000-000000000000', 'cd4e2537-251e-4fc5-ad50-0d0b4f47c26c', '{"action":"token_revoked","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 20:43:28.338858+00', ''),
	('00000000-0000-0000-0000-000000000000', '231ae8ff-1570-4f74-bc7a-ec3881bfee1a', '{"action":"token_refreshed","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 21:05:18.07769+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f8a97e9d-5b5a-485c-8e06-8b387839588c', '{"action":"token_revoked","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 21:05:18.079348+00', ''),
	('00000000-0000-0000-0000-000000000000', '1cf4dd33-9540-4dc7-9bc2-d72a7a41d020', '{"action":"logout","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 21:10:34.411364+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c5bee0c-a2ed-4eb1-9555-d5b288d1ef51', '{"action":"user_repeated_signup","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2025-01-07 21:11:16.472356+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a243eef6-f30a-4731-97f3-3e258132e909', '{"action":"login","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 21:11:19.021531+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f856427a-062a-4aa8-a45a-1e88eee47eb4', '{"action":"token_refreshed","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 21:43:33.832207+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f7ecb0ee-7e8f-4c87-8a8c-92555169b433', '{"action":"token_revoked","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 21:43:33.833149+00', ''),
	('00000000-0000-0000-0000-000000000000', '37816b86-5352-4aab-8636-ae0b15aca799', '{"action":"token_refreshed","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 22:38:25.224763+00', ''),
	('00000000-0000-0000-0000-000000000000', '40737445-eae1-45eb-ba04-78a83423a48a', '{"action":"token_revoked","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 22:38:25.228839+00', ''),
	('00000000-0000-0000-0000-000000000000', '611c428b-c205-4dce-a0aa-d9685cdca84d', '{"action":"token_refreshed","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:16:42.092174+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ce9fe7d7-44f3-4f01-adbf-b15bbd7c9526', '{"action":"token_revoked","actor_id":"c53a434b-e444-44ea-a474-40a419e08f87","actor_username":"123abc@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:16:42.098042+00', ''),
	('00000000-0000-0000-0000-000000000000', '919d9628-2422-4dc6-a1af-48860e498e72', '{"action":"token_refreshed","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:33:59.68778+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a4ec223d-0eb7-4b01-a159-aa9bdec76a71', '{"action":"token_revoked","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:33:59.689253+00', ''),
	('00000000-0000-0000-0000-000000000000', '40afb4d3-6777-4d03-9688-dbd41e211a60', '{"action":"logout","actor_id":"2a219aa0-843f-40c2-9a57-75cfdfc12348","actor_username":"rharding1123a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-07 23:45:31.260844+00', ''),
	('00000000-0000-0000-0000-000000000000', '5508ce76-0c8f-421a-82ab-0d9050be948e', '{"action":"user_signedup","actor_id":"a60bc151-729c-453a-beac-d3b366e10150","actor_username":"rharding113323a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-07 23:45:39.935264+00', ''),
	('00000000-0000-0000-0000-000000000000', '4ab9acd5-fa09-4d17-beb6-0633a5f466b5', '{"action":"login","actor_id":"a60bc151-729c-453a-beac-d3b366e10150","actor_username":"rharding113323a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-07 23:45:39.939182+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b80cb203-9a76-4ade-acac-98fca3ff187c', '{"action":"token_refreshed","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:54:21.336234+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bca09f5f-c0be-4be4-842a-7c3ef3667518', '{"action":"token_revoked","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-07 23:54:21.337823+00', ''),
	('00000000-0000-0000-0000-000000000000', '5739a129-59db-4714-8b2f-bba76f5a3ffc', '{"action":"logout","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-08 00:04:55.912194+00', ''),
	('00000000-0000-0000-0000-000000000000', '7d3526bf-2e19-4f0d-bfa6-241ea75d3e06', '{"action":"login","actor_id":"4a1f3a43-1012-44ee-9c40-6a22bc1a63d2","actor_username":"rieboysspa22m@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-08 00:05:00.478443+00', ''),
	('00000000-0000-0000-0000-000000000000', '9aee0614-eee0-4bc5-ad13-8f8918747962', '{"action":"logout","actor_id":"4a1f3a43-1012-44ee-9c40-6a22bc1a63d2","actor_username":"rieboysspa22m@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-08 00:09:04.883853+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6f76537-470f-4d5f-bf52-f5f9620c4a3c', '{"action":"login","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-08 00:09:14.029884+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c1833999-949c-4f7f-9f8f-ca9954a32bb8', '{"action":"token_refreshed","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-08 17:35:38.231838+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c9fee93d-ffe4-4285-9584-93a618b29963', '{"action":"token_revoked","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-08 17:35:38.242164+00', ''),
	('00000000-0000-0000-0000-000000000000', '4c7043fb-d84e-4050-b96f-9b6ea42f8e7f', '{"action":"logout","actor_id":"f715211f-09c7-45c9-997c-c54c2e591850","actor_username":"rieboysspaa222am@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-08 17:40:37.546042+00', ''),
	('00000000-0000-0000-0000-000000000000', '129defe4-a2a2-49c0-8485-29be57ff9316', '{"action":"user_signedup","actor_id":"d6dfec51-9b05-4221-992f-1b3518e92be2","actor_username":"testuser@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-08 17:46:11.82034+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e7549868-4cfe-4c49-8e4e-bb0e477e825a', '{"action":"login","actor_id":"d6dfec51-9b05-4221-992f-1b3518e92be2","actor_username":"testuser@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-08 17:46:11.82787+00', ''),
	('00000000-0000-0000-0000-000000000000', '9d97475f-0cbd-4a98-920d-fd81dd59935b', '{"action":"token_refreshed","actor_id":"a60bc151-729c-453a-beac-d3b366e10150","actor_username":"rharding113323a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-08 20:22:39.703878+00', ''),
	('00000000-0000-0000-0000-000000000000', '8d1afef2-5714-4e1b-9947-15265540f040', '{"action":"token_revoked","actor_id":"a60bc151-729c-453a-beac-d3b366e10150","actor_username":"rharding113323a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"token"}', '2025-01-08 20:22:39.722682+00', ''),
	('00000000-0000-0000-0000-000000000000', '168cc901-20a5-42dc-9137-d7f03d77bdba', '{"action":"logout","actor_id":"a60bc151-729c-453a-beac-d3b366e10150","actor_username":"rharding113323a2aa7aazz@gmail.com","actor_via_sso":false,"log_type":"account"}', '2025-01-08 20:30:57.660992+00', ''),
	('00000000-0000-0000-0000-000000000000', '5e4821fe-0b10-4e06-ab2f-b9a5d51e51f3', '{"action":"login","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-08 20:31:29.179009+00', ''),
	('00000000-0000-0000-0000-000000000000', '5377ad22-9046-4746-9623-80cb899e521d', '{"action":"login","actor_id":"f5392b1e-cafd-40a6-ba97-91376cb104e7","actor_username":"rharding1123@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-08 20:39:10.240674+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '7563ac33-3752-4c3f-b1f2-3b31aba75a90', 'authenticated', 'authenticated', 'foodresque@gmail.com', '$2a$10$YANxhtEPvKnayGieBerotOPsvU32rkucq/tKzj6kcv/8j5LhJaJfq', '2024-12-24 17:12:08.942827+00', NULL, '', '2024-12-24 17:11:46.444914+00', '', NULL, '', '', NULL, '2024-12-24 17:12:08.947193+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "7563ac33-3752-4c3f-b1f2-3b31aba75a90", "email": "foodresque@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:11:46.439706+00', '2024-12-24 17:12:08.949314+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7ba2724c-a20e-44d8-9fe2-c29208641c62', 'authenticated', 'authenticated', 'reeceharding@gmail.com', '$2a$10$xZ0VXu6OnSr02Lz5v7ZSteFsUr3ruY.w92NGoHy5yKTJk0TNmTTVu', '2024-12-24 17:01:09.188821+00', NULL, '', '2024-12-24 17:00:54.087479+00', '', NULL, '', '', NULL, '2024-12-24 17:05:24.154882+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "7ba2724c-a20e-44d8-9fe2-c29208641c62", "email": "reeceharding@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:00:54.044621+00', '2024-12-24 17:05:24.156648+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5e537171-e309-44f7-93cd-343842befc28', 'authenticated', 'authenticated', 'rharding2@wisc.edu', '$2a$10$i10dASnbjOBRm8k0II1zcenW.dSEe3VB.tjBu8SlCBrV6Jz88usTi', '2024-12-24 17:11:45.030625+00', NULL, '', '2024-12-24 17:11:12.487764+00', '', NULL, '', '', NULL, '2024-12-24 17:11:45.038951+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5e537171-e309-44f7-93cd-343842befc28", "email": "rharding2@wisc.edu", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:11:12.478446+00', '2024-12-24 17:11:45.043412+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '93756889-6c68-4cc5-bca7-068b15475bf3', 'authenticated', 'authenticated', 'onesecrepo@gmail.com', '$2a$10$LE/5JuoQdiTWBTb7gmgSle1aWDz46yok7ORJadEEO9DAL57jHWvuK', '2024-12-24 17:14:31.169414+00', NULL, '', '2024-12-24 17:14:20.184015+00', '', NULL, '', '', NULL, '2024-12-24 17:14:31.173725+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "93756889-6c68-4cc5-bca7-068b15475bf3", "email": "onesecrepo@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:14:20.175375+00', '2024-12-24 17:14:31.176753+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99', 'authenticated', 'authenticated', 'rharding112ss3@gmail.com', '$2a$10$cZmgQp.3fOiFxDQqkrnQiu9I1cbtFQaUOzuFeynRX25fKnuZmVQTq', '2025-01-07 06:12:36.286527+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 06:12:36.289755+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99", "email": "rharding112ss3@gmail.com", "username": "rharding112ss3", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 06:12:36.280611+00', '2025-01-07 06:12:36.292012+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '786a527e-7ade-4d89-95e3-158d9ede52bf', 'authenticated', 'authenticated', 'rharding1123333@gmail.com', '$2a$10$aJDMhLsUimzx9YuPu.Wyh.AtvBTSSd5bFFtV0LAf89U95GO0IejZK', '2025-01-07 06:10:55.03857+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 06:11:49.010168+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "786a527e-7ade-4d89-95e3-158d9ede52bf", "email": "rharding1123333@gmail.com", "username": "rharding1123333", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 06:10:55.01384+00', '2025-01-07 06:11:49.011882+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5967063f-3ff0-4db0-8277-8100dd805273', 'authenticated', 'authenticated', 'newuser@example.com', '$2a$10$RZXAER2LVkHtxWk37.IVJeiSV97euBPfTU2NQuQFNdwKncWP6Zvli', '2025-01-07 05:32:35.480966+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 05:32:35.484018+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5967063f-3ff0-4db0-8277-8100dd805273", "email": "newuser@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 05:32:35.471626+00', '2025-01-07 05:32:35.485595+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', 'authenticated', 'authenticated', 'test@example.com', '$2a$10$cKqjONyzYRoyCh3AoQ7PUOkeqVz41U9QwYzE92pVSn0nQ5jsUDvJ.', '2025-01-07 05:32:35.081334+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 05:32:35.79732+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6a8df463-5019-4b0f-b7a6-c856a88a1b02", "email": "test@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 05:32:35.056419+00', '2025-01-07 05:32:35.79903+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 'authenticated', 'authenticated', 'rharding1123@gmail.com', '$2a$10$jwpaD.2u3PL0K76VW62atO8/RODOj45tMPsLjGwnOhykyTur/Q9xC', '2024-12-24 17:09:19.898396+00', NULL, '', '2024-12-24 17:09:02.267329+00', '', NULL, '', '', NULL, '2025-01-08 20:39:10.242891+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f5392b1e-cafd-40a6-ba97-91376cb104e7", "email": "rharding1123@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:09:02.258757+00', '2025-01-08 20:39:10.250679+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'authenticated', 'authenticated', 'collegeforreece@gmail.com', '$2a$10$1Ll8Ul9LFeFkIYRetsTF5eX22dUhRZRl0QCSN0TFoLuB4F.aP9zja', '2025-01-07 04:58:56.888195+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 04:58:56.893747+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "87330b5e-0fcd-4d59-a479-3369a9e6dedd", "email": "collegeforreece@gmail.com", "username": "collegeforreece", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 04:58:56.868406+00', '2025-01-07 04:58:56.903673+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5f944b5a-31bc-4905-a021-76c59f88f275', 'authenticated', 'authenticated', 'thegreatestregretofthedying@gmail.com', '$2a$10$QjFlMrVoTdijjIDgsaJuv.CmK683Eolr.IGP8OcnngiBUCTnjym0y', '2024-12-24 17:16:09.8337+00', NULL, '', '2024-12-24 17:15:54.714938+00', '', NULL, '', '', NULL, '2025-01-07 17:59:53.227659+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "5f944b5a-31bc-4905-a021-76c59f88f275", "email": "thegreatestregretofthedying@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:15:54.707069+00', '2025-01-07 20:09:47.951751+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', 'authenticated', 'authenticated', 'rieboysspam@gmail.com', '$2a$10$04Yj7CIv45rWmzHxV0FT3.i.f04qdQWkr1yV6aONpU1ehCYZSVHny', '2024-12-24 17:06:30.556054+00', NULL, '', '2024-12-24 17:05:36.116824+00', '', NULL, '', '', NULL, '2025-01-07 18:02:13.337592+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9004c2e6-259f-48ea-ba08-87ccf30a3d8e", "email": "rieboysspam@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2024-12-24 17:05:36.10828+00', '2025-01-07 20:11:49.794772+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b43e63f7-9a88-4b75-847c-225dac39d613', 'authenticated', 'authenticated', 'rharding112zz3@gmail.com', '$2a$10$ZyP1mjr/hF/xuaTdp4UtbONAPVW1Jy2bxa89/PzgJBofvZd6cx7.C', '2025-01-07 06:14:18.352812+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 16:38:50.435845+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "b43e63f7-9a88-4b75-847c-225dac39d613", "email": "rharding112zz3@gmail.com", "username": "rharding112zz3", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 06:14:18.342278+00', '2025-01-07 16:38:50.443669+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '19c75dbd-1dad-478a-b053-fe0319d2b23d', 'authenticated', 'authenticated', 'rieboysspaa22am@gmail.com', '$2a$10$U16tdkNthVeu4oUlo.DBCuc.LLV1M/qomS35I1h37M5UaTdW7Irma', '2025-01-07 20:18:02.60462+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:18:02.608574+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "19c75dbd-1dad-478a-b053-fe0319d2b23d", "email": "rieboysspaa22am@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:18:02.595047+00', '2025-01-07 20:18:02.612476+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 'authenticated', 'authenticated', 'rharding1123a2aa7aa@gmail.com', '$2a$10$DU3uBAp.Gyy5vttI83S79ug63b.fRut0I6aKCVKzVkdde8L7AJ7ay', '2025-01-07 18:33:42.3305+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 19:31:34.213583+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "76071b4e-168a-4de6-80c1-3a8e91140cc6", "email": "rharding1123a2aa7aa@gmail.com", "username": "rharding1123a2aa7aa", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:33:42.318879+00', '2025-01-07 19:31:34.217476+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '60f7a927-3f13-4e05-ab6e-42103399d5ff', 'authenticated', 'authenticated', 'rharding1123aaa7aa@gmail.com', '$2a$10$VS.5CbbdSgOCIgNob66P4OOScFNjkzUgXiFlcDBOtXOnPgiNdfWte', '2025-01-07 18:32:38.341011+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 18:32:38.345374+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "60f7a927-3f13-4e05-ab6e-42103399d5ff", "email": "rharding1123aaa7aa@gmail.com", "username": "rharding1123aaa7aa", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:32:38.328294+00', '2025-01-07 18:32:38.347317+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f715211f-09c7-45c9-997c-c54c2e591850', 'authenticated', 'authenticated', 'rieboysspaa222am@gmail.com', '$2a$10$kYokHhz5fFfBRt0ELy3xZej4gxG8OcXReBmZTEVC/O7lxTJ9DuHHC', '2025-01-07 20:19:34.538487+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-08 00:09:14.030643+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "f715211f-09c7-45c9-997c-c54c2e591850", "email": "rieboysspaa222am@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:19:34.527012+00', '2025-01-08 17:35:38.254079+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '94564ad5-98f8-4005-b35f-84974bf9cb77', 'authenticated', 'authenticated', '1235@gmail.com', '$2a$10$WE2wn4C2N.RjqEGaJqOixuQOR0oXYUPxklzYKKcGngacMFIOZE2je', '2025-01-07 18:18:25.115382+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 18:18:25.120963+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "94564ad5-98f8-4005-b35f-84974bf9cb77", "email": "1235@gmail.com", "username": "1235", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:18:25.101564+00', '2025-01-07 20:31:30.231854+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 'authenticated', 'authenticated', 'rieboysspa22m@gmail.com', '$2a$10$xWbgc45R/j3TjVigSeBWgeQa12.uelRwP4YvlNlImURwrazgCeaQ6', '2025-01-07 20:12:16.387643+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-08 00:05:00.47924+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "4a1f3a43-1012-44ee-9c40-6a22bc1a63d2", "email": "rieboysspa22m@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:12:16.375221+00', '2025-01-08 00:05:00.48719+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c53a434b-e444-44ea-a474-40a419e08f87', 'authenticated', 'authenticated', '123abc@gmail.com', '$2a$10$Ms.x.OkjRnZAtPIlLe5y0.ukU6Xk.UjvJiRabZWX5TavSPGNw2LzS', '2025-01-07 20:09:58.739845+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:09:58.744374+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "c53a434b-e444-44ea-a474-40a419e08f87", "email": "123abc@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:09:58.722453+00', '2025-01-07 23:16:42.105152+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', 'authenticated', 'authenticated', '23e@gmail.com', '$2a$10$dJwkuc1UuEHYxDvGEWLPwucJ2/HWrs/h1Cs5RlGSQs/RkNy20NwW2', '2025-01-07 18:16:13.570456+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 18:16:13.574489+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "82dbba6b-68f8-4b8a-87c2-5fc29f117dd1", "email": "23e@gmail.com", "username": "23e", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:16:13.55797+00', '2025-01-07 18:16:13.580744+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 'authenticated', 'authenticated', 'rharding1123aaaaa@gmail.com', '$2a$10$yRwRIaP6GHGQCXpAa8Z1BufFiapjsY316u6h7t41M2XLjgpyYWSD6', '2025-01-07 16:39:06.309254+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 16:39:06.315602+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "6edc9c5a-b9d2-4e6b-9904-2dd141878213", "email": "rharding1123aaaaa@gmail.com", "username": "rharding1123aaaaa", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 16:39:06.280679+00', '2025-01-07 18:32:33.014475+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 'authenticated', 'authenticated', 'john@gmail.com', '$2a$10$YejyuJtLISTzqvj7zA6Q7OHDfX09O1qEJgjH16PydI0jHS6uOKcLK', '2025-01-07 18:05:00.825314+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 18:09:14.739682+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e29fda9e-9e1e-44b0-8a59-c4e8b54e0333", "email": "john@gmail.com", "username": "john", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:05:00.803416+00', '2025-01-07 20:21:20.943518+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', 'authenticated', 'authenticated', 'rieboysspaa22m@gmail.com', '$2a$10$Cg09L22KG5GGr6mTD8W7IOtVUu0XOrBqvDjYzIeIPLVlCamrEgXk6', '2025-01-07 20:15:05.808374+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:15:05.812621+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "53c879ef-cd9f-40ed-ae0b-bca72abc5d0f", "email": "rieboysspaa22m@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:15:05.795872+00', '2025-01-07 20:15:05.817399+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '41bc6dad-db73-46d4-a98a-4b259a18711c', 'authenticated', 'authenticated', '11@gmail.com', '$2a$10$eAtWKLAjNlqt/caVe.6WL.CBvX7J.eNf/6HCenI0lTiGKq4OAAeJC', '2025-01-07 18:19:55.932876+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 18:19:55.937706+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "41bc6dad-db73-46d4-a98a-4b259a18711c", "email": "11@gmail.com", "username": "11", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 18:19:55.920371+00', '2025-01-07 20:33:59.91211+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'authenticated', 'authenticated', 'rharding1123a2aa7aazz@gmail.com', '$2a$10$LOHuO.DgW3PhJiW6uhKgYeeJ6Vz3hj0O8nr6Zfz6Fh6zGfVg5Iv1m', '2025-01-07 19:49:05.627364+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 19:49:05.632874+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "2a219aa0-843f-40c2-9a57-75cfdfc12348", "email": "rharding1123a2aa7aazz@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 19:49:05.605396+00', '2025-01-07 23:33:59.693044+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '577a8927-0fb6-41fe-9685-026228c35f2a', 'authenticated', 'authenticated', 'johnnew1@gmail.com', '$2a$10$fy6hCfXJccIwJhMW7rZgtuxtkcgIEJQq6JpGQMl.1dt2ouTYNc.Ea', '2025-01-07 20:21:30.932259+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:21:30.937169+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "577a8927-0fb6-41fe-9685-026228c35f2a", "email": "johnnew1@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:21:30.922262+00', '2025-01-07 20:21:30.939059+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '45957215-03ac-4607-8fa4-10814c200b79', 'authenticated', 'authenticated', 'john22@gmail.com', '$2a$10$4IqBr67ZQf4H.p/XSe2T4.a9SgoTNi/amLiMqVSaBYTapJWSMW2YC', '2025-01-07 20:24:06.836636+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:24:06.841715+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "45957215-03ac-4607-8fa4-10814c200b79", "email": "john22@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:24:06.823577+00', '2025-01-07 20:24:06.845329+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', 'authenticated', 'authenticated', '123nwe@gmail.com', '$2a$10$GXzyw2RNsHkfjXHHBTDMmuWunNn8Oav5lzr/gg7ep4a7x/Drs.W3i', '2025-01-07 20:26:42.362252+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 20:26:42.367485+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a8404d1f-dcd0-42ac-9eac-7ef4db4643d6", "email": "123nwe@gmail.com", "username": "123nwe", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 20:26:42.350227+00', '2025-01-07 20:26:42.370331+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd6dfec51-9b05-4221-992f-1b3518e92be2', 'authenticated', 'authenticated', 'testuser@gmail.com', '$2a$10$EshMyyqi5BK3HJAv/gZAIeL1prwspuq5/nLnWW0hboKzlgd7YJ8KC', '2025-01-08 17:46:11.821094+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-08 17:46:11.828446+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "d6dfec51-9b05-4221-992f-1b3518e92be2", "email": "testuser@gmail.com", "username": "testuser", "email_verified": true, "phone_verified": false}', NULL, '2025-01-08 17:46:11.796092+00', '2025-01-08 17:46:11.83535+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a60bc151-729c-453a-beac-d3b366e10150', 'authenticated', 'authenticated', 'rharding113323a2aa7aazz@gmail.com', '$2a$10$B6G1wXSSi0L3G712TRVUpOcrkiZp9dqtoKaRJzkhDz3n6.Jbt6nlW', '2025-01-07 23:45:39.935736+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-07 23:45:39.939654+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a60bc151-729c-453a-beac-d3b366e10150", "email": "rharding113323a2aa7aazz@gmail.com", "username": "rharding113323a2aa7aazz", "email_verified": true, "phone_verified": false}', NULL, '2025-01-07 23:45:39.907852+00', '2025-01-08 20:22:39.734458+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('7ba2724c-a20e-44d8-9fe2-c29208641c62', '7ba2724c-a20e-44d8-9fe2-c29208641c62', '{"sub": "7ba2724c-a20e-44d8-9fe2-c29208641c62", "email": "reeceharding@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:00:54.077035+00', '2024-12-24 17:00:54.07709+00', '2024-12-24 17:00:54.07709+00', '6d94315a-9263-40cd-9ad8-45b48a8b255d'),
	('9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '{"sub": "9004c2e6-259f-48ea-ba08-87ccf30a3d8e", "email": "rieboysspam@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:05:36.113238+00', '2024-12-24 17:05:36.113288+00', '2024-12-24 17:05:36.113288+00', '2b3a04b3-944e-45fe-bd48-0b3636f10930'),
	('f5392b1e-cafd-40a6-ba97-91376cb104e7', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', '{"sub": "f5392b1e-cafd-40a6-ba97-91376cb104e7", "email": "rharding1123@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:09:02.263934+00', '2024-12-24 17:09:02.263988+00', '2024-12-24 17:09:02.263988+00', '5c7eab42-fb4b-4e73-a4e8-553df7b58659'),
	('5e537171-e309-44f7-93cd-343842befc28', '5e537171-e309-44f7-93cd-343842befc28', '{"sub": "5e537171-e309-44f7-93cd-343842befc28", "email": "rharding2@wisc.edu", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:11:12.483479+00', '2024-12-24 17:11:12.483528+00', '2024-12-24 17:11:12.483528+00', '32a41186-7c53-4f03-88bd-c7fdda0faab6'),
	('7563ac33-3752-4c3f-b1f2-3b31aba75a90', '7563ac33-3752-4c3f-b1f2-3b31aba75a90', '{"sub": "7563ac33-3752-4c3f-b1f2-3b31aba75a90", "email": "foodresque@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:11:46.442246+00', '2024-12-24 17:11:46.442294+00', '2024-12-24 17:11:46.442294+00', 'e9eba861-6f92-4d80-a462-820c2ba08baa'),
	('93756889-6c68-4cc5-bca7-068b15475bf3', '93756889-6c68-4cc5-bca7-068b15475bf3', '{"sub": "93756889-6c68-4cc5-bca7-068b15475bf3", "email": "onesecrepo@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:14:20.180602+00', '2024-12-24 17:14:20.180655+00', '2024-12-24 17:14:20.180655+00', '5436048a-fbaf-4ee9-9f22-2f2cbae8c6ef'),
	('5f944b5a-31bc-4905-a021-76c59f88f275', '5f944b5a-31bc-4905-a021-76c59f88f275', '{"sub": "5f944b5a-31bc-4905-a021-76c59f88f275", "email": "thegreatestregretofthedying@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2024-12-24 17:15:54.711429+00', '2024-12-24 17:15:54.711481+00', '2024-12-24 17:15:54.711481+00', '8fca1afd-acd8-428f-adab-5100d34774fc'),
	('87330b5e-0fcd-4d59-a479-3369a9e6dedd', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', '{"sub": "87330b5e-0fcd-4d59-a479-3369a9e6dedd", "email": "collegeforreece@gmail.com", "username": "collegeforreece", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 04:58:56.883412+00', '2025-01-07 04:58:56.883465+00', '2025-01-07 04:58:56.883465+00', '291bcc72-d854-4d64-98b2-8b2f1b2f4347'),
	('6a8df463-5019-4b0f-b7a6-c856a88a1b02', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', '{"sub": "6a8df463-5019-4b0f-b7a6-c856a88a1b02", "email": "test@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 05:32:35.075508+00', '2025-01-07 05:32:35.075584+00', '2025-01-07 05:32:35.075584+00', 'ee75fd81-f3ef-4e7e-8c39-c408b813f21b'),
	('5967063f-3ff0-4db0-8277-8100dd805273', '5967063f-3ff0-4db0-8277-8100dd805273', '{"sub": "5967063f-3ff0-4db0-8277-8100dd805273", "email": "newuser@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 05:32:35.47424+00', '2025-01-07 05:32:35.474286+00', '2025-01-07 05:32:35.474286+00', '70cc5941-a085-40b8-8c51-ed01d9490846'),
	('786a527e-7ade-4d89-95e3-158d9ede52bf', '786a527e-7ade-4d89-95e3-158d9ede52bf', '{"sub": "786a527e-7ade-4d89-95e3-158d9ede52bf", "email": "rharding1123333@gmail.com", "username": "rharding1123333", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 06:10:55.026332+00', '2025-01-07 06:10:55.026392+00', '2025-01-07 06:10:55.026392+00', '03d0f6b3-8db7-4719-b248-afca40f1757c'),
	('fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99', 'fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99', '{"sub": "fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99", "email": "rharding112ss3@gmail.com", "username": "rharding112ss3", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 06:12:36.283068+00', '2025-01-07 06:12:36.283122+00', '2025-01-07 06:12:36.283122+00', '0082f565-f2a6-4357-a0ca-bf62a60dfc08'),
	('b43e63f7-9a88-4b75-847c-225dac39d613', 'b43e63f7-9a88-4b75-847c-225dac39d613', '{"sub": "b43e63f7-9a88-4b75-847c-225dac39d613", "email": "rharding112zz3@gmail.com", "username": "rharding112zz3", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 06:14:18.348775+00', '2025-01-07 06:14:18.348823+00', '2025-01-07 06:14:18.348823+00', 'a22affc8-b579-4282-9e44-4dc704869b27'),
	('6edc9c5a-b9d2-4e6b-9904-2dd141878213', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{"sub": "6edc9c5a-b9d2-4e6b-9904-2dd141878213", "email": "rharding1123aaaaa@gmail.com", "username": "rharding1123aaaaa", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 16:39:06.298941+00', '2025-01-07 16:39:06.299023+00', '2025-01-07 16:39:06.299023+00', '0ce0449e-6dfa-4f9d-9006-63705d15a72e'),
	('e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '{"sub": "e29fda9e-9e1e-44b0-8a59-c4e8b54e0333", "email": "john@gmail.com", "username": "john", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:05:00.818981+00', '2025-01-07 18:05:00.81904+00', '2025-01-07 18:05:00.81904+00', 'be2ea9cd-1f1d-4190-8d90-cd1085cc3ea3'),
	('82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '{"sub": "82dbba6b-68f8-4b8a-87c2-5fc29f117dd1", "email": "23e@gmail.com", "username": "23e", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:16:13.564811+00', '2025-01-07 18:16:13.56486+00', '2025-01-07 18:16:13.56486+00', 'e363fb63-d911-47cc-bddd-2993c693b86a'),
	('94564ad5-98f8-4005-b35f-84974bf9cb77', '94564ad5-98f8-4005-b35f-84974bf9cb77', '{"sub": "94564ad5-98f8-4005-b35f-84974bf9cb77", "email": "1235@gmail.com", "username": "1235", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:18:25.109883+00', '2025-01-07 18:18:25.109937+00', '2025-01-07 18:18:25.109937+00', '174bf00c-4e9e-4f1f-bb26-599b547e36c6'),
	('41bc6dad-db73-46d4-a98a-4b259a18711c', '41bc6dad-db73-46d4-a98a-4b259a18711c', '{"sub": "41bc6dad-db73-46d4-a98a-4b259a18711c", "email": "11@gmail.com", "username": "11", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:19:55.92705+00', '2025-01-07 18:19:55.927105+00', '2025-01-07 18:19:55.927105+00', '30cd9ec1-3522-4658-b0e9-964317781bc4'),
	('60f7a927-3f13-4e05-ab6e-42103399d5ff', '60f7a927-3f13-4e05-ab6e-42103399d5ff', '{"sub": "60f7a927-3f13-4e05-ab6e-42103399d5ff", "email": "rharding1123aaa7aa@gmail.com", "username": "rharding1123aaa7aa", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:32:38.336989+00', '2025-01-07 18:32:38.337039+00', '2025-01-07 18:32:38.337039+00', '9da7c715-11e1-4899-afe2-dc56768e7902'),
	('76071b4e-168a-4de6-80c1-3a8e91140cc6', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{"sub": "76071b4e-168a-4de6-80c1-3a8e91140cc6", "email": "rharding1123a2aa7aa@gmail.com", "username": "rharding1123a2aa7aa", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 18:33:42.32679+00', '2025-01-07 18:33:42.326841+00', '2025-01-07 18:33:42.326841+00', 'b49f7556-e075-4108-ab6f-e0b251d61d65'),
	('2a219aa0-843f-40c2-9a57-75cfdfc12348', '2a219aa0-843f-40c2-9a57-75cfdfc12348', '{"sub": "2a219aa0-843f-40c2-9a57-75cfdfc12348", "email": "rharding1123a2aa7aazz@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 19:49:05.620416+00', '2025-01-07 19:49:05.620866+00', '2025-01-07 19:49:05.620866+00', 'b73ca610-3009-4044-9f4d-90bdd3121190'),
	('c53a434b-e444-44ea-a474-40a419e08f87', 'c53a434b-e444-44ea-a474-40a419e08f87', '{"sub": "c53a434b-e444-44ea-a474-40a419e08f87", "email": "123abc@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:09:58.735673+00', '2025-01-07 20:09:58.735727+00', '2025-01-07 20:09:58.735727+00', '889156e8-d821-453c-ac2d-b8d7e88d76d5'),
	('4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '{"sub": "4a1f3a43-1012-44ee-9c40-6a22bc1a63d2", "email": "rieboysspa22m@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:12:16.382808+00', '2025-01-07 20:12:16.383419+00', '2025-01-07 20:12:16.383419+00', 'b3b34f09-79a8-44d1-b589-237891b5f7c1'),
	('53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', '53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', '{"sub": "53c879ef-cd9f-40ed-ae0b-bca72abc5d0f", "email": "rieboysspaa22m@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:15:05.803634+00', '2025-01-07 20:15:05.803685+00', '2025-01-07 20:15:05.803685+00', '49b4e469-ee02-4439-9238-5e8806c700c1'),
	('19c75dbd-1dad-478a-b053-fe0319d2b23d', '19c75dbd-1dad-478a-b053-fe0319d2b23d', '{"sub": "19c75dbd-1dad-478a-b053-fe0319d2b23d", "email": "rieboysspaa22am@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:18:02.601214+00', '2025-01-07 20:18:02.601279+00', '2025-01-07 20:18:02.601279+00', '52fc59d1-51d4-4e00-a2e1-cf3744aaa93a'),
	('f715211f-09c7-45c9-997c-c54c2e591850', 'f715211f-09c7-45c9-997c-c54c2e591850', '{"sub": "f715211f-09c7-45c9-997c-c54c2e591850", "email": "rieboysspaa222am@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:19:34.533836+00', '2025-01-07 20:19:34.533888+00', '2025-01-07 20:19:34.533888+00', 'e297b460-26dc-442c-91a3-6a6561bbdfd8'),
	('577a8927-0fb6-41fe-9685-026228c35f2a', '577a8927-0fb6-41fe-9685-026228c35f2a', '{"sub": "577a8927-0fb6-41fe-9685-026228c35f2a", "email": "johnnew1@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:21:30.928986+00', '2025-01-07 20:21:30.929033+00', '2025-01-07 20:21:30.929033+00', 'f5c6dc28-27af-4691-88b3-4229cc21aecc'),
	('45957215-03ac-4607-8fa4-10814c200b79', '45957215-03ac-4607-8fa4-10814c200b79', '{"sub": "45957215-03ac-4607-8fa4-10814c200b79", "email": "john22@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:24:06.830884+00', '2025-01-07 20:24:06.830943+00', '2025-01-07 20:24:06.830943+00', 'cebfd0e8-910b-4848-b4ef-ade430c81d01'),
	('a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', '{"sub": "a8404d1f-dcd0-42ac-9eac-7ef4db4643d6", "email": "123nwe@gmail.com", "username": "123nwe", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 20:26:42.357501+00', '2025-01-07 20:26:42.357552+00', '2025-01-07 20:26:42.357552+00', 'd932072b-4bb0-4651-9d03-945aec654bf1'),
	('a60bc151-729c-453a-beac-d3b366e10150', 'a60bc151-729c-453a-beac-d3b366e10150', '{"sub": "a60bc151-729c-453a-beac-d3b366e10150", "email": "rharding113323a2aa7aazz@gmail.com", "username": "rharding113323a2aa7aazz", "email_verified": false, "phone_verified": false}', 'email', '2025-01-07 23:45:39.931659+00', '2025-01-07 23:45:39.931722+00', '2025-01-07 23:45:39.931722+00', 'b5602a01-e5e1-45bc-a246-e59c3a065de2'),
	('d6dfec51-9b05-4221-992f-1b3518e92be2', 'd6dfec51-9b05-4221-992f-1b3518e92be2', '{"sub": "d6dfec51-9b05-4221-992f-1b3518e92be2", "email": "testuser@gmail.com", "username": "testuser", "email_verified": false, "phone_verified": false}', 'email', '2025-01-08 17:46:11.814652+00', '2025-01-08 17:46:11.814711+00', '2025-01-08 17:46:11.814711+00', '9b569491-cf6f-4327-9fe7-ee021d02f4b4');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('3c4a652c-04fe-48e0-8ab3-999710367030', '7ba2724c-a20e-44d8-9fe2-c29208641c62', '2024-12-24 17:01:09.195088+00', '2024-12-24 17:01:09.195088+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('4d199872-d598-4e53-8aa0-8adb0bc45e8c', '7ba2724c-a20e-44d8-9fe2-c29208641c62', '2024-12-24 17:02:30.046115+00', '2024-12-24 17:02:30.046115+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('3dae3866-ef39-4fd3-b16e-8375d2b4f68f', '7ba2724c-a20e-44d8-9fe2-c29208641c62', '2024-12-24 17:05:19.221873+00', '2024-12-24 17:05:19.221873+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('79858d40-6bd0-4fa4-9d4b-02fbe8c6a816', '7ba2724c-a20e-44d8-9fe2-c29208641c62', '2024-12-24 17:05:24.154989+00', '2024-12-24 17:05:24.154989+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('144b1698-135a-4a50-b1a0-ee3a6088a1ab', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '2024-12-24 17:06:30.559803+00', '2024-12-24 17:06:30.559803+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('de341fea-39aa-4af9-97c9-429876dfa76e', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '2024-12-24 17:08:51.289423+00', '2024-12-24 17:08:51.289423+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('dac9a01c-0791-4f12-8720-5b18984e143e', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', '2024-12-24 17:09:19.901831+00', '2024-12-24 17:09:19.901831+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('9d660801-35ee-4fa4-a619-4903db215593', '5e537171-e309-44f7-93cd-343842befc28', '2024-12-24 17:11:45.039037+00', '2024-12-24 17:11:45.039037+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', '18.233.104.184', NULL),
	('583576de-fa6c-49bd-874c-4f5d17c7e11d', '7563ac33-3752-4c3f-b1f2-3b31aba75a90', '2024-12-24 17:12:08.947269+00', '2024-12-24 17:12:08.947269+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('b3d70e77-4dbf-450e-81f2-905df4315bc4', '93756889-6c68-4cc5-bca7-068b15475bf3', '2024-12-24 17:14:31.17382+00', '2024-12-24 17:14:31.17382+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('d83bd57e-04ef-4d95-b0a9-0195377b2e8c', '5f944b5a-31bc-4905-a021-76c59f88f275', '2024-12-24 17:16:09.83773+00', '2024-12-24 17:16:09.83773+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '96.60.172.29', NULL),
	('d43d13a9-f39f-4627-92d4-0f3826e1097e', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', '2025-01-07 05:32:35.089576+00', '2025-01-07 05:32:35.089576+00', NULL, 'aal1', NULL, NULL, 'node', '107.3.66.9', NULL),
	('b3885c43-8fda-4f75-9a87-8633ae7167ca', '5967063f-3ff0-4db0-8277-8100dd805273', '2025-01-07 05:32:35.484099+00', '2025-01-07 05:32:35.484099+00', NULL, 'aal1', NULL, NULL, 'node', '107.3.66.9', NULL),
	('69478687-53f2-4731-8d17-e63e4ae2274a', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', '2025-01-07 05:32:35.797395+00', '2025-01-07 05:32:35.797395+00', NULL, 'aal1', NULL, NULL, 'node', '107.3.66.9', NULL),
	('50c9679a-ed37-4276-bc70-2970ae30bcbd', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', '2025-01-07 05:03:37.681853+00', '2025-01-07 06:00:02.885924+00', NULL, 'aal1', NULL, '2025-01-07 06:00:02.885841', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('20e63887-6731-481f-bda1-0466f8cc6099', '786a527e-7ade-4d89-95e3-158d9ede52bf', '2025-01-07 06:10:55.044418+00', '2025-01-07 06:10:55.044418+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('9b376699-01cc-45dc-998b-fa45a5265c06', '786a527e-7ade-4d89-95e3-158d9ede52bf', '2025-01-07 06:11:45.525231+00', '2025-01-07 06:11:45.525231+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('144ff267-d42b-41fd-bee1-db6d93018d56', '786a527e-7ade-4d89-95e3-158d9ede52bf', '2025-01-07 06:11:49.010252+00', '2025-01-07 06:11:49.010252+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('a681b6f3-454b-451e-bbfd-592b3c4c9cb0', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '2025-01-07 18:02:13.337661+00', '2025-01-07 20:11:49.796872+00', NULL, 'aal1', NULL, '2025-01-07 20:11:49.796802', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('1f6aca89-f395-4c20-901d-e8a353eb87ed', '5f944b5a-31bc-4905-a021-76c59f88f275', '2025-01-07 05:27:43.03436+00', '2025-01-07 17:59:49.340181+00', NULL, 'aal1', NULL, '2025-01-07 17:59:49.339474', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('aaf8b2f7-f137-4172-8afa-14b622ab2760', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '2025-01-07 18:09:14.739762+00', '2025-01-07 18:09:14.739762+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('dcfd0a4b-3a80-47ed-acee-d28e699b3260', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '2025-01-07 18:16:13.574559+00', '2025-01-07 18:16:13.574559+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('f82d8998-2210-49d1-a9a8-2e73b52d06c6', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 16:39:06.315685+00', '2025-01-07 18:32:33.016077+00', NULL, 'aal1', NULL, '2025-01-07 18:32:33.016001', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('0eee859c-a47e-447c-a174-c83052d50508', '60f7a927-3f13-4e05-ab6e-42103399d5ff', '2025-01-07 18:32:38.34546+00', '2025-01-07 18:32:38.34546+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('bc04ac3d-8a64-4ace-8558-49f6f021975c', '5f944b5a-31bc-4905-a021-76c59f88f275', '2025-01-07 17:59:53.227749+00', '2025-01-07 20:09:47.956598+00', NULL, 'aal1', NULL, '2025-01-07 20:09:47.956506', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('bb15ba15-9268-43f6-9bbd-9d522dde9bb4', '53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', '2025-01-07 20:15:05.812698+00', '2025-01-07 20:15:05.812698+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('e7fe82a4-e3aa-475c-9c6f-4637fe147e6e', '19c75dbd-1dad-478a-b053-fe0319d2b23d', '2025-01-07 20:18:02.608652+00', '2025-01-07 20:18:02.608652+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('d172c937-ff98-4536-9941-28e74af13cab', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '2025-01-07 18:05:00.834988+00', '2025-01-07 20:21:20.945318+00', NULL, 'aal1', NULL, '2025-01-07 20:21:20.945206', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('48c80433-c5b1-4ffb-aeed-e25ba4565246', '577a8927-0fb6-41fe-9685-026228c35f2a', '2025-01-07 20:21:30.937232+00', '2025-01-07 20:21:30.937232+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('fa6e47ab-7685-4449-bc14-06b9151e4cbf', '45957215-03ac-4607-8fa4-10814c200b79', '2025-01-07 20:24:06.841799+00', '2025-01-07 20:24:06.841799+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('278edddf-b7d2-4861-9e6c-2b06e8f575b2', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', '2025-01-07 20:26:42.367562+00', '2025-01-07 20:26:42.367562+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('efda3a4b-a641-41b1-b3cf-fd5a209e91bd', '94564ad5-98f8-4005-b35f-84974bf9cb77', '2025-01-07 18:18:25.12104+00', '2025-01-07 20:31:30.234572+00', NULL, 'aal1', NULL, '2025-01-07 20:31:30.234476', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('18c483ab-72f2-4d6e-abc7-8862f62aaba7', '41bc6dad-db73-46d4-a98a-4b259a18711c', '2025-01-07 18:19:55.938347+00', '2025-01-07 20:33:59.914165+00', NULL, 'aal1', NULL, '2025-01-07 20:33:59.914082', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('d22f406c-8747-4299-9337-10c5010552fc', 'c53a434b-e444-44ea-a474-40a419e08f87', '2025-01-07 20:09:58.744465+00', '2025-01-07 23:16:42.108597+00', NULL, 'aal1', NULL, '2025-01-07 23:16:42.108499', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('27cb9942-a6df-4c89-bccd-1d3e82676308', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', '2025-01-08 20:39:10.242965+00', '2025-01-08 20:39:10.242965+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('1a675bdd-ce1a-4df4-aaed-871373e688f2', 'd6dfec51-9b05-4221-992f-1b3518e92be2', '2025-01-08 17:46:11.828535+00', '2025-01-08 17:46:11.828535+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL),
	('78cad066-8e17-4b24-b3f7-053c5fa46b33', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', '2025-01-08 20:31:29.180615+00', '2025-01-08 20:31:29.180615+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', '107.3.66.9', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('3c4a652c-04fe-48e0-8ab3-999710367030', '2024-12-24 17:01:09.210385+00', '2024-12-24 17:01:09.210385+00', 'otp', 'f941e4a9-86dd-43f1-a769-3f13f192a7a1'),
	('4d199872-d598-4e53-8aa0-8adb0bc45e8c', '2024-12-24 17:02:30.049593+00', '2024-12-24 17:02:30.049593+00', 'password', '295be763-a95f-4cfb-84b9-35bbdaf9b81e'),
	('3dae3866-ef39-4fd3-b16e-8375d2b4f68f', '2024-12-24 17:05:19.225491+00', '2024-12-24 17:05:19.225491+00', 'password', 'f2e41773-7b4c-4ec1-b304-b8b8d5cc0dff'),
	('79858d40-6bd0-4fa4-9d4b-02fbe8c6a816', '2024-12-24 17:05:24.156971+00', '2024-12-24 17:05:24.156971+00', 'password', '357cf8e4-dbf5-408b-a782-e662175d1c07'),
	('144b1698-135a-4a50-b1a0-ee3a6088a1ab', '2024-12-24 17:06:30.56412+00', '2024-12-24 17:06:30.56412+00', 'otp', '69cf5aff-7acb-413e-af93-cad59cbd2661'),
	('de341fea-39aa-4af9-97c9-429876dfa76e', '2024-12-24 17:08:51.292733+00', '2024-12-24 17:08:51.292733+00', 'password', '25a82c7e-5125-48d3-84dd-4a4cedbb54c9'),
	('dac9a01c-0791-4f12-8720-5b18984e143e', '2024-12-24 17:09:19.903954+00', '2024-12-24 17:09:19.903954+00', 'otp', '1ffc55a4-0c50-4203-946f-fff56d61be70'),
	('9d660801-35ee-4fa4-a619-4903db215593', '2024-12-24 17:11:45.044191+00', '2024-12-24 17:11:45.044191+00', 'otp', 'f128723b-3e9a-48fe-ae0a-c798e82b951d'),
	('583576de-fa6c-49bd-874c-4f5d17c7e11d', '2024-12-24 17:12:08.949678+00', '2024-12-24 17:12:08.949678+00', 'otp', '92136b30-e4b6-43fa-96cb-acb6024410cc'),
	('b3d70e77-4dbf-450e-81f2-905df4315bc4', '2024-12-24 17:14:31.178098+00', '2024-12-24 17:14:31.178098+00', 'otp', 'ee46612a-e939-4be7-8df7-b9fae1b211f5'),
	('d83bd57e-04ef-4d95-b0a9-0195377b2e8c', '2024-12-24 17:16:09.842087+00', '2024-12-24 17:16:09.842087+00', 'otp', '4be94458-b9c2-422b-bc3e-10ec7fc7db9e'),
	('50c9679a-ed37-4276-bc70-2970ae30bcbd', '2025-01-07 05:03:37.686717+00', '2025-01-07 05:03:37.686717+00', 'password', 'b3398e9c-b773-409d-9173-26835187143b'),
	('1f6aca89-f395-4c20-901d-e8a353eb87ed', '2025-01-07 05:27:43.040427+00', '2025-01-07 05:27:43.040427+00', 'password', 'dd850dd8-eb2f-41ab-897e-9af74fa67bf2'),
	('d43d13a9-f39f-4627-92d4-0f3826e1097e', '2025-01-07 05:32:35.097363+00', '2025-01-07 05:32:35.097363+00', 'password', 'af14bf33-f669-419e-9bcf-28e119429310'),
	('b3885c43-8fda-4f75-9a87-8633ae7167ca', '2025-01-07 05:32:35.485905+00', '2025-01-07 05:32:35.485905+00', 'password', '52e47274-832a-4152-aa1a-f6e3c17ecc29'),
	('69478687-53f2-4731-8d17-e63e4ae2274a', '2025-01-07 05:32:35.799356+00', '2025-01-07 05:32:35.799356+00', 'password', 'aaa43a6a-9faf-4ffc-98db-e952109f28e4'),
	('20e63887-6731-481f-bda1-0466f8cc6099', '2025-01-07 06:10:55.052204+00', '2025-01-07 06:10:55.052204+00', 'password', 'a6e5b934-cd07-47f1-bbc8-332917c3c665'),
	('9b376699-01cc-45dc-998b-fa45a5265c06', '2025-01-07 06:11:45.53079+00', '2025-01-07 06:11:45.53079+00', 'password', '2efe297a-8b42-4a6e-8bbb-87704da2da32'),
	('144ff267-d42b-41fd-bee1-db6d93018d56', '2025-01-07 06:11:49.012223+00', '2025-01-07 06:11:49.012223+00', 'password', '547c112d-1693-4eeb-9303-f70fd7b43dad'),
	('f82d8998-2210-49d1-a9a8-2e73b52d06c6', '2025-01-07 16:39:06.318556+00', '2025-01-07 16:39:06.318556+00', 'password', '09ede1cc-e654-4035-aea5-53ed39cc4d2c'),
	('bc04ac3d-8a64-4ace-8558-49f6f021975c', '2025-01-07 17:59:53.232189+00', '2025-01-07 17:59:53.232189+00', 'password', '74f9cabd-1b6e-49b2-aba4-a800e872fe1e'),
	('a681b6f3-454b-451e-bbfd-592b3c4c9cb0', '2025-01-07 18:02:13.34226+00', '2025-01-07 18:02:13.34226+00', 'password', 'f02212cc-8cb5-440c-b3c3-96f51c6c7d7b'),
	('d172c937-ff98-4536-9941-28e74af13cab', '2025-01-07 18:05:00.841757+00', '2025-01-07 18:05:00.841757+00', 'password', '72bf9681-246d-4bb8-9db9-fa8a37f4a0c3'),
	('aaf8b2f7-f137-4172-8afa-14b622ab2760', '2025-01-07 18:09:14.747836+00', '2025-01-07 18:09:14.747836+00', 'password', '9eff2bc9-37c2-4f3c-adc5-b2937c9a80f3'),
	('dcfd0a4b-3a80-47ed-acee-d28e699b3260', '2025-01-07 18:16:13.581236+00', '2025-01-07 18:16:13.581236+00', 'password', '1c93712f-c532-41dc-b15b-bca05f4ce34d'),
	('efda3a4b-a641-41b1-b3cf-fd5a209e91bd', '2025-01-07 18:18:25.123986+00', '2025-01-07 18:18:25.123986+00', 'password', 'f7aabf71-cb33-4f2f-beae-5b1a5f8a7876'),
	('18c483ab-72f2-4d6e-abc7-8862f62aaba7', '2025-01-07 18:19:55.945014+00', '2025-01-07 18:19:55.945014+00', 'password', '919e4f69-8926-4c3d-8143-c0fb49fbb3e0'),
	('0eee859c-a47e-447c-a174-c83052d50508', '2025-01-07 18:32:38.347642+00', '2025-01-07 18:32:38.347642+00', 'password', 'c3867e96-f623-44ec-b1c2-370f7f4294f1'),
	('d22f406c-8747-4299-9337-10c5010552fc', '2025-01-07 20:09:58.74673+00', '2025-01-07 20:09:58.74673+00', 'password', 'f464385a-9963-4f14-9f18-a0cc5616c83c'),
	('bb15ba15-9268-43f6-9bbd-9d522dde9bb4', '2025-01-07 20:15:05.81797+00', '2025-01-07 20:15:05.81797+00', 'password', '3bc31346-a422-496a-8669-34bea165eba8'),
	('e7fe82a4-e3aa-475c-9c6f-4637fe147e6e', '2025-01-07 20:18:02.612934+00', '2025-01-07 20:18:02.612934+00', 'password', 'fe9a30a6-43b4-4f7c-9ef6-db61afbfee4d'),
	('48c80433-c5b1-4ffb-aeed-e25ba4565246', '2025-01-07 20:21:30.939429+00', '2025-01-07 20:21:30.939429+00', 'password', '7be257ba-b02d-4914-b3c3-c9299d0f6c27'),
	('fa6e47ab-7685-4449-bc14-06b9151e4cbf', '2025-01-07 20:24:06.845801+00', '2025-01-07 20:24:06.845801+00', 'password', '33fe724d-1ba3-429b-802e-56d95baa6b19'),
	('278edddf-b7d2-4861-9e6c-2b06e8f575b2', '2025-01-07 20:26:42.370846+00', '2025-01-07 20:26:42.370846+00', 'password', '15b43d39-8bbf-414b-a72f-c207f7232035'),
	('1a675bdd-ce1a-4df4-aaed-871373e688f2', '2025-01-08 17:46:11.83583+00', '2025-01-08 17:46:11.83583+00', 'password', 'aeaf9064-9a03-4393-a64f-0add0102adc7'),
	('78cad066-8e17-4b24-b3f7-053c5fa46b33', '2025-01-08 20:31:29.189516+00', '2025-01-08 20:31:29.189516+00', 'password', 'f2f05709-31bc-403b-bf6e-846ba6ad706a'),
	('27cb9942-a6df-4c89-bccd-1d3e82676308', '2025-01-08 20:39:10.251966+00', '2025-01-08 20:39:10.251966+00', 'password', '8c97bb9c-1036-4cd0-bd3d-10101fa5a211');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, 'Zpt8guNzOQ42QbFk857AFg', '7ba2724c-a20e-44d8-9fe2-c29208641c62', false, '2024-12-24 17:01:09.199211+00', '2024-12-24 17:01:09.199211+00', NULL, '3c4a652c-04fe-48e0-8ab3-999710367030'),
	('00000000-0000-0000-0000-000000000000', 2, 'woDKVXSX6y8ctG_ht1y3gg', '7ba2724c-a20e-44d8-9fe2-c29208641c62', false, '2024-12-24 17:02:30.047277+00', '2024-12-24 17:02:30.047277+00', NULL, '4d199872-d598-4e53-8aa0-8adb0bc45e8c'),
	('00000000-0000-0000-0000-000000000000', 3, 'GEYb_Ve-fs2AqeLroxdzVw', '7ba2724c-a20e-44d8-9fe2-c29208641c62', false, '2024-12-24 17:05:19.223157+00', '2024-12-24 17:05:19.223157+00', NULL, '3dae3866-ef39-4fd3-b16e-8375d2b4f68f'),
	('00000000-0000-0000-0000-000000000000', 4, 'iGJr91sgY2dtmK4ka6jb-Q', '7ba2724c-a20e-44d8-9fe2-c29208641c62', false, '2024-12-24 17:05:24.155722+00', '2024-12-24 17:05:24.155722+00', NULL, '79858d40-6bd0-4fa4-9d4b-02fbe8c6a816'),
	('00000000-0000-0000-0000-000000000000', 5, 'f3xfHaE0r1blNX_cgELclA', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', false, '2024-12-24 17:06:30.562359+00', '2024-12-24 17:06:30.562359+00', NULL, '144b1698-135a-4a50-b1a0-ee3a6088a1ab'),
	('00000000-0000-0000-0000-000000000000', 6, '5wj8K3R7ktm3liMQkogpPg', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', false, '2024-12-24 17:08:51.290632+00', '2024-12-24 17:08:51.290632+00', NULL, 'de341fea-39aa-4af9-97c9-429876dfa76e'),
	('00000000-0000-0000-0000-000000000000', 7, '3HsJECc-LnGVjRDI9JYsVA', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', false, '2024-12-24 17:09:19.90266+00', '2024-12-24 17:09:19.90266+00', NULL, 'dac9a01c-0791-4f12-8720-5b18984e143e'),
	('00000000-0000-0000-0000-000000000000', 8, 'xsKoVmZUs6YBoFfmr_3aUA', '5e537171-e309-44f7-93cd-343842befc28', false, '2024-12-24 17:11:45.040703+00', '2024-12-24 17:11:45.040703+00', NULL, '9d660801-35ee-4fa4-a619-4903db215593'),
	('00000000-0000-0000-0000-000000000000', 9, 'U8kFPBfKVEP0ITcal9oEmA', '7563ac33-3752-4c3f-b1f2-3b31aba75a90', false, '2024-12-24 17:12:08.94815+00', '2024-12-24 17:12:08.94815+00', NULL, '583576de-fa6c-49bd-874c-4f5d17c7e11d'),
	('00000000-0000-0000-0000-000000000000', 10, 'IMSp91RB2Y9fHip2kQgtog', '93756889-6c68-4cc5-bca7-068b15475bf3', false, '2024-12-24 17:14:31.175212+00', '2024-12-24 17:14:31.175212+00', NULL, 'b3d70e77-4dbf-450e-81f2-905df4315bc4'),
	('00000000-0000-0000-0000-000000000000', 11, 's6wlZrrQL7EhM1GwGzrZ1Q', '5f944b5a-31bc-4905-a021-76c59f88f275', false, '2024-12-24 17:16:09.839597+00', '2024-12-24 17:16:09.839597+00', NULL, 'd83bd57e-04ef-4d95-b0a9-0195377b2e8c'),
	('00000000-0000-0000-0000-000000000000', 15, 'lFjcLAhDLKQtuo3uvKnhHQ', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', false, '2025-01-07 05:32:35.091142+00', '2025-01-07 05:32:35.091142+00', NULL, 'd43d13a9-f39f-4627-92d4-0f3826e1097e'),
	('00000000-0000-0000-0000-000000000000', 16, 'Amk0XqTWj5RXhp-RI-T_tw', '5967063f-3ff0-4db0-8277-8100dd805273', false, '2025-01-07 05:32:35.484749+00', '2025-01-07 05:32:35.484749+00', NULL, 'b3885c43-8fda-4f75-9a87-8633ae7167ca'),
	('00000000-0000-0000-0000-000000000000', 17, 'HATgcGy7DUE1dmz2QWeTog', '6a8df463-5019-4b0f-b7a6-c856a88a1b02', false, '2025-01-07 05:32:35.798141+00', '2025-01-07 05:32:35.798141+00', NULL, '69478687-53f2-4731-8d17-e63e4ae2274a'),
	('00000000-0000-0000-0000-000000000000', 13, 'JRQkHZXez8W-KJWtbfKVHQ', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', true, '2025-01-07 05:03:37.684162+00', '2025-01-07 06:00:02.878966+00', NULL, '50c9679a-ed37-4276-bc70-2970ae30bcbd'),
	('00000000-0000-0000-0000-000000000000', 18, 'ne1cShwcqhWLqyspD2YT_w', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', false, '2025-01-07 06:00:02.881206+00', '2025-01-07 06:00:02.881206+00', 'JRQkHZXez8W-KJWtbfKVHQ', '50c9679a-ed37-4276-bc70-2970ae30bcbd'),
	('00000000-0000-0000-0000-000000000000', 19, 'w5CtQ5na4Juc_v8V-tKfjg', '786a527e-7ade-4d89-95e3-158d9ede52bf', false, '2025-01-07 06:10:55.048665+00', '2025-01-07 06:10:55.048665+00', NULL, '20e63887-6731-481f-bda1-0466f8cc6099'),
	('00000000-0000-0000-0000-000000000000', 20, 'CJk42FuAmljxpU4WJxOHYA', '786a527e-7ade-4d89-95e3-158d9ede52bf', false, '2025-01-07 06:11:45.529441+00', '2025-01-07 06:11:45.529441+00', NULL, '9b376699-01cc-45dc-998b-fa45a5265c06'),
	('00000000-0000-0000-0000-000000000000', 21, '3yKCGAr6tN-E2cq6SAX3Bg', '786a527e-7ade-4d89-95e3-158d9ede52bf', false, '2025-01-07 06:11:49.010984+00', '2025-01-07 06:11:49.010984+00', NULL, '144ff267-d42b-41fd-bee1-db6d93018d56'),
	('00000000-0000-0000-0000-000000000000', 26, '8rc7l2O0XvMyY0pfUgCYDQ', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', true, '2025-01-07 16:39:06.316345+00', '2025-01-07 17:31:56.459787+00', NULL, 'f82d8998-2210-49d1-a9a8-2e73b52d06c6'),
	('00000000-0000-0000-0000-000000000000', 14, 'xhgh76nPgdxtUvbX92N8lQ', '5f944b5a-31bc-4905-a021-76c59f88f275', true, '2025-01-07 05:27:43.037493+00', '2025-01-07 17:59:49.33156+00', NULL, '1f6aca89-f395-4c20-901d-e8a353eb87ed'),
	('00000000-0000-0000-0000-000000000000', 28, 'b58pllj9OrwagC1V7ibh7w', '5f944b5a-31bc-4905-a021-76c59f88f275', false, '2025-01-07 17:59:49.33523+00', '2025-01-07 17:59:49.33523+00', 'xhgh76nPgdxtUvbX92N8lQ', '1f6aca89-f395-4c20-901d-e8a353eb87ed'),
	('00000000-0000-0000-0000-000000000000', 32, 'invQfRR7uDVYO6pevH9faA', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', false, '2025-01-07 18:09:14.743058+00', '2025-01-07 18:09:14.743058+00', NULL, 'aaf8b2f7-f137-4172-8afa-14b622ab2760'),
	('00000000-0000-0000-0000-000000000000', 33, 'sSCLToM-ejXaAU3TjddjrQ', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', false, '2025-01-07 18:16:13.577382+00', '2025-01-07 18:16:13.577382+00', NULL, 'dcfd0a4b-3a80-47ed-acee-d28e699b3260'),
	('00000000-0000-0000-0000-000000000000', 27, 'PGM4O1ahAgvj5u9f1hvSng', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', true, '2025-01-07 17:31:56.463898+00', '2025-01-07 18:32:33.011521+00', '8rc7l2O0XvMyY0pfUgCYDQ', 'f82d8998-2210-49d1-a9a8-2e73b52d06c6'),
	('00000000-0000-0000-0000-000000000000', 36, 'glXzOd8Y6DMKhr6LRMYP7Q', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', false, '2025-01-07 18:32:33.013065+00', '2025-01-07 18:32:33.013065+00', 'PGM4O1ahAgvj5u9f1hvSng', 'f82d8998-2210-49d1-a9a8-2e73b52d06c6'),
	('00000000-0000-0000-0000-000000000000', 37, 'srb5G2RsKR9Pbn7tA9lVwg', '60f7a927-3f13-4e05-ab6e-42103399d5ff', false, '2025-01-07 18:32:38.346339+00', '2025-01-07 18:32:38.346339+00', NULL, '0eee859c-a47e-447c-a174-c83052d50508'),
	('00000000-0000-0000-0000-000000000000', 29, '0rb2c8u5ZyAvCHOcQ4T46g', '5f944b5a-31bc-4905-a021-76c59f88f275', true, '2025-01-07 17:59:53.230397+00', '2025-01-07 20:09:47.946807+00', NULL, 'bc04ac3d-8a64-4ace-8558-49f6f021975c'),
	('00000000-0000-0000-0000-000000000000', 42, 'K58ZJjPgVEMr3ejLKHfGbw', '5f944b5a-31bc-4905-a021-76c59f88f275', false, '2025-01-07 20:09:47.949567+00', '2025-01-07 20:09:47.949567+00', '0rb2c8u5ZyAvCHOcQ4T46g', 'bc04ac3d-8a64-4ace-8558-49f6f021975c'),
	('00000000-0000-0000-0000-000000000000', 30, 'jTN7DC2fP7RF7U1q1TJ1Vw', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', true, '2025-01-07 18:02:13.339471+00', '2025-01-07 20:11:49.792919+00', NULL, 'a681b6f3-454b-451e-bbfd-592b3c4c9cb0'),
	('00000000-0000-0000-0000-000000000000', 44, 'TZrcfU49DCuIUYc02ZzAyg', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', false, '2025-01-07 20:11:49.793589+00', '2025-01-07 20:11:49.793589+00', 'jTN7DC2fP7RF7U1q1TJ1Vw', 'a681b6f3-454b-451e-bbfd-592b3c4c9cb0'),
	('00000000-0000-0000-0000-000000000000', 46, '6PBvluDRg2qLI759biDioA', '53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', false, '2025-01-07 20:15:05.814331+00', '2025-01-07 20:15:05.814331+00', NULL, 'bb15ba15-9268-43f6-9bbd-9d522dde9bb4'),
	('00000000-0000-0000-0000-000000000000', 47, 'F1qhtu45aD3AjgrC8GTUsg', '19c75dbd-1dad-478a-b053-fe0319d2b23d', false, '2025-01-07 20:18:02.611047+00', '2025-01-07 20:18:02.611047+00', NULL, 'e7fe82a4-e3aa-475c-9c6f-4637fe147e6e'),
	('00000000-0000-0000-0000-000000000000', 31, 'tLL9nOWNF_A1MzkYk_efhg', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', true, '2025-01-07 18:05:00.836977+00', '2025-01-07 20:21:20.941791+00', NULL, 'd172c937-ff98-4536-9941-28e74af13cab'),
	('00000000-0000-0000-0000-000000000000', 49, 'GNCL4D6bGEGD-b7n1DLpYg', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', false, '2025-01-07 20:21:20.942433+00', '2025-01-07 20:21:20.942433+00', 'tLL9nOWNF_A1MzkYk_efhg', 'd172c937-ff98-4536-9941-28e74af13cab'),
	('00000000-0000-0000-0000-000000000000', 50, 'SftpQbOxWL0sgji3G3sHgg', '577a8927-0fb6-41fe-9685-026228c35f2a', false, '2025-01-07 20:21:30.938164+00', '2025-01-07 20:21:30.938164+00', NULL, '48c80433-c5b1-4ffb-aeed-e25ba4565246'),
	('00000000-0000-0000-0000-000000000000', 51, 'dLh_lJbfyzOYZsN2OMxcTw', '45957215-03ac-4607-8fa4-10814c200b79', false, '2025-01-07 20:24:06.842884+00', '2025-01-07 20:24:06.842884+00', NULL, 'fa6e47ab-7685-4449-bc14-06b9151e4cbf'),
	('00000000-0000-0000-0000-000000000000', 52, 'iNPuwdLntPmcEM_4qKQZ2g', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', false, '2025-01-07 20:26:42.368802+00', '2025-01-07 20:26:42.368802+00', NULL, '278edddf-b7d2-4861-9e6c-2b06e8f575b2'),
	('00000000-0000-0000-0000-000000000000', 34, 'oA1NyZvVOE6RlP5wx9tuMA', '94564ad5-98f8-4005-b35f-84974bf9cb77', true, '2025-01-07 18:18:25.122102+00', '2025-01-07 20:31:30.227971+00', NULL, 'efda3a4b-a641-41b1-b3cf-fd5a209e91bd'),
	('00000000-0000-0000-0000-000000000000', 53, 'DMrWo0WRxgPGfUrvvQqWWA', '94564ad5-98f8-4005-b35f-84974bf9cb77', false, '2025-01-07 20:31:30.230522+00', '2025-01-07 20:31:30.230522+00', 'oA1NyZvVOE6RlP5wx9tuMA', 'efda3a4b-a641-41b1-b3cf-fd5a209e91bd'),
	('00000000-0000-0000-0000-000000000000', 35, '9huNSHVfwKLQKmnxY--_wQ', '41bc6dad-db73-46d4-a98a-4b259a18711c', true, '2025-01-07 18:19:55.940662+00', '2025-01-07 20:33:59.910049+00', NULL, '18c483ab-72f2-4d6e-abc7-8862f62aaba7'),
	('00000000-0000-0000-0000-000000000000', 54, 'bDGN2N7jUpD3_3je7qs8OQ', '41bc6dad-db73-46d4-a98a-4b259a18711c', false, '2025-01-07 20:33:59.910796+00', '2025-01-07 20:33:59.910796+00', '9huNSHVfwKLQKmnxY--_wQ', '18c483ab-72f2-4d6e-abc7-8862f62aaba7'),
	('00000000-0000-0000-0000-000000000000', 43, 'NUq9VI0VuQrhzDiCrBHFpg', 'c53a434b-e444-44ea-a474-40a419e08f87', true, '2025-01-07 20:09:58.745391+00', '2025-01-07 21:05:18.079899+00', NULL, 'd22f406c-8747-4299-9337-10c5010552fc'),
	('00000000-0000-0000-0000-000000000000', 56, 'AOe86VaSj7z_IM7plkGkEg', 'c53a434b-e444-44ea-a474-40a419e08f87', true, '2025-01-07 21:05:18.081897+00', '2025-01-07 23:16:42.098767+00', 'NUq9VI0VuQrhzDiCrBHFpg', 'd22f406c-8747-4299-9337-10c5010552fc'),
	('00000000-0000-0000-0000-000000000000', 60, '7gRO0gmgUoITQBAoleR0JA', 'c53a434b-e444-44ea-a474-40a419e08f87', false, '2025-01-07 23:16:42.101343+00', '2025-01-07 23:16:42.101343+00', 'AOe86VaSj7z_IM7plkGkEg', 'd22f406c-8747-4299-9337-10c5010552fc'),
	('00000000-0000-0000-0000-000000000000', 67, 'R1aRXOqv1Xrnasowy2UyaA', 'd6dfec51-9b05-4221-992f-1b3518e92be2', false, '2025-01-08 17:46:11.831835+00', '2025-01-08 17:46:11.831835+00', NULL, '1a675bdd-ce1a-4df4-aaed-871373e688f2'),
	('00000000-0000-0000-0000-000000000000', 69, '0Y7CLQUQJavNudfH5ugeuw', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', false, '2025-01-08 20:31:29.185185+00', '2025-01-08 20:31:29.185185+00', NULL, '78cad066-8e17-4b24-b3f7-053c5fa46b33'),
	('00000000-0000-0000-0000-000000000000', 70, 'kp05pqkHuuKzMHsgL30ykA', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', false, '2025-01-08 20:39:10.246722+00', '2025-01-08 20:39:10.246722+00', NULL, '27cb9942-a6df-4c89-bccd-1d3e82676308');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "username", "status", "avatar_url", "updated_at") VALUES
	('87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'collegeforreece@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('5f944b5a-31bc-4905-a021-76c59f88f275', 'thegreatestregretofthedying', 'ONLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('6a8df463-5019-4b0f-b7a6-c856a88a1b02', 'test@example.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('5967063f-3ff0-4db0-8277-8100dd805273', 'newuser@example.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('786a527e-7ade-4d89-95e3-158d9ede52bf', 'rharding1123333@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('fa5ea4f3-34a6-4bf9-913f-40dbf2b3ae99', 'rharding112ss3@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('b43e63f7-9a88-4b75-847c-225dac39d613', 'rharding112zz3@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('6edc9c5a-b9d2-4e6b-9904-2dd141878213', 'rharding1123aaaaa@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('9004c2e6-259f-48ea-ba08-87ccf30a3d8e', 'rieboysspam', 'ONLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 'john@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '23e@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('94564ad5-98f8-4005-b35f-84974bf9cb77', '1235@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('41bc6dad-db73-46d4-a98a-4b259a18711c', '11@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('60f7a927-3f13-4e05-ab6e-42103399d5ff', 'rharding1123aaa7aa@gmail.com', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 'supabot', 'OFFLINE', NULL, '2025-01-07 18:58:56.841421+00'),
	('76071b4e-168a-4de6-80c1-3a8e91140cc6', '', 'ONLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/76071b4e-168a-4de6-80c1-3a8e91140cc6/1736279712615.png', '2025-01-07 19:55:18.74+00'),
	('2a219aa0-843f-40c2-9a57-75cfdfc12348', 'rharding1123a2aa7aazz@gmail.com', 'OFFLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/2a219aa0-843f-40c2-9a57-75cfdfc12348/1736279770028.png', '2025-01-07 19:56:15.257+00'),
	('53c879ef-cd9f-40ed-ae0b-bca72abc5d0f', 'rieboysspaa22m@gmail.com', 'OFFLINE', NULL, '2025-01-07 20:15:05.793629+00'),
	('19c75dbd-1dad-478a-b053-fe0319d2b23d', 'rieboysspaa22am@gmail.com', 'OFFLINE', NULL, '2025-01-07 20:18:02.594715+00'),
	('577a8927-0fb6-41fe-9685-026228c35f2a', 'johnnew1@gmail.com', 'OFFLINE', NULL, '2025-01-07 20:21:30.921908+00'),
	('45957215-03ac-4607-8fa4-10814c200b79', 'john22@gmail.com', 'OFFLINE', NULL, '2025-01-07 20:24:06.823234+00'),
	('a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', '123nwe@gmail.com', 'OFFLINE', NULL, '2025-01-07 20:26:42.349864+00'),
	('c53a434b-e444-44ea-a474-40a419e08f87', 'Vader', 'ONLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/c53a434b-e444-44ea-a474-40a419e08f87-0.8930065474120294.png', '2025-01-07 20:09:58.722087+00'),
	('f715211f-09c7-45c9-997c-c54c2e591850', 'rieboysspaa222am@gmail.com', 'OFFLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/f715211f-09c7-45c9-997c-c54c2e591850-0.8045493446019594.png', '2025-01-07 20:19:34.526636+00'),
	('4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 'rieboysspa22m@gmail.com', 'OFFLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/4a1f3a43-1012-44ee-9c40-6a22bc1a63d2-0.3004292826178916.png', '2025-01-07 20:12:16.374883+00'),
	('d6dfec51-9b05-4221-992f-1b3518e92be2', 'testuser@gmail.com', 'OFFLINE', 'https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/avatars/d6dfec51-9b05-4221-992f-1b3518e92be2-0.470585525031763.png', '2025-01-08 17:46:11.795268+00'),
	('a60bc151-729c-453a-beac-d3b366e10150', 'rharding113323a2aa7aazz@gmail.com', 'OFFLINE', NULL, '2025-01-07 23:45:39.906891+00'),
	('f5392b1e-cafd-40a6-ba97-91376cb104e7', 'rharding1123', 'ONLINE', NULL, '2025-01-07 18:58:56.841421+00');


--
-- Data for Name: channels; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."channels" ("id", "inserted_at", "slug", "created_by") VALUES
	(1, '2025-01-07 04:26:04.43076+00', 'public', '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'),
	(2, '2025-01-07 04:26:04.43076+00', 'random', '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e'),
	(4, '2025-01-07 05:02:12.951476+00', 'reece', '87330b5e-0fcd-4d59-a479-3369a9e6dedd');


--
-- Data for Name: direct_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."direct_messages" ("id", "sender_id", "recipient_id", "message", "attachments", "inserted_at", "updated_at") VALUES
	(1, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 'hi reece!', NULL, '2025-01-07 22:09:32.263381+00', '2025-01-07 22:09:32.263381+00'),
	(2, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 'howdy!', NULL, '2025-01-07 22:09:42.301481+00', '2025-01-07 22:09:42.301481+00'),
	(3, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'c53a434b-e444-44ea-a474-40a419e08f87', 'howdy!', NULL, '2025-01-07 22:16:58.995179+00', '2025-01-07 22:16:58.995179+00'),
	(4, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', '123', NULL, '2025-01-07 22:20:02.924881+00', '2025-01-07 22:20:02.924881+00'),
	(5, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '41bc6dad-db73-46d4-a98a-4b259a18711c', 'howdy!', NULL, '2025-01-07 22:22:09.639643+00', '2025-01-07 22:22:09.639643+00'),
	(6, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', 'howdy!', NULL, '2025-01-07 22:22:26.391474+00', '2025-01-07 22:22:26.391474+00'),
	(7, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'howdy!', NULL, '2025-01-07 22:24:18.079475+00', '2025-01-07 22:24:18.079475+00'),
	(8, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'test22', NULL, '2025-01-07 22:26:10.792179+00', '2025-01-07 22:26:10.792179+00'),
	(9, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'hello', NULL, '2025-01-07 22:28:54.830946+00', '2025-01-07 22:28:54.830946+00'),
	(10, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '94564ad5-98f8-4005-b35f-84974bf9cb77', 'howdy!', NULL, '2025-01-07 22:32:50.223163+00', '2025-01-07 22:32:50.223163+00'),
	(11, '2a219aa0-843f-40c2-9a57-75cfdfc12348', '87330b5e-0fcd-4d59-a479-3369a9e6dedd', 'hello?', NULL, '2025-01-07 22:40:47.924198+00', '2025-01-07 22:40:47.924198+00'),
	(12, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', 'message', NULL, '2025-01-07 22:41:13.799772+00', '2025-01-07 22:41:13.799772+00'),
	(13, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', 'hello?', NULL, '2025-01-07 22:41:45.16958+00', '2025-01-07 22:41:45.16958+00'),
	(14, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'a8404d1f-dcd0-42ac-9eac-7ef4db4643d6', 'test', NULL, '2025-01-07 22:42:42.854354+00', '2025-01-07 22:42:42.854354+00'),
	(15, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'c53a434b-e444-44ea-a474-40a419e08f87', 'test 1', NULL, '2025-01-07 22:48:18.041067+00', '2025-01-07 22:48:18.041067+00'),
	(16, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 'sup', NULL, '2025-01-07 22:51:02.869736+00', '2025-01-07 22:51:02.869736+00'),
	(17, '2a219aa0-843f-40c2-9a57-75cfdfc12348', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 'again', NULL, '2025-01-07 22:53:27.02472+00', '2025-01-07 22:53:27.02472+00');


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."messages" ("id", "inserted_at", "message", "user_id", "channel_id", "attachments", "parent_id") VALUES
	(1, '2025-01-07 04:26:04.43076+00', 'Hello World 👋', '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 1, '[]', NULL),
	(2, '2025-01-07 04:26:04.43076+00', 'Perfection is attained, not when there is nothing more to add, but when there is nothing left to take away.', '8d0fd2b3-9ca7-4d9e-a95f-9e13dded323e', 2, '[]', NULL),
	(9, '2025-01-07 05:09:17.145554+00', '333', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 1, '[]', NULL),
	(10, '2025-01-07 05:09:23.711151+00', 'hey!', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 1, '[]', NULL),
	(12, '2025-01-07 05:09:44.525727+00', 'what up!', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 4, '[]', NULL),
	(13, '2025-01-07 05:27:56.933467+00', 'hi!', '5f944b5a-31bc-4905-a021-76c59f88f275', 2, '[]', NULL),
	(14, '2025-01-07 05:55:50.896541+00', 'test', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 1, '[]', NULL),
	(15, '2025-01-07 05:55:58.652119+00', 'hello', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 4, '[]', NULL),
	(16, '2025-01-07 06:18:59.098433+00', 'hello', 'b43e63f7-9a88-4b75-847c-225dac39d613', 4, '[]', NULL),
	(17, '2025-01-07 06:21:48.504204+00', 'aa', 'b43e63f7-9a88-4b75-847c-225dac39d613', 1, '[]', NULL),
	(18, '2025-01-07 06:23:02.845925+00', 'test', 'b43e63f7-9a88-4b75-847c-225dac39d613', 1, '[]', NULL),
	(19, '2025-01-07 06:24:27.852697+00', 'hello', 'b43e63f7-9a88-4b75-847c-225dac39d613', 2, '[]', NULL),
	(20, '2025-01-07 06:34:07.738167+00', 'aaa', 'b43e63f7-9a88-4b75-847c-225dac39d613', 4, '[]', NULL),
	(21, '2025-01-07 16:58:52.773069+00', 'good morning', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 2, '[]', NULL),
	(22, '2025-01-07 16:59:01.233886+00', 'hello!', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 2, '[]', NULL),
	(30, '2025-01-07 17:37:44.559347+00', '1', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 1, NULL, NULL),
	(31, '2025-01-07 17:37:58.032257+00', 'test', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(32, '2025-01-07 17:39:13.409009+00', '2', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271950764-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271950764-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(33, '2025-01-07 17:56:35.46807+00', '3', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736272993413-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736272993413-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(34, '2025-01-07 18:02:28.688397+00', '4', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/9004c2e6-259f-48ea-ba08-87ccf30a3d8e/1736273346937-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "9004c2e6-259f-48ea-ba08-87ccf30a3d8e/1736273346937-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(35, '2025-01-07 18:05:16.114744+00', 'what up?', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273512971-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273512971-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(36, '2025-01-07 18:09:27.18279+00', '5', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273762951-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "name": "1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "path": "e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273762951-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json", "size": 474, "type": "application/json"}]', NULL),
	(37, '2025-01-07 18:16:30.626822+00', '6', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274187701-profilePic.jpg", "name": "profilePic.jpg", "path": "82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274187701-profilePic.jpg", "size": 2222829, "type": "image/jpeg"}]', NULL),
	(38, '2025-01-07 18:17:01.148043+00', '7', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274218161-scopeCallAndProduction.png", "name": "scopeCallAndProduction.png", "path": "82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274218161-scopeCallAndProduction.png", "size": 3261593, "type": "image/png"}]', NULL),
	(39, '2025-01-07 18:21:24.522219+00', 'pdf test', '41bc6dad-db73-46d4-a98a-4b259a18711c', 1, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/41bc6dad-db73-46d4-a98a-4b259a18711c/1736274480331-Copy%20of%20GauntletAI%20Project%201%20-%20ChatGenius.pdf", "name": "Copy of GauntletAI Project 1 - ChatGenius.pdf", "path": "41bc6dad-db73-46d4-a98a-4b259a18711c/1736274480331-Copy of GauntletAI Project 1 - ChatGenius.pdf", "size": 256374, "type": "application/pdf"}]', NULL),
	(40, '2025-01-07 18:35:05.009851+00', 'new message', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 1, NULL, NULL),
	(41, '2025-01-07 18:36:53.174131+00', 'hey!', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 1, NULL, NULL),
	(42, '2025-01-07 18:36:59.826011+00', 'what up!', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 1, NULL, NULL),
	(43, '2025-01-07 18:37:02.78081+00', 'hey!', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 1, NULL, NULL),
	(44, '2025-01-07 19:06:45.334885+00', 'hi', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 1, NULL, NULL),
	(45, '2025-01-07 19:48:41.561948+00', 'heyyyy', '76071b4e-168a-4de6-80c1-3a8e91140cc6', 2, NULL, NULL),
	(46, '2025-01-07 19:50:02.573062+00', 'check out this guy!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 2, '[{"url": "https://nrfpyypohsriixctvsvt.supabase.co/storage/v1/object/public/message_attachments/2a219aa0-843f-40c2-9a57-75cfdfc12348/1736279797918-profilePic.jpg", "name": "profilePic.jpg", "path": "2a219aa0-843f-40c2-9a57-75cfdfc12348/1736279797918-profilePic.jpg", "size": 2222829, "type": "image/jpeg"}]', NULL),
	(47, '2025-01-07 21:58:52.217316+00', 'hey!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 1, '[]', NULL),
	(48, '2025-01-07 22:01:05.621591+00', 'howdy!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 1, '[]', NULL),
	(49, '2025-01-07 22:01:26.255285+00', 'howdy!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 4, '[]', NULL),
	(50, '2025-01-07 22:09:07.25385+00', '3', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 1, NULL, NULL),
	(51, '2025-01-07 22:09:11.262259+00', 'howdy!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 1, NULL, NULL),
	(52, '2025-01-07 22:09:22.564285+00', 'cute!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 2, NULL, NULL),
	(53, '2025-01-07 22:40:39.9089+00', 'hi!', '2a219aa0-843f-40c2-9a57-75cfdfc12348', 1, NULL, NULL),
	(54, '2025-01-07 23:28:35.532092+00', 'I am your father', 'c53a434b-e444-44ea-a474-40a419e08f87', 2, NULL, NULL),
	(55, '2025-01-07 23:57:29.188989+00', 'hello!', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, NULL, NULL),
	(56, '2025-01-07 23:57:36.412552+00', 'hello!', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, NULL, NULL),
	(57, '2025-01-08 00:09:23.746+00', 'test', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(58, '2025-01-08 00:09:30.678+00', 'test', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(59, '2025-01-08 00:09:45.064+00', 'test', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(60, '2025-01-08 00:11:25.4+00', 'message test', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(61, '2025-01-08 00:11:31.432+00', 'howdy!', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(62, '2025-01-08 00:13:48.439+00', 'hey!', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 1, '[]', NULL),
	(63, '2025-01-08 00:14:11.155+00', 'new profile avatar!', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 1, '[]', NULL),
	(64, '2025-01-08 00:14:26.79+00', 'Howdy', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 2, '[]', NULL),
	(65, '2025-01-08 00:14:47.596+00', 'howdy', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', 4, '[]', NULL),
	(66, '2025-01-08 17:42:42.141+00', 'test again', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(67, '2025-01-08 17:44:24.5+00', 'test', 'f715211f-09c7-45c9-997c-c54c2e591850', 1, '[]', NULL),
	(68, '2025-01-08 17:57:24.676+00', 'hello there', 'd6dfec51-9b05-4221-992f-1b3518e92be2', 1, '[]', NULL),
	(69, '2025-01-08 20:46:01.519+00', 'hello', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 1, '[]', NULL),
	(70, '2025-01-08 21:06:42.857+00', 'test', 'f5392b1e-cafd-40a6-ba97-91376cb104e7', 1, '[]', NULL);


--
-- Data for Name: message_reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."message_reactions" ("id", "message_id", "user_id", "emoji", "created_at") VALUES
	(1, 14, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '❤️', '2025-01-07 17:17:17.201361+00'),
	(2, 17, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '👍', '2025-01-07 17:18:50.029882+00'),
	(3, 18, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '❤️', '2025-01-07 17:20:19.479254+00'),
	(4, 10, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '😂', '2025-01-07 17:21:08.4427+00'),
	(5, 22, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '👋', '2025-01-07 17:21:23.267416+00'),
	(6, 18, '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '👍', '2025-01-07 17:34:14.116857+00'),
	(7, 35, '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '❤️', '2025-01-07 18:16:21.932719+00'),
	(8, 40, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '❤️', '2025-01-07 18:35:09.632075+00'),
	(9, 43, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '😂', '2025-01-07 18:37:06.901129+00'),
	(10, 41, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '👍', '2025-01-07 19:11:02.027102+00'),
	(11, 44, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '❤️', '2025-01-07 19:34:15.623262+00'),
	(12, 41, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '❤️', '2025-01-07 19:48:10.092396+00'),
	(13, 21, '76071b4e-168a-4de6-80c1-3a8e91140cc6', '🚀', '2025-01-07 19:48:17.449797+00'),
	(15, 1, 'c53a434b-e444-44ea-a474-40a419e08f87', '👍', '2025-01-07 23:16:48.77947+00'),
	(16, 9, 'c53a434b-e444-44ea-a474-40a419e08f87', '❤️', '2025-01-07 23:16:51.338891+00'),
	(17, 44, 'c53a434b-e444-44ea-a474-40a419e08f87', '🎉', '2025-01-07 23:17:02.756305+00'),
	(18, 42, 'f715211f-09c7-45c9-997c-c54c2e591850', '👍', '2025-01-07 23:55:11.329141+00'),
	(19, 1, 'a60bc151-729c-453a-beac-d3b366e10150', '❤️', '2025-01-07 23:56:17.969643+00'),
	(20, 18, 'a60bc151-729c-453a-beac-d3b366e10150', '😂', '2025-01-07 23:59:04.036475+00'),
	(21, 9, '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '👍', '2025-01-08 00:05:37.173999+00'),
	(22, 49, '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '❤️', '2025-01-08 00:08:57.6407+00'),
	(23, 20, '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '🎉', '2025-01-08 00:09:00.055011+00'),
	(24, 62, 'f715211f-09c7-45c9-997c-c54c2e591850', '👍', '2025-01-08 00:09:22.302267+00'),
	(25, 61, 'f715211f-09c7-45c9-997c-c54c2e591850', '❤️', '2025-01-08 17:39:52.813843+00'),
	(26, 68, 'd6dfec51-9b05-4221-992f-1b3518e92be2', '❤️', '2025-01-08 17:50:56.17015+00');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."role_permissions" ("id", "role", "permission") VALUES
	(1, 'admin', 'channels.delete'),
	(2, 'admin', 'messages.delete'),
	(3, 'moderator', 'messages.delete');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('message_attachments', 'message_attachments', NULL, '2025-01-07 17:25:38.635511+00', '2025-01-07 17:25:38.635511+00', true, false, 10485760, NULL, NULL),
	('avatars', 'avatars', NULL, '2025-01-07 06:18:32.24584+00', '2025-01-07 06:18:32.24584+00', true, false, 10485760, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('9dc14ade-aa84-4644-8221-ac3ba9a0788e', 'avatars', 'b43e63f7-9a88-4b75-847c-225dac39d613/1736231122621.jpg', 'b43e63f7-9a88-4b75-847c-225dac39d613', '2025-01-07 06:18:44.190939+00', '2025-01-07 06:18:44.190939+00', '2025-01-07 06:18:44.190939+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T06:18:45.000Z", "contentLength": 2222829, "httpStatusCode": 200}', 'eccf3fa4-7cdc-4d75-a109-00d8a3ce54ce', 'b43e63f7-9a88-4b75-847c-225dac39d613', '{}'),
	('e6b8a23b-f2bd-4df6-b04e-a5a5262e32f2', 'message_attachments', '6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271496910-AutoMouseClick.zip', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 17:31:37.837381+00', '2025-01-07 17:31:37.837381+00', '2025-01-07 17:31:37.837381+00', '{"eTag": "\"dc70d777fc13751edb17ede20bee6c2a\"", "size": 860060, "mimetype": "application/zip", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T17:31:38.000Z", "contentLength": 860060, "httpStatusCode": 200}', 'd97503ad-07a4-46cf-835b-868b1a92580c', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{}'),
	('a1d9049b-e9ac-4478-8606-d7ec9b0b90d5', 'message_attachments', '6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271659374-AutoMouseClick.zip', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 17:34:20.216292+00', '2025-01-07 17:34:20.216292+00', '2025-01-07 17:34:20.216292+00', '{"eTag": "\"dc70d777fc13751edb17ede20bee6c2a\"", "size": 860060, "mimetype": "application/zip", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T17:34:21.000Z", "contentLength": 860060, "httpStatusCode": 200}', '42f5e2c9-f637-48df-b65a-01f53a662845', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{}'),
	('3a0a4bd2-0f11-4a33-9bac-aa3f8f719a59', 'message_attachments', '6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 17:37:55.2044+00', '2025-01-07 17:37:55.2044+00', '2025-01-07 17:37:55.2044+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T17:37:56.000Z", "contentLength": 474, "httpStatusCode": 200}', '1276c07e-3103-485c-8d9d-9736753f6fa1', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{}'),
	('2a17989d-52f2-4942-a15d-93975446b9f5', 'message_attachments', '6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736271950764-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 17:39:10.933893+00', '2025-01-07 17:39:10.933893+00', '2025-01-07 17:39:10.933893+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T17:39:11.000Z", "contentLength": 474, "httpStatusCode": 200}', 'c93c173f-33bb-4431-a12d-5be28b4d4937', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{}'),
	('f7d9059d-e153-4ea2-a9e3-3c72810eff4d', 'message_attachments', '6edc9c5a-b9d2-4e6b-9904-2dd141878213/1736272993413-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '2025-01-07 17:56:33.667262+00', '2025-01-07 17:56:33.667262+00', '2025-01-07 17:56:33.667262+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T17:56:34.000Z", "contentLength": 474, "httpStatusCode": 200}', '1bec87e6-f190-4c20-ba2f-ccd4d1fc0e9d', '6edc9c5a-b9d2-4e6b-9904-2dd141878213', '{}'),
	('a0678184-0936-43c6-8647-e3e5d9da79b0', 'message_attachments', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e/1736273346937-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '2025-01-07 18:02:27.182221+00', '2025-01-07 18:02:27.182221+00', '2025-01-07 18:02:27.182221+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:02:28.000Z", "contentLength": 474, "httpStatusCode": 200}', '3ac69c01-631a-465c-89f7-acb1c51adfda', '9004c2e6-259f-48ea-ba08-87ccf30a3d8e', '{}'),
	('3dbe9ac8-0da7-419d-9c09-e46791c718a2', 'message_attachments', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273512971-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '2025-01-07 18:05:13.179741+00', '2025-01-07 18:05:13.179741+00', '2025-01-07 18:05:13.179741+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:05:14.000Z", "contentLength": 474, "httpStatusCode": 200}', '720e45ae-d827-4b70-bc57-0f94bc2938e9', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '{}'),
	('93b76e87-8f70-473f-9517-36fd2089e785', 'message_attachments', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333/1736273762951-1736271874966-client_secret_948511909929-qck8ft5t3idfl1rnc3r1kqn40icpc5to.apps.googleusercontent.com.json', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '2025-01-07 18:09:23.173171+00', '2025-01-07 18:09:23.173171+00', '2025-01-07 18:09:23.173171+00', '{"eTag": "\"016032152c2fddfcd6447f85bb0825f4\"", "size": 474, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:09:24.000Z", "contentLength": 474, "httpStatusCode": 200}', '5f79431c-5338-47ed-9fdb-f3ee572ba478', 'e29fda9e-9e1e-44b0-8a59-c4e8b54e0333', '{}'),
	('8cc7ef72-e5d0-4a79-8fe8-b4fe34683134', 'message_attachments', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274187701-profilePic.jpg', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '2025-01-07 18:16:28.983581+00', '2025-01-07 18:16:28.983581+00', '2025-01-07 18:16:28.983581+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:16:29.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '2a1813a0-ef29-42ae-b668-f49d40ed1eab', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '{}'),
	('07fde532-20aa-4709-9ed5-d692d9c62146', 'message_attachments', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1/1736274218161-scopeCallAndProduction.png', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '2025-01-07 18:16:59.877427+00', '2025-01-07 18:16:59.877427+00', '2025-01-07 18:16:59.877427+00', '{"eTag": "\"c45750cc43508043bded63f76003f353\"", "size": 3261593, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:17:00.000Z", "contentLength": 3261593, "httpStatusCode": 200}', 'f11920dc-2351-4800-922a-0ec9fde1f7b3', '82dbba6b-68f8-4b8a-87c2-5fc29f117dd1', '{}'),
	('6b31f67d-2622-4015-b2fb-35e8f04e247f', 'message_attachments', '41bc6dad-db73-46d4-a98a-4b259a18711c/1736274480331-Copy of GauntletAI Project 1 - ChatGenius.pdf', '41bc6dad-db73-46d4-a98a-4b259a18711c', '2025-01-07 18:21:20.891091+00', '2025-01-07 18:21:20.891091+00', '2025-01-07 18:21:20.891091+00', '{"eTag": "\"667363cddb4a33b1070547ad1af0c04e\"", "size": 256374, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:21:21.000Z", "contentLength": 256374, "httpStatusCode": 200}', '9d47aba3-5457-44ab-a408-fc4a09086f8a', '41bc6dad-db73-46d4-a98a-4b259a18711c', '{}'),
	('734b2169-8501-42de-8de0-4b53541fec01', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276149155.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:49:10.568705+00', '2025-01-07 18:49:10.568705+00', '2025-01-07 18:49:10.568705+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:49:11.000Z", "contentLength": 2222829, "httpStatusCode": 200}', 'dec9b3be-55de-4832-8f15-a066f14c83c0', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('1a349a47-beed-43c4-98ec-6ba8eb21111a', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276198238.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:49:59.802129+00', '2025-01-07 18:49:59.802129+00', '2025-01-07 18:49:59.802129+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:50:00.000Z", "contentLength": 2222829, "httpStatusCode": 200}', 'efa65014-7b32-4ec1-86ae-7104fd0c3c1a', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('b1a80d05-2fe7-41cc-bf70-007573e12825', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276252583.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:50:53.459708+00', '2025-01-07 18:50:53.459708+00', '2025-01-07 18:50:53.459708+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:50:54.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '348f8a20-11e2-414b-8198-7aa28ae8dd24', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('1ddd2b6a-f194-4ca4-a805-6a3a375595f6', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276522584.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:55:23.931884+00', '2025-01-07 18:55:23.931884+00', '2025-01-07 18:55:23.931884+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:55:24.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '83a10a3d-7513-48d3-b538-ffd9872c421f', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('03bd24b6-6941-465f-a1b4-7daa7ebdc0b7', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276599100.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:56:40.415118+00', '2025-01-07 18:56:40.415118+00', '2025-01-07 18:56:40.415118+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:56:41.000Z", "contentLength": 2222829, "httpStatusCode": 200}', 'dee56bdb-d8fe-4ba5-94fd-b9d7a5f2444b', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('1102807c-f8b9-4b32-be21-dfbe98f003dd', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276640497.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 18:57:22.140757+00', '2025-01-07 18:57:22.140757+00', '2025-01-07 18:57:22.140757+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T18:57:22.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '483a1def-c7ba-4588-8358-396674592b6a', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('522b0609-cd57-4d53-b2bd-c72db1098859', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736276816596.jpg', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 19:00:18.073104+00', '2025-01-07 19:00:18.073104+00', '2025-01-07 19:00:18.073104+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T19:00:18.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '35ea7ef3-f0b9-4450-8ca4-ff250b461b15', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('9f3cfdc3-1bfc-41a7-aef5-0b46ef2c1330', 'avatars', '76071b4e-168a-4de6-80c1-3a8e91140cc6/1736279712615.png', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '2025-01-07 19:48:34.058526+00', '2025-01-07 19:48:34.058526+00', '2025-01-07 19:48:34.058526+00', '{"eTag": "\"9a5d39fdf018c00a1e92cc7b86e36b0a\"", "size": 2450109, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T19:48:34.000Z", "contentLength": 2450109, "httpStatusCode": 200}', 'bcf5322f-9c9c-4e5b-9564-9973d4b29f1d', '76071b4e-168a-4de6-80c1-3a8e91140cc6', '{}'),
	('231f83c9-c8ac-4feb-9363-0a2a80a99ebd', 'avatars', '2a219aa0-843f-40c2-9a57-75cfdfc12348/1736279770028.png', '2a219aa0-843f-40c2-9a57-75cfdfc12348', '2025-01-07 19:49:31.813833+00', '2025-01-07 19:49:31.813833+00', '2025-01-07 19:49:31.813833+00', '{"eTag": "\"c45750cc43508043bded63f76003f353\"", "size": 3261593, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T19:49:32.000Z", "contentLength": 3261593, "httpStatusCode": 200}', '71cd0c71-5689-45ed-a9a0-10114c376f99', '2a219aa0-843f-40c2-9a57-75cfdfc12348', '{}'),
	('a4f3cba5-0495-4feb-9937-69fa0923d624', 'message_attachments', '2a219aa0-843f-40c2-9a57-75cfdfc12348/1736279797918-profilePic.jpg', '2a219aa0-843f-40c2-9a57-75cfdfc12348', '2025-01-07 19:49:59.308874+00', '2025-01-07 19:49:59.308874+00', '2025-01-07 19:49:59.308874+00', '{"eTag": "\"d40232553120dba60dc19fe4ab7c9158\"", "size": 2222829, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T19:50:00.000Z", "contentLength": 2222829, "httpStatusCode": 200}', '09677959-54f7-48c3-9a4c-45b847748b98', '2a219aa0-843f-40c2-9a57-75cfdfc12348', '{}'),
	('93a8a98e-b856-48ff-b996-28d1ada75ab2', 'avatars', 'c53a434b-e444-44ea-a474-40a419e08f87-0.8930065474120294.png', 'c53a434b-e444-44ea-a474-40a419e08f87', '2025-01-07 23:17:16.860489+00', '2025-01-07 23:17:16.860489+00', '2025-01-07 23:17:16.860489+00', '{"eTag": "\"739d073c66e911c124460d58ea34b8c5\"", "size": 122287, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T23:17:17.000Z", "contentLength": 122287, "httpStatusCode": 200}', 'dc3319a7-fc51-477e-b0f2-dad5308ce6a8', 'c53a434b-e444-44ea-a474-40a419e08f87', '{}'),
	('acc621b8-db16-4895-a93d-a8470e2a939e', 'avatars', 'c53a434b-e444-44ea-a474-40a419e08f87-0.06801644512037486.png', 'c53a434b-e444-44ea-a474-40a419e08f87', '2025-01-07 23:18:14.775637+00', '2025-01-07 23:18:14.775637+00', '2025-01-07 23:18:14.775637+00', '{"eTag": "\"739d073c66e911c124460d58ea34b8c5\"", "size": 122287, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-07T23:18:15.000Z", "contentLength": 122287, "httpStatusCode": 200}', 'd05ddd16-3824-42b8-9bce-aeb06489bccb', 'c53a434b-e444-44ea-a474-40a419e08f87', '{}'),
	('db2a98f8-78d2-41d3-bbf1-9f83f6738f6e', 'avatars', 'f715211f-09c7-45c9-997c-c54c2e591850-0.8045493446019594.png', 'f715211f-09c7-45c9-997c-c54c2e591850', '2025-01-08 00:02:58.292399+00', '2025-01-08 00:02:58.292399+00', '2025-01-08 00:02:58.292399+00', '{"eTag": "\"fb599ea3af5c4a236516c3fd91d4cebe\"", "size": 44570, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-08T00:02:59.000Z", "contentLength": 44570, "httpStatusCode": 200}', 'eb936b27-0815-402a-a948-c55c79da5ad2', 'f715211f-09c7-45c9-997c-c54c2e591850', '{}'),
	('80e225fc-3bf6-4f33-9db8-b6b51ed9fb25', 'avatars', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2-0.3004292826178916.png', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '2025-01-08 00:07:22.481633+00', '2025-01-08 00:07:22.481633+00', '2025-01-08 00:07:22.481633+00', '{"eTag": "\"05e08effed6bc1f605b9b306afe3c261\"", "size": 193362, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-08T00:07:23.000Z", "contentLength": 193362, "httpStatusCode": 200}', '224b6fc4-0715-4729-8707-42a9eb69c293', '4a1f3a43-1012-44ee-9c40-6a22bc1a63d2', '{}'),
	('307683f7-d4ed-4456-869c-e3feca57352e', 'avatars', 'd6dfec51-9b05-4221-992f-1b3518e92be2-0.470585525031763.png', 'd6dfec51-9b05-4221-992f-1b3518e92be2', '2025-01-08 17:50:34.126862+00', '2025-01-08 17:50:34.126862+00', '2025-01-08 17:50:34.126862+00', '{"eTag": "\"739d073c66e911c124460d58ea34b8c5\"", "size": 122287, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-01-08T17:50:35.000Z", "contentLength": 122287, "httpStatusCode": 200}', '7854045c-cad6-478f-bf09-6e321ee6ad9a', 'd6dfec51-9b05-4221-992f-1b3518e92be2', '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 70, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: channels_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."channels_id_seq"', 4, true);


--
-- Name: direct_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."direct_messages_id_seq"', 17, true);


--
-- Name: message_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."message_reactions_id_seq"', 26, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."messages_id_seq"', 71, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."role_permissions_id_seq"', 3, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."user_roles_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
