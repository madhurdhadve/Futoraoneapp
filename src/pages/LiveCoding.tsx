import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Code, 
  Users,
  Play,
  Pause,
  Copy,
  Check,
  Share2,
  Terminal,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface CodeSession {
  id: string;
  title: string;
  host: string;
  language: string;
  participants: number;
  isLive: boolean;
}

const demoSessions: CodeSession[] = [
  { id: '1', title: 'Building REST APIs with Node.js', host: 'DevMaster', language: 'JavaScript', participants: 12, isLive: true },
  { id: '2', title: 'Python Data Structures', host: 'PyNinja', language: 'Python', participants: 8, isLive: true },
  { id: '3', title: 'React Hooks Deep Dive', host: 'ReactPro', language: 'TypeScript', participants: 23, isLive: true },
];

const LiveCoding = () => {
  const navigate = useNavigate();
  const [sessions] = useState<CodeSession[]>(demoSessions);
  const [activeSession, setActiveSession] = useState<CodeSession | null>(null);
  const [code, setCode] = useState(`// Welcome to Live Coding!
// Start typing to code together

function greet(name) {
  return \`Hello, \${name}! 👋\`;
}

console.log(greet("FutoraOne"));`);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const runCode = () => {
    try {
      // Simple eval for demo (in production, use a sandboxed environment)
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: any[]) => logs.push(args.join(' '))
      };
      
      // Very basic execution (demo only)
      const result = new Function('console', code)(mockConsole);
      setOutput(logs.join('\n') || 'Code executed successfully!');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Code copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900/20 via-background to-cyan-900/20">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
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
                <Code className="w-8 h-8 text-green-500" />
                Live Coding
              </h1>
              <p className="text-muted-foreground">Code together in real-time</p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-cyan-600">
            <Zap className="w-4 h-4 mr-2" />
            Start Session
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Live Sessions */}
          <div className="space-y-4">
            <h2 className="font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live Sessions
            </h2>
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`p-4 cursor-pointer transition-all ${
                    activeSession?.id === session.id 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'hover:border-green-500/50'
                  }`}
                  onClick={() => setActiveSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{session.language}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {session.participants}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{session.title}</h3>
                  <p className="text-xs text-muted-foreground">by {session.host}</p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Code Editor */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              {/* Editor Header */}
              <div className="bg-secondary/50 px-4 py-2 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {activeSession?.title || 'code.js'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Code Area */}
              <div className="p-4 bg-[#1e1e1e] min-h-[300px]">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-[300px] bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none"
                  spellCheck={false}
                />
              </div>

              {/* Run Button */}
              <div className="bg-secondary/50 px-4 py-2 flex items-center justify-between border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Terminal className="w-4 h-4" />
                  Console Output
                </div>
                <Button 
                  size="sm" 
                  onClick={runCode}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-1" />
                  Run
                </Button>
              </div>

              {/* Output */}
              {output && (
                <div className="bg-[#0d0d0d] p-4 font-mono text-sm text-gray-300 border-t border-gray-800">
                  <pre>{output}</pre>
                </div>
              )}
            </Card>

            {activeSession && (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">
                    <strong>{activeSession.participants}</strong> people are coding together
                  </span>
                </div>
                <Button variant="outline" size="sm">
                  Invite Others
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCoding;
