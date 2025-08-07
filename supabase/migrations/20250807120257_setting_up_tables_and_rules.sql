-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name text,
    gender text CHECK (gender IN ('male', 'female', 'others')),
    address text,
    phone text,
    avatar text,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

 INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('avatars', 'avatars', TRUE, 5242880); -- 5MB limit

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Upload Select avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Insert avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Upload Update avatars" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Delete avatars" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');


-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT
    USING (
      ((auth.uid() = id) AND (role = 'user'::text))
    );

CREATE POLICY "Users can edit their own profile" ON users
    FOR UPDATE
    USING (
      true
    );

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage users" ON users
    FOR ALL
    USING (
      ((( SELECT users_1.role
        FROM auth.users users_1
        WHERE (users_1.id = auth.uid())))::text = 'admin'::text)
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'user')
    ON CONFLICT (email) DO UPDATE
    SET email = NEW.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
