-- migration 20260321160000_initial_schema.sql

-- tables
CREATE TABLE businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id),
  email text,
  phone text,
  address text,
  city text,
  plan text DEFAULT 'basic',
  subscription_status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  business_id uuid REFERENCES businesses(id),
  name text,
  email text,
  role text CHECK (role IN ('admin', 'employee', 'customer', 'super_admin')),
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  name text NOT NULL,
  email text,
  phone text,
  notes text,
  total_visits integer DEFAULT 0,
  last_visit_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  profile_id uuid REFERENCES profiles(id),
  position text,
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  duration_minutes integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  customer_id uuid REFERENCES customers(id),
  service_id uuid REFERENCES services(id),
  employee_id uuid REFERENCES employees(id),
  reservation_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  name text NOT NULL,
  price numeric(10,2) NOT NULL,
  sku text,
  category text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  product_id uuid REFERENCES products(id),
  current_stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  product_id uuid REFERENCES products(id),
  type text CHECK (type IN ('in', 'out')),
  quantity integer NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE staff_shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  employee_id uuid REFERENCES employees(id),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  title text NOT NULL,
  description text,
  assigned_to uuid REFERENCES employees(id),
  due_date date,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id),
  user_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  message text,
  type text DEFAULT 'email',
  status text DEFAULT 'pending',
  scheduled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper Function for RLS
CREATE OR REPLACE FUNCTION get_user_business_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid();
$$;

-- RLS Policies
-- Profiles: Users can view profiles in their own business
CREATE POLICY "Users view profiles in their business" ON profiles FOR SELECT USING (business_id = get_user_business_id() OR id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Businesses: Admin can see their own business
CREATE POLICY "Users can view their own business" ON businesses FOR SELECT USING (id = get_user_business_id());
CREATE POLICY "Super admins and owners can update business" ON businesses FOR UPDATE USING (id = get_user_business_id());

-- Customers
CREATE POLICY "Users can access customers of their business" ON customers FOR ALL USING (business_id = get_user_business_id());

-- Employees
CREATE POLICY "Users can access employees of their business" ON employees FOR ALL USING (business_id = get_user_business_id());

-- Services
CREATE POLICY "Users can access services of their business" ON services FOR ALL USING (business_id = get_user_business_id());
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (active = true);

-- Reservations
CREATE POLICY "Users can access reservations of their business" ON reservations FOR ALL USING (business_id = get_user_business_id());

-- Products
CREATE POLICY "Users can access products of their business" ON products FOR ALL USING (business_id = get_user_business_id());

-- Inventory
CREATE POLICY "Users can access inventory of their business" ON inventory FOR ALL USING (business_id = get_user_business_id());

-- Inventory Movements
CREATE POLICY "Users can access inventory movements of their business" ON inventory_movements FOR ALL USING (business_id = get_user_business_id());

-- Staff Shifts
CREATE POLICY "Users can access staff shifts of their business" ON staff_shifts FOR ALL USING (business_id = get_user_business_id());

-- Tasks
CREATE POLICY "Users can access tasks of their business" ON tasks FOR ALL USING (business_id = get_user_business_id());

-- Notifications
CREATE POLICY "Users can access notifications of their business" ON notifications FOR ALL USING (business_id = get_user_business_id());

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER staff_shifts_updated_at BEFORE UPDATE ON staff_shifts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger for business and profile creation on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_business_id uuid;
BEGIN
  -- We assume the new user creates a business at signup
  -- The app might pass metadata (e.g., raw_user_meta_data->>'business_name')
  
  INSERT INTO public.businesses (name, owner_user_id, email)
  VALUES (
    COALESCE(new.raw_user_meta_data->>'business_name', 'My Business'),
    new.id,
    new.email
  ) RETURNING id INTO new_business_id;

  INSERT INTO public.profiles (id, business_id, name, email, role)
  VALUES (
    new.id,
    new_business_id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'admin'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
