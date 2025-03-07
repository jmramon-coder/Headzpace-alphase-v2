/*
  # Add widgets to user preferences

  1. Changes
    - Add widgets JSONB column to user_preferences table
    - Add validation check for widgets array
*/

-- Add widgets column
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS widgets JSONB DEFAULT '[]'::jsonb;

-- Add validation check
ALTER TABLE user_preferences
ADD CONSTRAINT valid_widgets_json 
CHECK (jsonb_typeof(widgets) = 'array');