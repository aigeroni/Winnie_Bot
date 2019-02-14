CREATE TABLE raptors(
    server_id       VARCHAR(30) NOT NULL,
	user_id         VARCHAR(30) NOT NULL,
    raptor_count    INT         NOT NULL,
    PRIMARY KEY(server_id, user_id)
);