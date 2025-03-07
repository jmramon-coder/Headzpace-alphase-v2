/*
  # Create waitlist table
  
  1. New Tables
    - `waitlist`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `status` (text) - tracks signup status
  
  2. Security
    - Enable RLS on waitlist table
    - Add policy for inserting new entries
*/

CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert into waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only authenticated users can view waitlist entries
CREATE POLICY "Only authenticated users can view waitlist" ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);