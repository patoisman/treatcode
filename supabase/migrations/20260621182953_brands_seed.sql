
insert into public.brands
  (name, slug, description, min_redemption_pence, max_redemption_pence, allowed_denominations, is_active)
values
  ('ASOS',    'asos',    'Fashion and beauty for 20-somethings — clothing, footwear, and accessories.',
   1000, 25000, null,
   true),
  ('Nike',    'nike',    'Performance sportswear, trainers, and lifestyle footwear.',
   1000, 20000, array[1000, 2500, 5000, 10000, 15000, 20000],
   true),
  ('Zara',    'zara',    'Contemporary fashion for women, men, and kids.',
   1000, 10000, array[1000, 2500, 5000, 10000],
   true),
  ('Amazon',  'amazon',  'Millions of products — books, tech, home essentials and more.',
   1000, 50000, null,
   true),
  ('Apple',   'apple',   'Apps, music, films, TV, iCloud storage and Apple accessories.',
   1500, 25000, array[1500, 2500, 5000, 10000, 15000, 25000],
   true),
  ('Sephora', 'sephora', 'Premium beauty, skincare, fragrance, and cosmetics.',
   1000, 15000, array[1000, 2500, 5000, 10000, 15000],
   true),
  ('Adidas',  'adidas',  'Sportswear, trainers, and streetwear from Three Stripes.',
   1000, 20000, array[1000, 2500, 5000, 10000, 15000, 20000],
   true),
  ('H&M',     'hm',      'Affordable fashion for the whole family.',
   1000, 10000, array[1000, 2500, 5000, 10000],
   true);
