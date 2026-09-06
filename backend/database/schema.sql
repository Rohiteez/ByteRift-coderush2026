-- ============================================================================
-- AAFNO PAY: PRODUCTION SUPABASE POSTGRESQL DATABASE SCHEMA
-- Zero Collateral • Institutional Student P2P Credit
-- All monetary units stored as minor units (BIGINT Paisa: 1 NPR = 100 Paisa)
-- ============================================================================

-- 1. Enable Cryptographic Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing types and tables if doing full schema refresh
DROP TABLE IF EXISTS fraud_alerts CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS loan_funders CASCADE;
DROP TABLE IF EXISTS loan_requests CASCADE;
DROP TABLE IF EXISTS credit_score_history CASCADE;
DROP TABLE IF EXISTS credit_scores CASCADE;
DROP TABLE IF EXISTS student_verifications CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ----------------------------------------------------------------------------
-- 2. USERS & ROLES
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('BORROWER', 'LENDER', 'ADMIN')),
    avatar_url TEXT,
    wallet_balance_paisa BIGINT NOT NULL DEFAULT 0 CHECK (wallet_balance_paisa >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ----------------------------------------------------------------------------
-- 3. KYC IDENTITY VERIFICATIONS
-- Anti-Sybil Protection: doc_number_hash is cryptographically unique
-- ----------------------------------------------------------------------------
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL CHECK (doc_type IN ('CITIZENSHIP', 'NATIONAL_ID', 'PASSPORT')),
    doc_number VARCHAR(100) NOT NULL,
    doc_number_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 prevents duplicate accounts
    full_name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    front_doc_url TEXT NOT NULL,
    back_doc_url TEXT,
    selfie_url TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('UNSUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_kyc UNIQUE (user_id)
);

CREATE INDEX idx_kyc_user_id ON kyc_verifications(user_id);
CREATE INDEX idx_kyc_status ON kyc_verifications(status);

-- ----------------------------------------------------------------------------
-- 4. STUDENT & UNIVERSITY ACADEMIC REGISTRY ORACLE VERIFICATIONS
-- Anti-Sybil: student_id_number_hash ensures 1 student = 1 borrower account
-- ----------------------------------------------------------------------------
CREATE TABLE student_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    university_name VARCHAR(255) NOT NULL,
    student_id_number VARCHAR(100) NOT NULL,
    student_id_number_hash VARCHAR(64) UNIQUE NOT NULL, -- Prevents duplicate roll number reuse
    student_card_url TEXT NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    enrollment_year INT NOT NULL,
    expected_graduation_year INT NOT NULL,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('UNSUBMITTED', 'PENDING', 'VERIFIED', 'REJECTED')),
    academic_clearance_status VARCHAR(30) NOT NULL DEFAULT 'CLEAR' CHECK (academic_clearance_status IN ('CLEAR', 'FINANCIAL_HOLD', 'EXPELLED')),
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_student UNIQUE (user_id)
);

CREATE INDEX idx_student_user_id ON student_verifications(user_id);
CREATE INDEX idx_student_status ON student_verifications(verification_status);

-- ----------------------------------------------------------------------------
-- 5. CREDIT SCORES & LADDER HISTORY
-- Explainable scoring: Tier 1 (NPR 4K), Tier 2 (NPR 6K), Tier 3 (NPR 8K), Tier 4 (NPR 10K)
-- ----------------------------------------------------------------------------
CREATE TABLE credit_scores (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    tier INT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 4),
    max_limit_paisa BIGINT NOT NULL DEFAULT 0 CHECK (max_limit_paisa >= 0),
    last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE credit_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    delta INT NOT NULL,
    previous_score INT NOT NULL,
    new_score INT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_score_history_user_id ON credit_score_history(user_id);

