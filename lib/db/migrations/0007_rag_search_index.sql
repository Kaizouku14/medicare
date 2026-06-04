CREATE VIEW patient_search_index AS
SELECT
  id || '-visit' AS id,
  patient_id,
  'visit_note' AS source_type,
  date AS ref_date,
  notes AS content,
  '' AS extra_meta
FROM visit_notes

UNION ALL

SELECT
  id || '-doc',
  patient_id,
  'document_analysis',
  created_at::text,
  file_name || '. Summary: ' || COALESCE(analysis->>'summary', '') || '. Findings: ' || COALESCE(analysis->>'findings', ''),
  COALESCE(analysis->>'documentType', '')
FROM patient_documents
WHERE analysis IS NOT NULL

UNION ALL

SELECT
  id || '-chat',
  s.patient_id,
  'chat_history',
  cm.created_at::text,
  CASE WHEN cm.role = 'user' THEN 'Q: ' ELSE 'A: ' END || cm.content,
  cm.role
FROM chat_messages cm
JOIN chat_sessions s ON s.id = cm.session_id
WHERE s.patient_id IS NOT NULL;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_patient_search_index_content
ON patient_search_index
USING gin(to_tsvector('english', content));
