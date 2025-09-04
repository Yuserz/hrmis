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
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for biometrics table
CREATE INDEX idx_biometrics_employee_id ON public.biometrics(employee_id);
CREATE INDEX idx_biometrics_timestamp ON public.biometrics(timestamp);
CREATE INDEX idx_biometrics_type ON public.biometrics(type);

CREATE TABLE public.attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_hours INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('completed', 'incomplete', 'half-day')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_unique_attendance_summary UNIQUE (user_id, timestamp)
);

CREATE INDEX idx_attendance_summary_employee_id ON public.attendance_summary(user_id);
CREATE INDEX idx_attendance_summary_timestamp ON public.attendance_summary(timestamp);
CREATE INDEX idx_attendance_summary_total_hourse ON public.attendance_summary(total_hours);

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
    employee_id TEXT REFERENCES users(employee_id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    days_present INTEGER NOT NULL,
    days_absent INTEGER NOT NULL,
    -- tardiness_count INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    archived_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_unique_combination UNIQUE (employee_id, month)
);

-- Indexes for attendance table
CREATE INDEX idx_attendance_employee_id ON public.attendance(employee_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX idx_attendance_month ON public.attendance(month);
CREATE INDEX idx_attendance_days_absent ON public.attendance(days_absent);
-- CREATE INDEX idx_attendance_tardiness_count ON public.attendance(tardiness_count);
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
    -- AND a.tardiness_count = 0
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
ALTER TABLE public.attendance_summary ENABLE ROW LEVEL SECURITY;

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


CREATE POLICY staff_all_leave_credits ON public.leave_credits
    FOR ALL
    TO authenticated
    USING (
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'staff'::text))
      AND archived_at IS NULL)
    WITH CHECK(
      ((( SELECT users_1.role
            FROM users users_1
            WHERE (users_1.id = auth.uid())) = 'staff'::text))
      AND archived_at IS NULL
    );
    

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
CREATE POLICY admin_all_attendance_summary ON public.attendance_summary
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

CREATE POLICY employee_own_attendance_summary ON public.attendance_summary
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND archived_at IS NULL);

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

CREATE OR REPLACE FUNCTION update_attendance_on_logout()
RETURNS TRIGGER AS $$
DECLARE
    login_time TIMESTAMP WITH TIME ZONE;
    total_days_in_month INTEGER;
    days_present_count INTEGER;
BEGIN
    SELECT EXTRACT(DAY FROM (DATE_TRUNC('month', NEW.timestamp) + INTERVAL '1 month - 1 day')) INTO total_days_in_month;

    IF NEW.type IN (1, 15) THEN
        SELECT timestamp INTO login_time
        FROM biometrics
        WHERE employee_id = NEW.employee_id
          AND DATE(timestamp) = DATE(NEW.timestamp)
          AND timestamp < NEW.timestamp
          AND NOT EXISTS (
              SELECT 1
              FROM biometrics b2
              WHERE b2.employee_id = NEW.employee_id
                AND DATE(b2.timestamp) = DATE(NEW.timestamp)
                AND b2.timestamp > biometrics.timestamp
                AND b2.timestamp < NEW.timestamp
          )
        ORDER BY timestamp DESC
        LIMIT 1;

        IF login_time IS NOT NULL THEN
            SELECT COUNT(DISTINCT DATE(b.timestamp))
            INTO days_present_count
            FROM biometrics b
            WHERE b.employee_id = NEW.employee_id
              AND DATE_TRUNC('month', b.timestamp) = DATE_TRUNC('month', NEW.timestamp)
              AND EXISTS (
                  SELECT 1
                  FROM biometrics b2
                  WHERE b2.employee_id = b.employee_id
                    AND DATE(b2.timestamp) = DATE(b.timestamp)
                    AND b2.timestamp > b.timestamp
              );

            INSERT INTO attendance (employee_id, user_id, month, days_present, days_absent)
            VALUES (NEW.employee_id, (SELECT id FROM users WHERE employee_id = NEW.employee_id), 
                    DATE_TRUNC('month', NEW.timestamp), days_present_count, total_days_in_month - days_present_count)
            ON CONFLICT (employee_id, month) DO UPDATE
            SET days_present = days_present_count,
                days_absent = total_days_in_month - days_present_count, 
                updated_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_attendance
