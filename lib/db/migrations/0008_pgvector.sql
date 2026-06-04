CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE patient_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('visit_note', 'document_analysis', 'chat_message')),
  source_id text NOT NULL,
  content text NOT NULL,
  embedding vector(384),
  created_at timestamptz DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX idx_patient_embeddings_vector
ON patient_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
--> statement-breakpoint
CREATE INDEX idx_patient_embeddings_patient
ON patient_embeddings (patient_id);
