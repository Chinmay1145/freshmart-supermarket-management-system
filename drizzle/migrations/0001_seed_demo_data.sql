-- Categories
insert into public.categories (name, description) values
 ('Groceries','Staples, rice, flour, pulses and spices'),
 ('Dairy','Milk, curd, butter, cheese'),
 ('Beverages','Tea, coffee, juices and soft drinks'),
 ('Snacks','Biscuits, chips and namkeen'),
 ('Personal Care','Soap, shampoo, oral care'),
 ('Household','Cleaning and home essentials'),
 ('Fruits & Vegetables','Fresh produce');

insert into public.categories (name, description, parent_id)
select v.name, v.description, c.id from (values
 ('Rice','Basmati and everyday rice','Groceries'),
 ('Flour','Atta and maida','Groceries'),
 ('Spices','Masala and whole spices','Groceries'),
 ('Pulses','Dals and legumes','Groceries')
) as v(name, description, parent) join public.categories c on c.name = v.parent;

-- Suppliers
insert into public.suppliers (name, company, phone, email, address, gst_number, payment_terms, outstanding_amount) values
 ('Rajesh Kumar','Shree Agro Distributors','+91 98200 11223','rajesh@shreeagro.in','Plot 12, MIDC, Pune','27AAACS1234A1Z5','Net 30', 48250.00),
 ('Anita Deshmukh','Sunrise Dairy Pvt Ltd','+91 98220 55441','anita@sunrisedairy.in','Dairy Road, Nashik','27AABCD9876B1Z2','Net 15', 12400.00),
 ('Mohan Iyer','Global Beverages Co','+91 99870 33221','mohan@globalbev.in','Sector 8, Navi Mumbai','27AACCG4567C1Z9','Net 45', 0.00),
 ('Farida Sheikh','CleanHome Supplies','+91 98111 77889','farida@cleanhome.in','Andheri East, Mumbai','27AADCC1122D1Z1','Net 30', 22600.00),
 ('Vikram Patil','FreshFarm Produce','+91 98333 66554','vikram@freshfarm.in','Market Yard, Pune','27AAEFF3344E1Z4','Net 7', 8750.00);

-- Products
insert into public.products (name, sku, barcode, category_id, supplier_id, brand, unit, purchase_price, selling_price, mrp, tax_rate, stock, min_stock, max_stock, expiry_date)
select p.name, p.sku, p.barcode,
 (select id from public.categories where name = p.cat and parent_id is null),
 (select id from public.suppliers where company = p.sup),
 p.brand, p.unit, p.pp, p.sp, p.mrp, p.tax, p.stock, p.minstock, p.maxstock, p.exp::date
