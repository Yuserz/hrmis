-- Users table for authentication and basic user information, linked to auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'staff')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Personal Data Sheet (PDS) table based on CSC Form 212 Revised 2017
CREATE TABLE public.pds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    personal_information JSONB NOT NULL,
    family_background JSONB,
    educational_background JSONB,
    civil_service_eligibility JSONB,
    work_experience JSONB,
    voluntary_work JSONB,
    training_programs JSONB,
    other_information JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Leave Credits table
CREATE TABLE public.leave_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Dynamically add leaves
CREATE TABLE public.leave_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Leave Applications table
CREATE TABLE public.leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    leave_id UUID REFERENCES leave_categories(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'disapproved')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Attendance table for monthly attendance records
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    days_present INTEGER NOT NULL,
    days_absent INTEGER NOT NULL,
    tardiness_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Certificates table for storing generated certificate data
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certificate_type TEXT NOT NULL CHECK (certificate_type IN ('COE', 'ServiceRecord', 'NOSA', 'COEC')),
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Awards table for storing employee awards
CREATE TABLE public.awards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    award_type TEXT NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

 INSERT INTO storage.buckets (id, name, public, file_size_limit)
        VALUES ('avatars', 'avatars', TRUE, 5242880); -- 5MB limit

CREATE POLICY "Upload Select avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Insert avatars" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Upload Update avatars" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Delete avatars" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for each table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pds_updated_at
    BEFORE UPDATE ON public.pds
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_credits_updated_at
    BEFORE UPDATE ON public.leave_credits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
    BEFORE UPDATE ON public.leave_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_categories_updated_at
    BEFORE UPDATE ON public.leave_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_awards_updated_at
    BEFORE UPDATE ON public.awards
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate leave credits based on attendance
CREATE OR REPLACE FUNCTION public.calculate_monthly_leave_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.days_absent = 0 THEN
        INSERT INTO public.leave_credits (user_id, credits, created_at)
        VALUES (NEW.user_id, 3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id)
        DO UPDATE SET credits = public.leave_credits.credits + 3,
                     updated_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for leave credits calculation
CREATE TRIGGER trigger_calculate_leave_credits
    AFTER INSERT ON public.attendance
    FOR EACH ROW
    WHEN (NEW.archived_at IS NULL)
    EXECUTE FUNCTION public.calculate_monthly_leave_credits();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role)
    VALUES (NEW.id, NEW.email, 'employee')
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

-- Row-Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY admin_all_users ON public.users
    FOR ALL
    TO authenticated
    USING (role = 'admin' AND archived_at IS NULL)
    WITH CHECK (role = 'admin');

CREATE POLICY insert_users ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (role = 'admin');

CREATE POLICY employee_own_account ON public.users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() AND archived_at IS NULL);

CREATE POLICY update_employee_own_account ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid() AND archived_at IS NULL)
    WITH CHECK (id = auth.uid());


CREATE POLICY staff_manage_users ON public.users
    FOR ALL
    TO authenticated
    USING (role = 'staff' AND archived_at IS NULL)
    WITH CHECK (role = 'staff');

CREATE POLICY all_leave_categories ON public.leave_categories
    FOR ALL
    TO authenticated
    USING (
      archived_at IS NULL
    ) WITH CHECK(
      archived_at IS NULL
    );


CREATE POLICY select_leave_categories ON public.leave_categories
    FOR SELECT
    TO authenticated
    USING (
      archived_at IS NULL
    );

CREATE POLICY insert_leave_categories ON public.leave_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
      archived_at IS NULL
    );

CREATE POLICY update_leave_categories ON public.leave_categories
    FOR UPDATE
    TO authenticated
    USING (
      archived_at IS NULL
    );

-- PDS table policies
CREATE POLICY admin_all_pds ON public.pds
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text)) AND archived_at IS NULL
    )
    WITH CHECK (
      ((( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY insert_employee_pds ON public.pds
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND archived_at IS NULL);

CREATE POLICY update_employee_own_certificates ON public.pds
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL 
    OR ((( SELECT users_1.role
     FROM users users_1
    WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_pds ON public.pds
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL)
    WITH CHECK (user_id = auth.uid());



-- Leave Credits table policies
CREATE POLICY admin_all_leave_credits ON public.leave_credits
    FOR SELECT
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY insert_leave_credits ON public.leave_credits
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND archived_at IS NULL);

CREATE POLICY update_leave_credits ON public.leave_credits
    FOR INSERT
    TO authenticated
    WITH CHECK (
      user_id = auth.uid() AND archived_at IS NULL OR 
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_leave_credits ON public.leave_credits
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

-- Leave Applications table policies
CREATE POLICY admin_all_leave_applications ON public.leave_applications
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    )
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_leave_applications ON public.leave_applications
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL)
    WITH CHECK (user_id = auth.uid());

-- Attendance table policies
CREATE POLICY admin_all_attendance ON public.attendance
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    )
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );


-- Certificates table policies
CREATE POLICY admin_all_certificates ON public.certificates
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    )
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_certificates ON public.certificates
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

CREATE POLICY insert_employee_own_certificates ON public.certificates
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND archived_at IS NULL);

    
CREATE POLICY update_employee_own_certificates ON public.certificates
    FOR UPDATE
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND archived_at IS NULL);

-- Awards table policies
CREATE POLICY admin_all_awards ON public.awards
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text)) AND archived_at IS NULL
    )
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_awards ON public.awards
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

-- Function to generate yearly awards
CREATE OR REPLACE FUNCTION public.generate_yearly_awards(p_year INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.awards (user_id, award_type, year, created_at)
    SELECT 
        a.user_id,
        'Perfect Attendance' AS award_type,
        p_year AS year,
        CURRENT_TIMESTAMP
    FROM public.active_attendance a
    WHERE EXTRACT(YEAR FROM a.month) = p_year
    AND a.days_absent = 0
    AND a.tardiness_count = 0
    GROUP BY a.user_id
    HAVING COUNT(*) = 12;
END;
$$ language 'plpgsql';

-- Example CSV import function for attendance
CREATE OR REPLACE FUNCTION public.import_attendance_csv(p_csv_data TEXT)
RETURNS VOID AS $$
DECLARE
    v_row TEXT;
    v_user_id UUID;
    v_month DATE;
    v_days_present INTEGER;
    v_days_absent INTEGER;
    v_tardiness_count INTEGER;
BEGIN
    FOR v_row IN (SELECT unnest(string_to_array(p_csv_data, '\n')) AS row)
    LOOP
        -- Assuming CSV format: user_id,month,days_present,days_absent,tardiness_count
        SELECT 
            split_part(v_row, ',', 1)::uuid,
            split_part(v_row, ',', 2)::DATE,
            split_part(v_row, ',', 3)::INTEGER,
            split_part(v_row, ',', 4)::INTEGER,
            split_part(v_row, ',', 5)::INTEGER
        INTO v_user_id, v_month, v_days_present, v_days_absent, v_tardiness_count;

        INSERT INTO public.attendance (user_id, month, days_present, days_absent, tardiness_count, created_at)
        VALUES (v_user_id, v_month, v_days_present, v_days_absent, v_tardiness_count, CURRENT_TIMESTAMP);
    END LOOP;
END;
$$ language 'plpgsql';
