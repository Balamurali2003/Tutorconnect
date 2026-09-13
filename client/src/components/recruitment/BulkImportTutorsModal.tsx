import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Tutor, TutorImportResult } from '../../types';
import { importTutorsExcel, fetchTutors } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';

interface BulkImportTutorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Canonical target fields for tutors
const EXPECTED_FIELDS: Record<string, { label: string; required?: boolean; aliases: string[] }> = {
  id: { label: 'External ID', aliases: ['id', 'external id', 'external_id', 'lead id', 'lead_id', 'lead'] },
  fullName: { label: 'Full Name', required: true, aliases: ['full name', 'full_name', 'fullname', 'name', 'tutor name', 'teacher name'] },
  phone: { label: 'Phone Number', required: true, aliases: ['phone number', 'phone_number', 'phonenumber', 'mobile', 'mobile number', 'phone', 'contact'] },
  email: { label: 'Email', aliases: ['email', 'email address', 'email_address', 'e-mail'] },
  subjects: { label: 'Subjects', aliases: ['subjects', 'which subjects can you teach', 'which_subjects_can_you_teach?', 'subject', 'teaching subjects'] },
  experience: { label: 'Experience', aliases: ['experience', 'how much teaching experience do you have', 'how_much_teaching_experience_do_you_have?', 'teaching experience', 'years of experience'] },
  qualification: { label: 'Qualification', aliases: ['qualification', 'degree', 'education', 'highest qualification'] },
  location: { label: 'Location', aliases: ['location', 'preferred location', 'city', 'area', 'address'] },
  availableDays: { label: 'Available Days', aliases: ['available days', 'available_days', 'days', 'teaching days'] },
  availableTiming: { label: 'Available Timing', aliases: ['available timing', 'available_timing', 'timing', 'time', 'preferred time'] },
  expectedSalary: { label: 'Expected Salary', aliases: ['expected salary', 'expected_salary', 'salary', 'fees', 'expected pay'] },
  homeTuition: { label: 'Home Tuition', aliases: ['home tuition', 'home_tuition', 'home tuition available', 'are you comfortable providing home tuition', 'are_you_comfortable_providing_home_tuition?', 'hometuition'] },
  priority: { label: 'Priority', aliases: ['priority', 'priority level', 'priority score'] },
  notes: { label: 'Notes', aliases: ['notes', 'remarks', 'comments', 'instruction'] }
};

