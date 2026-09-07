import React, { useState, useEffect } from 'react';
import { WhatsAppTemplate } from '../types';
import {
  fetchWhatsAppTemplates,
  createWhatsAppTemplate,
  updateWhatsAppTemplate,
  deleteWhatsAppTemplate
} from '../services/api';
import { useApp } from '../context/AppContext';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Send,
  Sparkles,
  Tag,
  Copy,
  Check
} from 'lucide-react';

export const WhatsAppTemplatesPage: React.FC<{ onUseTemplate?: (tmplId: string) => void }> = ({
  onUseTemplate
}) => {
  const { addToast, setActiveTab } = useApp();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'GENERAL', content: '' });
  const [deletingTemplate, setDeletingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetchWhatsAppTemplates();
      setTemplates(res.templates || []);
    } catch (err: any) {
      addToast('error', 'Failed to load templates', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({ name: '', category: 'GENERAL', content: '' });
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (tmpl: WhatsAppTemplate) => {
    setEditingTemplate(tmpl);
    setFormData({ name: tmpl.name, category: tmpl.category, content: tmpl.content });
    setIsEditModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      addToast('warning', 'Validation', 'Name and Content are required.');
      return;
    }

    try {
      if (editingTemplate) {
        await updateWhatsAppTemplate(editingTemplate.id, formData);
        addToast('success', 'Template Updated', `"${formData.name}" was saved successfully.`);
      } else {
        await createWhatsAppTemplate(formData);
        addToast('success', 'Template Created', `New template "${formData.name}" added.`);
      }
      setIsEditModalOpen(false);
      loadTemplates();
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTemplate) return;
    try {
      await deleteWhatsAppTemplate(deletingTemplate.id);
      addToast('success', 'Template Deleted', `Template removed.`);
      setDeletingTemplate(null);
      loadTemplates();
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
    }
  };

  const handleCopyContent = (tmpl: WhatsAppTemplate) => {
    navigator.clipboard.writeText(tmpl.content);
    setCopiedId(tmpl.id);
    setTimeout(() => setCopiedId(null), 2000);
    addToast('info', 'Copied', 'Template text copied to clipboard');
  };

  const handleUseTemplate = (tmplId: string) => {
    if (onUseTemplate) {
      onUseTemplate(tmplId);
    } else {
      setActiveTab('whatsapp-messaging');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">WhatsApp Message Templates</h2>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Standardized templates with dynamic variable interpolation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE TEMPLATE</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tmpl) => {
          return (
            <div
              key={tmpl.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                      {tmpl.category}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{tmpl.name}</h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyContent(tmpl)}
                      title="Copy Content"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {copiedId === tmpl.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      title="Edit Template"
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingTemplate(tmpl)}
                      title="Delete Template"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60 font-mono text-[11px] text-slate-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {tmpl.content}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div className="flex flex-wrap gap-1 max-w-[65%]">
                  {(tmpl.variables || []).map((v, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono font-medium px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded"
                    >
                      {v}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => handleUseTemplate(tmpl.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-all active:scale-95 shadow-2xs"
                >
                  <Send className="w-3 h-3 text-emerald-600" />
                  <span>USE TEMPLATE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingTemplate ? 'Edit WhatsApp Template' : 'Create New Template'}
        >
          <form onSubmit={handleSaveTemplate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Weekend Batch Notification"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              >
                <option value="APPLICATION">Application</option>
                <option value="VERIFICATION">Verification</option>
                <option value="INTERVIEW">Interview</option>
                <option value="DEMO_CLASS">Demo Class</option>
                <option value="PARENT_APPROVAL">Parent Approval</option>
                <option value="SELECTION">Selection</option>
                <option value="APPOINTMENT">Appointment</option>
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="GENERAL">General</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Message Content</label>
                <span className="text-[10px] text-slate-400">Use {'{{variable}}'} tags</span>
              </div>
              <textarea
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Hello {{tutor_name}}, ..."
                className="w-full font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Save Template
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingTemplate}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Template"
        message={`Are you sure you want to delete template "${deletingTemplate?.name}"?`}
        confirmText="Delete Template"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};