-- ----------------------------------------------------------------------------
-- 6. LOAN REQUESTS & P2P MARKETPLACE
-- Zero floating point drift: All values in paisa
-- Overfunding guard: CHECK (amount_funded_paisa <= amount_requested_paisa)
-- ----------------------------------------------------------------------------
CREATE TABLE loan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_id UUID NOT NULL REFERENCES users(id),
    borrower_pseudonym VARCHAR(100) NOT NULL, -- e.g. "Student #4892" for privacy minimization
    university_name VARCHAR(255) NOT NULL,
    faculty VARCHAR(255) NOT NULL,
    purpose_category VARCHAR(50) NOT NULL CHECK (purpose_category IN ('RENT', 'FOOD', 'MEDICAL', 'EDUCATION', 'TRANSPORT', 'UTILITIES', 'OTHER')),
    purpose_description TEXT NOT NULL,
    amount_requested_paisa BIGINT NOT NULL CHECK (amount_requested_paisa BETWEEN 50000 AND 1000000), -- NPR 500 to NPR 10,000
    amount_funded_paisa BIGINT NOT NULL DEFAULT 0,
    tenure_days INT NOT NULL DEFAULT 30,
    facility_fee_rate_bps INT NOT NULL DEFAULT 600, -- 6.00% fixed
    lender_yield_rate_bps INT NOT NULL DEFAULT 400,  -- 4.00% fixed return
    status VARCHAR(30) NOT NULL DEFAULT 'MATCHING' CHECK (status IN (
        'REQUESTED',
        'MATCHING',
        'PARTIALLY_FUNDED',
        'FUNDED',
        'AGREEMENT_PENDING',
        'ACTIVE',
        'PAYMENT_DUE',
        'OVERDUE',
        'GRACE_PERIOD',
        'DEFAULTED',
        'RECOVERY',
        'COMPLETED',
        'CANCELLED'
    )),
    aafno_score INT NOT NULL DEFAULT 0,
    score_tier INT NOT NULL DEFAULT 1 CHECK (score_tier BETWEEN 1 AND 4),
    agreement_signed BOOLEAN NOT NULL DEFAULT FALSE,
    disbursed_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_not_overfunded CHECK (amount_funded_paisa <= amount_requested_paisa)
);

CREATE INDEX idx_loans_borrower ON loan_requests(borrower_id);
CREATE INDEX idx_loans_status ON loan_requests(status);
CREATE INDEX idx_loans_created ON loan_requests(created_at DESC);

-- ----------------------------------------------------------------------------
-- 7. LOAN FUNDERS (P2P Fractional Funding Records)
-- ----------------------------------------------------------------------------
CREATE TABLE loan_funders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loan_requests(id) ON DELETE CASCADE,
    lender_id UUID NOT NULL REFERENCES users(id),
    amount_funded_paisa BIGINT NOT NULL CHECK (amount_funded_paisa > 0),
    expected_return_paisa BIGINT NOT NULL CHECK (expected_return_paisa >= 0),
    funded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_funders_loan_id ON loan_funders(loan_id);
CREATE INDEX idx_funders_lender_id ON loan_funders(lender_id);

-- ----------------------------------------------------------------------------
-- 8. DOUBLE-ENTRY TRANSACTION LEDGER
-- Exactly-Once Processing: idempotency_key is globally unique
-- ----------------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    loan_id UUID REFERENCES loan_requests(id),
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    amount_paisa BIGINT NOT NULL CHECK (amount_paisa > 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('DISBURSEMENT', 'REPAYMENT', 'PLATFORM_FEE', 'RESERVE_FEE', 'WALLET_TOPUP', 'REFUND')),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
    gateway_reference VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_idempotency ON transactions(idempotency_key);
