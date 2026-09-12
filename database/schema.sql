CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,

    email VARCHAR(254) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'USER',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    last_login_at TIMESTAMPTZ NULL,

    CONSTRAINT users_role_check
        CHECK (role IN ('USER', 'ADMIN'))
);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    original_name VARCHAR(255) NOT NULL,

    storage_key TEXT NULL,

    mime_type VARCHAR(100) NULL,

    extension VARCHAR(20) NULL,

    size_bytes BIGINT NULL,

    width INTEGER NULL,

    height INTEGER NULL,

    band_count INTEGER NULL,

    crs TEXT NULL,

    bounds JSONB NULL,

    footprint geometry(Geometry, 4326) NULL,

    acquisition_timestamp TIMESTAMPTZ NULL,

    metadata_json JSONB NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT assets_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT assets_size_check
        CHECK (size_bytes IS NULL OR size_bytes >= 0),

    CONSTRAINT assets_width_check
        CHECK (width IS NULL OR width > 0),

    CONSTRAINT assets_height_check
        CHECK (height IS NULL OR height > 0),

    CONSTRAINT assets_band_count_check
        CHECK (band_count IS NULL OR band_count > 0)
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id
    ON assets(user_id);

CREATE INDEX IF NOT EXISTS idx_assets_acquisition_timestamp
    ON assets(acquisition_timestamp);

CREATE INDEX IF NOT EXISTS idx_assets_footprint_gist
    ON assets
    USING GIST (footprint);


CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL,

    query TEXT NOT NULL,

    requested_task VARCHAR(255) NULL,

    benchmark_mode BOOLEAN NOT NULL DEFAULT FALSE,

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',

    intent VARCHAR(255) NULL,

    intent_confidence NUMERIC(5,4) NULL,

    compatibility_status VARCHAR(50) NULL,

    model_provider VARCHAR(100) NULL,

    model_name VARCHAR(255) NULL,

    started_at TIMESTAMPTZ NULL,

    completed_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT analyses_user_fk
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT analyses_status_check
        CHECK (
            status IN (
                'PENDING',
                'RUNNING',
                'COMPLETED',
                'FAILED',
                'ABSTAINED'
            )
        ),

    CONSTRAINT analyses_intent_confidence_check
        CHECK (
            intent_confidence IS NULL
            OR (
                intent_confidence >= 0
                AND intent_confidence <= 1
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id
    ON analyses(user_id);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at
    ON analyses(created_at);


CREATE TABLE IF NOT EXISTS analysis_assets (
    analysis_id UUID NOT NULL,

    asset_id UUID NOT NULL,

    position INTEGER NOT NULL,

    input_role VARCHAR(20) NULL,

    PRIMARY KEY (analysis_id, asset_id),

    CONSTRAINT analysis_assets_analysis_fk
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    CONSTRAINT analysis_assets_asset_fk
        FOREIGN KEY (asset_id)
        REFERENCES assets(id)
        ON DELETE CASCADE,

    CONSTRAINT analysis_assets_position_check
        CHECK (position IN (1, 2)),

    CONSTRAINT analysis_assets_position_unique
        UNIQUE (analysis_id, position)
);

CREATE INDEX IF NOT EXISTS idx_analysis_assets_asset_id
    ON analysis_assets(asset_id);

CREATE TABLE IF NOT EXISTS analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    task VARCHAR(255) NULL,

    answer_text TEXT NULL,

    confidence NUMERIC(5,4) NULL,

    grounding JSONB NULL,

    evidence JSONB NULL,

    model_name VARCHAR(255) NULL,

    model_version VARCHAR(255) NULL,

    provider VARCHAR(100) NULL,

    parameters_used JSONB NULL,

    warnings JSONB NULL,

    status VARCHAR(50) NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT analysis_results_analysis_fk
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    CONSTRAINT analysis_results_confidence_check
        CHECK (
            confidence IS NULL
            OR (
                confidence >= 0
                AND confidence <= 1
            )
        )
);

CREATE INDEX IF NOT EXISTS idx_analysis_results_analysis_id
    ON analysis_results(analysis_id);

CREATE TABLE IF NOT EXISTS analysis_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    analysis_id UUID NOT NULL,

    event_type VARCHAR(100) NOT NULL,

    payload JSONB NULL,

    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    duration_ms INTEGER NULL,

    CONSTRAINT analysis_steps_analysis_fk
        FOREIGN KEY (analysis_id)
        REFERENCES analyses(id)
        ON DELETE CASCADE,

    CONSTRAINT analysis_steps_duration_check
        CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

CREATE INDEX IF NOT EXISTS idx_analysis_steps_analysis_id
    ON analysis_steps(analysis_id);

CREATE INDEX IF NOT EXISTS idx_analysis_steps_timestamp
    ON analysis_steps(timestamp);
