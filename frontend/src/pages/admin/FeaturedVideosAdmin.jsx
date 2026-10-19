import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loader2, Plus, Edit2, Trash2, Video, Eye, EyeOff, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyVideo = {
  title: '',
  video_url: '',
  thumbnail_url: '',
  sort_order: 0,
  is_active: 1
};

const FeaturedVideosAdmin = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(emptyVideo);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/featured-videos');
      setVideos(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load featured videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const openModal = (video = null) => {
    if (video) {
      setCurrentVideo({ ...video });
    } else {
      setCurrentVideo({
        ...emptyVideo,
        sort_order: videos.length + 1
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentVideo.id) {
        await api.put(`/featured-videos/${currentVideo.id}`, currentVideo);
        toast.success('Video updated');
      } else {
        await api.post('/featured-videos', currentVideo);
        toast.success('Video created');
      }
      setIsModalOpen(false);
      fetchVideos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save video');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this featured video?')) return;
    try {
      await api.delete(`/featured-videos/${id}`);
      toast.success('Video deleted');
      fetchVideos();
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const toggleActive = async (video) => {
    try {
      const newStatus = video.is_active ? 0 : 1;
      await api.put(`/featured-videos/${video.id}`, { is_active: newStatus });
      toast.success(`Video ${newStatus ? 'activated' : 'deactivated'}`);
      fetchVideos();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-darkBlue dark:text-cyan" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-lightText dark:text-darkText">Featured Videos Management</h2>
          <p className="text-xs sm:text-sm text-lightTextSecondary dark:text-darkTextSecondary mt-0.5">
            Manage product demonstration and review videos displayed on the homepage
          </p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Video
        </button>
      </div>

      <div className="bg-lightCard dark:bg-darkCard rounded-2xl border border-lightBorder dark:border-darkBorder shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-lightBg dark:bg-darkBg border-b border-lightBorder dark:border-darkBorder text-xs uppercase tracking-wider font-bold text-darkBlue dark:text-cyan">
                <th className="p-4">Sort</th>
                <th className="p-4">Thumbnail</th>
                <th className="p-4">Video Title</th>
                <th className="p-4">Video Link / Source</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lightBorder dark:divide-darkBorder text-sm">
              {videos.map((vid) => (
                <tr key={vid.id} className="hover:bg-lightBg/50 dark:hover:bg-darkBg/50 transition-colors">
                  <td className="p-4 font-bold w-12 text-center">
                    {vid.sort_order}
                  </td>

                  <td className="p-4">
                    <div className="w-16 h-10 rounded bg-gray-100 dark:bg-[#111] overflow-hidden flex items-center justify-center relative border border-lightBorder dark:border-darkBorder flex-shrink-0">
                      {vid.thumbnail_url ? (
                        <img src={vid.thumbnail_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Play size={16} className="text-darkBlue dark:text-cyan" />
                      )}
                    </div>
                  </td>

                  <td className="p-4 font-bold text-lightText dark:text-darkText">
                    {vid.title}
                  </td>

                  <td className="p-4 text-xs text-lightTextSecondary dark:text-darkTextSecondary max-w-xs truncate" title={vid.video_url}>
                    {vid.video_url ? vid.video_url : <span className="italic text-amber-500 font-medium">No video linked (shows placeholder)</span>}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(vid)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        vid.is_active
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
                      }`}
                    >
                      {vid.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                      {vid.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(vid)}
                        className="p-1.5 rounded hover:bg-lightBorder dark:hover:bg-darkBorder text-lightTextSecondary dark:text-darkTextSecondary hover:text-darkBlue dark:hover:text-cyan"
                        title="Edit Video"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vid.id)}
                        className="p-1.5 rounded hover:bg-lightBorder dark:hover:bg-darkBorder text-lightTextSecondary dark:text-darkTextSecondary hover:text-red-500"
                        title="Delete Video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-lightCard dark:bg-darkCard border border-lightBorder dark:border-darkBorder rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-lightText dark:text-darkText">
              {currentVideo.id ? 'Edit Video Card' : 'Add New Featured Video'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Desi Ghee & Honey Inspection"
                  value={currentVideo.title}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                  className="input-field text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Video URL (YouTube URL or local path e.g. /videos/hero/placeholder.mp4)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or /videos/hero/placeholder.mp4"
                  value={currentVideo.video_url}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, video_url: e.target.value })}
                  className="input-field text-sm"
                />
                <p className="text-[11px] text-lightTextSecondary dark:text-darkTextSecondary mt-1">
                  Leave empty to test placeholder state.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                  Thumbnail Image URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="/images/hero/placeholder-1.jpg or https://..."
                  value={currentVideo.thumbnail_url}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, thumbnail_url: e.target.value })}
                  className="input-field text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-lightTextSecondary dark:text-darkTextSecondary mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={currentVideo.sort_order}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, sort_order: parseInt(e.target.value) || 0 })}
                    className="input-field text-sm"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="video_active"
                    checked={Boolean(currentVideo.is_active)}
                    onChange={(e) => setCurrentVideo({ ...currentVideo, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-darkBlue dark:text-cyan border-lightBorder dark:border-darkBorder cursor-pointer"
                  />
                  <label htmlFor="video_active" className="text-sm font-semibold cursor-pointer select-none">
                    Active (visible)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-lightBorder dark:border-darkBorder">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 hover:bg-lightBorder dark:hover:bg-darkBorder rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm px-5 py-2">
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedVideosAdmin;
