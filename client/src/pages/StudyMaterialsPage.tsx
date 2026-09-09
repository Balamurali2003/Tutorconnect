import React, { useState, useEffect } from 'react';
import { StudyMaterial } from '../types';
import {
  fetchStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial
} from '../services/api';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Trash2,
  Edit3,
  ExternalLink,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  FileCheck,
  Video,
  FileSpreadsheet,
  Layers,
  FolderOpen,
  X
} from 'lucide-react';

const CLASSES = [
  'All Classes',
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12'
];

const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Social Science',
  'Computer Science',
  'Environmental Science'
];

const CATEGORIES = [
  'All Types',
  'Notes',
  'Question Paper',
  'Worksheet',
  'Textbook',
  'Video Lesson'
];

export const StudyMaterialsPage: React.FC = () => {
  const { addToast } = useApp();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedCategory, setSelectedCategory] = useState('All Types');
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formClass, setFormClass] = useState('Class 10');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formCategory, setFormCategory] = useState<'Notes' | 'Question Paper' | 'Worksheet' | 'Textbook' | 'Video Lesson'>('Notes');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('3.5 MB');
  const [formFileFormat, setFormFileFormat] = useState('PDF');
  const [formDescription, setFormDescription] = useState('');

  // Delete Confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedClass !== 'All Classes') params.classGrade = selectedClass;
      if (selectedSubject !== 'All Subjects') params.subject = selectedSubject;
      if (selectedCategory !== 'All Types') params.category = selectedCategory;
      if (search) params.search = search;

      const res = await fetchStudyMaterials(params);
      if (res.success) {
        setMaterials(res.materials || []);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to load study materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [selectedClass, selectedSubject, selectedCategory, search]);

  const handleOpenAddModal = () => {
    setEditingMaterial(null);
    setFormTitle('');
    setFormClass(selectedClass !== 'All Classes' ? selectedClass : 'Class 10');
    setFormSubject(selectedSubject !== 'All Subjects' ? selectedSubject : 'Mathematics');
    setFormCategory('Notes');
    setFormFileUrl('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
    setFormFileSize('3.2 MB');
    setFormFileFormat('PDF');
    setFormDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StudyMaterial) => {
    setEditingMaterial(item);
    setFormTitle(item.title);
    setFormClass(item.classGrade);
    setFormSubject(item.subject);
    setFormCategory(item.category);
    setFormFileUrl(item.fileUrl);
    setFormFileSize(item.fileSize || '3.5 MB');
    setFormFileFormat(item.fileFormat || 'PDF');
    setFormDescription(item.description || '');
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('error', 'Validation Error', 'Material title is required');
      return;
    }

    setSaving(true);
    try {
      if (editingMaterial) {
        // Update
        const res = await updateStudyMaterial(editingMaterial.id, {
          title: formTitle,
          classGrade: formClass,
          subject: formSubject,
          category: formCategory,
          fileUrl: formFileUrl,
          fileSize: formFileSize,
          fileFormat: formFileFormat,
          description: formDescription
        });
        if (res.success) {
          addToast('success', 'Updated', 'Study material updated successfully.');
          setIsModalOpen(false);
          loadMaterials();
        }
      } else {
        // Create
        const res = await createStudyMaterial({
          title: formTitle,
          classGrade: formClass,
          subject: formSubject,
          category: formCategory,
          fileUrl: formFileUrl,
          fileSize: formFileSize,
          fileFormat: formFileFormat,
          description: formDescription
        });
        if (res.success) {
          addToast('success', 'Created', `Study material for ${formClass} added successfully.`);
          setIsModalOpen(false);
          loadMaterials();
        }
      }
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message || 'Error saving study material');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteStudyMaterial(id);
      if (res.success) {
        addToast('success', 'Deleted', 'Study material deleted by Admin.');
        setDeletingId(null);
        loadMaterials();
      }
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message || 'Error deleting study material');
    }
  };

  const getFormatBadge = (format?: string) => {
    const f = (format || 'PDF').toUpperCase();
    if (f === 'PDF') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (f === 'MP4' || f === 'VIDEO') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (f === 'DOCX' || f === 'DOC') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Question Paper':
        return <FileCheck className="w-3.5 h-3.5 text-amber-600" />;
      case 'Worksheet':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Video Lesson':
        return <Video className="w-3.5 h-3.5 text-purple-600" />;
      case 'Textbook':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-sky-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              "CHARITHRA"-Edutech Learning Hub
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Admin Managed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-indigo-400 shrink-0" />
            <span>Class 1 to Class 12 Study Materials Repository</span>
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
            Centralized academic repository maintaining lesson notes, board exam question papers, practice worksheets, and reference guides across all school standards.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-95 w-full md:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Material</span>
          </button>
        </div>
      </div>

      {/* Class 1 to 12 Horizontal Grade Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Class / Standard</span>
          </span>
          <span className="text-xs font-mono font-bold text-indigo-600">
            {materials.length} Materials Available
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CLASSES.map((cls) => {
            const active = selectedClass === cls;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                {cls}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, chapter title, keywords, or class..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Subject & Category Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
          >
            {SUBJECTS.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Study Materials Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 font-semibold bg-white rounded-3xl border border-slate-100">
          Loading Class 1-12 Study Materials...
        </div>
      ) : materials.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-sm text-slate-800">No Study Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No study materials match your current filters. Click "Add Study Material" above to upload content for this class.
          </p>
          <button
            onClick={() => {
              setSelectedClass('All Classes');
              setSelectedSubject('All Subjects');
              setSelectedCategory('All Types');
              setSearch('');
            }}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                {/* Header Badges */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {item.classGrade}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.subject}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getFormatBadge(item.fileFormat)}`}>
                    {item.fileFormat || 'PDF'}
                  </span>
                </div>

                {/* Title and Description */}
                <div>
                  <h4 className="font-black text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Verified curriculum resource for student practice and revision.'}
                  </p>
                </div>
              </div>

              {/* Footer info & Admin Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    {getCategoryIcon(item.category)}
                    <span className="font-semibold text-slate-600">{item.category}</span>
                  </span>
                  <span>{item.fileSize || '2.5 MB'}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {/* Download / Resource Link */}
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 hover:bg-indigo-50 text-slate-800 hover:text-indigo-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download / View</span>
                  </a>

                  {/* Admin Edit & Delete buttons */}
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                    title="Edit Material"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {editingMaterial ? 'Edit Study Material' : 'Add New Study Material (Admin)'}
                </h3>
                <p className="text-xs text-slate-400">
                  Upload and maintain curriculum resources for Classes 1 to 12
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Title / Chapter Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Class 10: Real Numbers & Polynomials Formula Handbook"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Class / Standard</label>
                  <select
                    value={formClass}
                    onChange={(e) => setFormClass(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold"
                  >
                    {CLASSES.filter((c) => c !== 'All Classes').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold"
                  >
                    {SUBJECTS.filter((s) => s !== 'All Subjects').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Resource Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold"
                  >
                    <option value="Notes">Notes / Study Guide</option>
                    <option value="Question Paper">Question Paper / Test Bank</option>
                    <option value="Worksheet">Practice Worksheet</option>
                    <option value="Textbook">Textbook / PDF Reference</option>
                    <option value="Video Lesson">Video Lecture / Lesson</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={formFileFormat}
                    onChange={(e) => setFormFileFormat(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word Document (.docx)</option>
                    <option value="MP4">Video Lesson (.mp4)</option>
                    <option value="ZIP">Archive (.zip)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">File URL / Download Link</label>
                  <input
                    type="text"
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estimated File Size</label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="e.g. 3.5 MB"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description &amp; Key Topics</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Key concepts, syllabus coverage, or instructions for students..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMaterial ? 'Save Changes' : 'Publish Study Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
