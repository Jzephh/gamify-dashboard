'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay to ensure smooth animation
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  return (
    <Dialog open={show} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 border-0 text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-200 animate-pulse" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            🎉 Level Up! 🎉
          </DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          <div className="text-6xl font-bold text-white drop-shadow-lg">
            Level {level}
          </div>
          
          <div className="bg-white/20 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-5 h-5 text-yellow-200" />
              <span className="font-semibold">Congratulations!</span>
            </div>
            <p className="text-sm text-white/90">
              You&apos;ve reached a new level! Keep up the great work and continue your journey to the top.
            </p>
          </div>

          <div className="space-y-2 text-sm text-white/80">
            <p>✨ New level unlocked</p>
            <p>🏆 Progress towards next level</p>
            <p>💎 Potential new badges available</p>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleClose}
            className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-8 py-2"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
