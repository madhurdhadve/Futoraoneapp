import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Sparkles, 
  Copy, 
  Check,
  Loader2,
  Hash,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const AIEnhancer = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-mentor`;

  const enhanceContent = async () => {
    if (!content.trim()) return;
    
    setIsLoading(true);
    setEnhancedContent('');
    setHashtags([]);
    setSuggestions('');

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          mode: 'enhance'
        }),
      });

      if (!resp.ok) throw new Error('Failed to enhance content');
      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      let textBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const chunk = parsed.choices?.[0]?.delta?.content;
            if (chunk) fullResponse += chunk;
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Try to parse the JSON response
      try {
        // Find JSON in the response
        const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setEnhancedContent(parsed.enhanced_content || content);
          setHashtags(parsed.hashtags || []);
          setSuggestions(parsed.suggestions || '');
        } else {
          setEnhancedContent(fullResponse);
        }
      } catch {
        setEnhancedContent(fullResponse);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enhance content",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = enhancedContent + '\n\n' + hashtags.map(h => `#${h}`).join(' ');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Enhanced content copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/ai-tools')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-500" />
              AI Content Enhancer
            </h1>
            <p className="text-muted-foreground">Make your posts stand out with AI magic</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Your Content
            </h2>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your post content here... e.g., 'Just finished building my first React app with TypeScript'"
              className="min-h-[200px] resize-none mb-4"
            />
            <Button
              onClick={enhanceContent}
              disabled={!content.trim() || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance with AI
                </>
              )}
            </Button>
          </Card>

          {/* Output */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Enhanced Content
              </h2>
              {enhancedContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI is working its magic...</p>
                </div>
              </div>
            ) : enhancedContent ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-secondary/50 rounded-lg p-4 min-h-[150px]">
                  <p className="whitespace-pre-wrap">{enhancedContent}</p>
                </div>

                {hashtags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      Suggested Hashtags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            navigator.clipboard.writeText(`#${tag}`);
                            toast({ title: `#${tag} copied!` });
                          }}
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {suggestions && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-1 text-blue-500">💡 Tips</h3>
                    <p className="text-sm text-muted-foreground">{suggestions}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
                <p>Your enhanced content will appear here</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIEnhancer;
