'use client';

import { useState, useEffect } from 'react';
import { DragEditor } from '@/components/DragEditor';
import { LivePreview } from '@/components/LivePreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PortfolioBlock {
  id: string;
  type: 'bio' | 'projects' | 'skills' | 'blog';
  content: any;
  position: { x: number; y: number };
}

export default function EditPortfolio() {
  const [blocks, setBlocks] = useState<PortfolioBlock[]>([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load existing portfolio data
    const loadPortfolio = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`,
          {
            credentials: 'include',
          }
        );
        if (response.ok) {
          const data = await response.json();
          setBlocks(data.blocks || []);
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      }
    };

    loadPortfolio();
  }, []);

  const handleSavePortfolio = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ blocks }),
        }
      );

      if (response.ok) {
        // Show success message
        console.log('Portfolio saved successfully');
      }
    } catch (error) {
      console.error('Failed to save portfolio:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockUpdate = (updatedBlocks: PortfolioBlock[]) => {
    setBlocks(updatedBlocks);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Edit Portfolio</h1>
          <p className="text-muted-foreground mt-2">
            Drag and drop blocks to build your portfolio
          </p>
        </div>
        <div className="space-x-4">
          <Button onClick={handleSavePortfolio} disabled={saving}>
            {saving ? 'Saving...' : 'Save Portfolio'}
          </Button>
          <Button variant="outline">Preview</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Live Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Available Blocks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    📝 Bio Block
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    🚀 Projects Block
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    💻 Skills Block
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    📚 Blog Block
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <DragEditor blocks={blocks} onBlocksUpdate={handleBlockUpdate} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <LivePreview blocks={blocks} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
