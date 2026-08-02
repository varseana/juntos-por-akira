-- ============================================================================
-- Juntos por Akira - Carga inicial de compradores y donaciones ya registrados
--
-- Ejecutar UNA vez en: Supabase Dashboard > SQL Editor > New query > Run.
-- Requisito: haber corrido antes supabase/schema.sql (crea buyer_phone y
-- la tabla donations).
--
-- Los telefonos aun no se conocen, por eso quedan en null. Cuando la persona
-- te escriba, los agregas desde el panel de seguimiento y se agrupan solos.
-- Es idempotente: se puede volver a ejecutar sin duplicar nada.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Numeros vendidos (34 numeros, 13 personas).
-- ---------------------------------------------------------------------------
update public.raffle_numbers as r
set status = 'sold',
    buyer_name = v.buyer_name
from (
  values
    (5,   'Amanda'),
    (3,   'Jeremy Andrey Villa'),
    (28,  'Jeremy Andrey Villa'),
    (9,   'Jessica Vanessa Arias'),
    (26,  'Jessica Vanessa Arias'),
    (30,  'Katherine Valeria'),
    (146, 'Katherine Valeria'),
    (177, 'Katherine Valeria'),
    (260, 'Katherine Valeria'),
    (15,  'Luis Vasquez'),
    (99,  'Luis Vasquez'),
    (206, 'Meiling'),
    (8,   'Miranda Villalobos'),
    (84,  'Miranda Villalobos'),
    (56,  'Montero'),
    (57,  'Montero'),
    (59,  'Montero'),
    (65,  'Montero'),
    (67,  'Montero'),
    (25,  'Nazaret Godinez'),
    (77,  'Nazaret Godinez'),
    (89,  'Nazaret Godinez'),
    (197, 'Nazaret Godinez'),
    (222, 'Nazaret Godinez'),
    (7,   'Ramirez Barrantes M'),
    (19,  'Ramirez Barrantes M'),
    (95,  'Rowdy'),
    (111, 'Rowdy'),
    (178, 'Rowdy'),
    (282, 'Rowdy'),
    (4,   'Tania'),
    (22,  'Tania'),
    (27,  'Tania'),
    (20,  'Victor'),
    (21,  'Victor'),
    (23,  'Victor')
) as v (n, buyer_name)
where r.n = v.n;

-- ---------------------------------------------------------------------------
-- 2. Mensajes de agradecimiento del ticker (uno por persona).
--    Solo se insertan si el mensaje no existe ya.
-- ---------------------------------------------------------------------------
insert into public.ticker_messages (message)
select m.message
from (
  values
    ('Gracias Amanda por tu granito de arena'),
    ('Gracias por el apoyo Jeremy Andrey Villa'),
    ('Gracias de corazon Jessica Vanessa Arias'),
    ('Gracias Katherine Valeria por tu granito de arena'),
    ('Gracias por el apoyo Luis Vasquez'),
    ('Gracias de corazon Meiling'),
    ('Gracias Miranda Villalobos por tu granito de arena'),
    ('Gracias por el apoyo Montero'),
    ('Gracias de corazon Nazaret Godinez'),
    ('Gracias Ramirez Barrantes M por tu granito de arena'),
    ('Gracias por el apoyo Rowdy'),
    ('Gracias de corazon Tania'),
    ('Gracias Victor por tu granito de arena'),
    ('Gracias Angelo David Blando por tu granito de arena'),
    ('Gracias por el apoyo Nunez Bosa Juan')
) as m (message)
where not exists (
  select 1 from public.ticker_messages t where t.message = m.message
);

-- ---------------------------------------------------------------------------
-- 3. Donaciones sin numero.
-- ---------------------------------------------------------------------------
insert into public.donations (donor_name, amount, message)
select d.donor_name, d.amount, d.message
from (
  values
    ('Angelo David Blando', 5000, 'con mucho amor'),
    ('Nunez Bosa Juan', 2000, 'para Akira de Felix')
) as d (donor_name, amount, message)
where not exists (
  select 1 from public.donations x where x.donor_name = d.donor_name
);

-- ---------------------------------------------------------------------------
-- 4. Verificacion rapida. Debe devolver 34 vendidos y 2 donaciones.
-- ---------------------------------------------------------------------------
select
  (select count(*) from public.raffle_numbers where status = 'sold') as vendidos,
  (select count(distinct buyer_name) from public.raffle_numbers where status = 'sold') as personas,
  (select count(*) from public.donations) as donaciones,
  (select coalesce(sum(amount), 0) from public.donations) as colones_donados;
