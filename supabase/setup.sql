-- Supabase schema for LSP workforce management

create extension if not exists "uuid-ossp";

create table if not exists employees (
  id serial primary key,
  name text not null,
  email text not null unique,
  role text not null check (role in ('hr_admin', 'team_leader', 'employee')),
  department text not null default 'Operations',
  position text not null default 'Employee',
  team text,
  phone_number text,
  hire_date date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  pto_balance integer default 0,
  sick_leave_balance integer default 0,
  address text,
  emergency_contact jsonb,
  created_at timestamptz not null default now()
);

create table if not exists schedules (
  id serial primary key,
  employee_email text not null,
  work_date date not null,
  shift text not null,
  team text,
  created_at timestamptz not null default now(),
  constraint fk_employee_email foreign key(employee_email) references employees(email) on delete cascade
);

create table if not exists pto_requests (
  id serial primary key,
  employee_email text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  constraint fk_pto_employee_email foreign key(employee_email) references employees(email) on delete cascade
);
