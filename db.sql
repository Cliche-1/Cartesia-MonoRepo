-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.collaborations (
  id integer NOT NULL DEFAULT nextval('collaborations_id_seq'::regclass),
  roadmap_id integer NOT NULL,
  collaborator_id integer NOT NULL,
  role character varying NOT NULL DEFAULT 'viewer'::character varying CHECK (role::text = ANY (ARRAY['owner'::character varying, 'editor'::character varying, 'viewer'::character varying, 'contributor'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT collaborations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_collaborations_roadmap FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id),
  CONSTRAINT fk_collaborations_user FOREIGN KEY (collaborator_id) REFERENCES public.users(id)
);
CREATE TABLE public.comments (
  id integer NOT NULL DEFAULT nextval('comments_id_seq'::regclass),
  roadmap_id integer NOT NULL,
  user_id integer NOT NULL,
  comment text NOT NULL CHECK (length(TRIM(BOTH FROM comment)) > 0),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_comments_roadmap FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id),
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id integer NOT NULL DEFAULT nextval('notifications_id_seq'::regclass),
  user_id integer NOT NULL,
  message text NOT NULL CHECK (length(TRIM(BOTH FROM message)) > 0),
  read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.roadmap_tags (
  id integer NOT NULL DEFAULT nextval('roadmap_tags_id_seq'::regclass),
  roadmap_id integer NOT NULL,
  tag_id integer NOT NULL,
  CONSTRAINT roadmap_tags_pkey PRIMARY KEY (id),
  CONSTRAINT fk_roadmap_tags_roadmap FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id),
  CONSTRAINT fk_roadmap_tags_tag FOREIGN KEY (tag_id) REFERENCES public.tags(id)
);
CREATE TABLE public.roadmaps (
  id integer NOT NULL DEFAULT nextval('roadmaps_id_seq'::regclass),
  title character varying NOT NULL CHECK (length(TRIM(BOTH FROM title)) > 0),
  description text,
  json_data jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT roadmaps_pkey PRIMARY KEY (id)
);
CREATE TABLE public.roadmaps_branches (
  id integer NOT NULL DEFAULT nextval('roadmaps_branches_id_seq'::regclass),
  parent_roadmap_id integer NOT NULL,
  child_roadmap_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT roadmaps_branches_pkey PRIMARY KEY (id),
  CONSTRAINT fk_branches_parent FOREIGN KEY (parent_roadmap_id) REFERENCES public.roadmaps(id),
  CONSTRAINT fk_branches_child FOREIGN KEY (child_roadmap_id) REFERENCES public.roadmaps(id)
);
CREATE TABLE public.tags (
  id integer NOT NULL DEFAULT nextval('tags_id_seq'::regclass),
  name character varying NOT NULL UNIQUE CHECK (length(TRIM(BOTH FROM name)) > 0),
  CONSTRAINT tags_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_progress (
  id integer NOT NULL DEFAULT nextval('user_progress_id_seq'::regclass),
  user_id integer NOT NULL,
  roadmap_id integer NOT NULL,
  progress_state character varying NOT NULL DEFAULT 'not_started'::character varying CHECK (progress_state::text = ANY (ARRAY['not_started'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'paused'::character varying]::text[])),
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_progress_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_progress_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_user_progress_roadmap FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id)
);
CREATE TABLE public.user_roadmap (
  id integer NOT NULL DEFAULT nextval('user_roadmap_id_seq'::regclass),
  user_id integer NOT NULL,
  roadmap_id integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT user_roadmap_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_roadmap_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_user_roadmap_roadmap FOREIGN KEY (roadmap_id) REFERENCES public.roadmaps(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying NOT NULL UNIQUE CHECK (length(username::text) >= 3),
  email character varying NOT NULL UNIQUE CHECK (email::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  password_hash character varying NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);