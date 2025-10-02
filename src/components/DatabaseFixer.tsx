import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { supabase } from '../lib/supabase';

const DatabaseFixer: React.FC = () => {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const fixYearColumn = async () => {
    setIsFixing(true);
    setResults([]);
    
    try {
      addResult('🔧 Starting database fixes...');
      
      // Check if year column exists first
      addResult('Checking if year column exists in daily_questions...');
      const { data: yearCheck, error: yearCheckError } = await (supabase as any)
        .from('daily_questions')
        .select('year')
        .limit(1);
        
      if (yearCheckError && yearCheckError.code === '42703') {
        addResult('❌ Confirmed: year column is missing from daily_questions');
        addResult('⚠️ Manual SQL execution required in Supabase dashboard');
        addResult('📝 SQL Command needed:');
        addResult('   ALTER TABLE public.daily_questions ADD COLUMN year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);');
      } else if (yearCheckError) {
        addResult(`❌ Error checking year column: ${yearCheckError.message}`);
      } else {
        addResult('✅ Year column exists in daily_questions');
      }
      
      // Update existing records with year values
      addResult('Updating existing records with year values...');
      const { error: updateError } = await supabase.rpc('exec_sql', {
        query: `UPDATE public.daily_questions SET year = EXTRACT(YEAR FROM created_at::date) WHERE year IS NULL;`
      });
      
      if (updateError) {
        addResult(`⚠️ Update error (may be normal): ${updateError.message}`);
      } else {
        addResult('✅ Existing records updated');
      }
      
      // Check question_bucket table
      addResult('Checking question_bucket table...');
      const { data: bucketData, error: bucketError } = await (supabase as any)
        .from('question_bucket')
        .select('*')
        .limit(1);
        
      if (bucketError) {
        addResult(`❌ Question bucket table error: ${bucketError.message}`);
        if (bucketError.message.includes('does not exist')) {
          addResult('⚠️ Question bucket table needs to be created manually');
        }
      } else {
        addResult(`✅ Question bucket table exists (${bucketData?.length || 0} sample records)`);
      }
      
      // Check question_usage table
      addResult('Checking question_usage table...');
      const { data: usageData, error: usageError } = await (supabase as any)
        .from('question_usage')
        .select('*')
        .limit(1);
        
      if (usageError) {
        addResult(`❌ Question usage table error: ${usageError.message}`);
      } else {
        addResult(`✅ Question usage table exists (${usageData?.length || 0} sample records)`);
      }
      
      addResult('🏁 Database fix attempt completed');
      
    } catch (error) {
      addResult(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsFixing(false);
    }
  };

  const showManualSQL = () => {
    const sqlCommands = `
-- Execute these commands in your Supabase SQL editor:

-- 1. Add year column to daily_questions
ALTER TABLE public.daily_questions 
ADD COLUMN IF NOT EXISTS year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE);

-- 2. Update existing records
UPDATE public.daily_questions 
SET year = EXTRACT(YEAR FROM created_at::date) 
WHERE year IS NULL;

-- 3. Create question_bucket table if missing
CREATE TABLE IF NOT EXISTS public.question_bucket (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    difficulty_level TEXT DEFAULT 'medium',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create question_usage table if missing
CREATE TABLE IF NOT EXISTS public.question_usage (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    couple_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    used_date DATE NOT NULL,
    year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(couple_id, question_id, year)
);

-- 5. Enable RLS
ALTER TABLE public.question_bucket ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_usage ENABLE ROW LEVEL SECURITY;

-- 6. Create policies (allow all for now)
CREATE POLICY "Allow all operations on question_bucket" ON public.question_bucket FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_usage" ON public.question_usage FOR ALL USING (true);
    `;
    
    alert('Manual SQL Commands:\n\n' + sqlCommands);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔧 Database Fixer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            This tool attempts to fix missing database columns and tables. 
            If automatic fixing fails, manual SQL execution may be required.
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-4">
          <Button 
            onClick={fixYearColumn}
            disabled={isFixing}
          >
            {isFixing ? 'Fixing...' : '🔧 Fix Database Schema'}
          </Button>
          
          <Button 
            variant="outline"
            onClick={showManualSQL}
          >
            📋 Show Manual SQL
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Fix Results:</h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`text-sm font-mono ${
                    result.includes('❌') ? 'text-red-600' : 
                    result.includes('✅') ? 'text-green-600' : 
                    result.includes('⚠️') ? 'text-yellow-600' : 'text-gray-700'
                  }`}
                >
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseFixer;
