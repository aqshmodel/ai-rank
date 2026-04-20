CREATE TABLE IF NOT EXISTS signups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  rank INT,
  client_at TIMESTAMP WITH TIME ZONE,
  url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent VARCHAR(500),
  ip VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enterprise_inquiries (
  id SERIAL PRIMARY KEY,
  company VARCHAR(200) NOT NULL,
  contact_name VARCHAR(100) NOT NULL,
  job_title VARCHAR(100),
  email VARCHAR(200) NOT NULL,
  employee_count VARCHAR(50),
  budget_range VARCHAR(50),
  timeline VARCHAR(50),
  interests JSONB,
  consultation_pref VARCHAR(50),
  message TEXT,
  client_at TIMESTAMP WITH TIME ZONE,
  url VARCHAR(500),
  referrer VARCHAR(500),
  user_agent VARCHAR(500),
  ip VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
