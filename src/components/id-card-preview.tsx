import { useState } from 'react';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IdCardData, IdDesignConfig } from '@/lib/pdf-types';
import { IdCard,  } from '@/components/id-card-dom';

interface IdCardPreviewProps {
  config: IdDesignConfig;
}

export function IdCardPreview({ config }: IdCardPreviewProps) {
  const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');
  const [zoom, setZoom] = useState(1);
  const [isFlipping, setIsFlipping] = useState(false);

  // Mock data for preview
  const mockData: IdCardData = {
    name: 'John Doe',
    idNumber: 'ID-123456789',
    kabale: 'Sample Kabale',
    issueDate: 'Jan 15, 2024',
    expiryDate: 'Jan 15, 2029',
    dateOfBirth: 'Jan 1, 1990',
    sex: 'Male',
    phone: '+251 900 000 000',
    nationality: 'Ethiopian',
    address: 'Addis Ababa\nGullele\nWoreda 09',
    logoUrl: config.logoUrl,
  };

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setActiveTab(activeTab === 'front' ? 'back' : 'front');
      setIsFlipping(false);
    }, 300);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.25, 2));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'front' | 'back')} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Front Side</TabsTrigger>
            <TabsTrigger value="back">Back Side</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            disabled={isFlipping}
            className="h-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2 min-w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            {zoom !== 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetZoom}
                className="h-8 w-8 p-0"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'front' | 'back')}>
        <TabsContent value="front" className="mt-4">
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg overflow-hidden">
            <div
              className={cn(
                "border-2 border-border rounded-lg shadow-2xl transition-all duration-300",
                isFlipping && "opacity-0 scale-95"
              )}
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <IdCard config={config} data={mockData} side="front" />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="back" className="mt-4">
          <div className="flex items-center justify-center p-8 bg-muted/20 rounded-lg overflow-hidden">
            <div
              className={cn(
                "border-2 border-border rounded-lg shadow-2xl transition-all duration-300",
                isFlipping && "opacity-0 scale-95"
              )}
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-in-out',
              }}
            >
              <IdCard config={config} data={mockData} side="back" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

