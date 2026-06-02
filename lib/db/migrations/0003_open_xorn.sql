CREATE INDEX "idx_chat_messages_session_id" ON "chat_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "idx_chat_sessions_user_id" ON "chat_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_chat_sessions_user_updated" ON "chat_sessions" USING btree ("user_id","updated_at");