-- Add search_vector column for full-text search
ALTER TABLE industries ADD COLUMN search_vector tsvector;

-- Create GIN index for efficient full-text search
CREATE INDEX IF NOT EXISTS industries_search_vector_idx ON industries USING gin(search_vector);

-- Populate search_vector with existing data
UPDATE industries 
SET search_vector = to_tsvector('english', COALESCE(name, '') || ' ' || COALESCE(description, ''));

-- Create trigger to automatically update search_vector when name or description changes
CREATE OR REPLACE FUNCTION update_industry_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER industries_search_vector_update
  BEFORE INSERT OR UPDATE ON industries
  FOR EACH ROW EXECUTE FUNCTION update_industry_search_vector();
