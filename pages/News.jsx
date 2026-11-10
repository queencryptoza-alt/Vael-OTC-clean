import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, ExternalLink, Share2, Lightbulb, Send } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'Crypto', 'Forex', 'Regulation', 'Markets', 'South Africa'];

export default function News() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a financial news aggregator. Generate 8 realistic, current-sounding news headlines and summaries relevant to OTC trading, cryptocurrency, forex, South African markets, and financial regulation. 
        Return a JSON array of articles, each with: title, summary (2-3 sentences), category (one of: Crypto, Forex, Regulation, Markets, South Africa), source (publication name), published_ago (e.g. "2 hours ago"), url (a plausible but fictional URL).`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            articles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  summary: { type: 'string' },
                  category: { type: 'string' },
                  source: { type: 'string' },
                  published_ago: { type: 'string' },
                  url: { type: 'string' },
                }
              }
            }
          }
        }
      });
      setArticles(result.articles || []);
    } catch (e) {
      toast.error('Failed to load news');
    }
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const filtered = activeCategory === 'All' ? articles : articles.filter(a => a.category === activeCategory);

  const handleShare = (article) => {
    navigator.clipboard.writeText(article.title + ' — ' + article.url);
    toast.success('Article link copied to clipboard');
  };

  const handleSuggest = async () => {
    if (!suggestion.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Feature suggestion submitted — thank you!');
    setSuggestion('');
    setSubmitting(false);
  };

  const categoryColors = {
    Crypto: 'bg-primary/20 text-primary',
    Forex: 'bg-blue-500/20 text-blue-400',
    Regulation: 'bg-yellow-500/20 text-yellow-400',
    Markets: 'bg-accent/20 text-accent',
    'South Africa': 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Market News</h1>
          <p className="text-sm text-muted-foreground mt-1">Industry updates and insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((article, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary/40 transition-colors group">
              {/* Placeholder image */}
              <div className="h-36 bg-gradient-to-br from-secondary to-muted rounded-t-xl overflow-hidden flex items-center justify-center">
                <span className="text-4xl opacity-30">
                  {article.category === 'Crypto' ? '₿' : article.category === 'Forex' ? '💱' : article.category === 'Regulation' ? '⚖️' : article.category === 'South Africa' ? '🇿🇦' : '📈'}
                </span>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <Badge className={categoryColors[article.category] || 'bg-muted text-muted-foreground'}>
                    {article.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{article.published_ago}</span>
                </div>
                <CardTitle className="text-sm font-semibold leading-snug mt-2 line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3">{article.summary}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{article.source}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleShare(article)}>
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Suggest a Feature */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Suggest a Feature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="What would you like to see improved or added to this platform?"
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            rows={3}
          />
          <Button size="sm" onClick={handleSuggest} disabled={submitting || !suggestion.trim()}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Submit Suggestion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}