from (values
 ('Basmati Rice 5kg','SKU-RICE-5KG','8901234500011','Groceries','Shree Agro Distributors','India Gate','pack',420,499,549,5,86,20,300,'2027-06-30'),
 ('Wheat Flour 5kg','SKU-ATTA-5KG','8901234500028','Groceries','Shree Agro Distributors','Aashirvaad','pack',215,265,289,5,64,20,300,'2026-12-31'),
 ('Tata Salt 1kg','SKU-SALT-1KG','8901234500035','Groceries','Shree Agro Distributors','Tata','pack',22,28,30,5,180,40,600,'2028-01-31'),
 ('Toor Dal 1kg','SKU-DAL-1KG','8901234500042','Groceries','Shree Agro Distributors','Organic Tattva','kg',132,159,175,5,48,25,250,'2026-11-30'),
 ('Sunflower Cooking Oil 1L','SKU-OIL-1L','8901234500059','Groceries','Shree Agro Distributors','Fortune','liter',118,145,159,5,96,30,300,'2026-10-31'),
 ('Milk 1L','SKU-MILK-1L','8901234500066','Dairy','Sunrise Dairy Pvt Ltd','Amul','liter',52,62,64,0,42,50,400,'2026-09-20'),
 ('Butter 500g','SKU-BUTR-500','8901234500073','Dairy','Sunrise Dairy Pvt Ltd','Amul','pack',245,285,299,12,26,15,120,'2026-12-15'),
 ('Curd 400g','SKU-CURD-400','8901234500080','Dairy','Sunrise Dairy Pvt Ltd','Mother Dairy','pack',28,35,38,0,18,20,150,'2026-09-18'),
 ('Bread 400g','SKU-BRED-400','8901234500097','Groceries','Sunrise Dairy Pvt Ltd','Britannia','pack',32,40,42,5,35,25,150,'2026-09-16'),
 ('Tea 250g','SKU-TEA-250','8901234500103','Beverages','Global Beverages Co','Tata Tea Gold','pack',148,185,199,5,72,20,250,'2027-03-31'),
 ('Coffee 200g','SKU-COFF-200','8901234500110','Beverages','Global Beverages Co','Bru','pack','215',265,285,18,31,15,150,'2027-05-31'),
 ('Soft Drink 750ml','SKU-SOFT-750','8901234500127','Beverages','Global Beverages Co','Coca-Cola','piece',30,40,45,28,120,40,500,'2026-12-01'),
 ('Biscuits 300g','SKU-BISC-300','8901234500134','Snacks','Global Beverages Co','Parle-G','pack',38,50,55,18,150,40,500,'2027-01-31'),
 ('Potato Chips 100g','SKU-CHIP-100','8901234500141','Snacks','Global Beverages Co','Lays','pack',15,20,20,18,9,30,400,'2026-10-10'),
 ('Shampoo 340ml','SKU-SHMP-340','8901234500158','Personal Care','CleanHome Supplies','Dove','piece',245,299,325,18,44,15,150,'2028-02-28'),
 ('Bath Soap 125g','SKU-SOAP-125','8901234500165','Personal Care','CleanHome Supplies','Lux','piece',32,42,45,18,210,50,600,'2028-04-30'),
 ('Toothpaste 150g','SKU-TPST-150','8901234500172','Personal Care','CleanHome Supplies','Colgate','piece',82,105,115,18,68,25,300,'2028-03-31'),
 ('Detergent Powder 1kg','SKU-DETG-1KG','8901234500189','Household','CleanHome Supplies','Surf Excel','pack',132,169,185,18,0,20,200,'2028-06-30'),
 ('Dishwash Liquid 750ml','SKU-DISH-750','8901234500196','Household','CleanHome Supplies','Vim','piece',115,145,159,18,52,20,200,'2028-05-31'),
 ('Tomato 1kg','SKU-TOMT-1KG','8901234500202','Fruits & Vegetables','FreshFarm Produce','Local','kg',24,36,40,0,58,30,200,'2026-09-15'),
 ('Onion 1kg','SKU-ONIN-1KG','8901234500219','Fruits & Vegetables','FreshFarm Produce','Local','kg',22,32,35,0,74,30,200,'2026-09-22'),
 ('Banana 1 dozen','SKU-BANA-12','8901234500226','Fruits & Vegetables','FreshFarm Produce','Local','pack',38,54,60,0,12,20,120,'2026-09-14')
) as p(name, sku, barcode, cat, sup, brand, unit, pp, sp, mrp, tax, stock, minstock, maxstock, exp);

-- Customers
insert into public.customers (name, phone, email, address, loyalty_points, total_purchases, last_purchase_at) values
 ('Walk-in Customer',null,null,null,0,0,null),
 ('Priya Sharma','+91 98765 12345','priya.sharma@gmail.com','Kothrud, Pune',1240,48250,now() - interval '1 day'),
 ('Amit Verma','+91 99887 65432','amit.verma@gmail.com','Baner, Pune',860,32100,now() - interval '3 day'),
 ('Sneha Nair','+91 90045 22118','sneha.nair@gmail.com','Viman Nagar, Pune',430,17800,now() - interval '6 day'),
 ('Rahul Joshi','+91 97654 33210','rahul.joshi@gmail.com','Hadapsar, Pune',2110,76400,now() - interval '2 day'),
 ('Fatima Khan','+91 93456 77012','fatima.khan@gmail.com','Camp, Pune',150,5400,now() - interval '12 day');

