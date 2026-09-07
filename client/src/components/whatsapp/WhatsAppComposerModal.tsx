import React, { useState, useEffect } from 'react';
import { Tutor, WhatsAppTemplate, BulkSendResponse, BulkSendResultItem } from '../../types';
import {
  fetchWhatsAppTemplates,
  sendWhatsAppMessage,
  bulkSendWhatsAppMessages
} from '../../services/api';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import {
  MessageCircle,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Edit3,
  ExternalLink,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface WhatsAppComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Tutor[];
  defaultTemplateId?: string;
  defaultMessage?: string;
  extraParams?: Record<string, any>;
  onSuccess?: () => void;
}

export const WhatsAppComposerModal: React.FC<WhatsAppComposerModalProps> = ({
  isOpen,
  onClose,
  recipients,
  defaultTemplateId,
  defaultMessage,
  extraParams = {},
  onSuccess
}) => {
  const { addToast, triggerRefresh } = useApp();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplateId || '');
  const [message, setMessage] = useState<string>(defaultMessage || '');
  const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // Workflow states: 'compose' | 'confirm' | 'sending' | 'results'
  const [viewState, setViewState] = useState<'compose' | 'confirm' | 'sending' | 'results'>('compose');
  const [bulkResult, setBulkResult] = useState<BulkSendResponse | null>(null);
  const [loadingSingle, setLoadingSingle] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const res = await fetchWhatsAppTemplates();
        setTemplates(res.templates || []);
      } catch (err: any) {
        console.error('Failed to load templates', err);
      }
    };
    if (isOpen) {
      loadTemplates();
      setActiveTab('compose');
      setViewState('compose');
      setPreviewIndex(0);
      setBulkResult(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (defaultMessage) {
      setMessage(defaultMessage);
    } else if (defaultTemplateId && templates.length > 0) {
      const tmpl = templates.find((t) => t.id === defaultTemplateId);
      if (tmpl) {
        setSelectedTemplateId(tmpl.id);
        setMessage(tmpl.content);
      }
    } else if (!message && templates.length > 0) {
      setSelectedTemplateId(templates[0].id);
      setMessage(templates[0].content);
    }
  }, [templates, defaultTemplateId, defaultMessage]);

  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;
    const found = templates.find((t) => t.id === tmplId);
    if (found) {
      setMessage(found.content);
    }
  };

  const handleInsertVariable = (varTag: string) => {
    setMessage((prev) => prev + (prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ') + varTag + ' ');
  };

  const replaceVariables = (templateText: string, tutor: Tutor): string => {
    if (!templateText) return '';
    const subjectsStr = Array.isArray(tutor.subjects)
      ? tutor.subjects.join(', ')
      : tutor.subjects || 'All Subjects';
    const vars: Record<string, string> = {
      '{{tutor_name}}': tutor.fullName || 'Tutor',
      '{{phone_number}}': tutor.whatsappPhoneNumber || tutor.mobile || tutor.phone || '',
      '{{subjects}}': subjectsStr,
      '{{experience}}': tutor.experience || `${tutor.experienceYears || 1} years`,
      '{{location}}': tutor.preferredLocation || 'Centre / Residence',
      '{{priority}}': (tutor.priority || 'NOT_ASSIGNED').replace(/_/g, ' '),
      '{{status}}': (tutor.status || 'NEW_APPLICATION').replace(/_/g, ' '),
      '{{availableTiming}}': tutor.availableTiming || '5:00 PM - 7:00 PM',
      '{{interview_date}}': extraParams.interview_date || extraParams.date || '08 Sep 2026',
      '{{interview_time}}': extraParams.interview_time || extraParams.time || '11:00 AM',
      '{{demo_date}}': extraParams.demo_date || extraParams.date || '10 Sep 2026',
      '{{demo_time}}': extraParams.demo_time || extraParams.time || '05:00 PM',
      '{{student_name}}': extraParams.student_name || 'Standard 10 Student',
      '{{subject}}':
        extraParams.subject ||
        (Array.isArray(tutor.subjects) && tutor.subjects[0]) ||
        'Mathematics'
    };

    let res = templateText;
    Object.entries(vars).forEach(([k, v]) => {
      res = res.split(k).join(v);
    });
    return res;
  };

  const isBulk = recipients.length > 1;
  const currentTutor = recipients[previewIndex] || recipients[0];

  // Recipient Statistics
  const validContacts = recipients.filter((t) => {
    const raw = t.whatsappPhoneNumber || t.mobile || t.phone || '';
    const digits = raw.replace(/[^\d]/g, '');
    return digits.length >= 10;
  });

  const invalidContacts = recipients.filter((t) => {
    const raw = t.whatsappPhoneNumber || t.mobile || t.phone || '';
    const digits = raw.replace(/[^\d]/g, '');
    return digits.length < 10;
  });

  const optedInContacts = validContacts.filter((t) => (t.whatsappOptIn || '').toUpperCase() === 'YES');
  const skippedNotEligibleContacts = recipients.filter((t) => {
    const raw = t.whatsappPhoneNumber || t.mobile || t.phone || '';
    const isValid = raw.replace(/[^\d]/g, '').length >= 10;
    return isValid && (t.whatsappOptIn || '').toUpperCase() !== 'YES';
  });

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const templateTitle = selectedTemplate ? selectedTemplate.name : 'Custom Message';
  const previewMessage = currentTutor ? replaceVariables(message, currentTutor) : message;

  // 1. Single Tutor: Open in WhatsApp Web (wa.me is valid only for ONE tutor)
  const handleOpenIndividualWhatsApp = () => {
    if (!currentTutor) return;
    const raw = currentTutor.whatsappPhoneNumber || currentTutor.mobile || currentTutor.phone || '';
    let digits = raw.replace(/[^\d]/g, '');
    if (digits.length === 10) digits = '91' + digits;

    const url = `https://wa.me/${digits}?text=${encodeURIComponent(previewMessage)}`;
    window.open(url, '_blank');

    sendWhatsAppMessage({
      tutorId: currentTutor.id,
      phone: currentTutor.whatsappPhoneNumber || raw,
      message: previewMessage,
      templateName: templateTitle,
      sentBy: 'Admin',
      extra: extraParams
    }).catch(console.error);

    addToast('success', 'WhatsApp Launched', `Opened WhatsApp chat for ${currentTutor.fullName}`);
    triggerRefresh();
    if (onSuccess) onSuccess();
    onClose();
  };

  // 2. Single Tutor: Direct Send via Backend API
  const handleSendSingle = async () => {
    if (!currentTutor) return;
    setLoadingSingle(true);
    try {
      const raw = currentTutor.whatsappPhoneNumber || currentTutor.mobile || currentTutor.phone || '';
      await sendWhatsAppMessage({
        tutorId: currentTutor.id,
        phone: currentTutor.whatsappPhoneNumber || raw,
        message,
        templateName: templateTitle,
        sentBy: 'Admin',
        extra: extraParams
      });

      addToast('success', 'Message Sent', `WhatsApp message dispatched to ${currentTutor.fullName} via WhatsApp Business API.`);
      triggerRefresh();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Sending Failed', err.message);
    } finally {
      setLoadingSingle(false);
    }
  };

  // 3. Bulk Send: Execute through backend WhatsApp Business API
  const handleExecuteBulkSend = async () => {
    setViewState('sending');
    try {
      const tutorIds = recipients.map((t) => t.id);
      const res = await bulkSendWhatsAppMessages({
        tutorIds,
        templateId: selectedTemplateId || 'custom',
        templateName: templateTitle,
        messageTemplate: message,
        extra: extraParams
      });

      setBulkResult(res);
      setViewState('results');
      triggerRefresh();
      addToast(
        'success',
        'Bulk Send Complete',
        `Dispatched to ${res.summary.successfullySent} tutors via WhatsApp Business API.`
      );
    } catch (err: any) {
      addToast('error', 'Bulk Send Failed', err.message);
      setViewState('compose');
    }
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={viewState === 'sending' ? () => {} : onClose}
      title={
        viewState === 'results'
          ? 'Bulk WhatsApp Message Result'
          : `Bulk WhatsApp Message (${recipients.length} ${recipients.length === 1 ? 'Tutor' : 'Tutors'})`
      }
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* STATE 1: SEND RESULT SCREEN (AFTER SENDING) */}
        {/* ========================================================================= */}
        {viewState === 'results' && bulkResult && (
          <div className="space-y-4">
            {/* KPI Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Selected</span>
                <span className="text-xl font-black text-slate-800">{bulkResult.summary.totalSelected}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Successfully Sent</span>
                <span className="text-xl font-black text-emerald-700">✓ {bulkResult.summary.successfullySent}</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">Failed</span>
                <span className="text-xl font-black text-red-700">{bulkResult.summary.failed}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Invalid / Skipped</span>
                <span className="text-xl font-black text-amber-800">
                  {bulkResult.summary.invalidNumbers + bulkResult.summary.skippedNotEligible}
                </span>
              </div>
            </div>

            {/* Results Detailed Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h5 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Delivery Report ({bulkResult.results.length} Recipients)
                </h5>
                <span className="text-[11px] font-mono text-slate-500">
                  WhatsApp Business API
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-600 font-bold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4">Tutor</th>
                      <th className="py-2.5 px-4">Phone</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Reason / Provider ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bulkResult.results.map((r, i) => (
                      <tr key={r.tutorId + i} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-900">{r.tutorName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">{r.phoneNumber}</td>
                        <td className="py-2.5 px-4">
                          {(r.status === 'Sent' || r.status === 'SENT') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>✓ Sent</span>
                            </span>
                          )}
                          {(r.status === 'Failed' || r.status === 'FAILED') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3" />
                              <span>✗ Failed</span>
                            </span>
                          )}
                          {(r.status === 'Invalid Number' || r.status === 'INVALID' || r.status === 'INVALID_NUMBER') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              <span>⚠ Invalid Number</span>
                            </span>
                          )}
                          {(r.status === 'Skipped' || r.status === 'SKIPPED') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                              <AlertCircle className="w-3 h-3" />
                              <span>Skipped</span>
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {r.providerMessageId ? (
                            <span className="text-emerald-700 font-semibold">{r.providerMessageId}</span>
                          ) : (
                            r.reason || '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Results Footer Action */}
            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-xl shadow-md transition-all"
              >
                Done & Close
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 2: SENDING PROGRESS (IN FLIGHT) */}
        {/* ========================================================================= */}
        {viewState === 'sending' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div>
              <h4 className="font-black text-slate-800 text-base">Processing Bulk WhatsApp Broadcast...</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                The backend WhatsApp Business API is processing every selected tutor individually.
                Each candidate receives their personalized message. Please do not close this window.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 3: CONFIRMATION STEP */}
        {/* ========================================================================= */}
        {viewState === 'confirm' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-sm">Confirm Bulk WhatsApp Broadcast</h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    You are about to send this message to <strong className="font-bold underline">{optedInContacts.length} tutors</strong> via the official WhatsApp Business API.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-amber-200/80 text-xs space-y-1 font-mono text-amber-900">
                <p>&bull; <strong>Total Selected Tutors:</strong> {recipients.length}</p>
                <p className="text-emerald-800">&bull; <strong>Eligible Recipients (Opt-in YES):</strong> {optedInContacts.length}</p>
                <p className="text-amber-800">&bull; <strong>Invalid / Missing Numbers:</strong> {invalidContacts.length} (will be marked Invalid)</p>
                <p className="text-slate-600">&bull; <strong>Skipped / Not Eligible (No Opt-in):</strong> {skippedNotEligibleContacts.length} (will be skipped)</p>
              </div>

              <p className="text-[11px] text-amber-800 italic">
                Each tutor will receive an individual personalized message using their actual name and details.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setViewState('compose')}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkSend}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>CONFIRM SEND</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STATE 4: COMPOSER & PREVIEW SCREEN */}
        {/* ========================================================================= */}
        {viewState === 'compose' && (
          <div className="space-y-4">
            {/* Pre-Send Recipient Statistics Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {isBulk ? `Recipients: ${recipients.length} Tutors` : `Recipient: ${recipients[0]?.fullName || '1 Tutor'}`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {isBulk ? (
                      <>
                        <span className="text-emerald-700 font-bold">Valid WhatsApp: {validContacts.length}</span>
                        {' '}&bull;{' '}
                        <span className="text-slate-500">Invalid: {invalidContacts.length}</span>
                        {' '}&bull;{' '}
                        <span className="text-indigo-700 font-bold">Opt-in YES: {optedInContacts.length}</span>
                      </>
                    ) : (
                      recipients[0]?.whatsappPhoneNumber || recipients[0]?.mobile || 'No phone'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('compose')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'compose'
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Message Composer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'preview'
                      ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Recipients ({recipients.length})</span>
                </button>
              </div>
            </div>

            {/* Compose Mode */}
            {activeTab === 'compose' ? (
              <div className="space-y-3">
                {/* Template Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message Template:
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">[ Select Template ▼ ]</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Variables Helper Bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Insert Personalization Tags:</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Replaced automatically per tutor</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      '{{tutor_name}}',
                      '{{subjects}}',
                      '{{experience}}',
                      '{{status}}',
                      '{{location}}',
                      '{{phone_number}}',
                      '{{priority}}',
                      '{{interview_date}}',
                      '{{interview_time}}',
                      '{{demo_date}}',
                      '{{demo_time}}',
                      '{{student_name}}'
                    ].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleInsertVariable(v)}
                        className="px-2 py-1 text-[11px] font-mono font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-md transition-all active:scale-95"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message:
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    placeholder="Enter your message using dynamic variables like {{tutor_name}}..."
                    className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              /* Live Preview Mode */
              <div className="space-y-3">
                {isBulk && (
                  <div className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 text-xs">
                    <span className="font-semibold text-slate-600">
                      Previewing Candidate {previewIndex + 1} of {recipients.length}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={previewIndex === 0}
                        onClick={() => setPreviewIndex((p) => Math.max(0, p - 1))}
                        className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-slate-800 px-2">{currentTutor?.fullName}</span>
                      <button
                        type="button"
                        disabled={previewIndex >= recipients.length - 1}
                        onClick={() => setPreviewIndex((p) => Math.min(recipients.length - 1, p + 1))}
                        className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* WhatsApp Chat Preview Bubble */}
                <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-amber-900/10 shadow-inner">
                  <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-none p-3.5 shadow-sm border border-slate-200/60 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {previewMessage || (
                      <span className="text-slate-400 italic">No message content entered yet...</span>
                    )}
                    <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                      12:45 PM &bull; WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Opt-In Compliance Warning */}
            {skippedNotEligibleContacts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{skippedNotEligibleContacts.length} tutors</strong> will be skipped (WhatsApp Opt-in is NO or UNKNOWN).
                  </span>
                </span>
                <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  Skipped / Not Eligible
                </span>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                {/* Individual WhatsApp: Allowed for single tutor only */}
                {!isBulk && (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenIndividualWhatsApp}
                      className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                      title="Open direct WhatsApp Web chat with pre-filled message"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in WhatsApp Web</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendSingle}
                      disabled={loadingSingle || !message.trim()}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{loadingSingle ? 'Sending...' : 'Send WhatsApp'}</span>
                    </button>
                  </>
                )}

                {/* Bulk WhatsApp: One Bulk Send Action to Message All Selected Tutors */}
                {isBulk && (
                  <button
                    type="button"
                    onClick={() => setViewState('confirm')}
                    disabled={optedInContacts.length === 0 || !message.trim()}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>SEND TO ALL {optedInContacts.length} TUTORS</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
