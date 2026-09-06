import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocType } from '../../types';
import { 
  ShieldCheck, 
  Upload, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle, 
  Camera, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Search, 
  Building2,
  FileCheck
} from 'lucide-react';
import { paisaToNpr } from '../../utils/currency';

export const KycWizard: React.FC = () => {
  const { 
    currentUser, 
    currentKyc, 
    currentStudent, 
    submitKyc, 
    submitStudentVerification, 
    setActiveTab, 
    showNotification,
    triggerConfetti 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(
    currentKyc?.status === 'VERIFIED' && currentStudent?.verificationStatus === 'VERIFIED' ? 3 : 1
  );

  // Step 1 State: National ID
  const [docType, setDocType] = useState<DocType>('CITIZENSHIP');
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [dob, setDob] = useState('2003-08-12');
  const [frontDocUrl, setFrontDocUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);

  // Step 2 State: Student & Academic Link
  const [universityName, setUniversityName] = useState('Tribhuvan University — IOE Pulchowk');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [faculty, setFaculty] = useState('Computer Engineering (B.E.)');
  const [enrollmentYear, setEnrollmentYear] = useState(2022);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState(2026);
  const [studentCardUrl, setStudentCardUrl] = useState('');
  const [isQueryingOracle, setIsQueryingOracle] = useState(false);
  const [oracleResult, setOracleResult] = useState<any | null>(null);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Quick Demo Auto-Fill: Simulated OCR extraction
  const handleAutoFillOcr = () => {
    setDocType('CITIZENSHIP');
    setDocNumber('27-01-79-99412');
    setFullName(currentUser.fullName || 'Rohan Adhikari');
    setDob('2003-08-12');
    setFrontDocUrl('https://placehold.co/600x400/0f172a/f8fafc?text=Nepalese+Citizenship+Card+Verified');
    setSelfieUrl('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80');
    showNotification('Simulated OCR automatically extracted details from document', 'success');
  };

  const handleAutoFillStudent = () => {
    setUniversityName('Kathmandu University — Dhulikhel');
    setStudentIdNumber('KU-2022-CS-094');
    setFaculty('Computer Science (B.Sc.)');
    setEnrollmentYear(2022);
    setExpectedGraduationYear(2026);
    setStudentCardUrl('https://placehold.co/600x400/0f172a/f8fafc?text=Kathmandu+University+ID+Card');
    showNotification('Populated university academic credentials', 'info');
  };

  // Submit Step 1
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKycError(null);
    if (!docNumber.trim()) {
      setKycError('Please enter your official document registration number');
      return;
    }
    if (!fullName.trim()) {
      setKycError('Please enter your full legal name as shown on document');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      await submitKyc({
        docType,
        docNumber: docNumber.trim(),
        fullName: fullName.trim(),
        dob,
        frontDocUrl: frontDocUrl || 'https://placehold.co/600x400/0f172a/f8fafc?text=Uploaded+Document',
        selfieUrl: selfieUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
      });
      setCurrentStep(2);
      showNotification('Identity KYC verified! Next: Connect University Academic Record', 'success');
    } catch (err: any) {
      setKycError(err.message || 'Verification failed');
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Query Mock University Oracle (Step 2)
  const handleQueryOracle = () => {
    if (!studentIdNumber.trim()) {
      setStudentError('Please input your student registration / roll number first');
      return;
    }
    setIsQueryingOracle(true);
    setStudentError(null);

    setTimeout(() => {
      setIsQueryingOracle(false);
      setOracleResult({
        institution: universityName,
        registration_id: studentIdNumber.trim(),
        enrollment_status: 'ACTIVE_FULL_TIME',
        academic_standing: 'IN_GOOD_STANDING',
        institutional_trust_score: 98.4,
        clearance_hold: 'NONE',
      });
      showNotification('University Academic Oracle confirmed active student status!', 'success');
    }, 1200);
  };

  // Submit Step 2
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudentError(null);

    if (!studentIdNumber.trim()) {
      setStudentError('Please enter your university student registration number');
      return;
    }

    try {
      await submitStudentVerification({
        universityName,
        studentIdNumber: studentIdNumber.trim(),
        faculty,
        enrollmentYear,
        expectedGraduationYear,
        studentCardUrl: studentCardUrl || 'https://placehold.co/600x400/0f172a/f8fafc?text=University+ID+Card',
      });
      setCurrentStep(3);
      triggerConfetti();
    } catch (err: any) {
      setStudentError(err.message || 'Academic verification failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      {/* Header & Steps Breadcrumb */}
      <div className="mb-10 text-center">
        <span className="px-4 py-1.5 bg-amber-100 text-amber-950 rounded-full text-xs font-bold tracking-wide uppercase">
          Identity & Academic Verification
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 mt-3 tracking-tight">
          Verify Student Credentials to Unlock Emergency Credit
        </h1>
        <p className="text-stone-500 text-sm max-w-xl mx-auto mt-2 leading-relaxed">
          Aafno Pay uses cryptographic document hashing to prevent multi-account evasion and connects with university registries for institutional verification.
        </p>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2.5 mt-8">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            currentStep === 1 ? 'bg-amber-400 text-stone-950 shadow-xs' : currentStep > 1 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-400'
          }`}>
            <span>1. National Identity</span>
            {currentStep > 1 && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
          </div>

          <div className="w-8 h-0.5 bg-stone-200" />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            currentStep === 2 ? 'bg-amber-400 text-stone-950 shadow-xs' : currentStep > 2 ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-400'
          }`}>
            <span>2. Academic Registry</span>
            {currentStep > 2 && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
          </div>

          <div className="w-8 h-0.5 bg-stone-200" />

          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            currentStep === 3 ? 'bg-amber-400 text-stone-950 shadow-xs' : 'bg-stone-100 text-stone-400'
          }`}>
            <span>3. Credit Limit Unlocked</span>
            {currentStep === 3 && <Sparkles className="w-4 h-4 text-stone-950" />}
          </div>
        </div>
      </div>

      {/* STEP 1: National Identity Verification */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-amber-50/70 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white text-amber-600 rounded-2xl border border-amber-200/80 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-stone-900">Step 1: Government National Identity (KYC)</h2>
                <p className="text-xs text-stone-600 mt-0.5">Salted cryptographic hash is stored in database to prevent Sybil duplicate accounts.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillOcr}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Auto-Fill Demo Data (Simulate OCR)</span>
            </button>
          </div>

          {kycError && (
            <div className="m-6 sm:m-8 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Anti-Fraud / KYC Collision Detected:</p>
                <p className="mt-0.5">{kycError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleStep1Submit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Document Type Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Document Type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as DocType)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white font-medium transition-all"
                >
                  <option value="CITIZENSHIP">Citizenship Card (नागरिकता)</option>
                  <option value="NATIONAL_ID">National ID (राष्ट्रिय परिचयपत्र)</option>
                  <option value="PASSPORT">Passport (राहदानी)</option>
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Document Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 27-01-79-04921"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white font-mono transition-all"
                  required
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Date of Birth (AD)
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Legal Full Name */}
            <div>
              <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                Full Legal Name (as per government records)
              </label>
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                required
              />
            </div>

            {/* Mock Upload Dropzones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              {/* Front Document Upload Preview */}
              <div className="border-2 border-dashed border-stone-200 rounded-3xl p-6 text-center hover:border-amber-400 transition-colors bg-[#faf9f6]">
                {frontDocUrl ? (
                  <div className="space-y-3">
                    <img src={frontDocUrl} alt="Doc preview" className="h-32 w-full object-cover rounded-2xl border border-stone-200" />
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" /> Document Scanned & Encrypted
                    </span>
                  </div>
                ) : (
                  <div className="py-6 cursor-pointer" onClick={handleAutoFillOcr}>
                    <Upload className="w-9 h-9 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-700">Upload Front of {docType}</p>
                    <p className="text-[11px] text-stone-400 mt-1">PNG, JPG, or PDF up to 5MB</p>
                  </div>
                )}
              </div>

              {/* Live Selfie / Biometric Preview */}
              <div className="border-2 border-dashed border-stone-200 rounded-3xl p-6 text-center hover:border-amber-400 transition-colors bg-[#faf9f6]">
                {selfieUrl ? (
                  <div className="space-y-3">
                    <img src={selfieUrl} alt="Selfie preview" className="h-32 w-32 mx-auto object-cover rounded-full border-2 border-amber-400 shadow-sm" />
                    <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-amber-600" /> Biometric Liveness Passed
                    </span>
                  </div>
                ) : (
                  <div className="py-6 cursor-pointer" onClick={handleAutoFillOcr}>
                    <Camera className="w-9 h-9 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-stone-700">Capture Live Biometric Selfie</p>
                    <p className="text-[11px] text-stone-400 mt-1">Liveness validation check</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-100">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Protected by salted 256-bit hash encryption. No raw numbers stored.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingKyc}
                className="w-full sm:w-auto px-8 py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                <span>{isSubmittingKyc ? 'Encrypting & Verifying...' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2: University Academic Enrollment Link */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="p-6 sm:p-8 bg-amber-50/70 border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white text-amber-600 rounded-2xl border border-amber-200/80 shadow-xs">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg sm:text-xl text-stone-900">Step 2: University Academic Registry Oracle</h2>
                <p className="text-xs text-stone-600 mt-0.5">Direct query against university partner mock database to confirm student eligibility.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFillStudent}
              className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Populate Demo Student Details</span>
            </button>
          </div>

          {studentError && (
            <div className="m-6 sm:m-8 mb-0 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <p>{studentError}</p>
            </div>
          )}

          <form onSubmit={handleStep2Submit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Partner Institution / University
                </label>
                <div className="relative">
                  <select
                    value={universityName}
                    onChange={(e) => setUniversityName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white font-medium transition-all"
                  >
                    <option value="Tribhuvan University — IOE Pulchowk">Tribhuvan University — IOE Pulchowk</option>
                    <option value="Kathmandu University — Dhulikhel">Kathmandu University — Dhulikhel</option>
                    <option value="Pokhara University">Pokhara University</option>
                    <option value="Purbanchal University">Purbanchal University</option>
                    <option value="Nepal Engineering College">Nepal Engineering College</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Student Roll / Registration Number
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="e.g. 078BCT042 or KU-2022-CS-094"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white font-mono transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleQueryOracle}
                    disabled={isQueryingOracle}
                    className="px-5 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                  >
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>{isQueryingOracle ? 'Querying...' : 'Query Oracle'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Faculty / Degree Program
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Enrollment Year
                </label>
                <input
                  type="number"
                  value={enrollmentYear}
                  onChange={(e) => setEnrollmentYear(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2">
                  Expected Graduation
                </label>
                <input
                  type="number"
                  value={expectedGraduationYear}
                  onChange={(e) => setExpectedGraduationYear(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 bg-[#faf9f6] text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            {/* Oracle Handshake Result Banner */}
            {oracleResult && (
              <div className="p-5 bg-amber-50/80 border border-amber-200/90 rounded-2xl">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-3">
                  <FileCheck className="w-4 h-4 text-amber-600" />
                  <span>Oracle Response: {oracleResult.institution}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 block mb-0.5">Registration:</span>
                    <span className="font-bold text-stone-900">{oracleResult.registration_id}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block mb-0.5">Enrollment Status:</span>
                    <span className="font-bold text-amber-900">{oracleResult.enrollment_status}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block mb-0.5">Academic Standing:</span>
                    <span className="font-bold text-stone-900">{oracleResult.academic_standing}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block mb-0.5">Clearance Hold:</span>
                    <span className="font-bold text-amber-900">{oracleResult.clearance_hold}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 flex items-center justify-between border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-stone-500 hover:text-stone-900 px-3 py-2 rounded-xl transition-colors"
              >
                ← Back to National Identity
              </button>

              <button
                type="submit"
                className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Complete Academic Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 3: Verification Celebration & Credit Limit Unlocked */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-amber-200/80 shadow-md p-10 sm:p-14 text-center relative overflow-hidden">
          {/* Confetti background accent */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl flex items-center justify-center text-stone-950 mx-auto shadow-lg shadow-amber-400/20 mb-6 animate-bounce">
            <Sparkles className="w-10 h-10" />
          </div>

          <span className="px-4 py-1.5 bg-amber-100 text-amber-950 rounded-full text-xs font-extrabold tracking-wide uppercase">
            Verification Successful — Trust Tier 1 Unlocked
          </span>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-4 tracking-tight">
            Congratulations, {currentUser.fullName}!
          </h2>
          <p className="text-stone-500 text-sm max-w-md mx-auto mt-2 leading-relaxed">
            Your national identity and academic enrollment have been cryptographically authenticated.
          </p>

          {/* Unlocked Financial Card */}
          <div className="max-w-md mx-auto my-8 bg-[#fdfcfa] text-stone-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-amber-200/80 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300" />
            <div className="flex items-center justify-between border-b border-stone-200/60 pb-4 mb-4">
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block">
                  Aafno Credit Ladder
                </span>
                <span className="text-sm font-extrabold text-amber-800">Tier 1: New Scholar</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold block">
                  Trust Score
                </span>
                <span className="text-xl font-extrabold text-stone-900">30 / 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-stone-500 font-medium block mb-1">Approved Emergency Borrowing Limit</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-stone-950 tracking-tight">NPR 4,000.00</span>
                <span className="text-xs text-amber-700 font-bold">(400,000 paisa)</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200/60 text-[11px] text-stone-500 flex items-center justify-between">
              <span>Next Ladder: NPR 6,000 at Score 50</span>
              <span className="text-amber-700 font-bold">Repay on-time to upgrade</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('BORROWER')}
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-2xl text-sm font-extrabold shadow-sm flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Go to Borrower Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('MARKETPLACE')}
              className="px-8 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl text-sm font-bold transition-colors"
            >
              Explore Peer Marketplace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
