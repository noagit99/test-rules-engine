import { db } from '../shared/database';
import { JsonSchema } from '../shared/fields';

export class SchemaRepository {
    private initialized = false;

    async initialize() {
        if (this.initialized) {
            return;
        }
        
        // Drop the unique constraint on the name column
        await db.none(`
            DO $$ 
            BEGIN
                IF EXISTS (
                    SELECT 1 
                    FROM pg_constraint 
                    WHERE conname = 'schemas_name_key'
                ) THEN
                    ALTER TABLE schemas DROP CONSTRAINT schemas_name_key;
                END IF;
            END $$;
        `);
        
        this.initialized = true;
    }

    async saveSchema(name: string, content: JsonSchema) {
        try {
            const contentString = JSON.stringify(content);
            console.log(`Schema size: ${contentString.length} bytes`);
            
            if (contentString.length > 1000000) { // 1MB limit
                console.warn('Warning: Schema is very large');
            }

            const result = await db.one(
                `INSERT INTO schemas (name, content) 
                 VALUES ($1, $2::jsonb) 
                 RETURNING id, name, created_at, updated_at`,
                [name, content]
            );
            
            console.log('Schema saved successfully:', { id: result.id, name: result.name });
            return result;
        } catch (error) {
            console.error('Error in saveSchema:', error);
            throw error;
        }
    }

    async getSchema(name: string) {
        try {
            console.log('Attempting to get schema with name:', name);
            // First try to get the latest schema
            const result = await db.manyOrNone(
                'SELECT * FROM schemas WHERE name = $1 ORDER BY updated_at DESC',
                [name]
            );
            
            if (!result || result.length === 0) {
                console.log('No schema found with name:', name);
                return null;
            }
            
            // Return the most recent one
            const latestSchema = result[0];
            console.log('Get schema result:', latestSchema);
            return latestSchema;
        } catch (error) {
            console.error('Error in getSchema:', error);
            // Instead of throwing, return null to allow the application to continue
            return null;
        }
    }

    async updateSchema(name: string, content: JsonSchema) {
        try {
            console.log('Updating schema:', { name });
            const result = await db.oneOrNone(
                `UPDATE schemas 
                 SET content = $2::jsonb, 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE name = $1 
                 RETURNING *`,
                [name, content]
            );
            
            if (!result) {
                console.log('No schema found to update with name:', name);
                return null;
            }
            
            console.log('Schema updated successfully:', result);
            return result;
        } catch (error) {
            console.error('Error in updateSchema:', error);
            throw error;
        }
    }

    async upsertSchema(name: string, schema: JsonSchema): Promise<JsonSchema> {
        try {
            console.log('Checking for existing schema:', name);
            const existingSchema = await this.getSchema(name);
            
            if (existingSchema) {
                console.log('Updating existing schema');
                return await this.updateSchema(name, schema);
            }
            
            console.log('Creating new schema');
            return await this.saveSchema(name, schema);
        } catch (error) {
            console.error('Error in upsertSchema:', error);
            throw error;
        }
    }
} 