import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ExternalLink, Calendar, X, Pencil, Trash2, Save } from 'lucide-react';

interface CaptureCardProps {
  capture: {
    id: string;
    user_id: string;
    video_title: string;
    video_url: string;
    image_path: string;
    created_at: string;
  };
  onUpdate: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

const CaptureCard: React.FC<CaptureCardProps> = ({ capture, onUpdate, onDelete }) => {
  const [imageInfo, setImageInfo] = useState<{ url: string; loading: boolean; error: string | null }>({
    url: '',
    loading: true,
    error: null
  });
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(capture.video_title);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle === capture.video_title) {
      setIsEditing(false);
      return;
    }

    const { error } = await supabase
      .from('captures')
      .update({ video_title: editTitle.trim() })
      .eq('id', capture.id);

    if (!error) {
      onUpdate(capture.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this capture?')) return;
    
    setIsDeleting(true);
    
    const { error } = await supabase
      .from('captures')
      .delete()
      .eq('id', capture.id);

    if (!error) {
      onDelete(capture.id);
      setShowModal(false);
    } else {
      setIsDeleting(false);
    }
  };

  const formattedDate = new Date(capture.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="polaroid-card group cursor-pointer" onClick={() => setShowModal(true)}>
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
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
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
              onClick={(e) => e.stopPropagation()}
            >
              Watch
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <button 
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            onClick={() => setShowModal(false)}
          >
            <X size={32} />
          </button>

          <button 
            className="absolute top-4 left-4 p-2 text-white/70 hover:text-red-500 transition-colors"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 size={32} />
          </button>
          
          {imageInfo.url && (
            <img
              src={imageInfo.url}
              alt={capture.video_title}
              className="max-w-[90vw] max-h-[70vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center w-full max-w-[90vw] px-4">
            {isEditing ? (
              <div className="flex items-center gap-2 justify-center">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 max-w-md px-3 py-2 bg-white text-slate-900 rounded-lg text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    if (e.key === 'Enter') handleSaveTitle();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveTitle();
                  }}
                  className="p-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  <Save size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTitle(capture.video_title);
                    setIsEditing(false);
                  }}
                  className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500"
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <>
                <p className="font-semibold text-lg">{capture.video_title}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTitle(capture.video_title);
                      setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <Pencil size={16} />
                    Edit Title
                  </button>
                  <a
                    href={capture.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Watch on YouTube
                    <ExternalLink size={16} />
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CaptureCard;