-- Employees
insert into public.employees (employee_code, name, email, phone, role, department, joining_date, salary) values
 ('EMP-001','Arjun Mehta','arjun@freshmart.in','+91 98100 11111','super_admin','Administration','2022-04-01',95000),
 ('EMP-002','Kavita Rao','kavita@freshmart.in','+91 98100 22222','manager','Operations','2022-09-15',62000),
 ('EMP-003','Sanjay Pawar','sanjay@freshmart.in','+91 98100 33333','cashier','Billing','2023-01-10',28000),
 ('EMP-004','Neha Gupta','neha@freshmart.in','+91 98100 44444','cashier','Billing','2023-06-05',27000),
 ('EMP-005','Imran Shaikh','imran@freshmart.in','+91 98100 55555','inventory_staff','Warehouse','2023-03-20',31000);

-- Sales for the last 45 days
insert into public.sales (invoice_number, customer_id, customer_name, cashier_name, subtotal, discount_amount, tax_amount, total, amount_paid, payment_method, status, created_at)
select
  'INV-' || to_char(now() - (g || ' days')::interval, 'YYMMDD') || '-' || lpad(s::text, 3, '0'),
  c.id, c.name,
  (array['Sanjay Pawar','Neha Gupta','Kavita Rao'])[1 + ((g + s) % 3)],
  base, round(base * 0.03, 2), round(base * 0.05, 2), round(base * 1.02, 2), round(base * 1.02, 2),
  (array['cash','card','upi','wallet'])[1 + ((g * s) % 4)]::public.payment_method,
  'completed',
  now() - (g || ' days')::interval + (s || ' hours')::interval
from generate_series(0, 44) g
cross join generate_series(1, 6) s
cross join lateral (select round((350 + ((g * 37 + s * 113) % 2600))::numeric, 2) as base) b
join lateral (select id, name from public.customers order by md5(g::text || s::text) limit 1) c on true;

-- Sale items
insert into public.sale_items (sale_id, product_id, product_name, sku, quantity, unit_price, discount, tax_rate, total)
select s.id, p.id, p.name, p.sku, q.qty, p.selling_price, 0, p.tax_rate, round(p.selling_price * q.qty, 2)
from public.sales s
cross join lateral (
  select id, name, sku, selling_price, tax_rate from public.products
  order by md5(s.id::text || id::text) limit 3
) p
cross join lateral (select 1 + (('x' || substr(md5(s.id::text || p.id::text),1,8))::bit(32)::bigint % 4) as qty) q;

-- Purchases
insert into public.purchases (purchase_number, supplier_id, supplier_name, invoice_number, purchase_date, subtotal, tax_amount, total, status, payment_status)
select 'PO-' || lpad(row_number() over ()::text, 4, '0'), sp.id, sp.company, 'SUP-INV-' || (1000 + row_number() over ()),
  current_date - (row_number() over () * 4)::int,
  amt, round(amt * 0.05, 2), round(amt * 1.05, 2),
  (array['received','received','ordered','draft','partially_received'])[1 + (row_number() over ())::int % 5]::public.purchase_status,
  (array['paid','pending','partial'])[1 + (row_number() over ())::int % 3]
from public.suppliers sp
cross join lateral (select round((22000 + (random() * 45000))::numeric, 2) as amt) a;

insert into public.purchase_items (purchase_id, product_id, product_name, quantity, unit_cost, total)
select pu.id, p.id, p.name, 25, p.purchase_price, p.purchase_price * 25
from public.purchases pu
cross join lateral (select id, name, purchase_price from public.products order by md5(pu.id::text || id::text) limit 3) p;

