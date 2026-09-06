-- ============================================================================
-- AAFNO PAY: INITIAL DEMO SEED DATA (For Supabase SQL Editor)
-- ============================================================================

-- Fixed UUIDs for deterministic demo linking
DO $$
DECLARE
    v_borrower_id UUID := '00000000-0000-0000-0000-000000000001';
    v_new_student_id UUID := '00000000-0000-0000-0000-000000000002';
    v_lender_id UUID := '00000000-0000-0000-0000-000000000003';
    v_admin_id UUID := '00000000-0000-0000-0000-000000000004';
    v_active_loan_id UUID := '11111111-1111-1111-1111-111111111111';
    v_mkt_loan_id UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
    -- 1. Insert Initial Users
    INSERT INTO users (id, email, phone, full_name, role, avatar_url, wallet_balance_paisa, is_active, created_at)
    VALUES
    (
        v_borrower_id,
        'aashish.sharma@ioe.edu.np',
        '9841234567',
        'Aashish Sharma',
        'BORROWER',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        0,
        TRUE,
        '2026-08-15T10:00:00Z'
    ),
    (
        v_new_student_id,
        'rohan.adhikari@ku.edu.np',
        '9851122334',
        'Rohan Adhikari',
        'BORROWER',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        0,
        TRUE,
        '2026-09-01T09:00:00Z'
    ),
    (
        v_lender_id,
        'sunita.thapa@gmail.com',
        '9801987654',
        'Sunita Thapa',
        'LENDER',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        2500000, -- NPR 25,000.00 wallet balance
        TRUE,
        '2026-07-10T14:30:00Z'
    ),
    (
        v_admin_id,
        'admin.risk@aafnopay.com',
        '9811002233',
        'Bikash Shrestha',
        'ADMIN',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        0,
        TRUE,
        '2026-01-01T00:00:00Z'
    )
    ON CONFLICT (email) DO NOTHING;

    -- 2. Insert KYC for Aashish Sharma
    INSERT INTO kyc_verifications (user_id, doc_type, doc_number, doc_number_hash, full_name, dob, front_doc_url, back_doc_url, selfie_url, status, verified_at, created_at)
    VALUES (
        v_borrower_id,
        'CITIZENSHIP',
        '27-01-78-04921',
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        'Aashish Sharma',
        '2003-05-14',
        'https://placehold.co/600x400/e2e8f0/1e293b?text=Citizenship+Card+Front',
        'https://placehold.co/600x400/e2e8f0/1e293b?text=Citizenship+Card+Back',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        'VERIFIED',
        '2026-08-15T11:20:00Z',
        '2026-08-15T10:15:00Z'
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Insert Student Verification for Aashish Sharma
    INSERT INTO student_verifications (user_id, university_name, student_id_number, student_id_number_hash, student_card_url, faculty, enrollment_year, expected_graduation_year, verification_status, academic_clearance_status, verified_at, created_at)
    VALUES (
        v_borrower_id,
        'Tribhuvan University — IOE Pulchowk',
        '076BCT015',
        '1f8ac10f23c5b5bc1167bda84b833e5c057a77d2c1d94d4e503996f5d9e794b2',
        'https://placehold.co/600x400/e2e8f0/1e293b?text=Pulchowk+Campus+Card',
        'Computer Engineering (B.E.)',
        2021,
        2025,
        'VERIFIED',
        'CLEAR',
        '2026-08-15T11:25:00Z',
        '2026-08-15T10:20:00Z'
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- 4. Insert Credit Scores
    INSERT INTO credit_scores (user_id, score, tier, max_limit_paisa, last_calculated_at)
    VALUES
        (v_borrower_id, 68, 2, 600000, '2026-08-20T12:00:00Z'),
        (v_new_student_id, 0, 1, 0, '2026-09-01T09:00:00Z')
    ON CONFLICT (user_id) DO NOTHING;

    -- 5. Insert Score History
    INSERT INTO credit_score_history (user_id, delta, previous_score, new_score, reason, created_at)
    VALUES
        (v_borrower_id, 30, 0, 30, 'Initial Identity & University Enrollment Verified', '2026-08-15T11:30:00Z'),
        (v_borrower_id, 38, 30, 68, 'Successful early settlement of previous emergency loan', '2026-08-18T16:00:00Z');

    -- 6. Insert Active Loan for Aashish
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, disbursed_at, due_date, created_at
    ) VALUES (
        v_active_loan_id,
        v_borrower_id,
        'Student #4892',
        'Tribhuvan University — IOE Pulchowk',
        'Computer Engineering (B.E.)',
        'MEDICAL',
        'Emergency prescription medication and medical diagnosis after accidental injury',
        400000, -- NPR 4,000
        400000, -- 100% funded
        30,
        600,
        400,
        'ACTIVE',
        68,
        2,
        TRUE,
        '2026-08-20T14:00:00Z',
        '2026-09-19T14:00:00Z',
        '2026-08-20T11:00:00Z'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Loan Funder for Active Loan
    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES (
        v_active_loan_id,
        v_lender_id,
        400000,
        16000, -- 4% = NPR 160.00
        '2026-08-20T12:30:00Z'
    );

    -- 7. Insert Open Marketplace Loan
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, created_at
    ) VALUES (
        v_mkt_loan_id,
        v_borrower_id,
        'Student #3104',
        'Kathmandu University — Dhulikhel',
        'Computer Science (B.Sc.)',
        'RENT',
        'Urgent room rent shortfall before monthly allowance transfer',
        600000, -- NPR 6,000
        300000, -- NPR 3,000 partially funded
        30,
        600,
        400,
        'PARTIALLY_FUNDED',
        74,
        3,
        FALSE,
        '2026-09-02T16:00:00Z'
    )
    ON CONFLICT (id) DO NOTHING;

    -- Funder for Marketplace Loan
    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES (
        v_mkt_loan_id,
        v_lender_id,
        300000,
        12000, -- 4% = NPR 120.00
        '2026-09-02T17:30:00Z'
    );

    -- 8. Additional Open Marketplace Loans across all categories
    -- MEDICAL
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, created_at
    ) VALUES (
        '22222222-2222-2222-2222-222222222201',
        v_new_student_id,
        'Student #5120',
        'Tribhuvan University — IOE Pulchowk',
        'Computer Engineering (B.E.)',
        'MEDICAL',
        'Urgent diagnostic lab tests and prescription antibiotics after severe typhoid infection',
        350000,
        150000,
        30, 600, 400, 'PARTIALLY_FUNDED', 71, 3, FALSE, '2026-09-03T09:00:00Z'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES ('22222222-2222-2222-2222-222222222201', v_lender_id, 150000, 6000, '2026-09-03T11:00:00Z');

    -- EDUCATION
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, created_at
    ) VALUES (
        '22222222-2222-2222-2222-222222222204',
        v_new_student_id,
        'Student #7819',
        'Pokhara University',
        'Business Administration (BBA)',
        'EDUCATION',
        'Semester board exam clearance fee deadline',
        400000,
        100000,
        30, 600, 400, 'PARTIALLY_FUNDED', 58, 2, FALSE, '2026-09-03T07:15:00Z'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES ('22222222-2222-2222-2222-222222222204', v_lender_id, 100000, 4000, '2026-09-03T18:00:00Z');

    -- FOOD
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, created_at
    ) VALUES (
        '22222222-2222-2222-2222-222222222206',
        v_borrower_id,
        'Student #1522',
        'Kathmandu University — Dhulikhel',
        'Mechanical Engineering (B.E.)',
        'FOOD',
        'Campus cafeteria mess card monthly recharge before family allowance release',
        300000,
        100000,
        30, 600, 400, 'PARTIALLY_FUNDED', 69, 2, FALSE, '2026-09-04T07:00:00Z'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES ('22222222-2222-2222-2222-222222222206', v_lender_id, 100000, 4000, '2026-09-04T09:00:00Z');

    -- UTILITIES
    INSERT INTO loan_requests (
        id, borrower_id, borrower_pseudonym, university_name, faculty,
        purpose_category, purpose_description, amount_requested_paisa, amount_funded_paisa,
        tenure_days, facility_fee_rate_bps, lender_yield_rate_bps, status,
        aafno_score, score_tier, agreement_signed, created_at
    ) VALUES (
        '22222222-2222-2222-2222-222222222208',
        v_borrower_id,
        'Student #3908',
        'Tribhuvan University — IOE Pulchowk',
        'Electronics & Information Engineering',
        'UTILITIES',
        'Hostel high-speed fiber internet quarterly subscription for final year AI project research',
        200000,
        50000,
        30, 600, 400, 'PARTIALLY_FUNDED', 76, 3, FALSE, '2026-09-04T09:30:00Z'
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES ('22222222-2222-2222-2222-222222222208', v_lender_id, 50000, 2000, '2026-09-04T11:00:00Z');


    -- 8. Insert Disbursement Transaction
    INSERT INTO transactions (
        idempotency_key, loan_id, sender_id, sender_name, receiver_id, receiver_name,
        amount_paisa, type, status, gateway_reference, created_at
    ) VALUES (
        'idem-disb-seed-01',
        v_active_loan_id,
        v_lender_id::TEXT,
        'Sunita Thapa (Lender)',
        v_borrower_id::TEXT,
        'Student #4892 (Borrower)',
        400000,
        'DISBURSEMENT',
        'SUCCESS',
        'AFN-DISB-749210',
        '2026-08-20T14:00:00Z'
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    -- 9. Insert Sample Fraud Alert for admin demo
    INSERT INTO fraud_alerts (
        user_id, user_name, rule_code, severity, description, is_resolved, created_at
    ) VALUES (
        v_new_student_id,
        'Rohan Adhikari',
        'RULE_RAPID_VELOCITY_CHECK',
        'LOW',
        'Multiple wallet query attempts from new device subnet within 60 seconds.',
        FALSE,
        '2026-09-03T10:15:00Z'
    );

END $$;
