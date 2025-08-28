-- Enabling necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and basic user information, linked to auth.users
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id TEXT UNIQUE, -- New column for employee ID from .dat file
    username TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'employee', 'staff')),
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users table
CREATE INDEX idx_users_employee_id ON public.users(employee_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_archived_at ON public.users(archived_at);

-- Biometrics table for raw attendance logs
CREATE TABLE public.biometrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES users(employee_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    type INTEGER NOT NULL CHECK (type IN (1, 2, 15)), -- 1=login, 2=logout, 15=manual login
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for biometrics table
CREATE INDEX idx_biometrics_employee_id ON public.biometrics(employee_id);
CREATE INDEX idx_biometrics_timestamp ON public.biometrics(timestamp);
CREATE INDEX idx_biometrics_type ON public.biometrics(type);

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

-- Indexes for pds table
CREATE INDEX idx_pds_user_id ON public.pds(user_id);
CREATE INDEX idx_pds_archived_at ON public.pds(archived_at);
CREATE INDEX idx_pds_personal_information ON public.pds USING GIN (personal_information);

-- Leave Credits table
CREATE TABLE public.leave_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for leave_credits table
CREATE UNIQUE INDEX idx_leave_credits_user_id ON public.leave_credits(user_id);
CREATE INDEX idx_leave_credits_archived_at ON public.leave_credits(archived_at);

-- Leave Categories table
CREATE TABLE public.leave_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for leave_categories table
CREATE INDEX idx_leave_categories_name ON public.leave_categories(name);
CREATE INDEX idx_leave_categories_archived_at ON public.leave_categories(archived_at);

-- Leave Applications table
CREATE TABLE public.leave_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    leave_id UUID REFERENCES leave_categories(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'disapproved' , 'cancelled')),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for leave_applications table
CREATE INDEX idx_leave_applications_user_id ON public.leave_applications(user_id);
CREATE INDEX idx_leave_applications_leave_id ON public.leave_applications(leave_id);
CREATE INDEX idx_leave_applications_status ON public.leave_applications(status);
CREATE INDEX idx_leave_applications_start_date ON public.leave_applications(start_date);
CREATE INDEX idx_leave_applications_end_date ON public.leave_applications(end_date);
CREATE INDEX idx_leave_applications_archived_at ON public.leave_applications(archived_at);

-- Attendance table for monthly attendance records
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id TEXT REFERENCES users(employee_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    days_present INTEGER NOT NULL,
    days_absent INTEGER NOT NULL,
    tardiness_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for attendance table
CREATE INDEX idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_attendance_month ON public.attendance(month);
CREATE INDEX idx_attendance_days_absent ON public.attendance(days_absent);
CREATE INDEX idx_attendance_tardiness_count ON public.attendance(tardiness_count);
CREATE INDEX idx_attendance_archived_at ON public.attendance(archived_at);

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

-- Indexes for certificates table
CREATE INDEX idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX idx_certificates_certificate_type ON public.certificates(certificate_type);
CREATE INDEX idx_certificates_archived_at ON public.certificates(archived_at);
CREATE INDEX idx_certificates_data ON public.certificates USING GIN (data);

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

-- Indexes for awards table
CREATE INDEX idx_awards_user_id ON public.awards(user_id);
CREATE INDEX idx_awards_year ON public.awards(year);
CREATE INDEX idx_awards_archived_at ON public.awards(archived_at);

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('avatars', 'avatars', TRUE, 5242880); -- 5MB limit

CREATE POLICY "Upload Select avatars" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Insert avatars" ON storage.objects
    FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Upload Update avatars" ON storage.objects
    FOR UPDATE TO public USING (bucket_id = 'avatars');
CREATE POLICY "Upload Delete avatars" ON storage.objects
    FOR DELETE TO public USING (bucket_id = 'avatars');

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

CREATE TRIGGER update_biometrics_updated_at
    BEFORE UPDATE ON public.biometrics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pds_updated_at
    BEFORE UPDATE ON public.pds
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_credits_updated_at
    BEFORE UPDATE ON public.leave_credits
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_categories_updated_at
    BEFORE UPDATE ON public.leave_categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leave_applications_updated_at
    BEFORE UPDATE ON public.leave_applications
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

-- Function to import attendance from .dat file
CREATE OR REPLACE FUNCTION public.import_attendance_dat(p_dat_data TEXT)
RETURNS VOID AS $$
DECLARE
    v_row TEXT;
    v_employee_id TEXT;
    v_timestamp TIMESTAMP WITH TIME ZONE;
    v_device_id INTEGER;
    v_device_identifier INTEGER;
    v_type INTEGER;
    v_extra INTEGER;
    v_user_id UUID;
    v_month DATE;
    v_days_present INTEGER;
    v_days_absent INTEGER;
    v_tardiness_count INTEGER;
    v_workdays INTEGER;
BEGIN
    -- Create temporary table to store raw attendance logs
    CREATE TEMP TABLE temp_biometrics (
        employee_id TEXT,
        timestamp TIMESTAMP WITH TIME ZONE,
        type INTEGER
    );

    -- Parse tab-separated data and insert into temp table
    FOR v_row IN (SELECT unnest(string_to_array(p_dat_data, '\n')) AS row)
    LOOP
        SELECT 
            split_part(v_row, '\t', 1),
            split_part(v_row, '\t', 2)::TIMESTAMP WITH TIME ZONE,
            split_part(v_row, '\t', 3)::INTEGER,
            split_part(v_row, '\t', 4)::INTEGER,
            split_part(v_row, '\t', 5)::INTEGER,
            split_part(v_row, '\t', 6)::INTEGER
        INTO v_employee_id, v_timestamp, v_device_id, v_device_identifier, v_type, v_extra;

        IF v_employee_id IS NOT NULL AND v_timestamp IS NOT NULL AND v_type IN (1, 2, 15) THEN
            INSERT INTO temp_biometrics (employee_id, timestamp, type)
            VALUES (v_employee_id, v_timestamp, v_type);
        END IF;
    END LOOP;

    -- Insert into biometrics table
    INSERT INTO public.biometrics (employee_id, timestamp, type, created_at)
    SELECT t.employee_id, t.timestamp, t.type, CURRENT_TIMESTAMP
    FROM temp_biometrics t
    JOIN public.users u ON u.employee_id = t.employee_id
    WHERE u.archived_at IS NULL
    ON CONFLICT DO NOTHING;

    -- Aggregate attendance data by employee_id and month
    FOR v_employee_id, v_month IN
        SELECT employee_id, date_trunc('month', timestamp)::DATE
        FROM temp_biometrics
        GROUP BY employee_id, date_trunc('month', timestamp)
    LOOP
        -- Get user_id from users table
        SELECT id INTO v_user_id
        FROM public.users
        WHERE employee_id = v_employee_id AND archived_at IS NULL;

        IF v_user_id IS NOT NULL THEN
            -- Calculate workdays (Monday to Friday) in the month
            v_workdays := (
                SELECT COUNT(*)
                FROM generate_series(v_month, v_month + INTERVAL '1 month' - INTERVAL '1 day', INTERVAL '1 day') AS d
                WHERE EXTRACT(DOW FROM d) NOT IN (0, 6)
            );

            -- Calculate days_present, days_absent, and tardiness_count
            SELECT 
                COUNT(DISTINCT date_trunc('day', timestamp)) FILTER (WHERE type IN (1, 15)) AS days_present,
                v_workdays - COUNT(DISTINCT date_trunc('day', timestamp)) FILTER (WHERE type IN (1, 15)) AS days_absent,
                COUNT(*) FILTER (WHERE type IN (1, 15) AND timestamp::TIME > '08:00:00') AS tardiness_count
            INTO v_days_present, v_days_absent, v_tardiness_count
            FROM temp_biometrics
            WHERE employee_id = v_employee_id
            AND date_trunc('month', timestamp) = v_month;

            -- Insert or update attendance record
            INSERT INTO public.attendance (employee_id, user_id, month, days_present, days_absent, tardiness_count, created_at)
            VALUES (v_employee_id, v_user_id, v_month, v_days_present, v_days_absent, v_tardiness_count, CURRENT_TIMESTAMP)
            ON CONFLICT (employee_id, month)
            DO UPDATE SET
                days_present = EXCLUDED.days_present,
                days_absent = EXCLUDED.days_absent,
                tardiness_count = EXCLUDED.tardiness_count,
                updated_at = CURRENT_TIMESTAMP;
        ELSE
            RAISE NOTICE 'No user found for employee_id: %', v_employee_id;
        END IF;
    END LOOP;

    -- Drop temporary table
    DROP TABLE temp_biometrics;
END;
$$ language 'plpgsql' SECURITY DEFINER;

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
    FROM public.attendance a
    WHERE EXTRACT(YEAR FROM a.month) = p_year
    AND a.days_absent = 0
    AND a.tardiness_count = 0
    AND a.archived_at IS NULL
    GROUP BY a.user_id
    HAVING COUNT(*) = 12;
END;
$$ language 'plpgsql';

-- Row-Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY admin_all_users ON public.users
    FOR ALL
    TO authenticated
    USING (role = 'admin')
    WITH CHECK (role = 'admin');

CREATE POLICY insert_users ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (role = 'admin');

CREATE POLICY employee_own_account ON public.users
    FOR SELECT
    TO authenticated
    USING (id = auth.uid() AND archived_at IS NULL);

CREATE POLICY update_employee_account ON public.users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid() AND archived_at IS NULL OR role = 'admin')
    WITH CHECK (id = auth.uid() OR role = 'admin');


CREATE POLICY employe_policies ON public.users
    FOR ALL
    TO authenticated
    USING (role = 'employee')
    WITH CHECK (role = 'employee');

CREATE POLICY staff_manage_users ON public.users
    FOR ALL
    TO authenticated
    USING (id = auth.uid() OR role = 'staff')
    WITH CHECK (id = auth.uid() OR role = 'staff');

-- Biometrics table policies
CREATE POLICY admin_all_biometrics ON public.biometrics
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

CREATE POLICY employee_own_biometrics ON public.biometrics
    FOR SELECT
    TO authenticated
    USING (employee_id IN (SELECT employee_id FROM public.users WHERE id = auth.uid()));

-- PDS table policies
CREATE POLICY admin_all_pds ON public.pds
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text)) AND archived_at IS NULL)
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY insert_employee_pds ON public.pds
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid() AND archived_at IS NULL);