export const BulkImportTutorsModal: React.FC<BulkImportTutorsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing DB tutors for pre-validation lookup
  const [existingTutors, setExistingTutors] = useState<Tutor[]>([]);

  // Step 1: File state
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Step 2: Mapping state
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({}); // header -> targetField

  // Step 3: Parsed & validated rows
  const [analyzedRows, setAnalyzedRows] = useState<any[]>([]);
  const [validRows, setValidRows] = useState<any[]>([]);
  const [duplicateRows, setDuplicateRows] = useState<any[]>([]);
  const [invalidRows, setInvalidRows] = useState<any[]>([]);

  // Filter in preview table
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'DUPLICATES' | 'INVALID'>('ALL');

  // Step 4: Import execution & summary
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<TutorImportResult | null>(null);

  // Load existing tutors on modal open
  useEffect(() => {
    if (isOpen) {
      fetchTutors({ limit: '1000' })
        .then((res) => setExistingTutors(res.tutors || []))
        .catch(() => {});
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setFileName('');
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet('');
    setRawHeaders([]);
    setColumnMap({});
    setAnalyzedRows([]);
    setValidRows([]);
    setDuplicateRows([]);
    setInvalidRows([]);
    setPreviewFilter('ALL');
    setImporting(false);
    setImportResult(null);
  };

  // 1. Download Current Template (14 columns with realistic data)
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'ID': 'TUT-101',
        'Full Name': 'Arun Kumar',
        'Phone Number': '+91 98765 43210',
        'Email': 'arun.kumar@example.com',
        'Subjects': 'Mathematics, Physics',
        'Experience': '3 Years',
        'Qualification': 'B.Ed Mathematics',
        'Location': 'Tirunelveli',
        'Available Days': 'Monday, Wednesday, Friday',
        'Available Timing': '05:00 PM - 07:00 PM',
        'Expected Salary': 15000,
        'Home Tuition': 'Yes',
        'Priority': 'HIGH',
        'Notes': 'Experienced in high school CBSE & State Board coaching'
      },
      {
        'ID': 'TUT-102',
        'Full Name': 'Priya Sundaram',
        'Phone Number': '+91 98765 43211',
        'Email': 'priya.s@example.com',
        'Subjects': 'English, Social Science',
        'Experience': '2 Years',
        'Qualification': 'M.A English',
        'Location': 'Palayamkottai',
        'Available Days': 'Tuesday, Thursday, Saturday',
        'Available Timing': '04:00 PM - 06:00 PM',
        'Expected Salary': 12000,
        'Home Tuition': 'Yes',
        'Priority': 'MEDIUM',
        'Notes': 'Specializes in grammar and communicative English'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tutors');

    // Auto width
    ws['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 18 },
      { wch: 25 },
      { wch: 25 },
      { wch: 12 },
      { wch: 22 },
      { wch: 16 },
      { wch: 28 },
      { wch: 22 },
      { wch: 15 },
      { wch: 14 },
      { wch: 12 },
      { wch: 40 }
    ];

    XLSX.writeFile(wb, 'Charithra_Learning_Hub_Tutor_Import_Template.xlsx');
    addToast('success', 'Template Downloaded', 'Tutor Excel template downloaded successfully.');
  };

  // 2. Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        // Auto-select first sheet or sheet named Tutors/Sheet1
        const defSheet = wb.SheetNames.find((s) => /tutor/i.test(s)) || wb.SheetNames[0];
        setSelectedSheet(defSheet);
        parseSheet(wb, defSheet);
      } catch (err: any) {
        addToast('error', 'Read Error', 'Could not parse Excel file. Please ensure it is a valid .xlsx or .xls file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // 3. Parse Sheet & Auto-map Columns
  const parseSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;

    // Convert sheet to JSON array
    const rawData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (rawData.length === 0) {
      addToast('warning', 'Empty Sheet', 'Selected sheet has no data rows.');
      setRawHeaders([]);
      setAnalyzedRows([]);
      setValidRows([]);
      setDuplicateRows([]);
      setInvalidRows([]);
      return;
    }

    // Detect headers from first row
    const headers = Object.keys(rawData[0]);
    setRawHeaders(headers);

    // Auto-match column headers
    const newMap: Record<string, string> = {};
    headers.forEach((h) => {
      const cleanH = h.toLowerCase().trim().replace(/[?#_]/g, ' ');
      for (const [targetKey, conf] of Object.entries(EXPECTED_FIELDS)) {
        if (conf.aliases.some((alias) => cleanH === alias || cleanH.includes(alias) || alias.includes(cleanH))) {
          newMap[h] = targetKey;
          break;
        }
      }
    });
    setColumnMap(newMap);

    // Validate rows against DB & batch
    validateRows(rawData, newMap);
  };

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
    if (workbook) {
      parseSheet(workbook, sheet);
    }
  };

  const cleanPhone = (val: any): string => {
    if (!val) return '';
    return String(val).replace(/\D/g, '');
  };

  // 4. Row Validation Engine
  const validateRows = (rows: any[], mapping: Record<string, string>) => {
    const valid: any[] = [];
    const duplicates: any[] = [];
    const invalid: any[] = [];
    const allAnalyzed: any[] = [];

    // Pre-build lookup sets from existing DB tutors
    const dbExternalIds = new Map<string, Tutor>();
    const dbPhones = new Map<string, Tutor>();
    const dbEmails = new Map<string, Tutor>();

    existingTutors.forEach((t) => {
      if (t.isDeleted) return;
      if (t.externalLeadId) dbExternalIds.set(String(t.externalLeadId).trim(), t);
      const p1 = cleanPhone(t.mobile);
      const p2 = cleanPhone(t.phone);
      const p3 = cleanPhone(t.whatsappPhoneNumber);
      if (p1) dbPhones.set(p1, t);
      if (p2) dbPhones.set(p2, t);
      if (p3) dbPhones.set(p3, t);
      if (t.email) dbEmails.set(t.email.toLowerCase().trim(), t);
    });

    const batchExternalIds = new Set<string>();
    const batchPhones = new Set<string>();
    const batchEmails = new Set<string>();

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const rowErrors: string[] = [];

      // Extract values via column map
      const mappedRow: Record<string, any> = {};
      Object.entries(row).forEach(([rawH, val]) => {
        const targetField = mapping[rawH];
        if (targetField) {
          mappedRow[targetField] = val;
        }
      });

      const fullName = String(mappedRow.fullName || '').trim();
      const rawPhone = String(mappedRow.phone || '').trim();
      const cleanedPhone = cleanPhone(rawPhone);
      const email = String(mappedRow.email || '').toLowerCase().trim();
      const externalId = String(mappedRow.id || '').trim();
      const subjects = mappedRow.subjects || 'General Coaching';
      const experience = mappedRow.experience || '1 Year';
      const qualification = mappedRow.qualification || 'Not Provided';
      const location = mappedRow.location || 'Not Provided';
      const availableDays = mappedRow.availableDays || 'Monday, Wednesday, Friday';
      const availableTiming = mappedRow.availableTiming || 'Flexible';
      const expectedSalary = mappedRow.expectedSalary || 0;
      const homeTuition = mappedRow.homeTuition || 'Yes';
      const priority = mappedRow.priority || 'HIGH_PRIORITY';
      const notes = mappedRow.notes || '';

      // Required Field Validation
      if (!fullName) {
        rowErrors.push('Full Name is required');
      }
      if (!cleanedPhone || cleanedPhone.length < 7) {
        rowErrors.push('Valid phone number is required (minimum 7 digits)');
      }

      // Duplicate Priority Validation: 1. External ID, 2. Phone number, 3. Email
      let isDuplicate = false;
      let duplicateReason = '';

      if (externalId) {
        if (dbExternalIds.has(externalId)) {
          isDuplicate = true;
          duplicateReason = `Duplicate External ID '${externalId}' (matches ${dbExternalIds.get(externalId)?.fullName})`;
        } else if (batchExternalIds.has(externalId)) {
          isDuplicate = true;
          duplicateReason = `Duplicate External ID '${externalId}' in uploaded file`;
        }
      }

      if (!isDuplicate && cleanedPhone) {
        if (dbPhones.has(cleanedPhone)) {
          isDuplicate = true;
          duplicateReason = `Phone '${cleanedPhone}' already registered to ${dbPhones.get(cleanedPhone)?.fullName}`;
        } else if (batchPhones.has(cleanedPhone)) {
          isDuplicate = true;
          duplicateReason = `Duplicate Phone '${cleanedPhone}' in uploaded file`;
        }
      }

      if (!isDuplicate && email) {
        if (dbEmails.has(email)) {
          isDuplicate = true;
          duplicateReason = `Email '${email}' already registered to ${dbEmails.get(email)?.fullName}`;
        } else if (batchEmails.has(email)) {
          isDuplicate = true;
          duplicateReason = `Duplicate Email '${email}' in uploaded file`;
        }
      }

      const analyzedItem = {
        rowNum,
        rawRow: row,
        fullName: fullName || 'Unnamed',
        phone: rawPhone || cleanedPhone,
        email,
        externalId,
        subjects,
        experience,
        qualification,
        location,
        availableDays,
        availableTiming,
        expectedSalary,
        homeTuition,
        priority,
        notes,
        status: isDuplicate ? 'DUPLICATE' : rowErrors.length > 0 ? 'INVALID' : 'VALID',
        reason: duplicateReason,
        errors: rowErrors
      };

      allAnalyzed.push(analyzedItem);

      if (isDuplicate) {
        duplicates.push(analyzedItem);
      } else if (rowErrors.length > 0) {
        invalid.push(analyzedItem);
      } else {
        if (externalId) batchExternalIds.add(externalId);
        if (cleanedPhone) batchPhones.add(cleanedPhone);
        if (email) batchEmails.add(email);
        valid.push(analyzedItem);
      }
    });

    setAnalyzedRows(allAnalyzed);
    setValidRows(valid);
    setDuplicateRows(duplicates);
    setInvalidRows(invalid);
  };

  // 5. Download Invalid / Duplicate Rows for Correction
  const handleDownloadInvalidRows = () => {
    const errorRecords = [...invalidRows, ...duplicateRows];
    if (errorRecords.length === 0) {
      addToast('info', 'No Error Rows', 'There are no invalid or duplicate rows to export.');
      return;
    }

    const exportData = errorRecords.map((r) => ({
      'Row Number': r.rowNum,
      'Issue Type': r.status === 'DUPLICATE' ? 'Duplicate (Skipped)' : 'Invalid Data',
      'Reason / Errors': r.status === 'DUPLICATE' ? r.reason : r.errors.join('; '),
      ...r.rawRow
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invalid_Rows');
    XLSX.writeFile(wb, 'Charithra_Learning_Hub_Invalid_Import_Rows.xlsx');
    addToast('success', 'Exported', 'Invalid rows downloaded for administrative review.');
  };

  // 6. Confirm Import
  const handleConfirmImport = async () => {
    if (validRows.length === 0) {
      addToast('error', 'Cannot Import', 'There are no valid tutor rows to import.');
      return;
    }

    try {
      setImporting(true);
      const payloadRows = validRows.map((v) => ({
        'External ID': v.externalId,
        'Full Name': v.fullName,
        'Phone Number': v.phone,
        'Email': v.email,
        'Subjects': v.subjects,
        'Experience': v.experience,
        'Qualification': v.qualification,
        'Location': v.location,
        'Available Days': v.availableDays,
        'Available Timing': v.availableTiming,
        'Expected Salary': v.expectedSalary,
        'Home Tuition': v.homeTuition,
        'Priority': v.priority,
        'Notes': v.notes
      }));

      const res = await importTutorsExcel(payloadRows, true);
      setImportResult(res);
      addToast(
        'success',
        'Import Successful',
        `Successfully imported ${res.summary.successfullyImported} tutors into the Validate Tutor stage.`
      );
    } catch (err: any) {
      addToast('error', 'Import Failed', err.message || 'Could not import tutors.');
    } finally {
      setImporting(false);
    }
  };

  // Filtered preview rows
  const displayedRows = analyzedRows.filter((r) => {
    if (previewFilter === 'VALID') return r.status === 'VALID';
    if (previewFilter === 'DUPLICATES') return r.status === 'DUPLICATE';
    if (previewFilter === 'INVALID') return r.status === 'INVALID';
    return true;
  });

  // Mapped & Missing Columns
  const mappedCount = Object.keys(columnMap).length;
  const mappedTargets = new Set(Object.values(columnMap));
  const missingRequired = Object.entries(EXPECTED_FIELDS)
    .filter(([key, conf]) => conf.required && !mappedTargets.has(key))
    .map(([_, conf]) => conf.label);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/20 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                Bulk Import Tutors
              </h3>
              <p className="text-xs text-slate-500">
                Upload tutor spreadsheet (.xlsx / .xls), preview mapped data, and import into the Validate Tutor queue.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              title="Download Excel template matching current tutor database fields"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Post-Import Summary View */}
          {importResult ? (
            <div className="py-8 px-6 text-center space-y-5 bg-gradient-to-b from-emerald-50/40 to-white rounded-2xl border border-emerald-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">Import Completed</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Tutors have been imported into the <span className="font-bold text-emerald-800">VALIDATE TUTOR</span> stage. Candidate priority scores were automatically calculated.
                </p>
              </div>

              {/* Summary Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Rows</span>
                  <span className="text-xl font-black text-slate-900 mt-0.5 block">{importResult.summary.totalRows}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase block">Successfully Imported</span>
                  <span className="text-xl font-black text-emerald-600 mt-0.5 block">{importResult.summary.successfullyImported}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-amber-700 uppercase block">Skipped Duplicates</span>
                  <span className="text-xl font-black text-amber-600 mt-0.5 block">{importResult.summary.skippedDuplicates}</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-rose-700 uppercase block">Invalid Rows</span>
                  <span className="text-xl font-black text-rose-600 mt-0.5 block">{importResult.summary.invalidRows}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {importResult.summary.invalidRows + importResult.summary.skippedDuplicates > 0 && (
                  <button
                    onClick={handleDownloadInvalidRows}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Export Rejected Rows</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    onSuccess();
                    onClose();
                  }}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>View Imported Tutors</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Upload Box */}
              {!workbook ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Choose Excel File or Drag & Drop</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports Microsoft Excel files (<span className="font-mono font-bold">.xlsx</span>, <span className="font-mono font-bold">.xls</span>)
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    Select File
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File & Sheet Selection Bar */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-slate-800 font-mono truncate max-w-xs">{fileName}</span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-emerald-700 hover:underline font-bold ml-2"
                      >
                        Change File
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {sheetNames.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-600">Select Sheet:</span>
                        <div className="flex gap-1">
                          {sheetNames.map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSheetChange(s)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                selectedSheet === s
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Column Mapping Bar */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">Column Mapping:</span>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {mappedCount} of {rawHeaders.length} Columns Mapped
                        </span>
                      </div>
                      {missingRequired.length > 0 && (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Missing: {missingRequired.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Mapping Pills */}
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {rawHeaders.map((h) => {
                        const targetKey = columnMap[h];
                        const targetConfig = targetKey ? EXPECTED_FIELDS[targetKey] : null;
                        return (
                          <div
                            key={h}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                              targetConfig
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            <span>{h}</span>
                            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                            <span className="font-bold">{targetConfig ? targetConfig.label : 'Unmapped'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Counts Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <button
                      onClick={() => setPreviewFilter('ALL')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        previewFilter === 'ALL'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80 block">Total Rows</span>
                      <span className="text-xl font-black mt-0.5 block">{analyzedRows.length}</span>
                    </button>

                    <button
                      onClick={() => setPreviewFilter('VALID')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        previewFilter === 'VALID'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-50/50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80 block">Valid Ready</span>
                      <span className="text-xl font-black text-emerald-600 mt-0.5 block ${previewFilter === 'VALID' ? '!text-white' : ''}">
                        {validRows.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setPreviewFilter('DUPLICATES')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        previewFilter === 'DUPLICATES'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50/50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80 block">Skipped Duplicates</span>
                      <span className="text-xl font-black text-amber-600 mt-0.5 block ${previewFilter === 'DUPLICATES' ? '!text-white' : ''}">
                        {duplicateRows.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setPreviewFilter('INVALID')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        previewFilter === 'INVALID'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-rose-200 hover:bg-rose-50/50'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-80 block">Invalid Rows</span>
                      <span className="text-xl font-black text-rose-600 mt-0.5 block ${previewFilter === 'INVALID' ? '!text-white' : ''}">
                        {invalidRows.length}
                      </span>
                    </button>
                  </div>

                  {/* Preview Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Preview Data ({displayedRows.length} rows):</span>
                        <span className="text-slate-400">Filter: {previewFilter}</span>
                      </div>
                      {duplicateRows.length + invalidRows.length > 0 && (
                        <button
                          onClick={handleDownloadInvalidRows}
                          className="flex items-center gap-1 text-[11px] font-bold text-rose-700 hover:text-rose-900 underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Export Rejected Rows</span>
                        </button>
                      )}
                    </div>

                    <div className="overflow-x-auto max-h-64">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">Row</th>
                            <th className="py-2.5 px-3">Name</th>
                            <th className="py-2.5 px-3">Phone</th>
                            <th className="py-2.5 px-3">Email</th>
                            <th className="py-2.5 px-3">Subjects</th>
                            <th className="py-2.5 px-3">Experience</th>
                            <th className="py-2.5 px-3">Location</th>
                            <th className="py-2.5 px-3">Qualification</th>
                            <th className="py-2.5 px-3">Validation Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedRows.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                                No rows matching filter &quot;{previewFilter}&quot;
                              </td>
                            </tr>
                          ) : (
                            displayedRows.map((r) => (
                              <tr
                                key={r.rowNum}
                                className={`hover:bg-slate-50 transition-colors ${
                                  r.status === 'DUPLICATE'
                                    ? 'bg-amber-50/30'
                                    : r.status === 'INVALID'
                                    ? 'bg-rose-50/30'
                                    : ''
                                }`}
                              >
                                <td className="py-2 px-3 text-center font-mono text-slate-400">{r.rowNum}</td>
                                <td className="py-2 px-3 font-bold text-slate-900 whitespace-nowrap">{r.fullName}</td>
                                <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{r.phone || '—'}</td>
                                <td className="py-2 px-3 text-slate-600 whitespace-nowrap">{r.email || '—'}</td>
                                <td className="py-2 px-3 text-slate-700 truncate max-w-[140px]">{r.subjects}</td>
                                <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{r.experience}</td>
                                <td className="py-2 px-3 text-slate-700 whitespace-nowrap">{r.location}</td>
                                <td className="py-2 px-3 text-slate-700 truncate max-w-[120px]">{r.qualification}</td>
                                <td className="py-2 px-3 whitespace-nowrap">
                                  {r.status === 'VALID' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      Valid
                                    </span>
                                  )}
                                  {r.status === 'DUPLICATE' && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                                      title={r.reason}
                                    >
                                      <Copy className="w-3 h-3 text-amber-600" />
                                      Duplicate ({r.reason.slice(0, 24)}...)
                                    </span>
                                  )}
                                  {r.status === 'INVALID' && (
                                    <span
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                                      title={r.errors.join(', ')}
                                    >
                                      <XCircle className="w-3 h-3 text-rose-600" />
                                      {r.errors[0]}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importResult && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div className="text-slate-500 font-medium">
              {workbook ? (
                <span>
                  Ready to import <strong className="text-emerald-700">{validRows.length} valid tutors</strong> ({duplicateRows.length} duplicates skipped)
                </span>
              ) : (
                <span>Please select an Excel file to begin</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={importing || !workbook || validRows.length === 0}
                onClick={handleConfirmImport}
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{importing ? 'Importing Tutors...' : 'Confirm Import'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