AFTER INSERT ON biometrics
FOR EACH ROW
EXECUTE FUNCTION update_attendance_on_logout();

-- Create a function to update attendance_summary based on biometrics
CREATE OR REPLACE FUNCTION update_attendance_summary()
RETURNS TRIGGER AS $$
DECLARE
    earliest_login TIMESTAMP WITH TIME ZONE;
    latest_logout TIMESTAMP WITH TIME ZONE;
    total_hours_calculated INTEGER;
    user_id_val UUID;
BEGIN
    -- Get the user_id from the users table based on employee_id
    SELECT id INTO user_id_val
    FROM users
    WHERE employee_id = NEW.employee_id;

    IF user_id_val IS NOT NULL THEN
        -- Check all timestamps for the same employee_id and day
        IF NEW.type IN (1, 15) THEN
            -- Find the earliest login and latest logout on the same day
            SELECT MIN(timestamp) INTO earliest_login
            FROM biometrics
            WHERE employee_id = NEW.employee_id
              AND DATE(timestamp) = DATE(NEW.timestamp)
              AND type IN (1, 15);

            SELECT MAX(timestamp) INTO latest_logout
            FROM biometrics
            WHERE employee_id = NEW.employee_id
              AND DATE(timestamp) = DATE(NEW.timestamp)
              AND type IN (1, 15);

            IF earliest_login IS NOT NULL AND latest_logout IS NOT NULL AND earliest_login != latest_logout THEN
                -- Calculate total hours as the span from earliest login to latest logout
                total_hours_calculated = FLOOR(EXTRACT(EPOCH FROM (latest_logout - earliest_login)) / 3600);

                -- Determine status based on total hours
                IF total_hours_calculated > 8 THEN
                    INSERT INTO attendance_summary (user_id, timestamp, total_hours, status)
                    VALUES (user_id_val, DATE_TRUNC('day', NEW.timestamp), total_hours_calculated, 'completed')
                    ON CONFLICT (user_id, timestamp) DO UPDATE
                    SET total_hours = total_hours_calculated,
                        status = 'completed',
                        updated_at = CURRENT_TIMESTAMP;
                ELSIF total_hours_calculated <= 4 THEN
                    INSERT INTO attendance_summary (user_id, timestamp, total_hours, status)
                    VALUES (user_id_val, DATE_TRUNC('day', NEW.timestamp), total_hours_calculated, 'half-day')
                    ON CONFLICT (user_id, timestamp) DO UPDATE
                    SET total_hours = total_hours_calculated,
                        status = 'half-day',
                        updated_at = CURRENT_TIMESTAMP;
                ELSE
                    INSERT INTO attendance_summary (user_id, timestamp, total_hours, status)
                    VALUES (user_id_val, DATE_TRUNC('day', NEW.timestamp), total_hours_calculated, 'completed')
                    ON CONFLICT (user_id, timestamp) DO UPDATE
                    SET total_hours = total_hours_calculated,
                        status = 'completed',
                        updated_at = CURRENT_TIMESTAMP;
                END IF;
            ELSE
                -- No valid span (e.g., only one timestamp or all same time), mark as incomplete
                INSERT INTO attendance_summary (user_id, timestamp, total_hours, status)
                VALUES (user_id_val, DATE_TRUNC('day', NEW.timestamp), 0, 'incomplete')
                ON CONFLICT (user_id, timestamp) DO UPDATE
                SET total_hours = 0,
                    status = 'incomplete',
                    updated_at = CURRENT_TIMESTAMP;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_attendance_summary
AFTER INSERT ON biometrics
FOR EACH ROW
EXECUTE FUNCTION update_attendance_summary();