CREATE POLICY update_employee_own_pds ON public.pds
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL OR 
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    )
    WITH CHECK (user_id = auth.uid() OR 
      ((( SELECT users_1.role
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
      AND archived_at IS NULL);

CREATE POLICY insert_leave_credits ON public.leave_credits
    FOR INSERT
    TO authenticated
    WITH CHECK (
        ((user_id = auth.uid()) OR (( SELECT users_1.role
         FROM users users_1
        WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY update_leave_credits ON public.leave_credits
    FOR UPDATE
    TO authenticated
    WITH CHECK (user_id = auth.uid() OR 
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_leave_credits ON public.leave_credits
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

-- Leave Categories table policies
CREATE POLICY all_leave_categories ON public.leave_categories
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY select_leave_categories ON public.leave_categories
    FOR SELECT
    TO authenticated
    USING (archived_at IS NULL);

CREATE POLICY insert_leave_categories ON public.leave_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (archived_at IS NULL);

CREATE POLICY update_leave_categories ON public.leave_categories
    FOR UPDATE
    TO authenticated
    USING (archived_at IS NULL);

-- Leave Applications table policies
CREATE POLICY admin_all_leave_applications ON public.leave_applications
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text)))
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
       AND archived_at IS NULL)
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_attendance ON public.attendance
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

-- Certificates table policies
CREATE POLICY admin_all_certificates ON public.certificates
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
      AND archived_at IS NULL)
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
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
      AND archived_at IS NULL)
    WITH CHECK (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'admin'::text))
    );

CREATE POLICY employee_own_awards ON public.awards
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);


CREATE OR REPLACE FUNCTION decrement_update_credits(p_user_id UUID, count_dates INTEGER)
RETURNS VOID AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM leave_credits WHERE user_id = p_user_id;

  IF count_dates > current_credits THEN
    RAISE EXCEPTION 'Not enough leave credits, try again';
  END IF;

  IF current_credits = 0 THEN
    RAISE EXCEPTION 'User no longer have leave credits left';
  END IF;

  UPDATE leave_credits 
  SET credits = leave_credits.credits - count_dates
  WHERE leave_credits.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_update_credits(p_user_id UUID, count_dates INTEGER)
RETURNS VOID AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  SELECT credits INTO current_credits FROM leave_credits WHERE user_id = p_user_id;

  IF current_credits = 10 THEN
    RAISE EXCEPTION 'Your leave credits is already full';
  END IF;

  UPDATE leave_credits 
  SET credits = leave_credits.credits + count_dates
  WHERE leave_credits.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