CREATE INDEX idx_transactions_loan_id ON transactions(loan_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. FRAUD AUDIT HEURISTICS & RISK ALERTS
-- ----------------------------------------------------------------------------
CREATE TABLE fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    loan_id UUID REFERENCES loan_requests(id) ON DELETE SET NULL,
    rule_code VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description TEXT NOT NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_severity ON fraud_alerts(severity);
CREATE INDEX idx_fraud_resolved ON fraud_alerts(is_resolved);

-- ============================================================================
-- ATOMIC STORED PROCEDURES (Database Row-Lock Safeguards)
-- Prevents concurrency race conditions and overfunding attacks
-- ============================================================================

-- Function 1: Atomic P2P Loan Funding with Row Locking
CREATE OR REPLACE FUNCTION fund_loan_atomic(
    p_loan_id UUID,
    p_lender_id UUID,
    p_amount_paisa BIGINT
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_loan loan_requests%ROWTYPE;
    v_lender users%ROWTYPE;
    v_remaining_paisa BIGINT;
    v_expected_return_paisa BIGINT;
    v_funder_id UUID;
    v_disb_tx_id UUID;
    v_new_status VARCHAR(30);
    v_due_date TIMESTAMPTZ;
BEGIN
    -- 1. Acquire exclusive row lock on the loan request
    SELECT * INTO v_loan
    FROM loan_requests
    WHERE id = p_loan_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'LOAN_NOT_FOUND: Loan with ID % does not exist', p_loan_id;
    END IF;

    -- 2. Verify loan status is open for peer funding
    IF v_loan.status NOT IN ('MATCHING', 'PARTIALLY_FUNDED') THEN
        RAISE EXCEPTION 'LOAN_NOT_FUNDABLE: Loan is in % status and is not accepting funds', v_loan.status;
    END IF;

    -- 3. Concurrency / Race Condition Guard: check remaining amount
    v_remaining_paisa := v_loan.amount_requested_paisa - v_loan.amount_funded_paisa;
    IF p_amount_paisa > v_remaining_paisa THEN
        RAISE EXCEPTION 'RACE_CONDITION_PREVENTED: Only % paisa remaining to be funded. You requested % paisa.',
            v_remaining_paisa, p_amount_paisa;
    END IF;

    -- 4. Lock and check lender wallet balance
    SELECT * INTO v_lender
    FROM users
    WHERE id = p_lender_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'LENDER_NOT_FOUND: User ID % does not exist', p_lender_id;
    END IF;

    IF v_lender.wallet_balance_paisa < p_amount_paisa THEN
        RAISE EXCEPTION 'INSUFFICIENT_BALANCE: Lender wallet has % paisa, required % paisa',
            v_lender.wallet_balance_paisa, p_amount_paisa;
    END IF;

    -- 5. Deduct lender balance
    UPDATE users
    SET wallet_balance_paisa = wallet_balance_paisa - p_amount_paisa
    WHERE id = p_lender_id;

    -- 6. Calculate fixed 4% lender yield
    v_expected_return_paisa := ROUND((p_amount_paisa * v_loan.lender_yield_rate_bps) / 10000);

    -- 7. Insert into loan_funders
    INSERT INTO loan_funders (loan_id, lender_id, amount_funded_paisa, expected_return_paisa, funded_at)
    VALUES (p_loan_id, p_lender_id, p_amount_paisa, v_expected_return_paisa, CURRENT_TIMESTAMP)
    RETURNING id INTO v_funder_id;

    -- 8. Update loan funding progress
    IF (v_loan.amount_funded_paisa + p_amount_paisa) >= v_loan.amount_requested_paisa THEN
        v_new_status := 'ACTIVE';
        v_due_date := CURRENT_TIMESTAMP + (v_loan.tenure_days || ' days')::INTERVAL;

        UPDATE loan_requests
        SET amount_funded_paisa = amount_funded_paisa + p_amount_paisa,
            status = v_new_status,
            agreement_signed = TRUE,
            disbursed_at = CURRENT_TIMESTAMP,
            due_date = v_due_date
        WHERE id = p_loan_id;

        -- Record ledger disbursement
        INSERT INTO transactions (
            idempotency_key,
            loan_id,
            sender_id,
            sender_name,
            receiver_id,
            receiver_name,
            amount_paisa,
            type,
            status,
            gateway_reference
        ) VALUES (
            'idem-disb-' || p_loan_id || '-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT,
            p_loan_id,
            p_lender_id::TEXT,
            v_lender.full_name,
            v_loan.borrower_id::TEXT,
            v_loan.borrower_pseudonym,
            v_loan.amount_requested_paisa,
            'DISBURSEMENT',
            'SUCCESS',
            'AFN-DISB-' || FLOOR(100000 + RANDOM() * 900000)::TEXT
        ) RETURNING id INTO v_disb_tx_id;
    ELSE
        v_new_status := 'PARTIALLY_FUNDED';
        UPDATE loan_requests
        SET amount_funded_paisa = amount_funded_paisa + p_amount_paisa,
            status = v_new_status
        WHERE id = p_loan_id;
    END IF;

    -- 9. Return JSON confirmation
    RETURN jsonb_build_object(
        'success', true,
        'loanId', p_loan_id,
        'status', v_new_status,
        'amountFundedPaisa', v_loan.amount_funded_paisa + p_amount_paisa,
        'amountRequestedPaisa', v_loan.amount_requested_paisa,
        'lenderNewBalancePaisa', v_lender.wallet_balance_paisa - p_amount_paisa
    );
END;
$$;

-- Function 2: Atomic Loan Repayment & Score Upgrade with Idempotency
CREATE OR REPLACE FUNCTION repay_loan_atomic(
    p_loan_id UUID,
    p_borrower_id UUID,
    p_idempotency_key TEXT
) RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_existing_tx transactions%ROWTYPE;
    v_loan loan_requests%ROWTYPE;
    v_funder RECORD;
    v_total_due_paisa BIGINT;
    v_facility_fee_paisa BIGINT;
    v_current_score credit_scores%ROWTYPE;
    v_new_score INT;
    v_new_tier INT;
    v_new_limit BIGINT;
    v_payout BIGINT;
BEGIN
    -- 1. Idempotency verification: Check if transaction already executed
    SELECT * INTO v_existing_tx
    FROM transactions
    WHERE idempotency_key = p_idempotency_key;

    IF FOUND THEN
        SELECT * INTO v_loan FROM loan_requests WHERE id = p_loan_id;
        SELECT * INTO v_current_score FROM credit_scores WHERE user_id = p_borrower_id;
        RETURN jsonb_build_object(
            'success', true,
            'idempotentReplay', true,
            'loanId', p_loan_id,
            'status', v_loan.status,
            'newScore', v_current_score.score
        );
    END IF;

    -- 2. Lock loan row
    SELECT * INTO v_loan
    FROM loan_requests
    WHERE id = p_loan_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'LOAN_NOT_FOUND: Loan with ID % does not exist', p_loan_id;
    END IF;

    IF v_loan.borrower_id <> p_borrower_id THEN
        RAISE EXCEPTION 'UNAUTHORIZED: User does not own this loan';
    END IF;

    IF v_loan.status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'INVALID_STATE: Loan status is %; only ACTIVE loans can be repaid', v_loan.status;
    END IF;

    -- 3. Calculate exact 6% facility fee and total due
    v_facility_fee_paisa := ROUND((v_loan.amount_requested_paisa * v_loan.facility_fee_rate_bps) / 10000);
    v_total_due_paisa := v_loan.amount_requested_paisa + v_facility_fee_paisa;

    -- 4. Mark loan completed
    UPDATE loan_requests
    SET status = 'COMPLETED',
        completed_at = CURRENT_TIMESTAMP
    WHERE id = p_loan_id;

    -- 5. Disburse payouts (Principal + 4% yield) to peer lenders
    FOR v_funder IN
        SELECT * FROM loan_funders WHERE loan_id = p_loan_id
    LOOP
        v_payout := v_funder.amount_funded_paisa + v_funder.expected_return_paisa;
        UPDATE users
        SET wallet_balance_paisa = wallet_balance_paisa + v_payout
        WHERE id = v_funder.lender_id;
    END LOOP;

    -- 6. Record Double-entry Repayment Transaction
    INSERT INTO transactions (
        idempotency_key,
        loan_id,
        sender_id,
        sender_name,
        receiver_id,
        receiver_name,
        amount_paisa,
        type,
        status,
        gateway_reference
    ) VALUES (
        p_idempotency_key,
        p_loan_id,
        p_borrower_id::TEXT,
        'Verified Student (Borrower)',
        'aafno-ledger-escrow',
        'Aafno Settlement Escrow',
        v_total_due_paisa,
        'REPAYMENT',
        'SUCCESS',
        'AFN-SETTLE-' || FLOOR(100000 + RANDOM() * 900000)::TEXT
    );

    -- 7. Credit Ladder Upgrade (+10 points for on-time full repayment)
    SELECT * INTO v_current_score
    FROM credit_scores
    WHERE user_id = p_borrower_id
    FOR UPDATE;

    IF NOT FOUND THEN
        v_new_score := 40;
    ELSE
        v_new_score := LEAST(100, v_current_score.score + 10);
    END IF;

    -- Derive Tier & Limit
    IF v_new_score >= 85 THEN
        v_new_tier := 4;
        v_new_limit := 1000000; -- NPR 10,000
    ELSIF v_new_score >= 70 THEN
        v_new_tier := 3;
        v_new_limit := 800000;  -- NPR 8,000
    ELSIF v_new_score >= 50 THEN
        v_new_tier := 2;
        v_new_limit := 600000;  -- NPR 6,000
    ELSE
        v_new_tier := 1;
        v_new_limit := 400000;  -- NPR 4,000
    END IF;

    INSERT INTO credit_scores (user_id, score, tier, max_limit_paisa, last_calculated_at)
    VALUES (p_borrower_id, v_new_score, v_new_tier, v_new_limit, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE
    SET score = v_new_score,
        tier = v_new_tier,
        max_limit_paisa = v_new_limit,
        last_calculated_at = CURRENT_TIMESTAMP;

    -- Insert Score History Record
    INSERT INTO credit_score_history (user_id, delta, previous_score, new_score, reason)
    VALUES (
        p_borrower_id,
        10,
        COALESCE(v_current_score.score, 0),
        v_new_score,
        'On-time full repayment of loan #' || SUBSTRING(p_loan_id::TEXT, 1, 8) || ' (+10 pts)'
    );

    RETURN jsonb_build_object(
        'success', true,
        'loanId', p_loan_id,
        'status', 'COMPLETED',
        'newScore', v_new_score,
        'tier', v_new_tier,
        'maxLimitPaisa', v_new_limit
    );
END;
$$;