-- Expenses
insert into public.expenses (title, category, amount, payment_method, description, expense_date, added_by) values
 ('Monthly store rent','Rent',185000,'bank_transfer','Rent for main outlet', current_date - 5,'Kavita Rao'),
 ('Electricity bill','Electricity',42800,'upi','MSEDCL August bill', current_date - 8,'Kavita Rao'),
 ('Staff salaries','Salary',243000,'bank_transfer','Monthly payroll', current_date - 10,'Arjun Mehta'),
 ('Delivery van fuel','Transportation',9600,'cash','Diesel refill', current_date - 2,'Imran Shaikh'),
 ('Freezer servicing','Maintenance',7200,'card','Annual maintenance', current_date - 14,'Imran Shaikh'),
 ('Festival banners','Marketing',15400,'upi','Ganesh Chaturthi promo', current_date - 6,'Kavita Rao'),
 ('Packaging bags','Miscellaneous',5300,'cash','Carry bags restock', current_date - 1,'Sanjay Pawar');

-- Discounts
insert into public.discounts (name, code, discount_type, value, start_date, end_date, min_purchase, max_discount, usage_limit, used_count, applies_to) values
 ('Festive 10% Off','FEST10','percentage',10, current_date - 5, current_date + 20, 1000, 500, 500, 128,'all'),
 ('Flat ₹100 Off','SAVE100','fixed',100, current_date - 15, current_date + 10, 1500, null, 300, 87,'all'),
 ('Dairy Weekend Deal','DAIRY5','percentage',5, current_date - 2, current_date + 5, 300, 150, null, 34,'Dairy'),
 ('Buy 2 Get 1 Snacks',null,'bxgy',1, current_date - 20, current_date - 1, 0, null, null, 210,'Snacks');

-- Returns
insert into public.returns (return_number, sale_id, invoice_number, customer_name, reason, refund_amount, status, processed_by)
select 'RET-' || lpad(row_number() over ()::text, 4, '0'), s.id, s.invoice_number, s.customer_name,
 (array['Damaged packaging','Expired product','Customer changed mind','Wrong item billed'])[1 + (row_number() over ())::int % 4],
 round(s.total * 0.25, 2),
 (array['completed','approved','requested','rejected'])[1 + (row_number() over ())::int % 4]::public.return_status,
 'Neha Gupta'
from (select * from public.sales order by created_at desc limit 6) s;

-- Inventory movements
insert into public.inventory_movements (product_id, product_name, movement_type, previous_qty, new_qty, difference, reason, performed_by)
select p.id, p.name, 'adjustment', p.stock + 10, p.stock, -10, 'Stock audit correction', 'Imran Shaikh'
from public.products p limit 8;

-- Notifications
insert into public.notifications (title, message, type) values
 ('Out of stock','Detergent Powder 1kg is out of stock','error'),
 ('Low stock alert','Potato Chips 100g has only 9 units left','warning'),
 ('Low stock alert','Banana 1 dozen has only 12 units left','warning'),
 ('Expiring soon','Curd 400g expires within 14 days','warning'),
 ('Supplier payment pending','₹48,250 outstanding to Shree Agro Distributors','info'),
 ('High value sale','Invoice above ₹5,000 completed at counter 2','success');

-- Audit logs
insert into public.audit_logs (user_email, action, module, entity, details) values
 ('arjun@freshmart.in','Updated product price','Products','Basmati Rice 5kg','₹479 to ₹499'),
 ('sanjay@freshmart.in','Completed sale','POS','INV-250912-004','Total ₹2,340'),
 ('kavita@freshmart.in','Approved refund','Returns','RET-0002','₹560 refunded'),
 ('imran@freshmart.in','Adjusted stock','Inventory','Milk 1L','52 to 42');
