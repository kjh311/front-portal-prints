import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Play, Calendar } from 'lucide-react';

interface CaptureCardProps {
  capture: {
    id: string;
    user_id: string;
    video_title: string;
    video_url: string;
    image_path: string;
    created_at: string;
  };
}

const CaptureCard: React.FC<CaptureCardProps> = ({ capture }) => {
  const [imageInfo, setImageInfo] = useState<{ url: string; loading: boolean; error: string | null }>({
    url: '',
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!capture.image_path) {
      setImageInfo({ url: '', loading: false, error: 'No screenshot path' });
      return;
    }

    setImageInfo({ url: '', loading: true, error: null });

    const { data } = supabase.storage
      .from('screenshots')
      .getPublicUrl(capture.image_path);

    if (data?.publicUrl) {
      setImageInfo({ url: data.publicUrl, loading: false, error: null });
    } else {
      setImageInfo({ url: '', loading: false, error: 'Failed to get URL' });
    }
  }, [capture.image_path]);

  const formattedDate = new Date(capture.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="polaroid-card group">
      <div className="polaroid-image-container">
        {imageInfo.loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : imageInfo.error || !imageInfo.url ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-400 text-sm p-4 text-center">
            {imageInfo.error || 'Image not available'}
          </div>
        ) : (
          <img
            src={imageInfo.url}
            alt={capture.video_title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={capture.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
          >
            <Play fill="currentColor" size={24} />
          </a>
        </div>
      </div>
      
      <div className="polaroid-content py-4">
        <h3 className="font-bold text-slate-800 line-clamp-2 min-h-[3rem] mb-2 leading-snug">
          {capture.video_title}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium italic">
            <Calendar size={12} />
            {formattedDate}
          </div>
          
          <a
            href={capture.video_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Watch
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default CaptureCard;
