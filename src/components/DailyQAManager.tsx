import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { MessageCircle, Users, Calendar, CheckCircle, BarChart3 } from 'lucide-react';
import { useCoupleContext } from '../contexts/CoupleContext';
import { getDailyQuestionAnswers, getAnswerStats, answerDailyQuestion } from '../lib/storage';
import { toast } from 'sonner';

const DailyQAManager: React.FC = () => {
  const { couple, currentUser } = useCoupleContext();
  const [answers, setAnswers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    answeredByBoth: 0,
    answeredByPartnerA: 0,
    answeredByPartnerB: 0,
    unanswered: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    if (!couple?.id) return;
    
    setIsLoading(true);
    try {
      const [answersData, statsData] = await Promise.all([
        getDailyQuestionAnswers(couple.id, 20),
        getAnswerStats(couple.id)
      ]);
      
      setAnswers(answersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading Q&A data:', error);
      toast("Failed to load Q&A data");
    } finally {
      setIsLoading(false);
    }
  };

  const testAnswerStorage = async () => {
    if (!couple?.id || !currentUser?.id || !answers[0]) return;
    
    try {
      setIsLoading(true);
      const testAnswer = `Test answer from ${currentUser.name} at ${new Date().toLocaleTimeString()}`;
      
      // Determine if current user is partner A
      const isPartnerA = couple.memberA.id === currentUser.id;
      
      await answerDailyQuestion(answers[0].id, currentUser.id, testAnswer, isPartnerA);
      
      toast("Test answer saved successfully! 🎉");
      
      // Reload data to show updated answer
      await loadData();
    } catch (error) {
      console.error('Error testing answer storage:', error);
      toast("Failed to save test answer");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [couple?.id]);

  const formatAnswerCount = (question: any): { hasA: boolean; hasB: boolean; count: number } => {
    let hasA = false;
    let hasB = false;
    
    // Check old format answers
    if (question.answer_by_a) hasA = true;
    if (question.answer_by_b) hasB = true;
    
    // Check new format answers
    if (question.daily_question_answers && couple) {
      question.daily_question_answers.forEach((answer: any) => {
        if (answer.user_id === couple.memberA.id) hasA = true;
        if (answer.user_id === couple.memberB.id) hasB = true;
      });
    }
    
    const count = (hasA ? 1 : 0) + (hasB ? 1 : 0);
    return { hasA, hasB, count };
  };

  if (!couple) {
    return (
      <Alert>
        <AlertDescription>Please set up your couple profile to view Q&A data.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Daily Q&A Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              This tool manages daily question answers with improved storage. 
              Answers are now stored in a dedicated table for better organization and tracking.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Answer Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalQuestions}</div>
              <div className="text-sm text-blue-800">Total Questions</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.answeredByBoth}</div>
              <div className="text-sm text-green-800">Both Answered</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.answeredByPartnerA}</div>
              <div className="text-sm text-yellow-800">Partner A Only</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.answeredByPartnerB}</div>
              <div className="text-sm text-purple-800">Partner B Only</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.unanswered}</div>
              <div className="text-sm text-gray-800">Unanswered</div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-4">
            <Button onClick={loadData} disabled={isLoading}>
              {isLoading ? 'Loading...' : '🔄 Refresh Data'}
            </Button>
            <Button onClick={testAnswerStorage} disabled={isLoading || answers.length === 0}>
              {isLoading ? 'Testing...' : '🧪 Test Answer Storage'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Questions & Answers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : answers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found. Use the Daily Q&A feature to start answering questions!
            </div>
          ) : (
            <div className="space-y-4">
              {answers.slice(0, 10).map((question) => {
                const { hasA, hasB, count } = formatAnswerCount(question);
                
                return (
                  <div key={question.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          "{question.question_text}"
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(question.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={count === 2 ? 'default' : count === 1 ? 'secondary' : 'outline'}>
                          {count === 2 ? '✅ Both Answered' : count === 1 ? '📝 Partial' : '⏸️ Pending'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{count}/2</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Answer indicators */}
                    <div className="flex gap-2">
                      <Badge variant={hasA ? 'default' : 'outline'} className="text-xs">
                        {hasA ? '✓' : '○'} {couple.memberA.name}
                      </Badge>
                      <Badge variant={hasB ? 'default' : 'outline'} className="text-xs">
                        {hasB ? '✓' : '○'} {couple.memberB.name}
                      </Badge>
                    </div>
                    
                    {/* Show actual answers if available */}
                    {(question.answer_by_a || question.answer_by_b || question.daily_question_answers?.length > 0) && (
                      <div className="mt-2 space-y-2 text-sm">
                        {/* Old format answers */}
                        {question.answer_by_a && (
                          <div className="bg-blue-50 p-2 rounded">
                            <strong>{couple.memberA.name}:</strong> {
                              typeof question.answer_by_a === 'string' 
                                ? question.answer_by_a 
                                : question.answer_by_a.text || 'No text'
                            }
                          </div>
                        )}
                        {question.answer_by_b && (
                          <div className="bg-purple-50 p-2 rounded">
                            <strong>{couple.memberB.name}:</strong> {
                              typeof question.answer_by_b === 'string' 
                                ? question.answer_by_b 
                                : question.answer_by_b.text || 'No text'
                            }
                          </div>
                        )}
                        
                        {/* New format answers */}
                        {question.daily_question_answers?.map((answer: any, index: number) => (
                          <div key={index} className="bg-green-50 p-2 rounded">
                            <strong>
                              {answer.user_id === couple.memberA.id ? couple.memberA.name : couple.memberB.name}:
                            </strong> {answer.answer_text}
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(answer.answered_at).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyQAManager;
