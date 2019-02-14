CREATE TABLE config(
    server_id       VARCHAR(30) PRIMARY KEY     NOT NULL,
	cross_server    BOOL        DEFAULT true    NOT NULL,
	auto_sum        BOOL        DEFAULT true    NOT NULL,
    prefix          VARCHAR(3)  DEFAULT '!'     NOT NULL,
	announce        VARCHAR(30)
);