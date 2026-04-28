create table if not exists public.players (
  id bigserial primary key,
  full_name text not null,
  elo integer not null default 1200,
  is_active boolean not null default true,
  is_present boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists players_full_name_ci_unique
  on public.players ((lower(full_name)));

create index if not exists players_active_present_idx
  on public.players (is_active, is_present);

create table if not exists public.matches (
  id bigserial primary key,
  round_number integer not null check (round_number > 0),
  white_player_id bigint not null references public.players(id) on delete restrict,
  black_player_id bigint references public.players(id) on delete restrict,
  white_score numeric(2, 1),
  black_score numeric(2, 1),
  is_bye boolean not null default false,
  white_bye boolean not null default false,
  black_bye boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint matches_white_black_different
    check (black_player_id is null or white_player_id <> black_player_id),

  constraint matches_scores_allowed
    check (
      (white_score is null or white_score in (0, 0.5, 1)) and
      (black_score is null or black_score in (0, 0.5, 1))
    ),

  constraint matches_bye_and_scores_consistency
    check (
      (
        is_bye = false and
        black_player_id is not null and
        (
          (white_score is null and black_score is null)
          or
          (
            white_score is not null and black_score is not null and white_score + black_score = 1.0
          )
        )
      )
      or
      (
        is_bye = true and
        black_player_id is null and
        black_score is null and
        white_bye = true and
        black_bye = false and
        (
          white_score is null or
          white_score = 1
        )
      )
    ),

  constraint matches_bye_flags_only_with_players
    check (
      black_player_id is not null or (white_bye = true and black_bye = false)
    )
);

create index if not exists matches_round_idx
  on public.matches (round_number);

create index if not exists matches_white_idx
  on public.matches (white_player_id);

create index if not exists matches_black_idx
  on public.matches (black_player_id);

create index if not exists matches_round_white_idx
  on public.matches (round_number, white_player_id);

create index if not exists matches_round_black_idx
  on public.matches (round_number, black_player_id);

create or replace function public.set_matches_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists matches_set_updated_at on public.matches;

create trigger matches_set_updated_at
before update on public.matches
for each row
execute function public.set_matches_updated_at();
