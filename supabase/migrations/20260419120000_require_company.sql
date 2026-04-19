-- Make company required on signups (matches frontend + API validation)
alter table public.signups
  alter column company set not null;
