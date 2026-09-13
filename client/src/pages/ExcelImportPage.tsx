import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { importExcelRows, ImportResult } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const ExcelImportPage: React.FC<{ initialTab?: 'teachers' | 'students' | 'parents' }> = ({
  initialTab = 'teachers'
}) => {
  const { addToast, triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'parents'>(initialTab);

  // File & Sheet Detection state
  const [fileName, setFileName] = useState('');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [workbookObj, setWorkbookObj] = useState<XLSX.WorkBook | null>(null);

  // Validation Result state
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'DUPLICATES' | 'INVALID'>('ALL');
  const [loading, setLoading] = useState(false);

  // 1. Download Template Matching Current Real Data Columns
  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    let headers: string[] = [];
    let sampleData: any[] = [];

    if (activeTab === 'teachers') {
      headers = [
        'id',
        'created_time',
        'full_name',
        'phone_number',
        'email',
        'which_subjects_can_you_teach?',
        'how_much_teaching_experience_do_you_have?',
        'are_you_comfortable_providing_home_tuition?',
        'platform',
        'campaign_name',
        'ad_name'
      ];
      sampleData = [
        {
          id: 'l:1722127015759792',
          created_time: '2026-08-29T09:34:00+05:30',
          full_name: 'Muthu lakshmi',
          phone_number: 'p:+919942323234',
          email: 'mukanraji@gmail.com',
          'which_subjects_can_you_teach?': 'tamil, social',
          'how_much_teaching_experience_do_you_have?': '5 years',
          'are_you_comfortable_providing_home_tuition?': 'yes',
          platform: 'fb',
          campaign_name: 'TEACHERS WANTED',
          ad_name: 'New Leads ad'
        },
        {
          id: 'l:928927793596778',
          created_time: '2026-08-29T08:15:47+05:30',
          full_name: 'Ishak jas',
          phone_number: 'p:+919751533400',
          email: 'ishakjas@gmail.com',
          'which_subjects_can_you_teach?': 'Mathematics',
          'how_much_teaching_experience_do_you_have?': '1-2 years',
          'are_you_comfortable_providing_home_tuition?': 'yes',
          platform: 'ig',
          campaign_name: 'TEACHERS WANTED',
          ad_name: 'New Leads ad'
        }
      ];
    } else if (activeTab === 'students') {
      headers = [
        'id',
        'created_time',
        'full_name',
        'phone_number',
        'email',
        '??????_??????_????_?????????_????????????',
        'platform',
        'campaign_name',
        'ad_name'
      ];
      sampleData = [
        {
          id: 'l:1096911329679079',
          created_time: '2026-08-29T10:33:04+05:30',
          full_name: 'Saradha.N',
          phone_number: 'p:+917904890501',
          email: 'saradha.nagarajan@gmail.com',
          '??????_??????_????_?????????_????????????': '10',
          platform: 'fb',
          campaign_name: 'Tution',
          ad_name: 'New Leads ad'
        },
        {
          id: 'l:1003423788390772',
          created_time: '2026-08-28T22:58:39+05:30',
          full_name: 'A.Raja subramanian',
          phone_number: 'p:+919842426300',
          email: 'aswin.raja1998@gmail.com',
          '??????_??????_????_?????????_????????????': '6 - 8 ???????',
          platform: 'ig',
          campaign_name: 'Tution ? Copy',
          ad_name: 'New Leads ad'
        }
      ];
    } else {
      headers = ['ParentName', 'Mobile', 'Email', 'Address', 'Occupation', 'Budget', 'TutorPreference'];
      sampleData = [
        {
          ParentName: 'Dr. Subramanian',
          Mobile: '+919884055443',
          Email: 'dr.subbu@gmail.com',
          Address: '15, Thillai Nagar, Tiruchirappalli',
          Occupation: 'Medical Professional',
          Budget: 15000,
          TutorPreference: 'Experienced Math Specialist'
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab}_template`);

    if (format === 'xlsx') {
      XLSX.writeFile(wb, `Charithra_Learning_Hub_${activeTab}_template.xlsx`);
    } else {
      XLSX.writeFile(wb, `Charithra_Learning_Hub_${activeTab}_template.csv`, { bookType: 'csv' });
    }

    addToast('success', 'Template Downloaded', `Downloaded ${activeTab} sample spreadsheet.`);
  };

  // 2. Parse selected sheet from workbook
  const parseSheetData = async (wb: XLSX.WorkBook, sheetName: string) => {
    try {
      setLoading(true);
      const ws = wb.Sheets[sheetName];
      if (!ws) throw new Error('Sheet not found');

      // Extract raw column headers from row 1
      const headerRow = (XLSX.utils.sheet_to_json(ws, { header: 1 })[0] || []) as string[];
      setDetectedHeaders(headerRow.map(h => String(h).trim()).filter(Boolean));

      // Extract records
      const rawRows = XLSX.utils.sheet_to_json(ws);
      setParsedRows(rawRows);

      // Validate with backend API (dry run commit: false)
      const res = await importExcelRows(activeTab === 'teachers' ? 'tutors' : activeTab, rawRows, false);
      setValidationResult(res);

      addToast(
        'info',
        'Sheet Analyzed',
        `Parsed ${rawRows.length} records. ${res.validCount} Valid, ${res.duplicateCount} Duplicates, ${res.invalidCount} Invalid.`
      );
    } catch (err: any) {
      addToast('error', 'Parse Error', err.message || 'Could not parse sheet data');
    } finally {
      setLoading(false);
    }
  };

  // 3. Upload and detect sheets
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbookObj(wb);
        setSheetNames(wb.SheetNames);

        const initialSheet = wb.SheetNames[0] || '';
        setSelectedSheet(initialSheet);

        if (initialSheet) {
          await parseSheetData(wb, initialSheet);
        }
      } catch (err: any) {
        addToast('error', 'File Read Error', err.message || 'Failed to read spreadsheet file');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSheetChange = (sheetName: string) => {
    setSelectedSheet(sheetName);
    if (workbookObj) {
      parseSheetData(workbookObj, sheetName);
    }
  };

  // 4. Commit Valid Records
  const handleCommitImport = async () => {
    if (!parsedRows || parsedRows.length === 0) return;
    setLoading(true);
    try {
      const res = await importExcelRows(activeTab === 'teachers' ? 'tutors' : activeTab, parsedRows, true);
      addToast(
        'success',
        'Import Completed!',
        `Successfully imported ${res.validCount} records into the permanent database.`
      );
      setParsedRows([]);
      setValidationResult(null);
      setFileName('');
      setWorkbookObj(null);
      setSheetNames([]);
      setDetectedHeaders([]);
      triggerRefresh();
    } catch (err: any) {
      addToast('error', 'Import Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setParsedRows([]);
    setValidationResult(null);
    setFileName('');
    setWorkbookObj(null);
    setSheetNames([]);
    setDetectedHeaders([]);
  };

  // Filter preview rows
  const getDisplayRows = () => {
    if (!validationResult) return [];
    if (previewFilter === 'VALID') return validationResult.validRecords.map((r, i) => ({ ...r, _status: 'VALID', _row: i + 2 }));
    if (previewFilter === 'DUPLICATES') return validationResult.duplicateRecords.map(r => ({ ...r.data, _status: 'DUPLICATE', _reason: r.reason, _row: r.rowNum }));
    if (previewFilter === 'INVALID') return validationResult.invalidRecords.map(r => ({ ...r.data, _status: 'INVALID', _reason: (r.errors || []).join(', '), _row: r.rowNum }));
    
    // ALL
    const valids = validationResult.validRecords.map((r, i) => ({ ...r, _status: 'VALID', _row: i + 2 }));
    const dups = validationResult.duplicateRecords.map(r => ({ ...r.data, _status: 'DUPLICATE', _reason: r.reason, _row: r.rowNum }));
    const invalids = validationResult.invalidRecords.map(r => ({ ...r.data, _status: 'INVALID', _reason: (r.errors || []).join(', '), _row: r.rowNum }));
    return [...valids, ...dups, ...invalids].sort((a, b) => a._row - b._row);
  };

  const displayPreviewRows = getDisplayRows();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900">Excel & CSV Bulk Import Module</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Bulk import real campaign data with automatic column recognition, multi-sheet detection, and duplicate prevention.
        </p>
      </div>

      {/* Primary Options: Teachers vs Students */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => {
            setActiveTab('teachers');
            handleCancel();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'teachers'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>1. IMPORT TEACHERS DATA</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('students');
            handleCancel();
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. IMPORT STUDENTS DATA</span>
        </button>
      </div>

      {/* Step 1 & 2 Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        {/* Step 1: Download Template */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Step 1: Download Formatted Template</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Template strictly matches current {activeTab === 'teachers' ? 'Teachers' : 'Students'} spreadsheet columns.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadTemplate('xlsx')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .XLSX</span>
            </button>
            <button
              onClick={() => handleDownloadTemplate('csv')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .CSV</span>
            </button>
          </div>
        </div>

        {/* Step 2: Upload Completed Spreadsheet */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-slate-900">Step 2: Upload Excel File</h4>
            {fileName && (
              <span className="text-xs font-mono text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                Uploaded: {fileName}
              </span>
            )}
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 bg-slate-50/50 hover:bg-indigo-50/20 cursor-pointer transition-all">
            <Upload className="w-8 h-8 text-indigo-600 mb-2" />
            <span className="text-sm font-bold text-slate-700">
              [ CHOOSE EXCEL / CSV SPREADSHEET ]
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Supports .xlsx, .xls, and .csv files from Meta Lead Ads or custom sheets
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Sheet & Header Detection Info */}
        {sheetNames.length > 0 && (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Detected Sheets ({sheetNames.length}):
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600 font-medium">Active Sheet:</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white rounded-lg border border-indigo-200 font-bold text-indigo-900 focus:outline-none"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {detectedHeaders.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1.5">
                  Detected Column Headers ({detectedHeaders.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {detectedHeaders.map((h, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-[11px] font-mono font-medium bg-white text-slate-700 rounded-md border border-slate-200 shadow-2xs"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 3: Verification & Duplicate Preview */}
      {validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Step 3: Verification & Duplicate Check</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect records before committing. Duplicates will be safely ignored.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500">
              Default Priority: <span className="text-slate-800 font-mono">NOT_ASSIGNED</span> | Status: <span className="text-slate-800 font-mono">NEW_APPLICATION</span>
            </div>
          </div>

          {/* 4 Summary Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-bold uppercase block">Total Records</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">
                {validationResult.totalRecords}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-bold uppercase block">? Valid Records</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                {validationResult.validCount}
              </span>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs text-amber-700 font-bold uppercase block">? Duplicate Records</span>
              <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                {validationResult.duplicateCount}
              </span>
            </div>

            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-xs text-rose-700 font-bold uppercase block">? Invalid Records</span>
              <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">
                {validationResult.invalidCount}
              </span>
            </div>
          </div>

          {/* Filter Preview Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            {[
              { id: 'ALL', label: `All (${validationResult.totalRecords})` },
              { id: 'VALID', label: `Valid (${validationResult.validCount})` },
              { id: 'DUPLICATES', label: `Duplicates (${validationResult.duplicateCount})` },
              { id: 'INVALID', label: `Invalid (${validationResult.invalidCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setPreviewFilter(f.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                  previewFilter === f.id
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-80 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">{activeTab === 'teachers' ? 'Subjects / Exp' : 'Class'}</th>
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3">Note / Duplicate Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayPreviewRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No records match the selected preview filter.
                    </td>
                  </tr>
                ) : (
                  displayPreviewRows.map((r, i) => {
                    const isValid = r._status === 'VALID';
                    const isDup = r._status === 'DUPLICATE';
                    const isInvalid = r._status === 'INVALID';

                    const name = r.fullName || r.full_name || r.studentName || r.student_name || r.name || 'Not Provided';
                    const phone = r.mobile || r.phone || r.phone_number || 'Not Provided';
                    const email = r.email || 'Not Provided';
                    const detail = activeTab === 'teachers'
                      ? `${Array.isArray(r.subjects) ? r.subjects.join(', ') : (r.subjects || r['which_subjects_can_you_teach?'] || '')} (${r.experience || r['how_much_teaching_experience_do_you_have?'] || 'Not Provided'})`
                      : (r.class || r.studentClass || r['??????_??????_????_?????????_????????????'] || 'Not Provided');
                    const platform = r.platform || 'fb';

                    return (
                      <tr
                        key={i}
                        className={`hover:bg-slate-50 ${
                          isDup ? 'bg-amber-50/30' : isInvalid ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 font-mono font-bold text-slate-500">{r._row}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {isValid && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              ? Valid
                            </span>
                          )}
                          {isDup && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              ? Duplicate
                            </span>
                          )}
                          {isInvalid && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              ? Invalid
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 whitespace-nowrap">{name}</td>
                        <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap">{phone}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-[150px] truncate" title={email}>{email}</td>
                        <td className="py-2 px-3 text-slate-700 max-w-[150px] truncate" title={detail}>{detail}</td>
                        <td className="py-2 px-3 font-bold uppercase text-[10px] text-slate-600">{platform}</td>
                        <td className="py-2 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                          {r._reason || (isValid ? 'Ready to import' : '')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              [ CANCEL ]
            </button>
            <button
              onClick={handleCommitImport}
              disabled={loading || validationResult.validCount === 0}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>[ IMPORT {validationResult.validCount} VALID RECORDS ]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
