-- Create table for Founder Listing Applications
CREATE TABLE IF NOT EXISTS founder_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES founder_listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  contact_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;

-- Policies for founder_applications
CREATE POLICY "Applicants can view their own applications" ON founder_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Listing owners can view applications for their listings" ON founder_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM founder_listings
      WHERE id = founder_applications.listing_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create applications" ON founder_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);


-- Create table for Gig Applications
CREATE TABLE IF NOT EXISTS gig_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID REFERENCES gig_listings(id) ON DELETE CASCADE,
  applicant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  bid_amount NUMERIC,
  expected_timeline TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE gig_applications ENABLE ROW LEVEL SECURITY;

-- Policies for gig_applications
CREATE POLICY "Applicants can view their own gig applications" ON gig_applications
  FOR SELECT USING (auth.uid() = applicant_id);

CREATE POLICY "Gig owners can view applications for their gigs" ON gig_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM gig_listings
      WHERE id = gig_applications.gig_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create gig applications" ON gig_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);
