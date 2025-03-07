/*
  # Add widget storage table and policies

  1. Create widget_storage table
    - Stores widget media files and metadata
    - Links to widgets table
    - Includes timestamps
    - Has RLS policies
*/

-- Create widget_storage table
CREATE TABLE IF NOT EXISTS widget_storage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id uuid REFERENCES widgets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_file_type CHECK (
    file_type IN ('image', 'video', 'audio')
  )
);

-- Enable RLS
ALTER TABLE widget_storage ENABLE ROW LEVEL SECURITY;

-- Add policies for widget_storage
CREATE POLICY "Users can read own files"
  ON widget_storage
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files"
  ON widget_storage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON widget_storage
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_widget_storage_updated_at
  BEFORE UPDATE ON widget_storage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();